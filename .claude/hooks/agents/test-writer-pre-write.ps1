# Test Writer Pre-Write Hook (Claude Code)
# Blocks writes to implementation files — test-writer should only write test files
# Claude Code stdin JSON: { tool_name, tool_input, session_id, cwd, hook_event_name }

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json

    if ($input.tool_name -ne "Write" -and $input.tool_name -ne "Edit") { exit 0 }

    $filePath = $input.tool_input.file_path
    if (-not $filePath) { exit 0 }

    $filePath = $filePath -replace '\\', '/'

    # Allow test files, config files, and non-source files
    if ($filePath -match '\.(test|spec)\.(ts|tsx|js|jsx)$') { exit 0 }
    if ($filePath -match '\.(json|md|yaml|yml|toml|cfg|ini)$') { exit 0 }
    if ($filePath -like "*/RLM/*") { exit 0 }

    # Block writes to implementation source files
    if ($filePath -match '\.(ts|tsx|js|jsx)$') {
        $result = @{
            decision = "block"
            reason = "Test writer agent cannot write to implementation files. Implementation files should only be written by the code-writer agent."
        } | ConvertTo-Json -Compress
        Write-Output $result
        exit 2
    }

    exit 0
} catch {
    exit 0
}
