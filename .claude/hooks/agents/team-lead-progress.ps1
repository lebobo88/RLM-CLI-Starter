# Team Lead Progress Tracking Hook
# Logs team coordination events for observability
# Claude Code stdin JSON: { tool_name, tool_input, session_id, cwd }

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $cwd = if ($input.PSObject.Properties['cwd']) { $input.cwd } else { $env:CLAUDE_PROJECT_DIR }
    $sessionId = if ($input.PSObject.Properties['session_id']) { $input.session_id } else { "" }

    if (-not $cwd) { $cwd = "." }

    $eventSender = Join-Path $PSScriptRoot ".." "lib" "event-sender.ps1"
    if (Test-Path $eventSender) {
        . $eventSender
        Send-RlmEvent -EventType "team.progress_check" -SessionId $sessionId -ProjectDir $cwd
    }

    exit 0
} catch {
    exit 0
}
