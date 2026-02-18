# RLM Pre-Tool Safety Hook (Gemini CLI)
# Prevents accidental deletion of RLM spec files and enforces safety guardrails
# Gemini CLI stdin JSON: { tool_name, arguments, session_id, cwd, hook_event_name }
# Blocking: exit code 2 with reason as JSON on stdout

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $toolName = $input.tool_name

    # Only check run_shell_command tool (Gemini CLI tool name)
    if ($toolName -ne "run_shell_command") {
        exit 0
    }

    # Parse the command from arguments
    $command = $input.arguments.command
    if (-not $command) { exit 0 }

    # --- Normalize to close bypass vectors ---
    try {
        $normalized = $command `
            -replace '\\', '/' `
            -replace '\s+', ' ' `
            -replace '"', '' `
            -replace "'", ''
        $normalized = $normalized.Trim()
    } catch {
        $response = @{ blocked = $true; reason = "Blocked: failed to normalize command for safety check." }
        $response | ConvertTo-Json -Compress | Write-Output
        exit 2
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
                $response = @{ blocked = $true; reason = "Blocked: destructive operation on RLM artifacts. Use individual file operations instead." }
                $response | ConvertTo-Json -Compress | Write-Output
                exit 2
            }
        }
    } catch {
        $response = @{ blocked = $true; reason = "Blocked: failed to validate command safety." }
        $response | ConvertTo-Json -Compress | Write-Output
        exit 2
    }

    # Allow by default
    exit 0
} catch {
    # JSON parse error — don't block session startup
    exit 0
}
