# Code Writer Pre-Write Hook (Claude Code)
# Blocks writes to test files — code-writer should only write implementation
# Claude Code stdin JSON: { tool_name, tool_input, session_id, cwd, hook_event_name }

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json

    if ($input.tool_name -ne "Write" -and $input.tool_name -ne "Edit") { exit 0 }

    $filePath = $input.tool_input.file_path
    if (-not $filePath) { exit 0 }

    $filePath = $filePath -replace '\\', '/'

    # Block writes to test files
    if ($filePath -match '\.(test|spec)\.(ts|tsx|js|jsx)$') {
        $result = @{
            decision = "block"
            reason = "Code writer agent cannot write to test files. Test files should only be written by the test-writer agent."
        } | ConvertTo-Json -Compress
        Write-Output $result
        exit 2
    }

    exit 0
} catch {
    exit 0
}
