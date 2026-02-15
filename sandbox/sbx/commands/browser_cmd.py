"""Browser interaction commands for sandbox-hosted applications."""

import click
from rich.console import Console

from sbx.errors import friendly_errors
from sbx.modules.sandbox import get_sandbox
from sbx.modules.browser import (
    init_browser,
    start_browser,
    close_browser,
    navigate,
    click_element,
    type_text,
    evaluate_js,
    take_screenshot,
    get_accessibility_tree,
    get_dom,
    browser_status,
)


def _get_provider(ctx: click.Context) -> str | None:
    return ctx.obj.get("provider") if ctx.obj else None


@click.group()
def browser() -> None:
    """Browser interaction with sandbox-hosted applications."""
    pass


@browser.command()
@click.argument("sandbox_id")
@click.pass_context
@friendly_errors
def init(ctx: click.Context, sandbox_id: str) -> None:
    """Initialize browser environment in the sandbox."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    init_browser(sbx)
    console.print("[green]Browser environment initialized[/green]")


@browser.command()
@click.argument("sandbox_id")
@click.option("--headless/--no-headless", default=True, help="Run in headless mode")
@click.pass_context
@friendly_errors
def start(ctx: click.Context, sandbox_id: str, headless: bool) -> None:
    """Start a browser instance in the sandbox."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    start_browser(sbx, headless=headless)
    console.print("[green]Browser started[/green]")


@browser.command()
@click.argument("sandbox_id")
@click.pass_context
@friendly_errors
def close(ctx: click.Context, sandbox_id: str) -> None:
    """Close the browser instance."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    close_browser(sbx)
    console.print("[yellow]Browser closed[/yellow]")


@browser.command()
@click.argument("sandbox_id")
@click.argument("url")
@click.pass_context
@friendly_errors
def nav(ctx: click.Context, sandbox_id: str, url: str) -> None:
    """Navigate to a URL in the browser."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    navigate(sbx, url)
    console.print(f"[green]Navigated to {url}[/green]")


@browser.command("click")
@click.argument("sandbox_id")
@click.argument("selector")
@click.pass_context
@friendly_errors
def click_cmd(ctx: click.Context, sandbox_id: str, selector: str) -> None:
    """Click an element by CSS selector."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    click_element(sbx, selector)
    console.print(f"[green]Clicked {selector}[/green]")


@browser.command("type")
@click.argument("sandbox_id")
@click.argument("selector")
@click.argument("text")
@click.pass_context
@friendly_errors
def type_cmd(ctx: click.Context, sandbox_id: str, selector: str, text: str) -> None:
    """Type text into an element."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    type_text(sbx, selector, text)
    console.print(f"[green]Typed into {selector}[/green]")


@browser.command()
@click.argument("sandbox_id")
@click.argument("script")
@click.pass_context
@friendly_errors
def eval(ctx: click.Context, sandbox_id: str, script: str) -> None:
    """Evaluate JavaScript in the browser."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    result = evaluate_js(sbx, script)
    console.print(result)


@browser.command()
@click.argument("sandbox_id")
@click.option("--output", "-o", default="screenshot.png", help="Output file path")
@click.pass_context
@friendly_errors
def screenshot(ctx: click.Context, sandbox_id: str, output: str) -> None:
    """Take a screenshot of the browser."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    take_screenshot(sbx, output)
    console.print(f"[green]Screenshot saved to {output}[/green]")


@browser.command("a11y")
@click.argument("sandbox_id")
@click.pass_context
@friendly_errors
def a11y_cmd(ctx: click.Context, sandbox_id: str) -> None:
    """Get the accessibility tree of the current page."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    tree = get_accessibility_tree(sbx)
    console.print(tree)


@browser.command()
@click.argument("sandbox_id")
@click.option("--selector", "-s", default=None, help="CSS selector to scope DOM output")
@click.pass_context
@friendly_errors
def dom(ctx: click.Context, sandbox_id: str, selector: str | None) -> None:
    """Get the DOM structure of the current page."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    html = get_dom(sbx, selector=selector)
    console.print(html)


@browser.command()
@click.argument("sandbox_id")
@click.pass_context
@friendly_errors
def status(ctx: click.Context, sandbox_id: str) -> None:
    """Check browser status in the sandbox."""
    console = Console()
    sbx = get_sandbox(sandbox_id, provider=_get_provider(ctx))
    info = browser_status(sbx)
    for key, value in info.items():
        console.print(f"[cyan]{key}:[/cyan] {value}")
