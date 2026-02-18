# RLM Pre-Tool Safety Hook (Claude Code)
# Prevents accidental deletion of RLM spec files and enforces safety guardrails
# Claude Code stdin JSON: { tool_name, tool_input, session_id, cwd, hook_event_name }
# Blocking: exit code 2 with structured JSON on stdout

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $toolName = $input.tool_name

    # Only check Bash tool (Claude Code tool name)
    if ($toolName -ne "Bash") {
        exit 0
    }

    # Parse the command from tool_input
    $command = $input.tool_input.command
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
        # If normalization fails, block for safety
        @{
            decision = "block"
            reason = "Failed to normalize command for safety check."
            additionalContext = "The command could not be safely analyzed. Please simplify the command."
        } | ConvertTo-Json -Compress
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
                @{
                    decision = "block"
                    reason = "Destructive operation on RLM artifacts. Use individual file operations instead."
                    additionalContext = "Protected paths: RLM/specs/, RLM/tasks/. Individual file operations are allowed."
                } | ConvertTo-Json -Compress
                exit 2
            }
        }
    } catch {
        # If pattern matching fails, block for safety
        @{
            decision = "block"
            reason = "Failed to validate command safety."
            additionalContext = "Pattern matching error during safety check. Please simplify the command."
        } | ConvertTo-Json -Compress
        exit 2
    }

    # Allow with context
    @{
        decision = "allow"
        reason = "Command passed safety check"
    } | ConvertTo-Json -Compress
    exit 0
} catch {
    # JSON parse error — don't block session startup
    exit 0
}
