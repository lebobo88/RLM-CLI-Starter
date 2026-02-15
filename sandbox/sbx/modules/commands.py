"""Command execution helpers for sandboxes."""

from sbx.provider import SandboxInstance


def run_command(
    sbx: SandboxInstance,
    command: str,
    cwd: str = "/workspace",
    env_vars: dict | None = None,
    user: str = "user",
    timeout: int = 60,
):
    """Run a command synchronously inside the sandbox."""
    return sbx.commands.run(
        command,
        cwd=cwd,
        envs=env_vars or {},
        user=user,
        timeout=timeout,
    )


def run_background(
    sbx: SandboxInstance,
    command: str,
    cwd: str = "/workspace",
    env_vars: dict | None = None,
    user: str = "user",
):
    """Run a command in background inside the sandbox."""
    return sbx.commands.run(
        command,
        cwd=cwd,
        envs=env_vars or {},
        user=user,
        background=True,
    )


def list_processes(sbx: SandboxInstance) -> str:
    """List running processes in the sandbox."""
    result = sbx.commands.run("ps aux")
    return result.stdout


def kill_process(sbx: SandboxInstance, pid: int) -> None:
    """Kill a process by PID in the sandbox."""
    sbx.commands.run(f"kill {pid}")
