# RLM Prompt Post Hook
# Logs prompt responses for progress tracking

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $agent = $input.agent
    $response = $input.response
    $cwd = $input.cwd

    $responseLen = if ($response) { $response.Length } else { 0 }

    # Ensure logs directory exists
    $logDir = Join-Path $cwd "RLM" "progress" "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    }

    $logFile = Join-Path $logDir "prompts.log"
    $entry = "$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss') | $agent | $responseLen"
    Add-Content -Path $logFile -Value $entry

    exit 0
} catch {
    # Hooks should not block the session
    exit 0
}
