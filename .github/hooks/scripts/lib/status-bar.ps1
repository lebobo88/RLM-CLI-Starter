# RLM Status Bar Module (PowerShell)
# Displays real-time pipeline state in terminal status bar

# ANSI Color Codes
$script:Colors = @{
    Reset      = "`e[0m"
    Bold       = "`e[1m"
    Green      = "`e[32m"
    Yellow     = "`e[33m"
    Red        = "`e[31m"
    Cyan       = "`e[36m"
    Magenta    = "`e[35m"
    Gray       = "`e[90m"
}

# Config cache
$script:Config = $null
$script:RLMRoot = $null

function Get-RLMRoot {
    if ($script:RLMRoot) { return $script:RLMRoot }
    
    $current = Get-Location
    while ($current) {
        $rlmPath = Join-Path $current "RLM"
        if (Test-Path $rlmPath) {
            $script:RLMRoot = $current
            return $current
        }
        $parent = Split-Path $current -Parent
        if ($parent -eq $current) { break }
        $current = $parent
    }
    return $null
}

function Get-StatusBarConfig {
    if ($script:Config) { return $script:Config }
    
    $root = Get-RLMRoot
    if (-not $root) { return $null }
    
    $configPath = Join-Path $root ".github\hooks\config\status-bar-config.json"
    if (Test-Path $configPath) {
        $script:Config = Get-Content $configPath -Raw | ConvertFrom-Json
        return $script:Config
    }
    return $null
}

function Test-ANSISupport {
    if ($env:TERM -match "xterm|color" -or $env:COLORTERM) {
        return $true
    }
    if ($PSVersionTable.PSVersion.Major -ge 7) {
        return $true
    }
    return $false
}

function Get-PipelineState {
    $root = Get-RLMRoot
    if (-not $root) { return $null }
    
    $statePath = Join-Path $root "RLM\progress\pipeline-state.json"
    if (Test-Path $statePath) {
        try {
            return Get-Content $statePath -Raw | ConvertFrom-Json
        } catch {
            return $null
        }
    }
    return $null
}

function Get-StatusJSON {
    $root = Get-RLMRoot
    if (-not $root) { return $null }
    
    $statusPath = Join-Path $root "RLM\progress\status.json"
    if (Test-Path $statusPath) {
        try {
            return Get-Content $statusPath -Raw | ConvertFrom-Json
        } catch {
            return $null
        }
    }
    return $null
}

function Get-CheckpointData {
    $root = Get-RLMRoot
    if (-not $root) { return $null }
    
    $checkpointPath = Join-Path $root "RLM\progress\checkpoint.json"
    if (Test-Path $checkpointPath) {
        try {
            return Get-Content $checkpointPath -Raw | ConvertFrom-Json
        } catch {
            return $null
        }
    }
    return $null
}

function Get-ContextPercentage {
    $root = Get-RLMRoot
    if (-not $root) { return 0 }
    
    $tokenDir = Join-Path $root "RLM\progress\token-usage"
    if (-not (Test-Path $tokenDir)) { return 0 }
    
    # Find most recent session token file
    $latestFile = Get-ChildItem $tokenDir -Filter "session-*.json" -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
    
    if ($latestFile) {
        try {
            $data = Get-Content $latestFile.FullName -Raw | ConvertFrom-Json
            if ($data.total_tokens -and $data.context_limit) {
                return [math]::Round(($data.total_tokens / $data.context_limit) * 100)
            }
        } catch {
            # Fallback: estimate based on file count and average size
        }
    }
    
    # Rough estimate based on common context limits
    return 0
}

