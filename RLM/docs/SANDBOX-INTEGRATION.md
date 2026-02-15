# Sandbox Integration Guide

> E2B cloud sandbox integration for the RLM Method pipeline — isolated Firecracker microVM environments for safe code execution, testing, and hosting.

## Overview

E2B (Environment to Binary) provides on-demand cloud sandboxes powered by Firecracker microVMs. Each sandbox is an isolated Linux environment with its own filesystem, network, and process space. The RLM pipeline uses sandboxes for:

- **Safe code execution** — Run untrusted or experimental code without risking the host system
- **Isolated testing** — Run test suites in clean environments with no local state leakage
- **App hosting** — Temporarily host applications with public URLs for E2E testing
- **Browser testing** — Automated Playwright-based browser interaction with hosted apps
- **Parallel experimentation** — Run multiple implementation approaches simultaneously (Best-of-N)

### Fully Opt-In Design

Sandbox integration is **never automatic or required**:
- No auto-provisioning — session hooks only detect existing sandboxes, never create them
- No forced sandbox mode — the `sandbox.enabled` config flag only tells agents that tools are available
- User-initiated only — sandboxes are created exclusively via `/rlm-sandbox create`
- Zero impact when unused — all existing workflows remain 100% identical
- Graceful degradation — sandbox-aware prompt sections are skipped when not configured

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  CLI (Copilot / Claude Code / Gemini)                        │
│  └── rlm-sandbox agent                                       │
│       └── uv run sbx <command>                               │
│            └── E2B Python SDK                                │
│                 └── E2B API (api.e2b.dev)                    │
│                      └── Firecracker microVM                 │
│                           ├── /workspace (project files)     │
│                           ├── Node.js / Python runtime       │
│                           ├── Public port forwarding         │
│                           └── Playwright (optional)          │
└──────────────────────────────────────────────────────────────┘
```

## Prerequisites

| Requirement | Version | Check Command |
|------------|---------|---------------|
| Python | >= 3.10 | `python --version` |
| uv | Latest | `uv --version` |
| E2B account | — | [e2b.dev/dashboard](https://e2b.dev/dashboard) |
| E2B API key | — | Set in `sandbox/.env` |

## Installation

### 1. Install dependencies

```bash
cd sandbox
uv sync
```

### 2. Configure API key

```bash
# Copy the example environment file
cp .env.example sandbox/.env

# Edit sandbox/.env and add your E2B API key
# E2B_API_KEY=e2b_...
```

### 3. Verify installation

```bash
uv run sbx --help
```

You should see the 4 command groups: `sandbox`, `exec`, `files`, `browser`.

### 4. (Optional) Enable sandbox mode in project config

Edit `RLM/config/project-config.json`:

```json
{
  "sandbox": {
    "enabled": true
  }
}
```

This tells agents that sandbox tools are available. Agents will still ask before using them.

## Platform Usage

### Copilot CLI

```
@rlm-sandbox create
@rlm-sandbox exec "npm test"
@rlm-sandbox host --port 3000
@rlm-sandbox kill
```

### Claude Code

```
/rlm-sandbox create
/rlm-sandbox exec "npm test"
/rlm-sandbox host --port 3000
/rlm-sandbox kill
```

### Gemini CLI

```
/rlm-sandbox create
/rlm-sandbox exec "npm test"
/rlm-sandbox host --port 3000
/rlm-sandbox kill
```

## Workflows

### Basic: Create, Execute, Kill

```bash
# Create a sandbox
uv run sbx sandbox create --template node --timeout 600

# Run a command (store the sandbox ID from create output)
uv run sbx exec run <sandbox-id> "echo 'Hello from sandbox'" --cwd /workspace

# Kill the sandbox
uv run sbx sandbox kill <sandbox-id>
```

### TDD in Sandbox

```bash
# Create sandbox
uv run sbx sandbox create --template node

# Upload test files (TDD Red)
uv run sbx files upload-dir <id> ./tests /workspace/tests
uv run sbx exec run <id> "npm test" --cwd /workspace  # Should FAIL

# Upload implementation (TDD Green)
uv run sbx files upload-dir <id> ./src /workspace/src
uv run sbx exec run <id> "npm test" --cwd /workspace  # Should PASS

# Download results
uv run sbx files download-dir <id> /workspace/src ./src
uv run sbx files download-dir <id> /workspace/coverage ./coverage

# Cleanup
uv run sbx sandbox kill <id>
```

### Full-Stack Hosting

```bash
# Create sandbox with extended timeout
uv run sbx sandbox create --template node --timeout 1800

