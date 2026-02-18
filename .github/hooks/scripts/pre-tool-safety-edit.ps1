# RLM Pre-Tool Safety Hook for Edit/Write tools (Copilot CLI)
# Validates structure of protected RLM progress files and blocks directory-level paths
# Copilot CLI stdin JSON: { toolName, toolArgs, ... }
# Output: JSON with permissionDecision

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $toolName = $input.toolName

    # Only check edit/write type tools
    if ($toolName -ne "editFile" -and $toolName -ne "writeFile" -and $toolName -ne "insertEdit") {
        exit 0
    }

    # Parse toolArgs
    $argsObj = $input.toolArgs | ConvertFrom-Json
    $filePath = $argsObj.filePath
    if (-not $filePath) { $filePath = $argsObj.file_path }
    if (-not $filePath) { exit 0 }

    # Normalize path separators
    $filePath = $filePath -replace '\\', '/'

    # --- Validate protected progress files ---
    if ($toolName -eq "writeFile") {
        $protectedFiles = @(
            @{ path = "RLM/progress/status.json"; fields = @('status') },
            @{ path = "RLM/progress/checkpoint.json"; fields = @('lastSession') },
            @{ path = "RLM/progress/pipeline-state.json"; fields = @('current_phase') }
        )

        foreach ($protected in $protectedFiles) {
            if ($filePath -like "*/$($protected.path)" -or $filePath -like "*\$($protected.path)") {
                $newContent = $argsObj.content
                if (-not $newContent) { continue }

                if ($newContent.Length -lt 10) {
                    $output = @{
                        permissionDecision = "deny"
                        permissionDecisionReason = "Blocked: writeFile with near-empty content to protected RLM progress file ($filePath)."
                    }
                    $output | ConvertTo-Json -Compress
                    exit 0
                }

                try {
                    $json = $newContent | ConvertFrom-Json
                    foreach ($field in $protected.fields) {
                        if (-not $json.PSObject.Properties[$field]) {
                            $output = @{
                                permissionDecision = "deny"
                                permissionDecisionReason = "Blocked: writeFile to $filePath missing required field '$field'. Destructive payload rejected."
                            }
                            $output | ConvertTo-Json -Compress
                            exit 0
                        }
                    }

                    if ($filePath -like "*/status.json") {
                        foreach ($arrayField in @('tasks', 'completedTasks')) {
                            $prop = $json.PSObject.Properties[$arrayField]
                            if ($prop -and $prop.Value -is [System.Array] -and $prop.Value.Count -eq 0) {
                                $output = @{
                                    permissionDecision = "deny"
                                    permissionDecisionReason = "Blocked: writeFile to $filePath has empty array '$arrayField'. This looks like a destructive payload."
                                }
                                $output | ConvertTo-Json -Compress
                                exit 0
                            }
                        }
                    }
                } catch {
                    $output = @{
                        permissionDecision = "deny"
                        permissionDecisionReason = "Blocked: writeFile to $filePath contains invalid JSON."
                    }
                    $output | ConvertTo-Json -Compress
                    exit 0
                }
            }
        }
    }

    # --- Block directory-level paths ---
    $directoryPatterns = @(
        "*/RLM/specs/", "*/RLM/specs",
        "*/RLM/tasks/", "*/RLM/tasks",
        "*/RLM/progress/", "*/RLM/progress"
    )

    foreach ($pattern in $directoryPatterns) {
        if ($filePath -like $pattern) {
            $output = @{
                permissionDecision = "deny"
                permissionDecisionReason = "Blocked: cannot edit/write a directory path ($filePath). Target individual files instead."
            }
            $output | ConvertTo-Json -Compress
            exit 0
        }
    }

    # Allow by default
    $output = @{ permissionDecision = "allow" }
    $output | ConvertTo-Json -Compress
    exit 0
} catch {
    exit 0
}
