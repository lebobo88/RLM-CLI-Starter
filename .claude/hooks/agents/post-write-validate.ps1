# Agent-level Post-Write Validation Hook
# Source code validation for agent-written files
# Claude Code stdin JSON: { tool_name, tool_input, session_id, cwd }

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json

    if ($input.tool_name -ne "Write" -and $input.tool_name -ne "Edit") { exit 0 }

    $filePath = $input.tool_input.file_path
    if (-not $filePath) { exit 0 }

    $filePath = $filePath -replace '\\', '/'

    # Skip non-source files
    if ($filePath -notmatch '\.(ts|tsx|js|jsx)$') { exit 0 }
    if ($filePath -like "*/RLM/*") { exit 0 }

    # Emit event for observability
    $cwd = if ($input.PSObject.Properties['cwd']) { $input.cwd } else { $env:CLAUDE_PROJECT_DIR }
    if (-not $cwd) { $cwd = "." }

    $eventSender = Join-Path $PSScriptRoot ".." "lib" "event-sender.ps1"
    if (Test-Path $eventSender) {
        . $eventSender
        Send-RlmEvent -EventType "agent.file_written" -Data @{ file = $filePath } -ProjectDir $cwd
    }

    exit 0
} catch {
    exit 0
}
