"""Docker backend — runs sandboxes as local Docker containers.

Uses subprocess calls to the `docker` CLI (no Python Docker SDK needed).
Works with Docker Desktop, Podman, and Rancher Desktop.
"""

from __future__ import annotations

import json
import os
import subprocess
import time
import uuid
from pathlib import Path

from sbx.provider import (
    BackgroundProcess,
    CommandResult,
    FileEntry,
)

# Label used to identify containers managed by sbx
_LABEL = "dev.sbx.managed=true"

# Default ports to eagerly map at creation time
_DEFAULT_PORTS = [3000, 3001, 5173, 8080]

# Docker template directory
_TEMPLATES_DIR = Path(__file__).resolve().parents[2] / "docker-templates"


def _run_docker(
    args: list[str],
    *,
    timeout: int | None = 120,
    input_data: bytes | None = None,
    check: bool = True,
) -> subprocess.CompletedProcess:
    """Run a docker CLI command."""
    cmd = ["docker"] + args
    return subprocess.run(
        cmd,
        capture_output=True,
        timeout=timeout,
        input=input_data,
        check=check,
    )


def _find_free_port(start: int = 32768) -> int:
    """Find an available host port starting from `start`."""
    import socket

    for port in range(start, start + 1000):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    raise RuntimeError("Could not find a free port in range 32768-33768")


class DockerCommandsAPI:
    """Executes commands inside a Docker container."""

    def __init__(self, container_id: str) -> None:
        self._container_id = container_id

    def run(
        self,
        command: str,
        cwd: str = "/workspace",
        envs: dict | None = None,
        user: str = "user",
        timeout: int = 60,
        background: bool = False,
    ) -> CommandResult | BackgroundProcess:
        args = ["exec"]
        if background:
            args.append("-d")
        args.extend(["-w", cwd, "-u", user])

        for key, value in (envs or {}).items():
            args.extend(["-e", f"{key}={value}"])

        args.extend([self._container_id, "sh", "-c", command])

        try:
            result = _run_docker(args, timeout=timeout if not background else None, check=False)
        except subprocess.TimeoutExpired:
            return CommandResult(stdout="", stderr="Command timed out", exit_code=124)

        if background:
            # For background commands, try to get the PID
            ps_result = _run_docker(
                ["exec", self._container_id, "sh", "-c", "echo $$"],
                timeout=5,
                check=False,
            )
            pid = 0
            try:
                pid = int(ps_result.stdout.decode().strip())
            except (ValueError, AttributeError):
                pass
            return BackgroundProcess(pid=pid)

        return CommandResult(
            stdout=result.stdout.decode(errors="replace"),
            stderr=result.stderr.decode(errors="replace"),
            exit_code=result.returncode,
        )


class DockerFilesystemAPI:
    """Filesystem operations inside a Docker container."""

    def __init__(self, container_id: str) -> None:
        self._container_id = container_id

    def list(self, path: str) -> list[FileEntry]:
        result = _run_docker(
            ["exec", self._container_id, "ls", "-1F", path],
            check=False,
        )
        if result.returncode != 0:
            return []
        entries = []
        for line in result.stdout.decode(errors="replace").strip().splitlines():
            line = line.strip()
            if not line:
                continue
            is_dir = line.endswith("/")
            name = line.rstrip("*/=>@|")
            entries.append(FileEntry(name=name, is_dir=is_dir))
        return entries

    def read(self, path: str) -> str:
        result = _run_docker(
            ["exec", self._container_id, "cat", path],
            check=False,
        )
        if result.returncode != 0:
            raise FileNotFoundError(
                f"Cannot read {path}: {result.stderr.decode(errors='replace')}"
            )
        return result.stdout.decode(errors="replace")

    def write(self, path: str, content: str) -> None:
        # Ensure parent directory exists
        parent = str(Path(path).parent)
        _run_docker(
            ["exec", self._container_id, "mkdir", "-p", parent],
            check=False,
        )
        # Pipe content through stdin
        _run_docker(
            ["exec", "-i", self._container_id, "sh", "-c", f"cat > {path}"],
            input_data=content.encode(),
        )

    def read_bytes(self, path: str) -> bytes:
        result = _run_docker(
            ["exec", self._container_id, "cat", path],
            check=False,
        )
        if result.returncode != 0:
            raise FileNotFoundError(
                f"Cannot read {path}: {result.stderr.decode(errors='replace')}"
            )
        return result.stdout

    def write_bytes(self, path: str, data: bytes) -> None:
        parent = str(Path(path).parent)
        _run_docker(
            ["exec", self._container_id, "mkdir", "-p", parent],
            check=False,
        )
        _run_docker(
            ["exec", "-i", self._container_id, "sh", "-c", f"cat > {path}"],
            input_data=data,
        )

    def make_dir(self, path: str) -> None:
        _run_docker(
            ["exec", self._container_id, "mkdir", "-p", path],
        )

    def remove(self, path: str) -> None:
        _run_docker(
            ["exec", self._container_id, "rm", "-rf", path],
        )


