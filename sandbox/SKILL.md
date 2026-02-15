# Sandbox Skill Reference

> Complete command reference for the `sbx` CLI tool. All commands are invoked via `uv run sbx <group> <command> [options]`.

## First-Time Setup

New to sandboxes? Run the diagnostic and setup commands:

```bash
# Check what's available
cd sandbox && uv run sbx doctor

# Guided setup (detects Docker/E2B, configures provider)
cd sandbox && uv run sbx setup

# Machine-readable diagnostics (for agents)
cd sandbox && uv run sbx doctor --json
```

`sbx setup` flags for CI / non-interactive use:
```bash
uv run sbx setup --provider docker --non-interactive
uv run sbx setup --provider e2b --e2b-key YOUR_KEY --non-interactive
uv run sbx setup --no-sync  # skip uv sync step
```

## Provider Selection

The `sbx` CLI supports two backends: **E2B** (cloud Firecracker microVMs) and **Docker** (local containers).

### Setting the Provider

```bash
# CLI flag (highest priority)
uv run sbx --provider docker sandbox create

# Environment variable
SBX_PROVIDER=docker uv run sbx sandbox create

# Project config: RLM/config/project-config.json → sandbox.provider
# Default: "auto" (tries Docker first, then E2B)
```

### Provider Comparison

| Feature | E2B | Docker |
|---------|-----|--------|
| URL from `get-host` | `https://<id>-<port>.e2b.dev` (public) | `http://localhost:<mapped_port>` (local) |
| Timeout | Server-side auto-kill | Deadline label checked on connect |
| Pause | Stops billing, preserves state | `docker pause` (freezes container) |
| Isolation | Firecracker microVM (kernel-level) | Container (process-level) |
| Requirements | `E2B_API_KEY` | Docker Desktop / Podman running |
| Cost | Pay-per-use | Free (local resources) |
| Install | `pip install sbx[e2b]` | `pip install sbx` |

## Critical Rules

1. **Store sandbox IDs in your agent context** — never store them in shell variables that won't persist across tool calls
2. **Use unique `--port` values** per agent when multiple agents share a sandbox
3. **Use `--cwd /workspace`** instead of `cd` — the sandbox working directory doesn't persist between commands
4. **Always check sandbox status** before long operations — sandboxes have timeouts
5. **Clean up sandboxes** when done — call `sbx sandbox kill <id>` to free resources

## Sandbox Lifecycle

### Create a sandbox
```bash
uv run sbx sandbox create [--template <name>] [--timeout <seconds>]

# Docker-specific
uv run sbx --provider docker sandbox create --template node --timeout 900
```
- `--template, -t`: Template name (default: `base`). Common templates: `base`, `node`, `python`
- `--timeout`: Sandbox lifetime in seconds (default: `600`)
- Returns: Sandbox ID (store this in your context)

### Shortcut: init
```bash
uv run sbx init [--template <name>] [--timeout <seconds>]
```
Alias for `sandbox create`.

### List running sandboxes
```bash
uv run sbx sandbox list
```

### Kill a sandbox
```bash
uv run sbx sandbox kill <sandbox_id>
```

### Check sandbox status
```bash
uv run sbx sandbox status <sandbox_id>
```

### Get sandbox info
```bash
uv run sbx sandbox info <sandbox_id>
```

### Get host URL for a port
```bash
uv run sbx sandbox get-host <sandbox_id> --port <port>
```
- **E2B**: Returns a public `https://` URL
- **Docker**: Returns a local `http://localhost:<mapped_port>` URL

### Extend sandbox lifetime
```bash
uv run sbx sandbox extend-lifetime <sandbox_id> --timeout <seconds>
```

### Pause a sandbox
```bash
uv run sbx sandbox pause <sandbox_id>
```
Preserves state. E2B: stops billing. Docker: freezes container processes.

### Garbage-collect expired sandboxes
```bash
uv run sbx sandbox gc
```
Removes sandboxes that have passed their timeout deadline (Docker only — E2B handles this server-side).

---

## Command Execution

### Run a command
```bash
uv run sbx exec run <sandbox_id> "<command>" [options]
```
- `--cwd`: Working directory (default: `/workspace`)
- `--shell`: Shell to use (default: `/bin/bash`)
- `--env, -e`: Environment variable as `KEY=VALUE` (repeatable)
- `--root`: Run as root
- `--timeout, -t`: Timeout in seconds (default: `60`)
- `--background, -b`: Run in background (returns PID)

#### Examples
```bash
# Run tests
uv run sbx exec run abc123 "npm test" --cwd /workspace

# Install dependencies as root
uv run sbx exec run abc123 "npm install" --cwd /workspace --root

# Start dev server in background
uv run sbx exec run abc123 "npm run dev" --cwd /workspace --background

# Run with environment variables
uv run sbx exec run abc123 "python app.py" -e PORT=8080 -e DEBUG=true
```

