# Session State Management

## Overview

The RLM pipeline now includes comprehensive session state tracking to maintain context across pipeline execution, enable session resumption, and provide detailed audit trails.

## Files

### Core State Files

| File | Purpose | Format |
|------|---------|--------|
| `session-state.json` | Current session state with history | JSON |
| `checkpoint.json` | Session checkpoints and history | JSON |
| `.session-context.md` | Human-readable context summary | Markdown |
| `pipeline-state.json` | Pipeline phase progress | JSON |
| `status.json` | Task-level status | JSON |

### Utilities

| File | Purpose | Platform |
|------|---------|----------|
| `.manage-session-state.ps1` | Session state management script | Windows PowerShell |
| `.manage-session-state.sh` | Session state management script | Linux/macOS/WSL |

## Session State Schema

```json
{
  "session_id": "UUID of the current session",
  "pipeline_id": "Pipeline identifier (PIPELINE-XXX-YYY)",
  "started_at": "ISO 8601 timestamp",
  "last_activity": "ISO 8601 timestamp",
  "status": "active|paused|completed|error",
  "current_phase": 1-9,
  "current_agent": "Agent name",
  "automation_level": "auto|supervised|manual",
  "context": {
    "active_feature": "Current feature ID or null",
    "active_task": "Current task ID or null",
    "last_checkpoint": "ISO 8601 timestamp",
    "token_usage": 0,
    "token_threshold_50_warned": false,
    "token_threshold_75_warned": false,
    "token_threshold_90_warned": false
  },
  "history": [
    {
      "timestamp": "ISO 8601 timestamp",
      "event": "Event name",
      "phase": 1-9,
      "agent": "Agent name",
      "description": "Event description"
    }
  ],
  "metadata": {
    "workspace": "Full workspace path",
    "branch": "Git branch",
    "last_commit": "Git commit SHA"
  }
}
```

## Usage

### PowerShell (Windows)

```powershell
# Initialize new session
.\RLM\progress\.manage-session-state.ps1 -Action init `
    -SessionId "uuid-here" `
    -PipelineId "PIPELINE-XXX-001" `
    -Phase 1

# Update session state
.\RLM\progress\.manage-session-state.ps1 -Action update `
    -Event "phase_completed" `
    -Description "Phase 1 discovery completed" `
    -Phase 2

# Read current state
.\RLM\progress\.manage-session-state.ps1 -Action read

# Save checkpoint
.\RLM\progress\.manage-session-state.ps1 -Action checkpoint

# Show history
.\RLM\progress\.manage-session-state.ps1 -Action history
```

### Bash (Linux/macOS/WSL)

```bash
# Initialize new session
./RLM/progress/.manage-session-state.sh init \
    "uuid-here" \
    "PIPELINE-XXX-001" \
    1 \
    "auto"

# Update session state
./RLM/progress/.manage-session-state.sh update \
    "phase_completed" \
    "Phase 1 discovery completed"

# Read current state
./RLM/progress/.manage-session-state.sh read

# Save checkpoint
./RLM/progress/.manage-session-state.sh checkpoint

# Show history
./RLM/progress/.manage-session-state.sh history
```

## Events

Common session events tracked in history:

| Event | Description |
|-------|-------------|
| `session_started` | Session initialized |
| `session_resumed` | Session resumed from checkpoint |
| `phase_started` | New phase began |
| `phase_completed` | Phase finished successfully |
| `phase_failed` | Phase encountered error |
| `checkpoint_saved` | Checkpoint created |
| `agent_delegated` | Sub-agent invoked |
| `task_started` | Implementation task started |
| `task_completed` | Implementation task finished |
| `feature_completed` | Feature implementation done |
| `token_threshold_50` | 50% token usage reached |
| `token_threshold_75` | 75% token usage reached |
| `token_threshold_90` | 90% token usage reached |
| `session_paused` | Manual pause requested |
| `session_completed` | Pipeline finished |

## Integration with Agents

### Reading Session Context

At the start of any RLM workflow, agents should:

1. Read `.session-context.md` for quick human-readable overview
2. Parse `session-state.json` for detailed state information
3. Check `pipeline-state.json` for phase progress

