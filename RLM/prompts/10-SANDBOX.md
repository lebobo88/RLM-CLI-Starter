# Phase 10: Sandbox Management

> Canonical prompt for sandbox operations. Referenced by `rlm-sandbox` agent across all platforms.

## Overview

Sandboxes provide isolated environments for safe code execution, testing, and hosting. Two backends are supported:

- **E2B** — Cloud-based Firecracker microVMs (requires `E2B_API_KEY`)
- **Docker** — Local containers via Docker Desktop, Podman, or Rancher Desktop (no cloud dependency)

Sandboxes are **fully opt-in** — they are never created automatically and have zero impact when unused.

## Prerequisites

Before any sandbox operation, run diagnostics:

```bash
cd sandbox && uv run sbx doctor --json
```

This checks Docker daemon, E2B API key, E2B package, uv, and dependency sync status. Parse the JSON output to determine readiness.

If setup is needed (no providers ready), instruct the user:

```bash
cd sandbox && uv run sbx setup
```

For non-interactive/CI environments:

```bash
cd sandbox && uv run sbx setup --provider docker --non-interactive
```

After setup, load `sandbox/SKILL.md` for the complete command reference.

### Provider Resolution Order

1. `--provider` CLI flag: `sbx --provider docker sandbox create`
2. `SBX_PROVIDER` environment variable
3. `RLM/config/project-config.json` → `sandbox.provider`
4. Default: `"auto"` (tries Docker first, then E2B)

### Provider Comparison

| Feature | E2B | Docker |
|---------|-----|--------|
| URL from `get-host` | `https://<id>-<port>.e2b.dev` (public) | `http://localhost:<mapped_port>` (local) |
| Timeout | Server-side auto-kill | Deadline label checked on connect; `sbx sandbox gc` for cleanup |
| Pause | Stops billing, preserves state | `docker pause` (freezes container) |
| Network | Full egress, public URLs | Full egress, localhost only |
| Isolation | Firecracker microVM (kernel-level) | Container (Docker Desktop uses Hyper-V on Windows) |
| Templates | E2B-hosted images | Local Dockerfiles in `sandbox/docker-templates/` |
| Cost | Pay-per-use | Free (local resources) |
| Install | `pip install sbx[e2b]` | `pip install sbx` (Docker must be installed separately) |

## Sandbox-Mode Detection

Check if sandbox mode is active:

1. Read `RLM/progress/config.json` — look for `sandbox.enabled: true`
2. Read `sandbox/.sandbox-state.json` — look for active `sandbox_id` and `provider`
3. Read `RLM/progress/.current-context.md` — check for sandbox context lines

**If sandbox mode is NOT active**, skip all sandbox-related sections in other prompts. Default to local execution.

## Sandbox Lifecycle

### Creating a Sandbox (User-Initiated Only)

Sandboxes are created ONLY when the user explicitly requests it:

```bash
# E2B (default)
uv run sbx sandbox create --template node --timeout 900

# Docker
uv run sbx --provider docker sandbox create --template node --timeout 900
```

Store the returned sandbox ID in your agent context. Never store it in shell variables.

### Checking Status

```bash
uv run sbx sandbox status <sandbox_id>
```

### Extending Lifetime

For long-running operations (> 10 minutes):

```bash
uv run sbx sandbox extend-lifetime <sandbox_id> --timeout 1800
```

### Killing a Sandbox

Always clean up when done:

```bash
uv run sbx sandbox kill <sandbox_id>
```

### Garbage Collection (Docker)

Remove expired containers:

```bash
uv run sbx sandbox gc
```

## Code Execution in Sandbox

### Running Commands

```bash
uv run sbx exec run <sandbox_id> "<command>" --cwd /workspace
```

Critical rules:
- Always use `--cwd /workspace` — working directory does NOT persist between calls
- Use `--root` for package installation commands
- Use `--background` for long-running servers
- Use `--timeout` for commands that may take longer than 60s

### TDD Workflow in Sandbox

