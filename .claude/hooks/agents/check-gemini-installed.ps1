# Check Gemini CLI Installed (Claude Code)
# Verifies gemini CLI exists before use by gemini-analyzer sub-agent
# Claude Code stdin JSON: { tool_name, tool_input, session_id, cwd, hook_event_name }

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json

    # Only check for Bash commands that reference gemini
    if ($input.tool_name -ne "Bash") { exit 0 }

    $command = $input.tool_input.command
    if (-not $command) { exit 0 }
    if ($command -notmatch '\bgemini\b') { exit 0 }

    # Check if gemini is available
    $geminiPath = Get-Command "gemini" -ErrorAction SilentlyContinue
    if (-not $geminiPath) {
        $result = @{
            decision = "block"
            reason = "Gemini CLI is not installed or not in PATH. Install with: npm install -g @anthropic-ai/gemini-cli"
        } | ConvertTo-Json -Compress
        Write-Output $result
        exit 2
    }

    exit 0
} catch {
    exit 0
}
