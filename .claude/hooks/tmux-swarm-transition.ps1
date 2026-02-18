# tmux-swarm-transition.ps1
# Plays a swarm animation transition when entering tmux team mode
# Usage: .\tmux-swarm-transition.ps1 -Duration 2

param(
    [int]$Duration = 2
)

# ANSI colors
$RESET = "`e[0m"
$BRIGHT_GREEN = "`e[92m"
$BRIGHT_MAGENTA = "`e[95m"
$BRIGHT_CYAN = "`e[96m"
$BOLD = "`e[1m"

# Frames
$AgentFrames = @("◆", "◇", "◆")
$SpinnerFrames = @("◐", "◓", "◑", "◒")

Write-Host ""
Write-Host "${BRIGHT_CYAN}${BOLD}⚡ Spawning Agent Swarm${RESET}"
Write-Host ""

$StartTime = Get-Date
$AgentCount = 0
$FrameIndex = 0
$SpinnerIndex = 0

while ($true) {
    $CurrentTime = Get-Date
    $Elapsed = ($CurrentTime - $StartTime).TotalSeconds

    if ($Elapsed -ge $Duration) {
        break
    }

    # Gradually spawn agents
    if ($AgentCount -lt 8) {
        $AgentCount++
    }

    # Spinner animation
    $Spinner = $SpinnerFrames[$SpinnerIndex % 4]
    $SpinnerIndex++

    # Agent animation
    $AgentFrame = $AgentFrames[$FrameIndex % 3]
    $FrameIndex++

    # Build agent visual
    $AgentVisual = ""
    for ($i = 0; $i -lt $AgentCount; $i++) {
        if ($i -lt 3) {
            $AgentVisual += "${BRIGHT_GREEN}${AgentFrame}${RESET} "
        } elseif ($i -lt 6) {
            $AgentVisual += "${BRIGHT_MAGENTA}◆${RESET} "
        } else {
            $AgentVisual += "${BRIGHT_CYAN}◇${RESET} "
        }
    }

    # Progress bar
    $Progress = [int]($Elapsed * 20 / $Duration)
    $Bar = ""
    for ($i = 0; $i -lt 20; $i++) {
        if ($i -lt $Progress) {
            $Bar += "${BRIGHT_GREEN}█${RESET}"
        } else {
            $Bar += "░"
        }
    }

    # Clear and print
    [Console]::CursorLeft = 0
    [Console]::CursorTop = [Console]::CursorTop - 1
    Write-Host "`r${Spinner} Team Mode: [${Bar}] (${AgentCount}/8)" -NoNewline
    Write-Host "`n${AgentVisual}" -NoNewline

    Start-Sleep -Milliseconds 150
}

# Final message
Write-Host ""
Write-Host "${BRIGHT_GREEN}${BOLD}✓ Swarm initialized${RESET}"
Write-Host ""
