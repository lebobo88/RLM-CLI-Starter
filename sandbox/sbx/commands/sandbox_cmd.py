"""Sandbox lifecycle management commands."""

import json
import os

import click
from rich.console import Console
from rich.table import Table

from sbx.errors import friendly_errors
from sbx.modules.sandbox import (
    create_sandbox,
    get_sandbox,
    kill_sandbox,
    list_sandboxes,
    load_state,
    save_state,
)


def _get_provider(ctx: click.Context) -> str | None:
    """Get provider from click context, falling back to state file."""
    return ctx.obj.get("provider") if ctx.obj else None


@click.group()
@click.pass_context
def sandbox(ctx: click.Context) -> None:
    """Manage sandbox lifecycle — create, list, kill, inspect."""
    ctx.ensure_object(dict)


@sandbox.command()
@click.option("--template", "-t", default=None, help="Template name (base, node, python)")
@click.option("--timeout", default=600, help="Sandbox timeout in seconds")
@click.pass_context
@friendly_errors
def create(ctx: click.Context, template: str | None, timeout: int) -> None:
    """Create a new sandbox."""
    console = Console()
    provider = _get_provider(ctx)
    template = template or os.environ.get("E2B_TEMPLATE", "base")
    with console.status("Creating sandbox..."):
        sbx = create_sandbox(template=template, timeout=timeout, provider=provider)
    console.print(f"[green]Sandbox created:[/green] {sbx.sandbox_id}")
    console.print(f"  Template: {template}")
    console.print(f"  Timeout:  {timeout}s")
    state = load_state()
    if state.get("provider"):
        console.print(f"  Provider: {state['provider']}")


@sandbox.command("list")
@click.pass_context
@friendly_errors
def list_cmd(ctx: click.Context) -> None:
    """List all running sandboxes."""
    console = Console()
    provider = _get_provider(ctx)
    sandboxes = list_sandboxes(provider=provider)
    if not sandboxes:
        console.print("[dim]No running sandboxes[/dim]")
        return
    table = Table(title="Running Sandboxes")
    table.add_column("Sandbox ID", style="cyan")
    table.add_column("Template", style="green")
    table.add_column("Status", style="yellow")
    for sbx in sandboxes:
        if isinstance(sbx, dict):
            sandbox_id = sbx.get("sandbox_id", "unknown")
            template_id = sbx.get("template_id", "unknown")
            status = sbx.get("status", "running")
        else:
            sandbox_id = getattr(sbx, "sandbox_id", "unknown")
            template_id = getattr(sbx, "template_id", "unknown")
            status = getattr(sbx, "started_at", "running")
        table.add_row(str(sandbox_id), str(template_id), str(status))
    console.print(table)


@sandbox.command()
@click.argument("sandbox_id")
@click.pass_context
@friendly_errors
def kill(ctx: click.Context, sandbox_id: str) -> None:
    """Kill a running sandbox."""
    console = Console()
    provider = _get_provider(ctx)
    kill_sandbox(sandbox_id, provider=provider)
    console.print(f"[red]Sandbox killed:[/red] {sandbox_id}")


@sandbox.command()
@click.argument("sandbox_id")
@click.pass_context
@friendly_errors
def info(ctx: click.Context, sandbox_id: str) -> None:
    """Show detailed sandbox information."""
    console = Console()
    provider = _get_provider(ctx)
    sbx = get_sandbox(sandbox_id, provider=provider)
    console.print(f"[cyan]Sandbox ID:[/cyan] {sbx.sandbox_id}")
    state = load_state()
    console.print(f"[cyan]Provider:[/cyan]   {state.get('provider', 'unknown')}")
    console.print(f"[cyan]Template:[/cyan]   {state.get('template', 'unknown')}")


@sandbox.command()
@click.argument("sandbox_id")
@click.pass_context
@friendly_errors
def status(ctx: click.Context, sandbox_id: str) -> None:
    """Check if a sandbox is still running."""
    console = Console()
    provider = _get_provider(ctx)
    try:
        sbx = get_sandbox(sandbox_id, provider=provider)
        console.print(f"[green]Sandbox {sandbox_id} is running[/green]")
    except Exception:
        console.print(f"[red]Sandbox {sandbox_id} is not available[/red]")


@sandbox.command("get-host")
@click.argument("sandbox_id")
@click.option("--port", "-p", required=True, type=int, help="Port number to get host URL for")
@click.pass_context
@friendly_errors
def get_host(ctx: click.Context, sandbox_id: str, port: int) -> None:
    """Get the hostname for a sandbox port."""
    console = Console()
    provider = _get_provider(ctx)
    sbx = get_sandbox(sandbox_id, provider=provider)
    host = sbx.get_host(port)
    # Docker returns localhost:port, E2B returns a public hostname
    if host.startswith("localhost"):
        console.print(f"[green]http://{host}[/green]")
    else:
        console.print(f"[green]https://{host}[/green]")


@sandbox.command("extend-lifetime")
@click.argument("sandbox_id")
@click.option("--timeout", "-t", required=True, type=int, help="New timeout in seconds")
@click.pass_context
@friendly_errors
def extend_lifetime(ctx: click.Context, sandbox_id: str, timeout: int) -> None:
    """Extend a sandbox's lifetime."""
    console = Console()
    provider = _get_provider(ctx)
    sbx = get_sandbox(sandbox_id, provider=provider)
    sbx.set_timeout(timeout)
    console.print(f"[green]Sandbox {sandbox_id} lifetime extended to {timeout}s[/green]")


@sandbox.command()
@click.argument("sandbox_id")
@click.pass_context
@friendly_errors
def pause(ctx: click.Context, sandbox_id: str) -> None:
    """Pause a sandbox (preserve state, stop billing/resources)."""
    console = Console()
    provider = _get_provider(ctx)
    sbx = get_sandbox(sandbox_id, provider=provider)
    sbx.pause()
    console.print(f"[yellow]Sandbox {sandbox_id} paused[/yellow]")


@sandbox.command()
@click.pass_context
@friendly_errors
def gc(ctx: click.Context) -> None:
    """Garbage-collect expired sandboxes."""
    console = Console()
    provider = _get_provider(ctx)
    sandboxes = list_sandboxes(provider=provider)
    removed = 0
    for sbx in sandboxes:
        sandbox_id = sbx.get("sandbox_id") if isinstance(sbx, dict) else getattr(sbx, "sandbox_id", None)
        if not sandbox_id:
            continue
        try:
            get_sandbox(sandbox_id, provider=provider)
        except RuntimeError:
            # Expired or invalid — kill it
            kill_sandbox(sandbox_id, provider=provider)
            console.print(f"[red]Removed expired sandbox:[/red] {sandbox_id}")
            removed += 1
    if removed == 0:
        console.print("[dim]No expired sandboxes found[/dim]")
    else:
        console.print(f"[green]Cleaned up {removed} sandbox(es)[/green]")
