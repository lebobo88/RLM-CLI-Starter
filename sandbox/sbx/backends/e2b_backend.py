"""E2B backend adapter — wraps the E2B SDK into the SandboxProvider protocol."""

from __future__ import annotations

import os

from e2b import Sandbox

from sbx.provider import (
    BackgroundProcess,
    CommandResult,
    FileEntry,
)


class E2BCommandsAdapter:
    """Adapts E2B's commands API to the CommandsAPI protocol."""

    def __init__(self, sbx: Sandbox) -> None:
        self._sbx = sbx

    def run(
        self,
        command: str,
        cwd: str = "/workspace",
        envs: dict | None = None,
        user: str = "user",
        timeout: int = 60,
        background: bool = False,
    ) -> CommandResult | BackgroundProcess:
        result = self._sbx.commands.run(
            command,
            cwd=cwd,
            envs=envs or {},
            user=user,
            timeout=timeout,
            background=background,
        )
        if background:
            return BackgroundProcess(pid=getattr(result, "pid", 0))
        return CommandResult(
            stdout=getattr(result, "stdout", ""),
            stderr=getattr(result, "stderr", ""),
            exit_code=getattr(result, "exit_code", 0),
        )


class E2BFilesystemAdapter:
    """Adapts E2B's filesystem API to the FilesystemAPI protocol."""

    def __init__(self, sbx: Sandbox) -> None:
        self._sbx = sbx

    def list(self, path: str) -> list[FileEntry]:
        entries = self._sbx.filesystem.list(path)
        return [
            FileEntry(
                name=getattr(e, "name", str(e)),
                is_dir=getattr(e, "is_dir", False),
            )
            for e in entries
        ]

    def read(self, path: str) -> str:
        return self._sbx.filesystem.read(path)

    def write(self, path: str, content: str) -> None:
        self._sbx.filesystem.write(path, content)

    def read_bytes(self, path: str) -> bytes:
        return self._sbx.filesystem.read_bytes(path)

    def write_bytes(self, path: str, data: bytes) -> None:
        self._sbx.filesystem.write_bytes(path, data)

    def make_dir(self, path: str) -> None:
        self._sbx.filesystem.make_dir(path)

    def remove(self, path: str) -> None:
        self._sbx.filesystem.remove(path)


class E2BSandboxInstance:
    """Wraps an E2B Sandbox into the SandboxInstance protocol."""

    def __init__(self, sbx: Sandbox) -> None:
        self._sbx = sbx
        self._commands = E2BCommandsAdapter(sbx)
        self._filesystem = E2BFilesystemAdapter(sbx)

    @property
    def sandbox_id(self) -> str:
        return self._sbx.sandbox_id

    @property
    def commands(self) -> E2BCommandsAdapter:
        return self._commands

    @property
    def filesystem(self) -> E2BFilesystemAdapter:
        return self._filesystem

    def get_host(self, port: int) -> str:
        return self._sbx.get_host(port)

    def set_timeout(self, timeout: int) -> None:
        self._sbx.set_timeout(timeout)

    def pause(self) -> None:
        self._sbx.pause()


class E2BBackend:
    """E2B sandbox provider — wraps E2B SDK calls into the SandboxProvider protocol."""

    def _get_api_key(self) -> str:
        api_key = os.environ.get("E2B_API_KEY", "")
        if not api_key:
            raise RuntimeError(
                "E2B_API_KEY not set. Add it to sandbox/.env or set it in your environment."
            )
        return api_key

    def create(self, template: str = "base", timeout: int = 600) -> E2BSandboxInstance:
        api_key = self._get_api_key()
        sbx = Sandbox(template=template, timeout=timeout, api_key=api_key)
        return E2BSandboxInstance(sbx)

    def connect(self, sandbox_id: str) -> E2BSandboxInstance:
        api_key = self._get_api_key()
        sbx = Sandbox.connect(sandbox_id, api_key=api_key)
        return E2BSandboxInstance(sbx)

    def kill(self, sandbox_id: str) -> None:
        api_key = self._get_api_key()
        Sandbox.kill(sandbox_id, api_key=api_key)

    def list(self) -> list:
        api_key = self._get_api_key()
        return Sandbox.list(api_key=api_key)
