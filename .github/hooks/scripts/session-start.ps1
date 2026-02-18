# RLM Session Start Hook
# Logs session start, loads RLM pipeline state, and initializes status bar

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $timestamp = $input.timestamp
    $source = $input.source
    $cwd = $input.cwd
    $sessionId = if ($input.PSObject.Properties['sessionId']) { $input.sessionId } else { "" }

    # Import modules
    $statusBarModule = Join-Path $cwd ".github" "hooks" "scripts" "lib" "status-bar.ps1"
    if (Test-Path $statusBarModule) {
        . $statusBarModule
    }
    
    $welcomeModule = Join-Path $cwd ".github" "hooks" "scripts" "lib" "orchestrator-welcome.ps1"
    $hasWelcomeModule = Test-Path $welcomeModule
    if ($hasWelcomeModule) {
        . $welcomeModule
    }

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

    # Load orchestrator autoload config
    $configPath = Join-Path $cwd ".github" "hooks" "config" "status-bar-config.json"
    $showWelcome = $false
    $welcomeFormat = "verbose"
    
    if (Test-Path $configPath) {
        try {
            $config = Get-Content $configPath -Raw | ConvertFrom-Json
            if ($config.PSObject.Properties['orchestrator_autoload']) {
                $autoloadConfig = $config.orchestrator_autoload
                $showWelcome = $autoloadConfig.enabled -and $autoloadConfig.show_welcome
                $welcomeFormat = if ($autoloadConfig.PSObject.Properties['welcome_format']) { $autoloadConfig.welcome_format } else { "verbose" }
            }
        } catch {
            # Config parsing failed, use defaults
        }
    }

    # Show orchestrator welcome screen (if enabled)
    if ($showWelcome -and $hasWelcomeModule) {
        try {
            Show-OrchestratorWelcome -Format $welcomeFormat
        } catch {
            # Welcome screen is optional, don't block
        }
    } elseif (Test-Path $statusBarModule) {
        # Fallback to old status bar display
        try {
            Write-Host "`n╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
            Write-Host "║       RLM Pipeline Session Started        ║" -ForegroundColor Cyan
            Write-Host "╚═══════════════════════════════════════════╝`n" -ForegroundColor Cyan
            
            Show-StatusBar -Format "compact"
            Write-Host ""
        } catch {
            # Status bar is optional, don't block
        }
    }

    exit 0
} catch {
    # Hooks should not block the session
    exit 0
}
