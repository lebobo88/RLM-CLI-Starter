# RLM Post-Tool Log Hook (Gemini CLI)
# Tracks tool usage for progress reporting
# Gemini CLI stdin JSON: { tool_name, arguments, session_id, cwd, hook_event_name }

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $toolName = $input.tool_name
    $cwd = if ($input.PSObject.Properties['cwd']) { $input.cwd } else { $env:GEMINI_PROJECT_DIR }
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
        "timestamp,sessionId,tool,event,source" | Set-Content -Path $logFile
    }

    $entry = "$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss'),$sessionId,$toolName,after_tool,gemini-cli"
    Add-Content -Path $logFile -Value $entry

    exit 0
} catch {
    exit 0
}
