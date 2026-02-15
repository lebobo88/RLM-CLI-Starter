# RLM Pre-Tool Safety Hook (Claude Code)
# Prevents accidental deletion of RLM spec files and enforces safety guardrails
# Claude Code stdin JSON: { tool_name, tool_input, session_id, cwd, hook_event_name }
# Blocking: exit code 2 with reason on stderr

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

    # Block destructive operations on RLM specs
    $dangerousPatterns = @(
        "rm -rf RLM/specs",
        "rm -rf RLM/tasks",
        "rm -rf ./RLM/specs",
        "rm -rf ./RLM/tasks",
        "Remove-Item.*RLM.specs.*-Recurse",
        "Remove-Item.*RLM.tasks.*-Recurse",
        "del /s.*RLM\\specs",
        "del /s.*RLM\\tasks"
    )

    foreach ($pattern in $dangerousPatterns) {
        if ($command -match $pattern) {
            [Console]::Error.WriteLine("Blocked: destructive operation on RLM artifacts. Use individual file operations instead.")
            exit 2
        }
    }

    # Allow by default
    exit 0
} catch {
    # Don't block on errors
    exit 0
}
