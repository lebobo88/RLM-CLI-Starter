# RLM Pre-Tool Safety Hook (Copilot CLI)
# Prevents accidental deletion of RLM spec files and enforces safety guardrails

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $toolName = $input.toolName

    # Only check shell/bash commands
    if ($toolName -ne "bash" -and $toolName -ne "shell" -and $toolName -ne "powershell") {
        exit 0
    }

    # Parse the command from toolArgs
    $argsObj = $toolArgs = $input.toolArgs | ConvertFrom-Json
    $command = $argsObj.command
    if (-not $command) {
        $output = @{ permissionDecision = "allow" }
        $output | ConvertTo-Json -Compress
        exit 0
    }

    # --- Normalize to close bypass vectors ---
    try {
        $normalized = $command `
            -replace '\\', '/' `
            -replace '\s+', ' ' `
            -replace '"', '' `
            -replace "'", ''
        $normalized = $normalized.Trim()
    } catch {
        $output = @{
            permissionDecision = "deny"
            permissionDecisionReason = "Blocked: failed to normalize command for safety check."
        }
        $output | ConvertTo-Json -Compress
        exit 0
    }

    # --- Case-insensitive destructive pattern matching ---
    try {
        $dangerousPatterns = @(
            'rm\s+-r[f]?\s+.*RLM/(specs|tasks)',
            'rm\s+-f?r\s+.*RLM/(specs|tasks)',
            'Remove-Item.*RLM/(specs|tasks).*-Recurse',
            'Remove-Item.*-Recurse.*RLM/(specs|tasks)',
            'del\s+/s.*RLM/(specs|tasks)',
            'rmdir\s+/s.*RLM/(specs|tasks)',
            'rd\s+/s.*RLM/(specs|tasks)'
        )

        foreach ($pattern in $dangerousPatterns) {
            if ($normalized -imatch $pattern) {
                $output = @{
                    permissionDecision = "deny"
                    permissionDecisionReason = "Blocked: destructive operation on RLM artifacts. Use individual file operations instead."
                }
                $output | ConvertTo-Json -Compress
                exit 0
            }
        }
    } catch {
        $output = @{
            permissionDecision = "deny"
            permissionDecisionReason = "Blocked: failed to validate command safety."
        }
        $output | ConvertTo-Json -Compress
        exit 0
    }

    # Allow by default — explicit permission decision
    $output = @{ permissionDecision = "allow" }
    $output | ConvertTo-Json -Compress
    exit 0
} catch {
    # Don't block on errors
    exit 0
}
