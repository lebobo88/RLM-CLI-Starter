"""Protocol definitions for sandbox backend abstraction.

Defines contracts that both E2B and Docker backends must satisfy.
Uses typing.Protocol for structural subtyping — backends don't need inheritance.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol, runtime_checkable


@dataclass
class CommandResult:
    """Result of a command execution inside a sandbox."""

    stdout: str = ""
    stderr: str = ""
    exit_code: int = 0


@dataclass
class BackgroundProcess:
    """Handle for a background process running inside a sandbox."""

    pid: int = 0


@dataclass
class FileEntry:
    """Entry in a sandbox filesystem listing."""

    name: str = ""
    is_dir: bool = False


@runtime_checkable
class CommandsAPI(Protocol):
    """Protocol for executing commands inside a sandbox."""

    def run(
        self,
        command: str,
        cwd: str = "/workspace",
        envs: dict | None = None,
        user: str = "user",
        timeout: int = 60,
        background: bool = False,
    ) -> CommandResult | BackgroundProcess: ...


@runtime_checkable
class FilesystemAPI(Protocol):
    """Protocol for filesystem operations inside a sandbox."""

    def list(self, path: str) -> list[FileEntry]: ...

    def read(self, path: str) -> str: ...

    def write(self, path: str, content: str) -> None: ...

    def read_bytes(self, path: str) -> bytes: ...

    def write_bytes(self, path: str, data: bytes) -> None: ...

    def make_dir(self, path: str) -> None: ...

    def remove(self, path: str) -> None: ...


@runtime_checkable
class SandboxInstance(Protocol):
    """Protocol for a connected sandbox instance."""

    @property
    def sandbox_id(self) -> str: ...

    @property
    def commands(self) -> CommandsAPI: ...

    @property
    def filesystem(self) -> FilesystemAPI: ...

    def get_host(self, port: int) -> str: ...

    def set_timeout(self, timeout: int) -> None: ...

    def pause(self) -> None: ...


@runtime_checkable
class SandboxProvider(Protocol):
    """Protocol for sandbox backend providers (E2B, Docker, etc.)."""

    def create(
        self, template: str = "base", timeout: int = 600
    ) -> SandboxInstance: ...

    def connect(self, sandbox_id: str) -> SandboxInstance: ...

    def kill(self, sandbox_id: str) -> None: ...

    def list(self) -> list: ...
