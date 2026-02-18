# RLM Stop Checkpoint Hook (Claude Code)
# Ensure progress is saved before session ends
# Claude Code stdin JSON: { session_id, cwd, hook_event_name }
# Non-blocking

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $sessionId = if ($input.PSObject.Properties['session_id']) { $input.session_id } else { "" }
    $cwd = if ($input.PSObject.Properties['cwd']) { $input.cwd } else { $env:CLAUDE_PROJECT_DIR }

    if (-not $cwd) { $cwd = "." }

    $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'

    # Ensure progress directory exists
    $progressDir = Join-Path $cwd "RLM" "progress"
    if (-not (Test-Path $progressDir)) {
        New-Item -ItemType Directory -Force -Path $progressDir | Out-Null
    }

    # Update checkpoint with stop marker
    $checkpointFile = Join-Path $progressDir "checkpoint.json"
    $checkpoint = @{
        lastSession = @{
            endedAt = $now
            reason = "session_stop"
            sessionId = $sessionId
        }
    }

    if (Test-Path $checkpointFile) {
        $existing = Get-Content $checkpointFile -Raw | ConvertFrom-Json
        $existing.lastSession = $checkpoint.lastSession
        $checkpoint = $existing
    }

    # Use atomic write if available
    $atomicLib = Join-Path $PSScriptRoot "lib" "atomic-write.ps1"
    $content = $checkpoint | ConvertTo-Json -Depth 10
    if (Test-Path $atomicLib) {
        . $atomicLib
        Write-AtomicFile -FilePath $checkpointFile -Content $content | Out-Null
    } else {
        $content | Set-Content -Path $checkpointFile -NoNewline
    }

    # Log stop event
    $logDir = Join-Path $progressDir "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    }

    $logEntry = @{
        timestamp = $now
        event = "session.stop"
        sessionId = $sessionId
    } | ConvertTo-Json -Compress
    Add-Content -Path (Join-Path $logDir "sessions.jsonl") -Value $logEntry

    exit 0
} catch {
    exit 0
}
