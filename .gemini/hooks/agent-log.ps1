# RLM Agent Log Hook (Gemini CLI)
# Logs BeforeAgent and AfterAgent events for sub-agent tracking
# Gemini CLI stdin JSON: { agent_name, hook_event_name, session_id, cwd }

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $agentName = if ($input.PSObject.Properties['agent_name']) { $input.agent_name } else { "unknown" }
    $hookEvent = if ($input.PSObject.Properties['hook_event_name']) { $input.hook_event_name } else { "agent" }
    $sessionId = if ($input.PSObject.Properties['session_id']) { $input.session_id } else { "" }
    $cwd = if ($input.PSObject.Properties['cwd']) { $input.cwd } else { $env:GEMINI_PROJECT_DIR }

    if (-not $cwd) { $cwd = "." }

    # Log agent invocation
    $logDir = Join-Path $cwd "RLM" "progress" "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    }

    $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'

    # Determine event type from hook name
    $eventType = if ($hookEvent -like "*Before*") { "agent.start" } else { "agent.end" }

    # Structured JSONL log
    $jsonlFile = Join-Path $logDir "agents.jsonl"
    $jsonEntry = @{
        timestamp = $now
        event = $eventType
        agent = $agentName
        source = "gemini-cli"
        sessionId = $sessionId
    }
    $jsonEntry | ConvertTo-Json -Compress | Add-Content -Path $jsonlFile

    # Human-readable log
    $logFile = Join-Path $logDir "agents.log"
    $label = if ($eventType -eq "agent.start") { "START" } else { "END  " }
    Add-Content -Path $logFile -Value "$now | $label | agent=$agentName"

    exit 0
} catch {
    exit 0
}