```powershell
# PowerShell example
$sessionState = Get-Content "RLM\progress\session-state.json" | ConvertFrom-Json
$currentPhase = $sessionState.current_phase
$pipelineId = $sessionState.pipeline_id
```

```bash
# Bash example
session_state=$(cat RLM/progress/session-state.json)
current_phase=$(echo "$session_state" | jq -r '.current_phase')
pipeline_id=$(echo "$session_state" | jq -r '.pipeline_id')
```

### Updating Session State

After significant events (phase transitions, task completions, errors):

```powershell
# PowerShell
.\RLM\progress\.manage-session-state.ps1 -Action update `
    -Event "phase_completed" `
    -Description "Specifications generated for 5 features" `
    -Phase 4
```

```bash
# Bash
./RLM/progress/.manage-session-state.sh update \
    "phase_completed" \
    "Specifications generated for 5 features"
```

### Saving Checkpoints

Save checkpoints at:
- End of each phase
- Before long-running operations
- When token usage reaches thresholds (50%, 75%, 90%)
- On errors or pauses

```powershell
.\RLM\progress\.manage-session-state.ps1 -Action checkpoint
```

```bash
./RLM/progress/.manage-session-state.sh checkpoint
```

## Token Usage Tracking

Session state tracks token usage and provides threshold warnings:

- **50%**: Warning logged, checkpoint saved, continue
- **75%**: Warning logged, checkpoint saved, suggest wrapping up
- **90%**: Warning logged, checkpoint saved, complete current task only, pause

Agents should update token usage periodically:

```powershell
.\RLM\progress\.manage-session-state.ps1 -Action update `
    -Event "token_usage_update" `
    -Description "Updated token count" `
    -TokenUsage 250000
```

## Session Resumption

To resume an interrupted session:

1. Read `session-state.json` to get session ID and pipeline ID
2. Read `pipeline-state.json` to determine current phase
3. Check `.session-context.md` for human-readable summary
4. Continue from last checkpoint

The `@rlm-resume` agent handles this automatically.

## Checkpoint History

The `checkpoint.json` file maintains a history of all sessions:

```json
{
  "lastTask": null,
  "lastSession": {
    "sessionId": "current-session-id",
    "reason": "session_state_implementation",
    "startedAt": "2026-02-18T01:45:18Z",
    "pipeline_id": "PIPELINE-ENT-HUB-2026-002",
    "phase": 4,
    "status": "active"
  },
  "sessions": [
    {
      "sessionId": "old-session-id",
      "reason": "factory_reset",
      "endedAt": "2026-02-15T20:27:00Z"
    },
    {
      "sessionId": "current-session-id",
      "reason": "session_state_implementation",
      "startedAt": "2026-02-18T01:45:18Z",
      "pipeline_id": "PIPELINE-ENT-HUB-2026-002",
      "phase": 4,
      "status": "active"
    }
  ]
}
```

## Best Practices

1. **Initialize at session start**: Always initialize session state when beginning work
2. **Update frequently**: Log significant events as they happen
3. **Save checkpoints at phase boundaries**: Ensures recovery points
4. **Monitor token usage**: Track and warn at thresholds
5. **Use descriptive event names**: Makes history readable and useful
6. **Keep context file updated**: Human-readable summary helps orientation

## Troubleshooting

### Session state file not found
Run initialization command with current session details.

### Checkpoint not saving
Check file permissions on `RLM/progress/` directory.

### Session history too large
This is expected for long-running pipelines. The history provides full audit trail.

### Token usage not updating
Ensure agents call update with `-TokenUsage` parameter regularly.

## Related Files

- `pipeline-state.json` - Phase-level progress tracking
- `status.json` - Task-level status tracking
- `RLM/progress/logs/` - Detailed session logs
- `RLM/progress/manifests/` - Agent completion manifests

## Future Enhancements

Potential improvements for session state management:

1. **Session archiving**: Move completed sessions to archive
2. **State compression**: Compress old history entries
3. **State validation**: Schema validation on read/write
4. **State migration**: Version migration for schema updates
5. **Multi-session tracking**: Track parallel sessions
6. **State visualization**: Dashboard for session state

---

**Version**: 1.0  
**Last Updated**: 2026-02-18  
**Maintainer**: RLM Pipeline Team
