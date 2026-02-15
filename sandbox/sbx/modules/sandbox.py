"""Sandbox lifecycle helpers — create, connect, kill, state persistence.

Provider-agnostic: uses the backend factory to select E2B or Docker.
"""

import json
from pathlib import Path

import click

from sbx.backends import get_backend
from sbx.provider import SandboxInstance

STATE_FILE = Path(__file__).resolve().parent.parent.parent / ".sandbox-state.json"


def load_state() -> dict:
    """Load persisted sandbox state."""
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {}


def save_state(state: dict) -> None:
    """Persist sandbox state to disk."""
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2))


def create_sandbox(
    template: str = "base",
    timeout: int = 600,
    provider: str | None = None,
) -> SandboxInstance:
    """Create a new sandbox and persist its ID."""
    backend = get_backend(provider)
    sbx = backend.create(template=template, timeout=timeout)
    state = load_state()
    state["sandbox_id"] = sbx.sandbox_id
    state["template"] = template
    state["timeout"] = timeout
    state["provider"] = provider or _resolve_provider_from_backend(backend)
    save_state(state)
    return sbx


def get_sandbox(sandbox_id: str, provider: str | None = None) -> SandboxInstance:
    """Connect to an existing sandbox by ID."""
    # Auto-detect provider from saved state if not specified
    if not provider:
        state = load_state()
        if state.get("sandbox_id") == sandbox_id:
            provider = state.get("provider")
    backend = get_backend(provider)
    return backend.connect(sandbox_id)


def kill_sandbox(sandbox_id: str, provider: str | None = None) -> None:
    """Kill a sandbox and clear persisted state."""
    # Auto-detect provider from saved state if not specified
    if not provider:
        state = load_state()
        if state.get("sandbox_id") == sandbox_id:
            provider = state.get("provider")
    backend = get_backend(provider)
    backend.kill(sandbox_id)
    state = load_state()
    if state.get("sandbox_id") == sandbox_id:
        state.pop("sandbox_id", None)
        state.pop("provider", None)
        save_state(state)


def list_sandboxes(provider: str | None = None) -> list:
    """List all running sandboxes."""
    backend = get_backend(provider)
    return backend.list()


def _resolve_provider_from_backend(backend) -> str:
    """Get provider name from a backend instance."""
    cls_name = type(backend).__name__
    if "E2B" in cls_name:
        return "e2b"
    if "Docker" in cls_name:
        return "docker"
    return "unknown"