class DockerSandboxInstance:
    """A sandbox running as a Docker container."""

    def __init__(self, container_id: str, port_map: dict[int, int] | None = None) -> None:
        self._container_id = container_id
        self._commands = DockerCommandsAPI(container_id)
        self._filesystem = DockerFilesystemAPI(container_id)
        self._port_map = port_map or {}

    @property
    def sandbox_id(self) -> str:
        return self._container_id

    @property
    def commands(self) -> DockerCommandsAPI:
        return self._commands

    @property
    def filesystem(self) -> DockerFilesystemAPI:
        return self._filesystem

    def get_host(self, port: int) -> str:
        """Get localhost URL for a mapped port."""
        if port in self._port_map:
            return f"localhost:{self._port_map[port]}"
        # Try to look up the port mapping from docker
        result = _run_docker(
            ["port", self._container_id, str(port)],
            check=False,
        )
        if result.returncode == 0:
            mapping = result.stdout.decode().strip().split("\n")[0]
            # Format: 0.0.0.0:32768 or :::32768
            if ":" in mapping:
                host_port = mapping.rsplit(":", 1)[-1]
                return f"localhost:{host_port}"
        return f"localhost:{port}"

    def set_timeout(self, timeout: int) -> None:
        """Store deadline as a container label (checked on connect)."""
        deadline = int(time.time()) + timeout
        _run_docker(
            ["container", "update", "--label", f"dev.sbx.deadline={deadline}",
             self._container_id],
            check=False,
        )

    def pause(self) -> None:
        """Pause the container (freezes all processes)."""
        _run_docker(["pause", self._container_id])


