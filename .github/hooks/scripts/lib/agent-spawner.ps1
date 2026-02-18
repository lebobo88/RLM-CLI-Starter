# RLM Agent Spawner Module (PowerShell)
# Animated ASCII agent spawning for sub-agent teams

# ASCII Agent Template (adapted from _test_runs/11/src/js/agent.js)
$script:AgentTemplate = @"
      _____
     /     \
    | [O] [O] |
    |    ^    |
     \  ===  /
      |||||||
"@

# Glitch characters for effect
$script:GlitchChars = @('!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+')

function New-AgentASCII {
    param(
        [string]$AgentID = "agent-0",
        [string]$TaskID = "",
        [string]$Status = "Active"
    )
    
    $agent = $script:AgentTemplate
    $metadata = ""
    
    if ($TaskID) {
        $metadata = "`n   [$AgentID]`n   Task: $TaskID`n   Status: 🟢 $Status"
    } else {
        $metadata = "`n   [$AgentID]"
    }
    
    return $agent + $metadata
}

function Invoke-AgentGlitch {
    param(
        [string]$AgentText
    )
    
    $lines = $AgentText -split "`n"
    $glitchedLines = @()
    
    foreach ($line in $lines) {
        if ((Get-Random -Minimum 0.0 -Maximum 1.0) -lt 0.05) {
            # Glitch this line
            $pos = Get-Random -Minimum 0 -Maximum $line.Length
            $char = $script:GlitchChars | Get-Random
            $glitched = $line.Substring(0, $pos) + $char + $line.Substring([Math]::Min($pos + 1, $line.Length))
            $glitchedLines += $glitched
        } else {
            $glitchedLines += $line
        }
    }
    
    return $glitchedLines -join "`n"
}

function Show-AgentSpawn {
    param(
        [string]$AgentID,
        [string]$TaskID = "",
        [int]$DelayMs = 200,
        [bool]$WithGlitch = $true
    )
    
    $agent = New-AgentASCII -AgentID $AgentID -TaskID $TaskID
    
    # Apply glitch effect
    if ($WithGlitch) {
        $agent = Invoke-AgentGlitch -AgentText $agent
    }
    
    Write-Host $agent -ForegroundColor Cyan
    
    if ($DelayMs -gt 0) {
        Start-Sleep -Milliseconds $DelayMs
    }
}

function Invoke-AgentSwarm {
    param(
        [int]$Count = 5,
        [string]$Type = "parallel",
        [array]$TaskIDs = @()
    )
    
    Write-Host "`n🔀 Spawning $Count sub-agents for $Type execution...`n" -ForegroundColor Yellow
    
    for ($i = 0; $i -lt $Count; $i++) {
        $agentID = "$Type-agent-$($i + 1)"
        $taskID = if ($i -lt $TaskIDs.Count) { $TaskIDs[$i] } else { "" }
        
        Show-AgentSpawn -AgentID $agentID -TaskID $taskID -DelayMs 200 -WithGlitch $true
    }
    
    Write-Host "`n✅ Agent swarm spawned successfully!`n" -ForegroundColor Green
}

function Invoke-TeamSpawn {
    param(
        [array]$AgentTypes = @("team-lead", "code-writer", "test-writer", "reviewer", "tester")
    )
    
    Write-Host "`n🎪 Spawning agent team...`n" -ForegroundColor Yellow
    
    foreach ($type in $AgentTypes) {
        Show-AgentSpawn -AgentID $type -DelayMs 200 -WithGlitch $true
    }
    
    Write-Host "`n✅ Team assembled and ready!`n" -ForegroundColor Green
}

function Show-AgentBanner {
    param(
        [string]$Message = "RLM Pipeline Active"
    )
    
    $banner = @"

╔═══════════════════════════════════════════╗
║                                           ║
║     $Message     ║
║                                           ║
╔═══════════════════════════════════════════╗

"@
    
    Write-Host $banner -ForegroundColor Cyan
}

# Export functions
Export-ModuleMember -Function @(
    'New-AgentASCII',
    'Show-AgentSpawn',
    'Invoke-AgentSwarm',
    'Invoke-TeamSpawn',
    'Show-AgentBanner'
)
