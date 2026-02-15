"""Backend factory for sandbox providers.

Resolution order for provider selection:
1. Explicit `provider` argument
2. SBX_PROVIDER environment variable
3. RLM/config/project-config.json → sandbox.provider
4. Default: "auto" (detect Docker first, then E2B)
"""

from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path
from typing import TYPE_CHECKING

import click

if TYPE_CHECKING:
    from sbx.provider import SandboxProvider

_provider_cache: dict[str, SandboxProvider] = {}

# Path to project config (relative to sandbox/ directory)
_PROJECT_CONFIG = Path(__file__).resolve().parents[3] / "RLM" / "config" / "project-config.json"


def _is_docker_available() -> bool:
    """Check if Docker daemon is running and responsive."""
    try:
        result = subprocess.run(
            ["docker", "info"],
            capture_output=True,
            timeout=10,
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired, OSError):
        return False


def _is_e2b_available() -> bool:
    """Check if E2B API key is set and the package is importable."""
    key = os.environ.get("E2B_API_KEY")
    if not key:
        # Check .env file in sandbox directory
        dot_env = Path(__file__).resolve().parents[2] / ".env"
        if dot_env.exists():
            try:
                for line in dot_env.read_text().splitlines():
                    stripped = line.strip()
                    if stripped.startswith("E2B_API_KEY=") and not stripped.startswith("#"):
                        val = stripped.split("=", 1)[1].strip().strip("'\"")
                        if val:
                            key = val
                            break
            except OSError:
                pass
    if not key:
        return False
    try:
        import e2b  # noqa: F401
        return True
    except ImportError:
        return False


def _resolve_provider_name(provider: str | None = None) -> str:
    """Resolve provider name from arguments, env, config, or default."""
    if provider and provider != "auto":
        return provider

    # Environment variable
    env_provider = os.environ.get("SBX_PROVIDER")
    if env_provider and env_provider != "auto":
        return env_provider

    # Project config
    try:
        if _PROJECT_CONFIG.exists():
            config = json.loads(_PROJECT_CONFIG.read_text())
            cfg_provider = config.get("sandbox", {}).get("provider")
            if cfg_provider and cfg_provider != "auto":
                return cfg_provider
    except (json.JSONDecodeError, KeyError):
        pass

    return "auto"


def get_backend(provider: str | None = None) -> SandboxProvider:
    """Get a sandbox backend by provider name.

    Args:
        provider: Provider name ("e2b", "docker", or "auto").
                  None uses the resolution order above.

    Returns:
        A SandboxProvider instance.

    Raises:
        ValueError: If the provider name is unknown.
        ImportError: If required packages are missing (e.g., e2b).
        click.ClickException: If auto-detect finds no available provider.
    """
    name = _resolve_provider_name(provider)

    if name in _provider_cache:
        return _provider_cache[name]

    if name == "auto":
        if _is_docker_available():
            name = "docker"
        elif _is_e2b_available():
            name = "e2b"
        else:
            raise click.ClickException(
                "No sandbox provider available.\n\n"
                "  Docker: not running (install Docker Desktop and start it)\n"
                "  E2B:    API key not set or e2b package not installed\n\n"
                "Run: uv run sbx setup   (guided configuration)\n"
                "Run: uv run sbx doctor  (check prerequisites)"
            )
        # Check cache again after resolution
        if name in _provider_cache:
            return _provider_cache[name]

    if name == "e2b":
        try:
            from sbx.backends.e2b_backend import E2BBackend
        except ImportError as exc:
            raise ImportError(
                "E2B backend requires the 'e2b' package. "
                "Install it with: pip install sbx[e2b]  or  uv pip install e2b"
            ) from exc
        backend = E2BBackend()
    elif name == "docker":
        from sbx.backends.docker_backend import DockerBackend
        backend = DockerBackend()
    else:
        raise ValueError(
            f"Unknown sandbox provider: {name!r}. "
            f"Valid providers: 'e2b', 'docker', 'auto'"
        )

    _provider_cache[name] = backend
    return backend
