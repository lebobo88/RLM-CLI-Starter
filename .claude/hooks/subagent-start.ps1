# RLM Sub-agent Start Hook (Claude Code)
# Logs sub-agent invocation and injects context
# Claude Code stdin JSON: { agent_name, session_id, cwd, hook_event_name }

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $agentName = if ($input.PSObject.Properties['agent_name']) { $input.agent_name } else { "unknown" }
    $sessionId = if ($input.PSObject.Properties['session_id']) { $input.session_id } else { "" }
    $cwd = if ($input.PSObject.Properties['cwd']) { $input.cwd } else { $env:CLAUDE_PROJECT_DIR }

    if (-not $cwd) { $cwd = "." }

    $logDir = Join-Path $cwd "RLM" "progress" "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    }

    $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'

    # Log sub-agent start
    $logEntry = @{
        timestamp = $now
        event = "subagent.start"
        agentName = $agentName
        sessionId = $sessionId
    } | ConvertTo-Json -Compress
    Add-Content -Path (Join-Path $logDir "subagents.jsonl") -Value $logEntry

    # Load agent tracer if available
    $tracerLib = Join-Path $PSScriptRoot "lib" "agent-tracer.ps1"
    if (Test-Path $tracerLib) {
        . $tracerLib
        Start-AgentTrace -AgentId $agentName -SessionId $sessionId -ProjectDir $cwd
    }

    exit 0
} catch {
    exit 0
}
