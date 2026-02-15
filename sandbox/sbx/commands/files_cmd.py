"""File operations inside sandboxes."""

import os

import click
from rich.console import Console
from rich.syntax import Syntax
from rich.table import Table

from sbx.modules.sandbox import get_sandbox
from sbx.errors import friendly_errors
from sbx.modules.files import (
    list_files,
    read_file,
    write_file,
    upload_file,
    download_file,
    upload_dir,
    download_dir,
    file_exists,
    file_info,
    mkdir_in_sandbox,
    remove_in_sandbox,
    move_in_sandbox,
)


def _get_provider(ctx: click.Context) -> str | None:
    return ctx.obj.get("provider") if ctx.obj else None


@click.group()
def files() -> None:
    """File operations inside a sandbox."""
    pass


@files.command("ls")
@click.argument("sandbox_id")
@click.argument("path", default="/workspace")
@click.pass_context
@friendly_errors
def ls_cmd(ctx: click.Context, sandbox_id: str, path: str) -> None:
    """List files in a sandbox directory."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    entries = list_files(sbx, path)
    table = Table(title=f"Files in {path}")
    table.add_column("Name", style="cyan")
    table.add_column("Type", style="green")
    for entry in entries:
        entry_type = "dir" if getattr(entry, "is_dir", False) else "file"
        table.add_row(entry.name, entry_type)
    console.print(table)


@files.command()
@click.argument("sandbox_id")
@click.argument("path")
@click.pass_context
@friendly_errors
def read(ctx: click.Context, sandbox_id: str, path: str) -> None:
    """Read a file from the sandbox."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    content = read_file(sbx, path)
    ext = os.path.splitext(path)[1].lstrip(".")
    if ext in ("js", "ts", "tsx", "jsx", "py", "json", "yaml", "yml", "md", "css", "html"):
        syntax = Syntax(content, ext, theme="monokai", line_numbers=True)
        console.print(syntax)
    else:
        console.print(content)


@files.command()
@click.argument("sandbox_id")
@click.argument("path")
@click.argument("content")
@click.pass_context
@friendly_errors
def write(ctx: click.Context, sandbox_id: str, path: str, content: str) -> None:
    """Write content to a file in the sandbox."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    write_file(sbx, path, content)
    console.print(f"[green]Written to {path}[/green]")


@files.command()
@click.argument("sandbox_id")
@click.argument("path")
@click.argument("old_text")
@click.argument("new_text")
@click.pass_context
@friendly_errors
def edit(ctx: click.Context, sandbox_id: str, path: str, old_text: str, new_text: str) -> None:
    """Edit a file by replacing text."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    content = read_file(sbx, path)
    if old_text not in content:
        console.print("[red]Error: old_text not found in file[/red]")
        raise SystemExit(1)
    updated = content.replace(old_text, new_text, 1)
    write_file(sbx, path, updated)
    console.print(f"[green]Edited {path}[/green]")


@files.command()
@click.argument("sandbox_id")
@click.argument("local_path")
@click.argument("remote_path")
@click.pass_context
@friendly_errors
def upload(ctx: click.Context, sandbox_id: str, local_path: str, remote_path: str) -> None:
    """Upload a local file to the sandbox."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    upload_file(sbx, local_path, remote_path)
    console.print(f"[green]Uploaded {local_path} -> {remote_path}[/green]")


@files.command()
@click.argument("sandbox_id")
@click.argument("remote_path")
@click.argument("local_path")
@click.pass_context
@friendly_errors
def download(ctx: click.Context, sandbox_id: str, remote_path: str, local_path: str) -> None:
    """Download a file from the sandbox."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    download_file(sbx, remote_path, local_path)
    console.print(f"[green]Downloaded {remote_path} -> {local_path}[/green]")


@files.command("upload-dir")
@click.argument("sandbox_id")
@click.argument("local_dir")
@click.argument("remote_dir")
@click.pass_context
@friendly_errors
def upload_dir_cmd(ctx: click.Context, sandbox_id: str, local_dir: str, remote_dir: str) -> None:
    """Upload a local directory to the sandbox recursively."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    count = upload_dir(sbx, local_dir, remote_dir)
    console.print(f"[green]Uploaded {count} files to {remote_dir}[/green]")


@files.command("download-dir")
@click.argument("sandbox_id")
@click.argument("remote_dir")
@click.argument("local_dir")
@click.pass_context
@friendly_errors
def download_dir_cmd(ctx: click.Context, sandbox_id: str, remote_dir: str, local_dir: str) -> None:
    """Download a sandbox directory to local recursively."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    count = download_dir(sbx, remote_dir, local_dir)
    console.print(f"[green]Downloaded {count} files to {local_dir}[/green]")


@files.command()
@click.argument("sandbox_id")
@click.argument("path")
@click.pass_context
@friendly_errors
def mkdir(ctx: click.Context, sandbox_id: str, path: str) -> None:
    """Create a directory in the sandbox."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    mkdir_in_sandbox(sbx, path)
    console.print(f"[green]Created directory {path}[/green]")


@files.command()
@click.argument("sandbox_id")
@click.argument("path")
@click.pass_context
@friendly_errors
def rm(ctx: click.Context, sandbox_id: str, path: str) -> None:
    """Remove a file or directory in the sandbox."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    remove_in_sandbox(sbx, path)
    console.print(f"[red]Removed {path}[/red]")


@files.command()
@click.argument("sandbox_id")
@click.argument("src")
@click.argument("dst")
@click.pass_context
@friendly_errors
def mv(ctx: click.Context, sandbox_id: str, src: str, dst: str) -> None:
    """Move/rename a file in the sandbox."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    move_in_sandbox(sbx, src, dst)
    console.print(f"[green]Moved {src} -> {dst}[/green]")


@files.command()
@click.argument("sandbox_id")
@click.argument("path")
@click.pass_context
@friendly_errors
def exists(ctx: click.Context, sandbox_id: str, path: str) -> None:
    """Check if a file exists in the sandbox."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    if file_exists(sbx, path):
        console.print(f"[green]{path} exists[/green]")
    else:
        console.print(f"[red]{path} does not exist[/red]")


@files.command("info")
@click.argument("sandbox_id")
@click.argument("path")
@click.pass_context
@friendly_errors
def info_cmd(ctx: click.Context, sandbox_id: str, path: str) -> None:
    """Get file metadata from the sandbox."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    finfo = file_info(sbx, path)
    console.print(f"[cyan]Path:[/cyan] {path}")
    for key, value in finfo.items():
        console.print(f"[cyan]{key}:[/cyan] {value}")
