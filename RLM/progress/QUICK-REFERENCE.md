# Session State Quick Reference

## Essential Commands

### PowerShell (Windows)

```powershell
# Navigate to progress directory
cd H:\RLM_CLI_Starter\RLM\progress

# Read current session state
.\.manage-session-state.ps1 -Action read

# Update with event
.\.manage-session-state.ps1 -Action update `
    -Event "phase_completed" `
    -Description "Phase 3 specs completed"

# Save checkpoint
.\.manage-session-state.ps1 -Action checkpoint

# Show history
.\.manage-session-state.ps1 -Action history
```

### Bash (Linux/macOS/WSL)

```bash
# Navigate to progress directory
cd /mnt/h/RLM_CLI_Starter/RLM/progress  # or appropriate path

# Read current session state
./.manage-session-state.sh read

# Update with event
./.manage-session-state.sh update "phase_completed" "Phase 3 specs completed"

# Save checkpoint
./.manage-session-state.sh checkpoint

# Show history
./.manage-session-state.sh history
```

## Quick File Reference

| File | Purpose | When to Read |
|------|---------|--------------|
| `.session-context.md` | Human-readable overview | **Start of every session** |
| `session-state.json` | Detailed session state | When you need full context |
| `pipeline-state.json` | Phase progress | To see what phases are done |
| `status.json` | Task status | During implementation (Phase 6) |
| `checkpoint.json` | Session history | When resuming or debugging |

## Agent Integration Pattern

### At Session Start

```powershell
# Read context for orientation
Get-Content .session-context.md

# Parse state if needed
$state = Get-Content session-state.json | ConvertFrom-Json
$currentPhase = $state.current_phase
$pipelineId = $state.pipeline_id
```

### During Execution

```powershell
# Log significant events
.\.manage-session-state.ps1 -Action update `
    -Event "feature_started" `
    -Description "Starting FTR-001 implementation"
```

### At Phase Boundaries

```powershell
# Save checkpoint
.\.manage-session-state.ps1 -Action checkpoint

# Update phase
.\.manage-session-state.ps1 -Action update `
    -Event "phase_completed" `
    -Description "Phase $N completed" `
    -Phase ($N + 1)
```

### On Errors

```powershell
.\.manage-session-state.ps1 -Action update `
    -Event "error_occurred" `
    -Description "Failed to generate spec: $errorMessage"

.\.manage-session-state.ps1 -Action checkpoint
```

## Common Events

| Event | When to Use |
|-------|-------------|
| `session_started` | Initialize session |
| `phase_started` | Beginning new phase |
| `phase_completed` | Phase finished successfully |
| `feature_started` | Starting feature work |
| `feature_completed` | Feature finished |
| `task_started` | Starting implementation task |
| `task_completed` | Task finished |
| `checkpoint_saved` | Manual checkpoint |
| `error_occurred` | Error encountered |
| `token_threshold_*` | Token threshold reached |

## Token Usage Tracking

```powershell
# Update token usage
.\.manage-session-state.ps1 -Action update `
    -Event "token_usage_update" `
    -Description "Updated token count" `
    -TokenUsage 150000

# Check thresholds in session-state.json
$state = Get-Content session-state.json | ConvertFrom-Json
$tokenPct = ($state.context.token_usage / 1000000) * 100

if ($tokenPct -ge 50 -and -not $state.context.token_threshold_50_warned) {
    .\.manage-session-state.ps1 -Action update `
        -Event "token_threshold_50" `
        -Description "50% token usage reached"
}
```

## One-Liners

### Get Current Phase
```powershell
# PowerShell
(Get-Content session-state.json | ConvertFrom-Json).current_phase

# Bash
jq -r '.current_phase' session-state.json
```

### Get Pipeline ID
```powershell
# PowerShell
(Get-Content session-state.json | ConvertFrom-Json).pipeline_id

# Bash
jq -r '.pipeline_id' session-state.json
```

### Get Last Activity
```powershell
# PowerShell
(Get-Content session-state.json | ConvertFrom-Json).last_activity

# Bash
jq -r '.last_activity' session-state.json
```

### Count History Events
```powershell
# PowerShell
((Get-Content session-state.json | ConvertFrom-Json).history).Count

# Bash
jq '.history | length' session-state.json
```

## Checkpoint Schedule

✅ **Always checkpoint at**:
- End of each phase
- Before long-running operations (>5 minutes)
- Token thresholds (50%, 75%, 90%)
- On errors or unexpected issues
- Before pausing work

❌ **Don't checkpoint during**:
- Active file operations
- Mid-test runs
- During agent delegation (wait for completion)

## File Sizes to Monitor

| File | Expected Size | Action if Exceeded |
|------|---------------|-------------------|
| `session-state.json` | <100 KB | Normal (history accumulates) |
| `checkpoint.json` | <50 KB | Normal |
| `pipeline-state.json` | <10 KB | Should not exceed |
| `status.json` | <10 KB | Should not exceed |

## Emergency Recovery

If session state is corrupted:

```powershell
# Backup current state
Copy-Item session-state.json session-state.json.backup

# Check pipeline state (usually reliable)
Get-Content pipeline-state.json

# Reinitialize if necessary
.\.manage-session-state.ps1 -Action init `
    -SessionId (New-Guid).ToString() `
    -PipelineId "PIPELINE-XXX-YYY" `
    -Phase <current-phase>
```

## See Also

- **Full Documentation**: `RLM/docs/SESSION-STATE.md`
- **Progress Directory**: `RLM/progress/README.md`
- **Pipeline Guide**: `RLM/START-HERE.md`
