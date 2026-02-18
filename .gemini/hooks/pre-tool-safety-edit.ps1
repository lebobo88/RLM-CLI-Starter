# RLM Pre-Tool Safety Hook for write_file/replace (Gemini CLI)
# Validates structure of protected RLM progress files and blocks directory-level paths
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

    # --- Validate protected progress files via required field checks ---
    if ($toolName -eq "write_file") {
        $protectedFiles = @(
            @{ path = "RLM/progress/status.json"; fields = @('status') },
            @{ path = "RLM/progress/checkpoint.json"; fields = @('lastSession') },
            @{ path = "RLM/progress/pipeline-state.json"; fields = @('current_phase') }
        )

        foreach ($protected in $protectedFiles) {
            if ($filePath -like "*/$($protected.path)" -or $filePath -like "*\$($protected.path)") {
                $newContent = $input.arguments.content
                if (-not $newContent) { continue }

                # Block near-empty content (< 10 chars)
                if ($newContent.Length -lt 10) {
                    $response = @{ blocked = $true; reason = "Blocked: write_file with near-empty content to protected RLM progress file ($filePath). Use replace for incremental updates." }
                    $response | ConvertTo-Json -Compress | Write-Output
                    exit 2
                }

                # Validate JSON structure — required fields must exist
                try {
                    $json = $newContent | ConvertFrom-Json
                    foreach ($field in $protected.fields) {
                        if (-not $json.PSObject.Properties[$field]) {
                            $response = @{ blocked = $true; reason = "Blocked: write_file to $filePath missing required field '$field'. Destructive payload rejected." }
                            $response | ConvertTo-Json -Compress | Write-Output
                            exit 2
                        }
                    }

                    # Extra check for status.json: block empty arrays
                    if ($filePath -like "*/status.json") {
                        foreach ($arrayField in @('tasks', 'completedTasks')) {
                            $prop = $json.PSObject.Properties[$arrayField]
                            if ($prop -and $prop.Value -is [System.Array] -and $prop.Value.Count -eq 0) {
                                $response = @{ blocked = $true; reason = "Blocked: write_file to $filePath has empty array '$arrayField'. This looks like a destructive payload." }
                                $response | ConvertTo-Json -Compress | Write-Output
                                exit 2
                            }
                        }
                    }
                } catch {
                    $response = @{ blocked = $true; reason = "Blocked: write_file to $filePath contains invalid JSON." }
                    $response | ConvertTo-Json -Compress | Write-Output
                    exit 2
                }
            }
        }
    }

    # --- Block any write_file/replace that targets a directory-level path ---
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
    # JSON parse error on stdin — don't block session
    exit 0
}
