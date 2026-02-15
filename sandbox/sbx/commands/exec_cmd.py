"""Command execution inside sandboxes."""

import click
from rich.console import Console
from rich.syntax import Syntax

from sbx.errors import friendly_errors
from sbx.modules.sandbox import get_sandbox
from sbx.modules.commands import run_command, run_background, list_processes, kill_process


@click.group("exec")
def exec_group() -> None:
    """Execute commands inside a sandbox."""
    pass


@exec_group.command()
@click.argument("sandbox_id")
@click.argument("command")
@click.option("--cwd", default="/workspace", help="Working directory inside sandbox")
@click.option("--shell", default="/bin/bash", help="Shell to use")
@click.option("--env", "-e", multiple=True, help="Environment variable (KEY=VALUE)")
@click.option("--root", is_flag=True, help="Run as root user")
@click.option("--timeout", "-t", default=60, help="Timeout in seconds")
@click.option("--background", "-b", is_flag=True, help="Run in background")
@click.pass_context
@friendly_errors
def run(
    ctx: click.Context,
    sandbox_id: str,
    command: str,
    cwd: str,
    shell: str,
    env: tuple[str, ...],
    root: bool,
    timeout: int,
    background: bool,
) -> None:
    """Run a command inside a sandbox."""
    console = Console()
    provider = ctx.obj.get("provider") if ctx.obj else None
    sbx = get_sandbox(sandbox_id, provider=provider)

    env_vars = {}
    for e in env:
        key, _, value = e.partition("=")
        env_vars[key] = value

    if background:
        proc = run_background(
            sbx, command, cwd=cwd, env_vars=env_vars, user="root" if root else "user"
        )
        console.print(f"[green]Background process started:[/green] PID {proc.pid}")
        return

    result = run_command(
        sbx,
        command,
        cwd=cwd,
        env_vars=env_vars,
        user="root" if root else "user",
        timeout=timeout,
    )

    if result.stdout:
        console.print(result.stdout, end="")
    if result.stderr:
        console.print(f"[red]{result.stderr}[/red]", end="")
    if result.exit_code != 0:
        console.print(f"\n[red]Exit code: {result.exit_code}[/red]")
    else:
        console.print(f"\n[green]Exit code: {result.exit_code}[/green]")
