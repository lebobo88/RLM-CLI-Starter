# Sandbox Management

Core sandbox lifecycle management for E2B cloud sandboxes.

## Prerequisites
- `E2B_API_KEY` environment variable set
- `uv` package manager installed
- `sandbox/` directory with `pyproject.toml`

## Create a Sandbox
```bash
uv run sbx sandbox create --template <template> --timeout <seconds>
```
Store the returned sandbox ID in your agent context for subsequent commands.

## Keep-Alive
Sandboxes have a default timeout of 600 seconds. For long-running tasks:
```bash
uv run sbx sandbox extend-lifetime <id> --timeout 1800
```

## Check Status
```bash
uv run sbx sandbox status <id>
```

## Cleanup
Always kill sandboxes when done:
```bash
uv run sbx sandbox kill <id>
```

## State Persistence
Sandbox state is persisted to `sandbox/.sandbox-state.json`. This allows session hooks to detect active sandboxes without user intervention.
