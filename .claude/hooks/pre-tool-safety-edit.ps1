# RLM Pre-Tool Safety Hook for Edit/Write (Claude Code)
# Validates structure of protected RLM progress files and blocks directory-level paths
# Claude Code stdin JSON: { tool_name, tool_input, session_id, cwd, hook_event_name }
# Blocking: exit code 2 with structured JSON on stdout

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

    # --- Validate protected progress files via required field checks ---
    if ($toolName -eq "Write") {
        $protectedFiles = @(
            @{ path = "RLM/progress/status.json"; fields = @('status') },
            @{ path = "RLM/progress/checkpoint.json"; fields = @('lastSession') },
            @{ path = "RLM/progress/pipeline-state.json"; fields = @('current_phase') }
        )

        foreach ($protected in $protectedFiles) {
            if ($filePath -like "*/$($protected.path)" -or $filePath -like "*\$($protected.path)") {
                $newContent = $input.tool_input.content
                if (-not $newContent) { continue }

                # Block near-empty content (< 10 chars)
                if ($newContent.Length -lt 10) {
                    @{
                        decision = "block"
                        reason = "Write with near-empty content to protected RLM progress file ($filePath). Use Edit for incremental updates."
                        additionalContext = "Protected progress files require meaningful content. Use Edit tool for incremental updates instead of Write with minimal content."
                    } | ConvertTo-Json -Compress
                    exit 2
                }

                # Validate JSON structure — required fields must exist
                try {
                    $json = $newContent | ConvertFrom-Json
                    foreach ($field in $protected.fields) {
                        if (-not $json.PSObject.Properties[$field]) {
                            @{
                                decision = "block"
                                reason = "Write to $filePath missing required field '$field'. Destructive payload rejected."
                                additionalContext = "Protected file requires field '$field'. Ensure the JSON payload includes all required fields."
                            } | ConvertTo-Json -Compress
                            exit 2
                        }
                    }

                    # Extra check: arrays should not be empty if they existed before
                    # (prevents {"tasks":[]} style wipes)
                    if ($filePath -like "*/status.json") {
                        foreach ($arrayField in @('tasks', 'completedTasks')) {
                            $prop = $json.PSObject.Properties[$arrayField]
                            if ($prop -and $prop.Value -is [System.Array] -and $prop.Value.Count -eq 0) {
                                # Only block if the field exists but is empty — likely a wipe
                                @{
                                    decision = "block"
                                    reason = "Write to $filePath has empty array '$arrayField'. This looks like a destructive payload."
                                    additionalContext = "Array field '$arrayField' in status.json must not be empty. Use Edit for incremental updates."
                                } | ConvertTo-Json -Compress
                                exit 2
                            }
                        }
                    }
                } catch {
                    # If content isn't valid JSON, block it for progress files
                    @{
                        decision = "block"
                        reason = "Write to $filePath contains invalid JSON."
                        additionalContext = "Protected progress files must contain valid JSON. Verify the content before writing."
                    } | ConvertTo-Json -Compress
                    exit 2
                }
            }
        }
    }

    # --- Block any Edit/Write that targets a directory-level path ---
    $directoryPatterns = @(
        "*/RLM/specs/", "*/RLM/specs",
        "*/RLM/tasks/", "*/RLM/tasks",
        "*/RLM/progress/", "*/RLM/progress"
    )

    foreach ($pattern in $directoryPatterns) {
        if ($filePath -like $pattern) {
            @{
                decision = "block"
                reason = "Cannot Edit/Write a directory path ($filePath). Target individual files instead."
                additionalContext = "Edit and Write tools must target individual files, not directory paths."
            } | ConvertTo-Json -Compress
            exit 2
        }
    }

    # Allow with context
    @{
        decision = "allow"
        reason = "Edit/Write passed safety check"
    } | ConvertTo-Json -Compress
    exit 0
} catch {
    # JSON parse error on stdin — don't block session
    exit 0
}
