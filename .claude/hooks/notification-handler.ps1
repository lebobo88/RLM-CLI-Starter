# RLM Notification Hook — Log notifications for observability
# Claude Code stdin JSON: { message, session_id, cwd, hook_event_name }
# Non-blocking: logs notification

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $cwd = if ($input.PSObject.Properties['cwd']) { $input.cwd } else { $env:CLAUDE_PROJECT_DIR }
    $sessionId = if ($input.PSObject.Properties['session_id']) { $input.session_id } else { "" }
    $message = if ($input.PSObject.Properties['message']) { $input.message } else { "" }

    if (-not $cwd) { $cwd = "." }

    $logDir = Join-Path $cwd "RLM" "progress" "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    }

    $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'

    $logEntry = @{
        timestamp = $now
        event_type = "notification"
        session_id = $sessionId
        message = $message
    } | ConvertTo-Json -Compress
    Add-Content -Path (Join-Path $logDir "events.jsonl") -Value $logEntry

    exit 0
} catch {
    exit 0
}
