# RLM Prompt Pre Hook
# Injects active pipeline context into the system prompt

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $cwd = $input.cwd

    # Check for active pipeline state
    $stateFile = Join-Path $cwd "RLM" "progress" "pipeline-state.json"
    if (Test-Path $stateFile) {
        $state = Get-Content $stateFile -Raw | ConvertFrom-Json
        $phase = $state.current_phase
        $agent = $state.current_agent

        $context = "Active RLM pipeline at phase $phase. Current agent: $agent."
        $output = @{ systemPromptAddendum = $context } | ConvertTo-Json -Compress
        Write-Output $output
    }

    exit 0
} catch {
    # Hooks should not block the session
    exit 0
}
