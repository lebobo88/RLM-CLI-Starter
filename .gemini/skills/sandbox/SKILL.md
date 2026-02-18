---
name: sandbox
description: Guide for managing E2B/Docker sandbox environments for isolated code execution. Use this when creating, executing in, or managing sandboxes.
---

# Sandbox Management Skill

Quick reference for creating and managing isolated execution environments.

## Quick Start

Use the `/rlm-sandbox` command for full sandbox lifecycle management.

## Capabilities

### Create Sandbox
- Detects available provider: E2B Cloud or Docker local
- Creates isolated environment with project dependencies
- Returns sandbox ID for subsequent operations

### Execute in Sandbox
- Run commands in isolated context
- Stream output back to primary session
- No risk to host filesystem

### Host Sync
- Copy files from sandbox to host project
- Validate files before copying (security check)
- Update progress tracking after sync

### Test in Sandbox
- Run test suites in isolation
- Capture coverage reports
- Compare against quality gates

### Kill Sandbox
- Gracefully shut down sandbox
- Clean up resources
- Log sandbox session

## Provider Detection

Priority order:
1. **E2B Cloud** (`E2B_API_KEY` set) -- Preferred for CI/CD and team use
2. **Docker** (`docker` available) -- Local development fallback
3. **None** -- Run locally with warnings

## State Files

- Config: `RLM/progress/config.json` (`sandbox.enabled`, `sandbox.provider`)
- State: `sandbox/.sandbox-state.json` (active sandbox ID, created timestamp)
- Logs: `RLM/progress/logs/sandbox.jsonl`

## Safety Rules

- Never expose host secrets to sandbox
- Validate all files before syncing from sandbox
- Time-limit sandbox sessions (default: 30 minutes)
- Auto-kill on session end
