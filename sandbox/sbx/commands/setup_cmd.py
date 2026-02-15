"""Doctor and Setup commands for guided sandbox onboarding."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
from dataclasses import dataclass, field
from pathlib import Path

import click
from rich.console import Console
from rich.table import Table

# Paths relative to this file (sandbox/sbx/commands/ → sandbox/ → repo root)
_SANDBOX_DIR = Path(__file__).resolve().parents[2]
_REPO_ROOT = _SANDBOX_DIR.parent
_PROJECT_CONFIG = _REPO_ROOT / "RLM" / "config" / "project-config.json"
_DOT_ENV = _SANDBOX_DIR / ".env"
_DOT_ENV_EXAMPLE = _SANDBOX_DIR / ".env.example"


@dataclass
class CheckResult:
    """Single prerequisite check result."""

    name: str
    passed: bool
    detail: str


@dataclass
class DoctorResult:
    """Aggregated result from all prerequisite checks."""

    checks: list[CheckResult] = field(default_factory=list)
    docker_available: bool = False
    e2b_available: bool = False
    uv_available: bool = False
    deps_synced: bool = False

    @property
    def ready_providers(self) -> list[str]:
        providers = []
        if self.docker_available:
            providers.append("docker")
        if self.e2b_available:
            providers.append("e2b")
        return providers

    @property
    def recommended_provider(self) -> str | None:
        if self.docker_available:
            return "docker"
        if self.e2b_available:
            return "e2b"
        return None

    def to_dict(self) -> dict:
        return {
            "checks": [
                {"name": c.name, "passed": c.passed, "detail": c.detail}
                for c in self.checks
            ],
            "ready_providers": self.ready_providers,
            "recommended_provider": self.recommended_provider,
        }


def _check_docker() -> CheckResult:
    """Check if Docker daemon is running."""
    try:
        result = subprocess.run(
            ["docker", "info"],
            capture_output=True,
            timeout=10,
        )
        if result.returncode == 0:
            return CheckResult("Docker daemon", True, "Running")
        return CheckResult("Docker daemon", False, "Docker installed but daemon not running")
    except FileNotFoundError:
        return CheckResult("Docker daemon", False, "Docker not found in PATH")
    except subprocess.TimeoutExpired:
        return CheckResult("Docker daemon", False, "Docker daemon not responding (timeout)")
    except Exception as exc:
        return CheckResult("Docker daemon", False, str(exc))


def _check_e2b_key() -> CheckResult:
    """Check if E2B_API_KEY is set."""
    key = os.environ.get("E2B_API_KEY")
    if key:
        masked = key[:4] + "..." + key[-4:] if len(key) > 8 else "****"
        return CheckResult("E2B API key", True, f"Set ({masked})")

    # Check .env file
    if _DOT_ENV.exists():
        for line in _DOT_ENV.read_text().splitlines():
            stripped = line.strip()
            if stripped.startswith("E2B_API_KEY=") and not stripped.startswith("#"):
                val = stripped.split("=", 1)[1].strip().strip("'\"")
                if val:
                    masked = val[:4] + "..." + val[-4:] if len(val) > 8 else "****"
                    return CheckResult("E2B API key", True, f"In .env ({masked})")

    return CheckResult("E2B API key", False, "Not set (env or sandbox/.env)")


def _check_e2b_package() -> CheckResult:
    """Check if the e2b Python package is importable."""
    try:
        import e2b  # noqa: F401

        return CheckResult("E2B package", True, "Installed")
    except ImportError:
        return CheckResult("E2B package", False, "Not installed (pip install sbx[e2b])")


def _check_uv() -> CheckResult:
    """Check if uv is available."""
    if shutil.which("uv"):
        return CheckResult("uv", True, "Available")
    return CheckResult("uv", False, "Not found in PATH")


def _check_deps_synced() -> CheckResult:
    """Check if sandbox dependencies appear to be synced."""
    venv = _SANDBOX_DIR / ".venv"
    if venv.exists():
        return CheckResult("Dependencies synced", True, ".venv exists")
    return CheckResult("Dependencies synced", False, "Run: cd sandbox && uv sync")


def _run_checks() -> DoctorResult:
    """Run all prerequisite checks and return aggregated result."""
    docker = _check_docker()
    e2b_key = _check_e2b_key()
    e2b_pkg = _check_e2b_package()
    uv = _check_uv()
    deps = _check_deps_synced()

    result = DoctorResult(
        checks=[docker, e2b_key, e2b_pkg, uv, deps],
        docker_available=docker.passed,
        e2b_available=e2b_key.passed and e2b_pkg.passed,
        uv_available=uv.passed,
        deps_synced=deps.passed,
    )
    return result


@click.command()
@click.option("--json", "as_json", is_flag=True, help="Output results as JSON (for agents)")
def doctor(as_json: bool) -> None:
    """Check sandbox prerequisites and show readiness status."""
    result = _run_checks()

    if as_json:
        click.echo(json.dumps(result.to_dict(), indent=2))
        return

    console = Console()
    table = Table(title="Sandbox Prerequisites")
    table.add_column("Check", style="cyan")
    table.add_column("Status", justify="center")
    table.add_column("Detail", style="dim")

    for check in result.checks:
        status = "[green]PASS[/green]" if check.passed else "[red]FAIL[/red]"
        table.add_row(check.name, status, check.detail)

    console.print(table)
    console.print()

    providers = result.ready_providers
    if providers:
        console.print(f"[bold green]Ready providers:[/bold green] {', '.join(providers)}")
        if result.recommended_provider:
            console.print(f"[bold]Recommended:[/bold] {result.recommended_provider}")
    else:
        console.print("[bold red]No providers ready.[/bold red] Run: uv run sbx setup")

    console.print()


@click.command()
@click.option("--provider", "-p", type=click.Choice(["e2b", "docker"], case_sensitive=False), default=None, help="Skip detection, use this provider")
@click.option("--e2b-key", default=None, help="E2B API key (writes to sandbox/.env)")
@click.option("--non-interactive", is_flag=True, help="Non-interactive mode (for CI)")
@click.option("--no-sync", is_flag=True, help="Skip uv sync step")
def setup(provider: str | None, e2b_key: str | None, non_interactive: bool, no_sync: bool) -> None:
    """Interactive guided setup for sandbox providers."""
    console = Console()
    console.print("[bold]Sandbox Setup[/bold]\n")

    # Run checks
    result = _run_checks()

    # Determine provider
    chosen = provider
    if not chosen:
        providers = result.ready_providers
        if not providers:
            console.print("[yellow]Neither Docker nor E2B is ready.[/yellow]\n")
            console.print("To use [cyan]Docker[/cyan] (recommended — free, local):")
            console.print("  1. Install Docker Desktop: https://docker.com/products/docker-desktop/")
            console.print("  2. Start Docker Desktop")
            console.print("  3. Re-run: uv run sbx setup\n")
            console.print("To use [cyan]E2B[/cyan] (cloud):")
            console.print("  1. Get an API key: https://e2b.dev/")
            console.print("  2. Re-run: uv run sbx setup --e2b-key YOUR_KEY\n")
            raise SystemExit(1)
        elif len(providers) == 1:
            chosen = providers[0]
            if not non_interactive:
                console.print(f"[green]Detected:[/green] {chosen} is available.")
                if not click.confirm(f"Use {chosen} as your sandbox provider?", default=True):
                    console.print("Setup cancelled.")
                    return
            else:
                console.print(f"[green]Auto-selected:[/green] {chosen}")
        else:
            # Both available
            if non_interactive:
                chosen = "docker"
                console.print("[green]Auto-selected:[/green] docker (both available, preferring free/local)")
            else:
                console.print("[green]Both providers are available![/green]\n")
                chosen = click.prompt(
                    "Choose provider",
                    type=click.Choice(["docker", "e2b"], case_sensitive=False),
                    default="docker",
                )

    console.print(f"\n[bold]Provider:[/bold] {chosen}\n")

    # Handle E2B key if E2B chosen
    if chosen == "e2b" and not result.e2b_available:
        key = e2b_key
        if not key and not non_interactive:
            key = click.prompt("Enter your E2B API key", hide_input=True)
        if key:
            _write_env_key(key, console)
        else:
            console.print("[red]E2B API key required but not provided.[/red]")
            raise SystemExit(1)

    # Update project config
    _update_project_config(chosen, console)

    # Sync dependencies
    if not no_sync and result.uv_available and not result.deps_synced:
        console.print("Syncing dependencies...")
        try:
            subprocess.run(
                ["uv", "sync"],
                cwd=str(_SANDBOX_DIR),
                check=True,
                timeout=120,
            )
            console.print("[green]Dependencies synced.[/green]")
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
            console.print(f"[yellow]Warning: uv sync failed: {exc}[/yellow]")

    console.print(f"\n[bold green]Setup complete![/bold green] Provider set to [cyan]{chosen}[/cyan].")
    console.print("Try: uv run sbx sandbox create")
    console.print("Run: uv run sbx doctor  to verify\n")


def _write_env_key(key: str, console: Console) -> None:
    """Write or update E2B_API_KEY in sandbox/.env."""
    lines: list[str] = []
    replaced = False

    if _DOT_ENV.exists():
        for line in _DOT_ENV.read_text().splitlines():
            if line.strip().startswith("E2B_API_KEY=") or line.strip().startswith("# E2B_API_KEY="):
                lines.append(f"E2B_API_KEY={key}")
                replaced = True
            else:
                lines.append(line)

    if not replaced:
        lines.append(f"E2B_API_KEY={key}")

    _DOT_ENV.write_text("\n".join(lines) + "\n")
    console.print("[green]E2B API key written to sandbox/.env[/green]")


def _update_project_config(provider: str, console: Console) -> None:
    """Update sandbox.provider in RLM/config/project-config.json."""
    try:
        if not _PROJECT_CONFIG.exists():
            console.print("[dim]Project config not found, skipping config update.[/dim]")
            return

        config = json.loads(_PROJECT_CONFIG.read_text())
        sandbox_cfg = config.setdefault("sandbox", {})
        sandbox_cfg["provider"] = provider

        # Ensure auto is in providerOptions
        options = sandbox_cfg.get("providerOptions", [])
        if "auto" not in options:
            options.append("auto")
            sandbox_cfg["providerOptions"] = options

        _PROJECT_CONFIG.write_text(json.dumps(config, indent=2) + "\n")
        console.print(f"[green]Updated project config:[/green] sandbox.provider = {provider}")
    except Exception as exc:
        console.print(f"[yellow]Warning: Could not update project config: {exc}[/yellow]")
