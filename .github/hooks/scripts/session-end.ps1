# RLM Session End Hook
# Saves checkpoint and logs session summary

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $reason = $input.reason
    $cwd = $input.cwd
    $sessionId = if ($input.PSObject.Properties['sessionId']) { $input.sessionId } else { "" }

    # Log session end
    $logDir = Join-Path $cwd "RLM" "progress" "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    }

    $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'

    # Backward-compatible log
    $logFile = Join-Path $logDir "sessions.log"
    $entry = "$now | END   | reason=$reason"
    Add-Content -Path $logFile -Value $entry

    # Structured JSONL log
    $jsonlFile = Join-Path $logDir "sessions.jsonl"
    $jsonEntry = @{
        timestamp = $now
        event = "session.end"
        reason = $reason
        sessionId = $sessionId
    }
    $jsonEntry | ConvertTo-Json -Compress | Add-Content -Path $jsonlFile

    # Update checkpoint
    $checkpointFile = Join-Path $cwd "RLM" "progress" "checkpoint.json"
    $checkpoint = @{
        lastSession = @{
            endedAt = $now
            reason = $reason
            sessionId = $sessionId
        }
    }
    $checkpoint | ConvertTo-Json -Compress | Set-Content -Path $checkpointFile

    # --- Sandbox State Logging (read-only, no teardown) ---
    $sandboxStateFile = Join-Path $cwd "sandbox" ".sandbox-state.json"
    if (Test-Path $sandboxStateFile) {
        $sbxState = Get-Content $sandboxStateFile -Raw | ConvertFrom-Json
        if ($sbxState.PSObject.Properties['sandbox_id']) {
            Add-Content -Path $logFile -Value "$now | INFO  | Sandbox $($sbxState.sandbox_id) was active during session"
        }
    }

    exit 0
} catch {
    exit 0
}
