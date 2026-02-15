# RLM Pre-Tool Safety Hook
# Prevents accidental deletion of RLM spec files and enforces safety guardrails

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $toolName = $input.toolName
    $toolArgs = $input.toolArgs

    # Only check shell/bash commands
    if ($toolName -ne "bash" -and $toolName -ne "shell" -and $toolName -ne "powershell") {
        exit 0
    }

    # Parse the command from toolArgs
    $argsObj = $toolArgs | ConvertFrom-Json
    $command = $argsObj.command

    # Block destructive operations on RLM specs
    $dangerousPatterns = @(
        "rm -rf RLM/specs",
        "rm -rf RLM/tasks",
        "Remove-Item.*RLM.specs.*-Recurse",
        "Remove-Item.*RLM.tasks.*-Recurse",
        "del /s.*RLM\\specs",
        "del /s.*RLM\\tasks"
    )

    foreach ($pattern in $dangerousPatterns) {
        if ($command -match $pattern) {
            $output = @{
                permissionDecision = "deny"
                permissionDecisionReason = "Blocked: destructive operation on RLM artifacts. Use individual file operations instead."
            }
            $output | ConvertTo-Json -Compress
            exit 0
        }
    }

    # Allow by default — explicit permission decision
    $output = @{
        permissionDecision = "allow"
    }
    $output | ConvertTo-Json -Compress
    exit 0
} catch {
    # Don't block on errors
    exit 0
}
