# RLM Pre-Tool Safety Hook for write_file/replace (Gemini CLI)
# Blocks bulk overwrites of protected RLM artifact directories via write_file/replace tools
# Gemini CLI stdin JSON: { tool_name, arguments, session_id, cwd, hook_event_name }
# Blocking: exit code 2 with reason as JSON on stdout

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $toolName = $input.tool_name

    # Only check write_file and replace tools
    if ($toolName -ne "write_file" -and $toolName -ne "replace") {
        exit 0
    }

    # Parse file path from arguments
    $filePath = $input.arguments.file_path
    if (-not $filePath) { exit 0 }

    # Normalize path separators
    $filePath = $filePath -replace '\\', '/'

    # Block writes that target protected RLM progress tracking files with near-empty content
    if ($toolName -eq "write_file") {
        $protectedFiles = @(
            "RLM/progress/status.json",
            "RLM/progress/checkpoint.json",
            "RLM/progress/pipeline-state.json"
        )

        foreach ($protected in $protectedFiles) {
            if ($filePath -like "*/$protected" -or $filePath -like "*\$protected") {
                $newContent = $input.arguments.content
                if ($newContent -and $newContent.Length -lt 10) {
                    $response = @{ blocked = $true; reason = "Blocked: write_file with near-empty content to protected RLM progress file ($filePath). Use replace for incremental updates." }
                    $response | ConvertTo-Json -Compress | Write-Output
                    exit 2
                }
            }
        }
    }

    # Block any write_file/replace that targets a directory-level path
    $directoryPatterns = @(
        "*/RLM/specs/", "*/RLM/specs",
        "*/RLM/tasks/", "*/RLM/tasks",
        "*/RLM/progress/", "*/RLM/progress"
    )

    foreach ($pattern in $directoryPatterns) {
        if ($filePath -like $pattern) {
            $response = @{ blocked = $true; reason = "Blocked: cannot write_file/replace a directory path ($filePath). Target individual files instead." }
            $response | ConvertTo-Json -Compress | Write-Output
            exit 2
        }
    }

    # Allow by default
    exit 0
} catch {
    # Don't block on errors
    exit 0
}