function Get-TaskCounts {
    $root = Get-RLMRoot
    if (-not $root) { return @{completed=0; inProgress=0; blocked=0} }
    
    $status = Get-StatusJSON
    if (-not $status) {
        return @{completed=0; inProgress=0; blocked=0}
    }
    
    $completed = if ($status.completedTasks) { $status.completedTasks.Count } else { 0 }
    $blocked = if ($status.blockedTasks) { $status.blockedTasks.Count } else { 0 }
    
    # Count in-progress from active directory
    $activePath = Join-Path $root "RLM\tasks\active"
    $inProgress = 0
    if (Test-Path $activePath) {
        $inProgress = (Get-ChildItem $activePath -Filter "TASK-*.md" -ErrorAction SilentlyContinue).Count
    }
    
    return @{
        completed = $completed
        inProgress = $inProgress
        blocked = $blocked
    }
}

function Format-PhaseIndicator {
    param(
        [object]$PipelineState,
        [bool]$UseColor = $true
    )
    
    if (-not $PipelineState) {
        return "⚠️  No pipeline"
    }
    
    $phase = $PipelineState.current_phase
    $phaseNames = @{
        1 = "Discover"
        2 = "Design"
        3 = "Specs"
        4 = "Feature-Design"
        5 = "Tasks"
        6 = "Implement"
        7 = "Quality"
        8 = "Verify"
        9 = "Report"
    }
    
    $phaseName = $phaseNames[$phase]
    if (-not $phaseName) { $phaseName = "Unknown" }
    
    $icon = "🔄"
    $color = if ($UseColor) { $script:Colors.Yellow } else { "" }
    $reset = if ($UseColor) { $script:Colors.Reset } else { "" }
    
    return "${color}${icon} Phase ${phase}/9${reset}"
}

function Format-CurrentTask {
    param(
        [object]$Status,
        [bool]$UseColor = $true
    )
    
    if (-not $Status -or -not $Status.currentTask) {
        return "--"
    }
    
    $taskId = $Status.currentTask
    $color = if ($UseColor) { $script:Colors.Cyan } else { "" }
    $reset = if ($UseColor) { $script:Colors.Reset } else { "" }
    
    return "${color}${taskId}${reset}"
}

function Format-TaskCounters {
    param(
        [hashtable]$Counts,
        [bool]$UseColor = $true
    )
    
    $green = if ($UseColor) { $script:Colors.Green } else { "" }
    $yellow = if ($UseColor) { $script:Colors.Yellow } else { "" }
    $red = if ($UseColor) { $script:Colors.Red } else { "" }
    $reset = if ($UseColor) { $script:Colors.Reset } else { "" }
    
    $parts = @()
    if ($Counts.completed -gt 0) {
        $parts += "${green}✅ $($Counts.completed)${reset}"
    }
    if ($Counts.inProgress -gt 0) {
        $parts += "${yellow}⏳ $($Counts.inProgress)${reset}"
    }
    if ($Counts.blocked -gt 0) {
        $parts += "${red}❌ $($Counts.blocked)${reset}"
    }
    
    if ($parts.Count -eq 0) {
        return "${yellow}⏳ 0${reset}"
    }
    
    return $parts -join " "
}

function Format-ContextUsage {
    param(
        [int]$Percentage,
        [bool]$UseColor = $true,
        [int]$WarnThreshold = 75,
        [int]$CriticalThreshold = 90
    )
    
    $color = if ($UseColor) {
        if ($Percentage -ge $CriticalThreshold) { $script:Colors.Red }
        elseif ($Percentage -ge $WarnThreshold) { $script:Colors.Yellow }
        else { $script:Colors.Gray }
    } else { "" }
    
    $reset = if ($UseColor) { $script:Colors.Reset } else { "" }
    
    return "${color}Ctx: ${Percentage}%${reset}"
}

function Format-AutomationLevel {
    param(
        [string]$Level,
        [bool]$UseColor = $true
    )
    
    if (-not $Level) { $Level = "MANUAL" }
    
    $color = if ($UseColor) { $script:Colors.Magenta } else { "" }
    $reset = if ($UseColor) { $script:Colors.Reset } else { "" }
    
    return "${color}[$($Level.ToUpper())]${reset}"
}

