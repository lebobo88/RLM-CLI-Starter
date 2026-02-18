---
name: observability
description: "Agent operation monitoring, context tracking, and execution traces."
disable-model-invocation: true
user-invocable: false
context: fork
model: haiku
allowed-tools:
  - read_file
  - grep
  - glob
---

## Recent Tool Usage (last 10)

!`tail -10 RLM/progress/logs/tool-usage.csv 2>/dev/null || echo "No logs yet"`

## Recent Events

!`tail -5 RLM/progress/logs/events.jsonl 2>/dev/null || echo "No events yet"`

# Observability Skill

Provides agent operation monitoring, context tracking, and execution traces for multi-agent workflows.

## Overview

This skill is auto-invoked by the orchestrator and hook infrastructure. It does NOT require manual invocation. Use `rlm-observe` command to view collected data.

## Data Sources

### Tool Usage Log (CSV)
- Path: `RLM/progress/logs/tool-usage.csv`
- Format: `timestamp,sessionId,tool,event`
- Written by: `post-tool-log.ps1`

### Tool Usage Log (JSONL)
- Path: `RLM/progress/logs/tool-usage.jsonl`
- Format: JSON lines with `timestamp`, `sessionId`, `agentId`, `tool`, `event`, `filePath`
- Written by: `post-tool-log.ps1` (enhanced)

### Agent Traces
- Path: `RLM/progress/logs/agents/{agent-id}.jsonl`
- Format: JSON lines with trace events
- Written by: `agent-tracer.ps1` library

### Session Logs
- Path: `RLM/progress/logs/sessions.jsonl`
- Written by: `session-start.ps1`, `session-end.ps1`

### Sub-agent Logs
- Path: `RLM/progress/logs/subagents.jsonl`
- Written by: `after-agent.ps1`

### Team Coordination Logs
- Path: `RLM/progress/logs/team-coordination.jsonl`
- Written by: `task-completed.ps1`

### State Verification Logs
- Path: `RLM/progress/logs/state-verification.jsonl`
- Written by: `post-state-write-verify.ps1`

## JSONL Trace Schema

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "event": "agent.start|agent.stop|tool.call|task.complete|error",
  "agentId": "rlm-code-writer|rlm-test-writer|rlm-reviewer|rlm-tester",
  "sessionId": "session-uuid",
  "data": {}
}
```

## Enable/Disable

Observability is enabled by default. To disable JSONL logging (CSV always active):
- Set `RLM_OBSERVABILITY=off` in environment
- Or set `observability.enabled: false` in `RLM/progress/config.json`

## Reports

Use `rlm-observe` command to generate human-readable reports from collected logs. Reports are written to `RLM/progress/reports/observability-{target}.md`.
