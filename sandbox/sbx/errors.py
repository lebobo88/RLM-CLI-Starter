"""Friendly error handling for sbx CLI commands.

Wraps common exceptions (RuntimeError, ImportError) with clean messages
and actionable fix suggestions instead of raw tracebacks.
"""

from __future__ import annotations

import functools
from typing import Any, Callable

import click


# Maps error substrings to (short_message, fix_steps) tuples.
_ERROR_HINTS: list[tuple[str, str, list[str]]] = [
    (
        "E2B_API_KEY",
        "E2B API key is not configured.",
        [
            "Run: uv run sbx setup  (guided configuration)",
            "Or add E2B_API_KEY=... to sandbox/.env",
            "Or switch to Docker: uv run sbx --provider docker ...",
        ],
    ),
    (
        "e2b",
        "The E2B package is not installed.",
        [
            "Run: pip install sbx[e2b]  or  uv pip install e2b",
            "Or switch to Docker (no extra packages): uv run sbx --provider docker ...",
        ],
    ),
    (
        "Docker is not available",
        "Docker daemon is not running.",
        [
            "Start Docker Desktop (or Podman / Rancher Desktop)",
            "Or switch to E2B: uv run sbx --provider e2b ...",
        ],
    ),
    (
        "docker",
        "Docker error.",
        [
            "Ensure Docker Desktop is running: docker info",
            "Run: uv run sbx doctor  to check prerequisites",
        ],
    ),
]


def _find_hint(error_msg: str) -> tuple[str, list[str]] | None:
    """Match an error message to the best hint entry."""
    lower = error_msg.lower()
    for pattern, short, steps in _ERROR_HINTS:
        if pattern.lower() in lower:
            return short, steps
    return None


def friendly_errors(fn: Callable[..., Any]) -> Callable[..., Any]:
    """Decorator that catches common exceptions and shows friendly messages.

    Wraps a Click command function so that RuntimeError and ImportError
    are displayed as clean, actionable messages instead of tracebacks.
    """

    @functools.wraps(fn)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        try:
            return fn(*args, **kwargs)
        except click.exceptions.Exit:
            raise  # Let Click handle its own exits
        except click.ClickException:
            raise  # Already a friendly Click error
        except (RuntimeError, ImportError) as exc:
            error_msg = str(exc)
            hint = _find_hint(error_msg)

            console = click.get_current_context().obj.get("console") if click.get_current_context().obj else None

            if console:
                console.print(f"\n[bold red]Error:[/bold red] {error_msg}")
                if hint:
                    short, steps = hint
                    console.print(f"\n[bold yellow]Fix:[/bold yellow] {short}")
                    for step in steps:
                        console.print(f"  {step}")
                else:
                    console.print("\n[dim]Run: uv run sbx doctor  to diagnose issues[/dim]")
                console.print()
            else:
                click.echo(f"\nError: {error_msg}", err=True)
                if hint:
                    _, steps = hint
                    click.echo("\nFix:", err=True)
                    for step in steps:
                        click.echo(f"  {step}", err=True)
                else:
                    click.echo("\nRun: uv run sbx doctor  to diagnose issues", err=True)

            raise SystemExit(1)

    return wrapper