function Get-StatusBarText {
    param(
        [string]$Format = "compact"
    )
    
    $config = Get-StatusBarConfig
    $useColor = Test-ANSISupport
    $showEmojis = if ($config) { $config.status_bar.show_emojis } else { $true }
    
    $pipelineState = Get-PipelineState
    $status = Get-StatusJSON
    $taskCounts = Get-TaskCounts
    $contextPct = Get-ContextPercentage
    
    $warnThreshold = if ($config) { $config.status_bar.context_threshold_warning } else { 75 }
    $criticalThreshold = if ($config) { $config.status_bar.context_threshold_critical } else { 90 }
    
    # Build components
    $phaseText = Format-PhaseIndicator -PipelineState $pipelineState -UseColor $useColor
    $taskText = Format-CurrentTask -Status $status -UseColor $useColor
    $countersText = Format-TaskCounters -Counts $taskCounts -UseColor $useColor
    $contextText = Format-ContextUsage -Percentage $contextPct -UseColor $useColor -WarnThreshold $warnThreshold -CriticalThreshold $criticalThreshold
    
    $automationLevel = if ($pipelineState) { $pipelineState.automation_level } else { "manual" }
    $autoText = Format-AutomationLevel -Level $automationLevel -UseColor $useColor
    
    if ($Format -eq "compact") {
        return "[$phaseText | $taskText | $countersText | $contextText | $autoText]"
    }
    elseif ($Format -eq "wide") {
        return "$phaseText | Task: $taskText | $countersText | $contextText | Mode: $autoText"
    }
    else {
        # Minimal format
        return "$phaseText | $taskText"
    }
}

function Show-StatusBar {
    param(
        [string]$Format = "compact"
    )
    
    $statusText = Get-StatusBarText -Format $Format
    Write-Host $statusText
}

function Start-StatusBarWatcher {
    param(
        [int]$IntervalMs = 500
    )
    
    $root = Get-RLMRoot
    if (-not $root) {
        Write-Warning "RLM root not found. Cannot start status bar watcher."
        return
    }
    
    $progressDir = Join-Path $root "RLM\progress"
    if (-not (Test-Path $progressDir)) {
        Write-Warning "RLM progress directory not found: $progressDir"
        return
    }
    
    # Use FileSystemWatcher for real-time updates
    $watcher = New-Object System.IO.FileSystemWatcher
    $watcher.Path = $progressDir
    $watcher.Filter = "*.json"
    $watcher.IncludeSubdirectories = $false
    $watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite
    
    $action = {
        # Debounce: only update if last update was > 500ms ago
        $global:LastStatusUpdate = if (-not $global:LastStatusUpdate) { (Get-Date).AddSeconds(-1) } else { $global:LastStatusUpdate }
        $elapsed = ((Get-Date) - $global:LastStatusUpdate).TotalMilliseconds
        
        if ($elapsed -gt 500) {
            $global:LastStatusUpdate = Get-Date
            # Clear previous line and redraw
            Write-Host "`r`e[K" -NoNewline
            Show-StatusBar
        }
    }
    
    Register-ObjectEvent -InputObject $watcher -EventName Changed -Action $action
    $watcher.EnableRaisingEvents = $true
    
    Write-Host "Status bar watcher started. Monitoring: $progressDir" -ForegroundColor Green
    
    return $watcher
}

function Stop-StatusBarWatcher {
    param(
        [object]$Watcher
    )
    
    if ($Watcher) {
        $Watcher.EnableRaisingEvents = $false
        $Watcher.Dispose()
        Get-EventSubscriber | Where-Object { $_.SourceObject -eq $Watcher } | Unregister-Event
        Write-Host "Status bar watcher stopped." -ForegroundColor Gray
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Get-StatusBarConfig',
    'Get-StatusBarText',
    'Show-StatusBar',
    'Start-StatusBarWatcher',
    'Stop-StatusBarWatcher'
)
