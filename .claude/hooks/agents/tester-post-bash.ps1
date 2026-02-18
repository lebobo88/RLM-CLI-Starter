# Tester Post-Bash Hook (Claude Code)
# Captures test results from Bash commands to logs
# Claude Code stdin JSON: { tool_name, tool_input, session_id, cwd, hook_event_name }

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json

    if ($input.tool_name -ne "Bash") { exit 0 }

    $command = $input.tool_input.command
    if (-not $command) { exit 0 }

    # Only log test-related commands
    $isTestCommand = $false
    if ($command -match '\bnpm\s+test\b') { $isTestCommand = $true }
    if ($command -match '\bnpx\s+(vitest|jest)\b') { $isTestCommand = $true }
    if ($command -match '\btest\b.*--coverage') { $isTestCommand = $true }

    if (-not $isTestCommand) { exit 0 }

    $cwd = if ($input.PSObject.Properties['cwd']) { $input.cwd } else { $env:CLAUDE_PROJECT_DIR }
    $sessionId = if ($input.PSObject.Properties['session_id']) { $input.session_id } else { "" }

    if (-not $cwd) { $cwd = "." }

    $logDir = Join-Path $cwd "RLM" "progress" "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    }

    $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'

    # Parse test runner output for pass/fail counts and coverage
    $testResults = @{
        passed = $null
        failed = $null
        skipped = $null
        total = $null
        coverage = $null
        runner = "unknown"
    }

    $toolResult = if ($input.PSObject.Properties['tool_result']) { $input.tool_result } else { "" }

    if ($toolResult) {
        # Detect test runner
        if ($toolResult -match 'vitest|VITEST') { $testResults.runner = "vitest" }
        elseif ($toolResult -match 'jest|JEST') { $testResults.runner = "jest" }

        # Parse vitest/jest summary: "Tests:  X passed, Y failed, Z total"
        if ($toolResult -match 'Tests:\s+(\d+)\s+passed') { $testResults.passed = [int]$Matches[1] }
        if ($toolResult -match 'Tests:\s+.*?(\d+)\s+failed') { $testResults.failed = [int]$Matches[1] }
        if ($toolResult -match 'Tests:\s+.*?(\d+)\s+skipped') { $testResults.skipped = [int]$Matches[1] }
        if ($toolResult -match 'Tests:\s+.*?(\d+)\s+total') { $testResults.total = [int]$Matches[1] }

        # Alternative vitest format: "x passed | y failed | z of w"
        if ($null -eq $testResults.passed -and $toolResult -match '(\d+)\s+passed') { $testResults.passed = [int]$Matches[1] }
        if ($null -eq $testResults.failed -and $toolResult -match '(\d+)\s+failed') { $testResults.failed = [int]$Matches[1] }

        # Parse coverage percentage: "All files  |  XX.XX |" or "Stmts   : XX.XX%"
        if ($toolResult -match 'All files\s*\|\s*([\d.]+)') { $testResults.coverage = $Matches[1] }
        elseif ($toolResult -match 'Stmts\s*:\s*([\d.]+)%') { $testResults.coverage = $Matches[1] }
        elseif ($toolResult -match 'Statements\s*:\s*([\d.]+)%') { $testResults.coverage = $Matches[1] }
    }

    $logEntry = @{
        timestamp = $now
        event = "test.execution"
        command = $command
        sessionId = $sessionId
        agentId = "tester"
        results = $testResults
    } | ConvertTo-Json -Compress
    Add-Content -Path (Join-Path $logDir "test-executions.jsonl") -Value $logEntry

    exit 0
} catch {
    exit 0
}
