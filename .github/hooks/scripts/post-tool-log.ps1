# RLM Post-Tool Log Hook
# Tracks tool usage for progress reporting

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $toolName = $input.toolName
    $resultType = $input.toolResult.resultType
    $cwd = $input.cwd
    $sessionId = if ($input.PSObject.Properties['sessionId']) { $input.sessionId } else { "" }

    # Log tool usage
    $logDir = Join-Path $cwd "RLM" "progress" "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    }

    $logFile = Join-Path $logDir "tool-usage.csv"

    # Create header if file doesn't exist
    if (-not (Test-Path $logFile)) {
        "timestamp,sessionId,tool,result" | Set-Content -Path $logFile
    }

    $entry = "$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss'),$sessionId,$toolName,$resultType"
    Add-Content -Path $logFile -Value $entry

    exit 0
} catch {
    exit 0
}
