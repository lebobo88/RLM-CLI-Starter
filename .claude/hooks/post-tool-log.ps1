# RLM Post-Tool Log Hook (Claude Code)
# Tracks tool usage for progress reporting
# Claude Code stdin JSON: { tool_name, tool_input, session_id, cwd, hook_event_name }

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $toolName = $input.tool_name
    $cwd = if ($input.PSObject.Properties['cwd']) { $input.cwd } else { $env:CLAUDE_PROJECT_DIR }
    $sessionId = if ($input.PSObject.Properties['session_id']) { $input.session_id } else { "" }

    if (-not $cwd) { $cwd = "." }

    # Log tool usage
    $logDir = Join-Path $cwd "RLM" "progress" "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    }

    $logFile = Join-Path $logDir "tool-usage.csv"

    # Create header if file doesn't exist
    if (-not (Test-Path $logFile)) {
        "timestamp,sessionId,tool,event" | Set-Content -Path $logFile
    }

    $entry = "$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss'),$sessionId,$toolName,post_tool_use"
    Add-Content -Path $logFile -Value $entry

    # Enhanced JSONL logging with agent tracking
    $observabilityOff = ($env:RLM_OBSERVABILITY -eq "off")
    if (-not $observabilityOff) {
        $jsonlFile = Join-Path $logDir "tool-usage.jsonl"
        $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'

        $agentId = if ($input.PSObject.Properties['agent_name']) { $input.agent_name } else { "" }

        # Extract file path from tool input if available
        $filePath = ""
        if ($input.tool_input.PSObject.Properties['file_path']) {
            $filePath = $input.tool_input.file_path
        } elseif ($input.tool_input.PSObject.Properties['command']) {
            $filePath = "[bash]"
        }

        $jsonEntry = @{
            timestamp = $now
            sessionId = $sessionId
            agentId = $agentId
            tool = $toolName
            event = "post_tool_use"
            filePath = $filePath
        } | ConvertTo-Json -Compress
        Add-Content -Path $jsonlFile -Value $jsonEntry
    }

    # Return additionalContext with event summary
    @{
        additionalContext = "Logged: $toolName on $(if ($filePath) { $filePath } else { 'N/A' })"
    } | ConvertTo-Json -Compress

    exit 0
} catch {
    exit 0
}
