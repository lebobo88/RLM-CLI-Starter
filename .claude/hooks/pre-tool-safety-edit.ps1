# RLM Pre-Tool Safety Hook for Edit/Write (Claude Code)
# Blocks bulk overwrites of protected RLM artifact directories via Edit/Write tools
# Claude Code stdin JSON: { tool_name, tool_input, session_id, cwd, hook_event_name }
# Blocking: exit code 2 with reason on stderr

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $toolName = $input.tool_name

    # Only check Edit and Write tools
    if ($toolName -ne "Edit" -and $toolName -ne "Write") {
        exit 0
    }

    # Parse file path from tool_input
    $filePath = $input.tool_input.file_path
    if (-not $filePath) { exit 0 }

    # Normalize path separators
    $filePath = $filePath -replace '\\', '/'

    # Block writes that target protected RLM progress tracking files with near-empty content
    if ($toolName -eq "Write") {
        $protectedFiles = @(
            "RLM/progress/status.json",
            "RLM/progress/checkpoint.json",
            "RLM/progress/pipeline-state.json"
        )

        foreach ($protected in $protectedFiles) {
            if ($filePath -like "*/$protected" -or $filePath -like "*\$protected") {
                $newContent = $input.tool_input.content
                if ($newContent -and $newContent.Length -lt 10) {
                    [Console]::Error.WriteLine("Blocked: Write with near-empty content to protected RLM progress file ($filePath). Use Edit for incremental updates.")
                    exit 2
                }
            }
        }
    }

    # Block any Edit/Write that targets a directory-level path
    $directoryPatterns = @(
        "*/RLM/specs/", "*/RLM/specs",
        "*/RLM/tasks/", "*/RLM/tasks",
        "*/RLM/progress/", "*/RLM/progress"
    )

    foreach ($pattern in $directoryPatterns) {
        if ($filePath -like $pattern) {
            [Console]::Error.WriteLine("Blocked: cannot Edit/Write a directory path ($filePath). Target individual files instead.")
            exit 2
        }
    }

    # Allow by default
    exit 0
} catch {
    # Don't block on errors
    exit 0
}
