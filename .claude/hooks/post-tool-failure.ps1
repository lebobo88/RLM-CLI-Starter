# RLM PostToolUseFailure Hook — Track and log failed tool operations
# Claude Code stdin JSON: { tool_name, tool_input, tool_error, session_id, cwd }
# Non-blocking: logs failure for observability

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $cwd = if ($input.PSObject.Properties['cwd']) { $input.cwd } else { $env:CLAUDE_PROJECT_DIR }
    $sessionId = if ($input.PSObject.Properties['session_id']) { $input.session_id } else { "" }
    $toolName = if ($input.PSObject.Properties['tool_name']) { $input.tool_name } else { "unknown" }
    $toolError = if ($input.PSObject.Properties['tool_error']) { $input.tool_error } else { "" }

    if (-not $cwd) { $cwd = "." }

    $logDir = Join-Path $cwd "RLM" "progress" "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    }

    $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
    $traceId = if ($env:RLM_TRACE_ID) { $env:RLM_TRACE_ID } else { "" }

    $logEntry = @{
        timestamp = $now
        event_type = "tool_failure"
        session_id = $sessionId
        trace_id = $traceId
        tool = $toolName
        error = if ($toolError.Length -gt 500) { $toolError.Substring(0, 500) + "..." } else { $toolError }
    } | ConvertTo-Json -Compress
    Add-Content -Path (Join-Path $logDir "events.jsonl") -Value $logEntry

    exit 0
} catch {
    exit 0
}