1. **Upload test files first** (Red phase):
   ```bash
   uv run sbx files upload-dir <id> ./tests /workspace/tests
   uv run sbx exec run <id> "npm test" --cwd /workspace  # Should FAIL
   ```

2. **Upload implementation** (Green phase):
   ```bash
   uv run sbx files upload-dir <id> ./src /workspace/src
   uv run sbx exec run <id> "npm test" --cwd /workspace  # Should PASS
   ```

3. **Download results**:
   ```bash
   uv run sbx files download-dir <id> /workspace/src ./src
   uv run sbx files download-dir <id> /workspace/coverage ./coverage
   ```

## File Operations

### Upload Project Files

```bash
# Single file
uv run sbx files upload <id> ./package.json /workspace/package.json

# Entire directory
uv run sbx files upload-dir <id> ./src /workspace/src
```

### Download Results

```bash
# Build artifacts
uv run sbx files download-dir <id> /workspace/dist ./dist

# Test coverage
uv run sbx files download-dir <id> /workspace/coverage ./coverage
```

### Edit Files in Sandbox

```bash
uv run sbx files edit <id> /workspace/src/app.ts "old_code" "new_code"
```

## App Hosting

### Start Application

```bash
uv run sbx exec run <id> "npm start" --cwd /workspace --background
```

### Get Host URL

```bash
uv run sbx sandbox get-host <id> --port 3000
```

- **E2B**: Returns a public HTTPS URL accessible from anywhere
- **Docker**: Returns `http://localhost:<mapped_port>` accessible locally

### Port Isolation

When multiple agents share a sandbox, each MUST use a unique port:
- Implementation agent: port 3001
- Verification agent: port 3002
- Browser testing: port 3003

## Browser Testing

### Setup (Once Per Sandbox)

```bash
uv run sbx browser init <id>
```

### Navigate and Interact

```bash
# Docker: use localhost URL
uv run sbx browser nav <id> "http://localhost:<port>"

# E2B: use public URL
uv run sbx browser nav <id> "https://<host-url>"

uv run sbx browser click <id> "#submit-button"
uv run sbx browser type <id> "#email" "test@example.com"
```

### Capture Evidence

```bash
uv run sbx browser screenshot <id> --output verification.png
uv run sbx browser a11y <id>
```

## Cleanup

Always clean up sandboxes when the task is complete:

```bash
uv run sbx sandbox kill <sandbox_id>
```

If the user wants to keep the sandbox running for further work, extend its lifetime instead:

```bash
uv run sbx sandbox extend-lifetime <sandbox_id> --timeout 1800
```

## Error Handling

| Error | Action |
|-------|--------|
| `E2B_API_KEY not set` | Instruct user to set key in `sandbox/.env` or use `--provider docker` |
| `Docker is not available` | Instruct user to start Docker Desktop or use `--provider e2b` |
| `e2b package not installed` | Run `pip install sbx[e2b]` or switch to `--provider docker` |
| `Sandbox not found` | Sandbox may have timed out. Create a new one |
| `Container has expired` | Docker deadline passed. Run `sbx sandbox gc` and create a new one |
| `Command timeout` | Increase `--timeout` or check for hung processes |
| `Connection refused` | App may not be running. Check with `sbx sandbox status` |
| `Port already in use` | Use a different `--port` value |

## Automation Level Behaviors

| Level | Sandbox Behavior |
|-------|-----------------|
| **AUTO** | Create sandbox on first sandbox-related request, auto-cleanup on task completion |
| **SUPERVISED** | Confirm before create/kill, auto-execute commands |
| **MANUAL** | Confirm every sandbox operation |

## Integration with Pipeline Phases

### Phase 6 (Implement) — Optional Sandbox Execution
If the user requests sandboxed implementation:
1. Create sandbox or connect to existing one
2. Upload source files to `/workspace`
3. Run TDD cycle inside sandbox
4. Download passing code back to host

### Phase 8 (Verify) — Optional Sandbox Verification
If the user requests sandboxed verification:
1. Host application in sandbox
2. Get host URL (public for E2B, localhost for Docker)
3. Run browser-based E2E tests
4. Download verification artifacts to `RLM/progress/verification/`
