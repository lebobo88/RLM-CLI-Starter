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
            # Gemini CLI: block via JSON on stdout
            $response = @{ blocked = $true; reason = "Blocked: destructive operation on RLM artifacts. Use individual file operations instead." }
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
