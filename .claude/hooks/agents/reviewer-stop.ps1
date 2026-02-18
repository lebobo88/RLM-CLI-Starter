# Reviewer Stop Hook (Claude Code)
# Verifies review report was generated before reviewer agent finishes
# Claude Code stdin JSON: { agent_name, session_id, cwd, hook_event_name }

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $cwd = if ($input.PSObject.Properties['cwd']) { $input.cwd } else { $env:CLAUDE_PROJECT_DIR }

    if (-not $cwd) { $cwd = "." }

    # Check for review report
    $reviewDir = Join-Path $cwd "RLM" "progress" "reviews"
    if (-not (Test-Path $reviewDir)) {
        $result = @{
            decision = "block"
            reason = "Reviewer agent must generate a review report in RLM/progress/reviews/ before stopping."
        } | ConvertTo-Json -Compress
        Write-Output $result
        exit 2
    }

    # Check if any recent review files exist (within last 30 minutes)
    $recentReviews = Get-ChildItem -Path $reviewDir -Filter "*.md" -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -gt (Get-Date).AddMinutes(-30) }

    if ($recentReviews.Count -eq 0) {
        $result = @{
            decision = "block"
            reason = "No recent review report found in RLM/progress/reviews/. Generate a review report before finishing."
        } | ConvertTo-Json -Compress
        Write-Output $result
        exit 2
    }

    exit 0
} catch {
    exit 0
}