class DockerBackend:
    """Docker sandbox provider — manages containers as sandboxes."""

    def _ensure_docker(self) -> None:
        """Verify Docker daemon is available."""
        try:
            _run_docker(["info"], timeout=10)
        except (subprocess.CalledProcessError, FileNotFoundError) as exc:
            raise RuntimeError(
                "Docker is not available. Ensure Docker Desktop (or Podman/Rancher Desktop) "
                "is installed and running."
            ) from exc

    def _build_or_pull_image(self, template: str) -> str:
        """Build a local template image or use an existing one."""
        image_name = f"sbx-{template}:latest"

        # Check if image already exists
        result = _run_docker(
            ["image", "inspect", image_name],
            check=False,
        )
        if result.returncode == 0:
            return image_name

        # Try to build from docker-templates/
        template_dir = _TEMPLATES_DIR / template
        if template_dir.exists() and (template_dir / "Dockerfile").exists():
            _run_docker(
                ["build", "-t", image_name, str(template_dir)],
                timeout=300,
            )
            return image_name

        # Fallback: use template name as a Docker Hub image
        # (e.g., "node" → "node:20-bookworm", "python" → "python:3.12-bookworm")
        fallback_images = {
            "base": "ubuntu:22.04",
            "node": "node:20-bookworm",
            "python": "python:3.12-bookworm",
        }
        return fallback_images.get(template, template)

    def create(
        self,
        template: str = "base",
        timeout: int = 600,
        ports: list[int] | None = None,
    ) -> DockerSandboxInstance:
        self._ensure_docker()
        image = self._build_or_pull_image(template)

        container_name = f"sbx-{uuid.uuid4().hex[:12]}"
        deadline = int(time.time()) + timeout

        # Build port mappings
        ports_to_map = ports or _DEFAULT_PORTS
        port_map: dict[int, int] = {}
        port_args: list[str] = []
        for p in ports_to_map:
            host_port = _find_free_port(32768 + len(port_map))
            port_map[p] = host_port
            port_args.extend(["-p", f"{host_port}:{p}"])

        args = [
            "run", "-d",
            "--name", container_name,
            "--label", _LABEL,
            "--label", f"dev.sbx.template={template}",
            "--label", f"dev.sbx.deadline={deadline}",
            "--label", f"dev.sbx.created={int(time.time())}",
            "--memory", "2g",
            "--cpus", "2",
            "-w", "/workspace",
        ] + port_args + [image, "sleep", "infinity"]

        result = _run_docker(args)
        container_id = result.stdout.decode().strip()[:12]

        # Ensure /workspace exists and has correct ownership
        _run_docker(
            ["exec", container_name, "sh", "-c",
             "mkdir -p /workspace && "
             "(id user >/dev/null 2>&1 && chown user:user /workspace || true)"],
            check=False,
        )

        return DockerSandboxInstance(container_name, port_map)

    def connect(self, sandbox_id: str) -> DockerSandboxInstance:
        """Reconnect to an existing container."""
        self._ensure_docker()

        # Verify container exists and is running
        result = _run_docker(
            ["inspect", "--format", "{{.State.Status}}", sandbox_id],
            check=False,
        )
        if result.returncode != 0:
            raise RuntimeError(f"Container {sandbox_id} not found")

        status = result.stdout.decode().strip()
        if status == "paused":
            _run_docker(["unpause", sandbox_id])
        elif status != "running":
            raise RuntimeError(
                f"Container {sandbox_id} is not running (status: {status})"
            )

        # Check deadline
        deadline_result = _run_docker(
            ["inspect", "--format",
             "{{index .Config.Labels \"dev.sbx.deadline\"}}",
             sandbox_id],
            check=False,
        )
        if deadline_result.returncode == 0:
            deadline_str = deadline_result.stdout.decode().strip()
            try:
                deadline = int(deadline_str)
                if deadline > 0 and time.time() > deadline:
                    self.kill(sandbox_id)
                    raise RuntimeError(
                        f"Container {sandbox_id} has expired (deadline passed). "
                        "Create a new sandbox."
                    )
            except ValueError:
                pass

        # Reconstruct port map from docker inspect
        port_map = self._get_port_map(sandbox_id)
        return DockerSandboxInstance(sandbox_id, port_map)

    def _get_port_map(self, sandbox_id: str) -> dict[int, int]:
        """Reconstruct port mappings from a running container."""
        result = _run_docker(
            ["inspect", "--format", "{{json .NetworkSettings.Ports}}", sandbox_id],
            check=False,
        )
        port_map: dict[int, int] = {}
        if result.returncode != 0:
            return port_map
        try:
            ports_json = json.loads(result.stdout.decode())
            for container_port_str, mappings in (ports_json or {}).items():
                if not mappings:
                    continue
                # container_port_str format: "3000/tcp"
                container_port = int(container_port_str.split("/")[0])
                host_port = int(mappings[0].get("HostPort", 0))
                if host_port:
                    port_map[container_port] = host_port
        except (json.JSONDecodeError, ValueError, KeyError):
            pass
        return port_map

    def kill(self, sandbox_id: str) -> None:
        """Remove a container and its resources."""
        self._ensure_docker()
        _run_docker(["rm", "-f", sandbox_id], check=False)

    def list(self) -> list[dict]:
        """List all sbx-managed containers."""
        self._ensure_docker()
        result = _run_docker(
            ["ps", "-a", "--filter", f"label={_LABEL}",
             "--format", "{{.Names}}\t{{.Status}}\t{{.Labels}}"],
            check=False,
        )
        if result.returncode != 0:
            return []

        containers = []
        for line in result.stdout.decode().strip().splitlines():
            if not line.strip():
                continue
            parts = line.split("\t")
            name = parts[0] if len(parts) > 0 else "unknown"
            status = parts[1] if len(parts) > 1 else "unknown"
            labels_str = parts[2] if len(parts) > 2 else ""

            # Extract template from labels
            template = "unknown"
            for label in labels_str.split(","):
                if label.strip().startswith("dev.sbx.template="):
                    template = label.strip().split("=", 1)[1]

            containers.append({
                "sandbox_id": name,
                "template_id": template,
                "status": status,
            })
        return containers
