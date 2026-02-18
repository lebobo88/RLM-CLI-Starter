# RLM After-Agent Hook (Gemini CLI)
# Logs sub-agent completion (maps to Claude's SubagentStop)
# Gemini CLI stdin JSON: { agent_name, hook_event_name }

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $agentName = if ($input.PSObject.Properties['agent_name']) { $input.agent_name } else { "unknown" }
    $cwd = if ($input.PSObject.Properties['cwd']) { $input.cwd } else { $env:GEMINI_PROJECT_DIR }

    if (-not $cwd) { $cwd = "." }

    $logDir = Join-Path $cwd "RLM" "progress" "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    }

    $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'

    $logEntry = @{
        timestamp = $now
        event = "agent.stop"
        agentName = $agentName
        source = "gemini-cli"
    } | ConvertTo-Json -Compress
    Add-Content -Path (Join-Path $logDir "subagents.jsonl") -Value $logEntry

    # Return non-blocking JSON to stdout
    @{ status = "ok" } | ConvertTo-Json -Compress | Write-Output
    exit 0
} catch {
    @{ status = "ok" } | ConvertTo-Json -Compress | Write-Output
    exit 0
}