---

## File Operations

### List files
```bash
uv run sbx files ls <sandbox_id> [path]
```
Default path: `/workspace`

### Read a file
```bash
uv run sbx files read <sandbox_id> <path>
```
Syntax-highlighted output for common file types.

### Write a file
```bash
uv run sbx files write <sandbox_id> <path> "<content>"
```

### Edit a file (find and replace)
```bash
uv run sbx files edit <sandbox_id> <path> "<old_text>" "<new_text>"
```

### Upload a file
```bash
uv run sbx files upload <sandbox_id> <local_path> <remote_path>
```

### Download a file
```bash
uv run sbx files download <sandbox_id> <remote_path> <local_path>
```

### Upload a directory (recursive)
```bash
uv run sbx files upload-dir <sandbox_id> <local_dir> <remote_dir>
```

### Download a directory (recursive)
```bash
uv run sbx files download-dir <sandbox_id> <remote_dir> <local_dir>
```

### Create a directory
```bash
uv run sbx files mkdir <sandbox_id> <path>
```

### Remove a file or directory
```bash
uv run sbx files rm <sandbox_id> <path>
```

### Move/rename
```bash
uv run sbx files mv <sandbox_id> <src> <dst>
```

### Check if file exists
```bash
uv run sbx files exists <sandbox_id> <path>
```

### Get file info
```bash
uv run sbx files info <sandbox_id> <path>
```

---

## Browser Interaction

For testing sandbox-hosted web applications.

### Initialize browser environment
```bash
uv run sbx browser init <sandbox_id>
```
Installs Playwright and Chromium in the sandbox. Run once before other browser commands.

### Start browser
```bash
uv run sbx browser start <sandbox_id> [--no-headless]
```

### Close browser
```bash
uv run sbx browser close <sandbox_id>
```

### Navigate to URL
```bash
uv run sbx browser nav <sandbox_id> <url>
```

### Click an element
```bash
uv run sbx browser click <sandbox_id> "<selector>"
```

### Type text into an element
```bash
uv run sbx browser type <sandbox_id> "<selector>" "<text>"
```

### Evaluate JavaScript
```bash
uv run sbx browser eval <sandbox_id> "<script>"
```

### Take a screenshot
```bash
uv run sbx browser screenshot <sandbox_id> [--output <path>]
```
Default output: `screenshot.png`

### Get accessibility tree
```bash
uv run sbx browser a11y <sandbox_id>
```

### Get DOM structure
```bash
uv run sbx browser dom <sandbox_id> [--selector "<css>"]
```

### Check browser status
```bash
uv run sbx browser status <sandbox_id>
```

---

## Common Workflows

### Plan-Build-Host-Test (Docker)
```bash
# 1. Create sandbox
uv run sbx --provider docker sandbox create --template node --timeout 900
# Store returned ID as SANDBOX_ID

# 2. Upload source
uv run sbx files upload-dir <id> ./src /workspace/src

# 3. Install deps
uv run sbx exec run <id> "npm install" --cwd /workspace --root

# 4. Run tests (TDD Red)
uv run sbx exec run <id> "npm test" --cwd /workspace

# 5. Host application
uv run sbx exec run <id> "npm start" --cwd /workspace --background

# 6. Get local URL
uv run sbx sandbox get-host <id> --port 3000
# Returns: http://localhost:<port>

# 7. Browser test
uv run sbx browser init <id>
uv run sbx browser nav <id> "http://localhost:<port>"
uv run sbx browser screenshot <id> --output test-result.png

# 8. Download results
uv run sbx files download-dir <id> /workspace/coverage ./coverage

# 9. Cleanup
uv run sbx sandbox kill <id>
```

### Plan-Build-Host-Test (E2B)
```bash
# 1. Create sandbox
uv run sbx sandbox create --template node --timeout 900

# 2-5. Same as Docker

# 6. Get public URL
uv run sbx sandbox get-host <id> --port 3000
# Returns: https://<id>-3000.e2b.dev

# 7. Browser test with public URL
uv run sbx browser nav <id> "https://<host-url>"

# 8-9. Same as Docker
```

### TDD in Sandbox
```bash
# Upload tests first (Red)
uv run sbx files upload-dir <id> ./tests /workspace/tests
uv run sbx exec run <id> "npm test" --cwd /workspace  # Should fail

# Upload implementation (Green)
uv run sbx files upload-dir <id> ./src /workspace/src
uv run sbx exec run <id> "npm test" --cwd /workspace  # Should pass

# Download passing code
uv run sbx files download-dir <id> /workspace/src ./src
```
