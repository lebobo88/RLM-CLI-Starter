# Orchestrator Welcome Screen Module
# Displays welcome banner and "Three Ways to Start" on session start

function Get-PipelineStateInfo {
    [CmdletBinding()]
    param()
    
    $statusPath = "RLM\progress\status.json"
    $pipelineStatePath = "RLM\progress\pipeline-state.json"
    
    $state = @{
        HasPipeline = $false
        PipelineId = $null
        Phase = $null
        Status = $null
        Automation = $null
        ActiveTask = $null
        Progress = @{
            Completed = 0
            InProgress = 0
            Blocked = 0
        }
    }
    
    # Check if pipeline state exists
    if (Test-Path $pipelineStatePath) {
        try {
            $pipelineState = Get-Content $pipelineStatePath -Raw | ConvertFrom-Json
            $state.HasPipeline = $true
            $state.PipelineId = $pipelineState.pipeline_id
            $state.Phase = $pipelineState.current_phase
            $state.Automation = $pipelineState.automation_level.ToUpper()
            
            # Determine status from phases
            $completedPhases = ($pipelineState.phases.PSObject.Properties | Where-Object { $_.Value.status -eq "completed" }).Count
            $totalPhases = $pipelineState.phases.PSObject.Properties.Count
            
            if ($completedPhases -eq $totalPhases) {
                $state.Status = "✅ Complete"
            } elseif ($pipelineState.current_phase -gt 0) {
                $state.Status = "🟢 Active"
            } else {
                $state.Status = "⏸️  Paused"
            }
        } catch {
            # Silently fail if JSON is malformed
        }
    }
    
    # Check for active tasks
    if (Test-Path "RLM\tasks\active") {
        $activeTasks = Get-ChildItem "RLM\tasks\active\*.md" -ErrorAction SilentlyContinue
        if ($activeTasks) {
            $state.ActiveTask = $activeTasks[0].BaseName
        }
    }
    
    # Read status.json for progress
    if (Test-Path $statusPath) {
        try {
            $status = Get-Content $statusPath -Raw | ConvertFrom-Json
            $state.Progress.Completed = if ($status.PSObject.Properties['completed_tasks']) { $status.completed_tasks.Count } else { 0 }
            $state.Progress.InProgress = if ($status.PSObject.Properties['in_progress_tasks']) { $status.in_progress_tasks.Count } else { 0 }
            $state.Progress.Blocked = if ($status.PSObject.Properties['blocked_tasks']) { $status.blocked_tasks.Count } else { 0 }
        } catch {
            # Silently fail if JSON is malformed
        }
    }
    
    return $state
}

function Format-WelcomeBanner {
    [CmdletBinding()]
    param()
    
    $banner = @"
╔═══════════════════════════════════════════════════════════╗
║    RLM Method v2.7 - Pipeline Orchestrator                ║
║    Ready to transform ideas into code                     ║
╚═══════════════════════════════════════════════════════════╝
"@
    
    return $banner
}

function Format-PipelineStatus {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [hashtable]$State
    )
    
    if (-not $State.HasPipeline) {
        return @"

📊 No active pipeline detected
   Start a new pipeline by describing your idea to the orchestrator

"@
    }
    
    $phaseNames = @{
        1 = "Discovery"
        2 = "Design"
        3 = "Specs"
        4 = "Feature Design"
        5 = "Tasks"
        6 = "Implementation"
        7 = "Quality"
        8 = "Verification"
        9 = "Report"
    }
    
    $phaseKey = [int]$State.Phase
    $phaseName = if ($phaseNames.ContainsKey($phaseKey)) { $phaseNames[$phaseKey] } else { "Unknown" }
    $activeTaskLine = if ($State.ActiveTask) { "📋 Active Task:  $($State.ActiveTask)" } else { "" }
    $progressLine = "📈 Progress:     ✅ $($State.Progress.Completed) completed | ⏳ $($State.Progress.InProgress) in progress | ❌ $($State.Progress.Blocked) blocked"
    
    return @"

📊 Current Pipeline State
   ID:          $($State.PipelineId)
   Phase:       $($State.Phase)/9 ($phaseName)
   Status:      $($State.Status)
   Automation:  $($State.Automation)

$activeTaskLine
$progressLine

"@
}

function Format-ThreeWaysToStart {
    [CmdletBinding()]
    param(
        [switch]$ShowSetupInstructions
    )
    
    # Detect if alias is installed
    $profilePath = $PROFILE.CurrentUserAllHosts
    $aliasInstalled = $false
    
    if (Test-Path $profilePath) {
        $profileContent = Get-Content $profilePath -Raw -ErrorAction SilentlyContinue
        $aliasInstalled = $profileContent -match "function rlm"
    }
    
    $aliasSection = if ($aliasInstalled) {
        @"
   ⭐ Option 1: Shell Alias (Fastest) ✅ INSTALLED
   → rlm
"@
    } else {
        @"
   ⭐ Option 1: Shell Alias (Fastest)
   → rlm
   
   📌 One-time setup (not yet installed):
      PowerShell: .github\hooks\scripts\setup-rlm-alias.ps1
      Bash/Zsh:   .github/hooks/scripts/setup-rlm-alias.sh
      Fish:       .github/hooks/scripts/setup-rlm-alias.fish
"@
    }
    
    return @"
──────────────────────────────────────────────────────────────

🚀 Three Ways to Start Orchestrator

$aliasSection
   
   🔧 Option 2: CLI Flag
   → copilot --agent rlm-orchestrator
   
   🖱️  Option 3: Interactive Menu
   → copilot
   → Type: /agents
   → Select: rlm-orchestrator

──────────────────────────────────────────────────────────────
"@
}

function Show-OrchestratorWelcome {
    [CmdletBinding()]
    param(
        [ValidateSet('verbose', 'minimal')]
        [string]$Format = 'verbose'
    )
    
    $state = Get-PipelineStateInfo
    
    Write-Host ""
    Write-Host (Format-WelcomeBanner) -ForegroundColor Cyan
    Write-Host (Format-PipelineStatus -State $state)
    
    if ($Format -eq 'verbose') {
        Write-Host (Format-ThreeWaysToStart)
        
        if ($state.HasPipeline) {
            Write-Host ""
            Write-Host "💡 TIP: Your pipeline is active! Once in orchestrator context:" -ForegroundColor Yellow
            Write-Host "   • Resume: `"resume`"" -ForegroundColor Gray
            Write-Host "   • Check status: `"show me the current state`"" -ForegroundColor Gray
            Write-Host ""
        } else {
            Write-Host ""
            Write-Host "💡 TIP: Start a new pipeline by describing your idea!" -ForegroundColor Yellow
            Write-Host "   Example: `"Build a task management API with authentication`"" -ForegroundColor Gray
            Write-Host ""
        }
    }
}