# Upload and start backend
uv run sbx files upload-dir <id> ./server /workspace/server
uv run sbx exec run <id> "npm install && npm start" --cwd /workspace/server --root --background

# Upload and start frontend
uv run sbx files upload-dir <id> ./client /workspace/client
uv run sbx exec run <id> "npm install && npm run build && npx serve -s build" --cwd /workspace/client --root --background

# Get public URLs
uv run sbx sandbox get-host <id> --port 3000  # Frontend
uv run sbx sandbox get-host <id> --port 8080  # Backend
```

### Browser Testing

```bash
# Initialize Playwright in sandbox (once)
uv run sbx browser init <id>

# Navigate and interact
uv run sbx browser nav <id> "https://<host-url>"
uv run sbx browser click <id> "#login-button"
uv run sbx browser type <id> "#email" "test@example.com"

# Capture evidence
uv run sbx browser screenshot <id> --output login-test.png
uv run sbx browser a11y <id>  # Accessibility tree
```

### Best-of-N Parallel

```bash
# Create N sandboxes
uv run sbx sandbox create --template node  # Sandbox A
uv run sbx sandbox create --template node  # Sandbox B
uv run sbx sandbox create --template node  # Sandbox C

# Upload different implementations to each
uv run sbx files upload-dir <id-a> ./approach-a /workspace/src
uv run sbx files upload-dir <id-b> ./approach-b /workspace/src
uv run sbx files upload-dir <id-c> ./approach-c /workspace/src

# Run identical test suite in all
uv run sbx exec run <id-a> "npm test" --cwd /workspace
uv run sbx exec run <id-b> "npm test" --cwd /workspace
uv run sbx exec run <id-c> "npm test" --cwd /workspace

# Compare results, download best, kill all
uv run sbx sandbox kill <id-a>
uv run sbx sandbox kill <id-b>
uv run sbx sandbox kill <id-c>
```

## Configuration

### Project Config (`RLM/config/project-config.json`)

```json
{
  "sandbox": {
    "enabled": false,
    "provider": "e2b",
    "defaultTemplate": null,
    "defaultTimeout": 600,
    "bestOfN": {
      "enabled": false,
      "count": 3
    }
  }
}
```

| Field | Default | Description |
|-------|---------|-------------|
| `enabled` | `false` | Whether sandbox tools are available to agents |
| `provider` | `"e2b"` | Sandbox provider (currently only E2B supported) |
| `defaultTemplate` | `null` | Default E2B template (null = "base") |
| `defaultTimeout` | `600` | Default sandbox timeout in seconds |
| `bestOfN.enabled` | `false` | Enable Best-of-N parallel experimentation |
| `bestOfN.count` | `3` | Number of parallel sandboxes for Best-of-N |

### Environment Variables (`sandbox/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `E2B_API_KEY` | Yes | E2B API key from [e2b.dev/dashboard](https://e2b.dev/dashboard) |
| `E2B_TEMPLATE` | No | Default template override |
| `E2B_TIMEOUT` | No | Default timeout override |

## Security

### API Key Management
- Store `E2B_API_KEY` in `sandbox/.env` (gitignored) or system environment variables
- Never commit API keys to version control
- `.env` is in `.gitignore` by default

### Sandbox Isolation
- Each sandbox is a Firecracker microVM with full isolation
- Sandboxes cannot access the host filesystem directly
- Files must be explicitly uploaded/downloaded
- Network egress is allowed (for package installation, etc.)

### Ephemeral State
- `sandbox/.sandbox-state.json` tracks the active sandbox ID (gitignored)
- Sandboxes are temporary — they auto-terminate after the configured timeout
- No persistent storage between sandbox sessions

### Audit Trail
- Session hooks log sandbox activity to `RLM/progress/logs/session.log`
- All `sbx` commands produce console output for review

## Command Reference

See `sandbox/SKILL.md` for the complete command reference with all options and examples.

## Troubleshooting

### "E2B_API_KEY not set"
Set your API key in `sandbox/.env`:
```
E2B_API_KEY=e2b_your_key_here
```

### "Sandbox not found"
The sandbox may have timed out. Create a new one:
```bash
uv run sbx sandbox create
```

### "Command timeout"
Increase the timeout for long-running commands:
```bash
uv run sbx exec run <id> "npm install" --timeout 120
```

### "uv: command not found"
Install uv: https://docs.astral.sh/uv/getting-started/installation/

### "Connection refused" when accessing hosted app
The application may not be running. Check:
```bash
uv run sbx sandbox status <id>
uv run sbx exec run <id> "ps aux" --cwd /workspace
```

### Browser tests failing
Ensure Playwright is initialized:
```bash
uv run sbx browser init <id>
```
