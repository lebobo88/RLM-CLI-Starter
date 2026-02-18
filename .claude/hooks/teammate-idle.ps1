# RLM Teammate Idle Hook (Claude Code)
# Verify last task completion, check manifest, assign next task
# Claude Code stdin JSON: { session_id, cwd, hook_event_name }
# Blocking on failure (exit 2) to keep teammate working

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $sessionId = if ($input.PSObject.Properties['session_id']) { $input.session_id } else { "" }
    $cwd = if ($input.PSObject.Properties['cwd']) { $input.cwd } else { $env:CLAUDE_PROJECT_DIR }

    if (-not $cwd) { $cwd = "." }

    $logDir = Join-Path $cwd "RLM" "progress" "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    }

    $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'

    # Check for pending tasks
    $activeDir = Join-Path $cwd "RLM" "tasks" "active"
    $pendingTasks = @()
    if (Test-Path $activeDir) {
        $pendingTasks = Get-ChildItem -Path $activeDir -Filter "TASK-*.md" | Select-Object -ExpandProperty Name
    }

    # Log teammate idle event
    $logEntry = @{
        timestamp = $now
        event = "teammate.idle"
        sessionId = $sessionId
        pendingTasks = $pendingTasks.Count
    } | ConvertTo-Json -Compress
    Add-Content -Path (Join-Path $logDir "team-coordination.jsonl") -Value $logEntry

    if ($pendingTasks.Count -gt 0) {
        # Signal there's more work to do
        $result = @{
            status = "has_work"
            pendingTasks = $pendingTasks
            nextTask = $pendingTasks[0]
        } | ConvertTo-Json -Compress
        Write-Output $result
        exit 2  # Block to keep teammate working
    }

    exit 0
} catch {
    exit 0
}
