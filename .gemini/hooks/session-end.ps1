# RLM Session End Hook (Gemini CLI)
# Saves checkpoint and logs session summary
# Gemini CLI stdin JSON: { session_id, cwd, hook_event_name }

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $sessionId = if ($input.PSObject.Properties['session_id']) { $input.session_id } else { "" }
    $cwd = if ($input.PSObject.Properties['cwd']) { $input.cwd } else { $env:GEMINI_PROJECT_DIR }

    if (-not $cwd) { $cwd = "." }

    # Log session end
    $logDir = Join-Path $cwd "RLM" "progress" "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    }

    $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'

    # Backward-compatible log
    $logFile = Join-Path $logDir "sessions.log"
    $entry = "$now | END   | reason=session_end"
    Add-Content -Path $logFile -Value $entry

    # Structured JSONL log
    $jsonlFile = Join-Path $logDir "sessions.jsonl"
    $jsonEntry = @{
        timestamp = $now
        event = "session.end"
        reason = "session_end"
        sessionId = $sessionId
    }
    $jsonEntry | ConvertTo-Json -Compress | Add-Content -Path $jsonlFile

    # Update checkpoint with file locking
    $checkpointFile = Join-Path $cwd "RLM" "progress" "checkpoint.json"
    $checkpoint = @{
        lastSession = @{
            endedAt = $now
            reason = "session_end"
            sessionId = $sessionId
        }
    }

    $libPath = Join-Path $PSScriptRoot "lib" "file-locking.ps1"
    if (Test-Path $libPath) {
        . $libPath
        $lock = Lock-File -Path $checkpointFile -TimeoutSeconds 10
        try {
            $checkpoint | ConvertTo-Json -Compress | Set-Content -Path $checkpointFile
        } finally {
            if ($lock) { Unlock-File -LockToken $lock }
        }
    } else {
        $checkpoint | ConvertTo-Json -Compress | Set-Content -Path $checkpointFile
    }

    # --- Clean up session-specific context file ---
    if ($sessionId) {
        $sessionContextFile = Join-Path $cwd "RLM" "progress" ".session-contexts" "session-$sessionId.md"
        if (Test-Path $sessionContextFile) {
            Remove-Item -Path $sessionContextFile -Force -ErrorAction SilentlyContinue
        }
    }

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
