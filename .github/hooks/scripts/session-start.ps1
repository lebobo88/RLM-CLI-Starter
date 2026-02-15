# RLM Session Start Hook
# Logs session start and loads RLM pipeline state

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $timestamp = $input.timestamp
    $source = $input.source
    $cwd = $input.cwd
    $sessionId = if ($input.PSObject.Properties['sessionId']) { $input.sessionId } else { "" }

    # Ensure logs directory exists
    $logDir = Join-Path $cwd "RLM" "progress" "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    }

    $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'

    # Backward-compatible log
    $logFile = Join-Path $logDir "sessions.log"
    $entry = "$now | START | source=$source"
    Add-Content -Path $logFile -Value $entry

    # Check for existing pipeline state
    $pipelinePhase = $null
    $stateFile = Join-Path $cwd "RLM" "progress" "pipeline-state.json"
    if (Test-Path $stateFile) {
        $state = Get-Content $stateFile -Raw | ConvertFrom-Json
        $pipelinePhase = $state.current_phase
        Add-Content -Path $logFile -Value "$now | INFO  | Resuming pipeline at phase $pipelinePhase"
    }

    # Structured JSONL log
    $jsonlFile = Join-Path $logDir "sessions.jsonl"
    $jsonEntry = @{
        timestamp = $now
        event = "session.start"
        source = $source
        sessionId = $sessionId
    }
    if ($null -ne $pipelinePhase) {
        $jsonEntry.pipelinePhase = $pipelinePhase
    }
    # --- Sandbox Detection ---
    $sandboxMode = $false
    $sandboxId = $null
    $configFile = Join-Path $cwd "RLM" "progress" "config.json"
    if (Test-Path $configFile) {
        $config = Get-Content $configFile -Raw | ConvertFrom-Json
        if ($config.PSObject.Properties['sandbox'] -and $config.sandbox.PSObject.Properties['enabled']) {
            $sandboxMode = $config.sandbox.enabled
        }
    }
    $sandboxStateFile = Join-Path $cwd "sandbox" ".sandbox-state.json"
    if (Test-Path $sandboxStateFile) {
        $sbxState = Get-Content $sandboxStateFile -Raw | ConvertFrom-Json
        if ($sbxState.PSObject.Properties['sandbox_id']) { $sandboxId = $sbxState.sandbox_id }
    }
    if ($sandboxMode) {
        $jsonEntry.sandboxMode = $true
        if ($sandboxId) { $jsonEntry.sandboxId = $sandboxId }
    }

    $jsonEntry | ConvertTo-Json -Compress | Add-Content -Path $jsonlFile

    exit 0
} catch {
    # Hooks should not block the session
    exit 0
}
