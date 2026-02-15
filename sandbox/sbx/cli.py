"""Main CLI entry point for the sbx sandbox tool."""

import click
from dotenv import load_dotenv
from rich.console import Console

from sbx.commands.sandbox_cmd import sandbox
from sbx.commands.exec_cmd import exec_group
from sbx.commands.files_cmd import files
from sbx.commands.browser_cmd import browser
from sbx.commands.setup_cmd import doctor, setup

console = Console()

load_dotenv()


@click.group()
@click.version_option(package_name="sbx")
@click.option(
    "--provider", "-P",
    type=click.Choice(["e2b", "docker", "auto"], case_sensitive=False),
    default=None,
    envvar="SBX_PROVIDER",
    help="Sandbox provider: e2b (cloud), docker (local), or auto (detect).",
)
@click.pass_context
def main(ctx: click.Context, provider: str | None) -> None:
    """Sandbox CLI — isolated environments for code execution and testing."""
    ctx.ensure_object(dict)
    ctx.obj["console"] = console
    ctx.obj["provider"] = provider


main.add_command(sandbox)
main.add_command(exec_group, name="exec")
main.add_command(files)
main.add_command(browser)
main.add_command(doctor)
main.add_command(setup)


@main.command()
@click.option("--template", "-t", default=None, help="Template name (base, node, python)")
@click.option("--timeout", default=600, help="Sandbox timeout in seconds")
@click.pass_context
def init(ctx: click.Context, template: str | None, timeout: int) -> None:
    """Shortcut: create a sandbox and display its ID."""
    ctx.invoke(sandbox.commands["create"], template=template, timeout=timeout)


if __name__ == "__main__":
    main()
