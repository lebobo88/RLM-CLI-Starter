# RLM Post-Tool Agent Spawn Hook
# Triggers agent spawning animation when team/batch agents are invoked

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $tool = $input.tool
    $args = $input.arguments
    $cwd = $input.cwd
    
    # Import agent spawner module
    $spawnerModule = Join-Path $cwd ".github" "hooks" "scripts" "lib" "agent-spawner.ps1"
    if (-not (Test-Path $spawnerModule)) {
        exit 0
    }
    
    . $spawnerModule
    
    # Check if this is a sub-agent invocation
    if ($tool -ne "task") {
        exit 0
    }
    
    # Parse agent type and description
    $agentType = if ($args.PSObject.Properties['agent_type']) { $args.agent_type } else { "" }
    $description = if ($args.PSObject.Properties['description']) { $args.description } else { "" }
    $prompt = if ($args.PSObject.Properties['prompt']) { $args.prompt } else { "" }
    
    # Detect team/swarm invocations
    $isTeamInvocation = $agentType -match "team-lead|rlm-team"
    $isBatchInvocation = $agentType -match "rlm-implement-all"
    $isParallelKeyword = $description -match "parallel|team|batch|swarm" -or $prompt -match "parallel|team|batch|swarm"
    
    if (-not ($isTeamInvocation -or $isBatchInvocation -or $isParallelKeyword)) {
        exit 0
    }
    
    # Extract task count if mentioned
    $taskCount = 5
    if ($prompt -match "(\d+)\s+(tasks?|agents?|sub-?agents?)") {
        $taskCount = [int]$matches[1]
    }
    
    # Trigger appropriate animation
    if ($isTeamInvocation) {
        Invoke-TeamSpawn
    }
    elseif ($isBatchInvocation -or $taskCount -gt 1) {
        Invoke-AgentSwarm -Count ([Math]::Min($taskCount, 10)) -Type "implement"
    }
    
    exit 0
} catch {
    # Don't block on animation errors
    exit 0
}
