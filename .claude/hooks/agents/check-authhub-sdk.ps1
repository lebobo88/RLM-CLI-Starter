# Check AuthHub SDK Prerequisites (Claude Code)
# Verifies Node.js and AuthHub SDK are available before gemini-image sub-agent use
# Claude Code stdin JSON: { tool_name, tool_input, session_id, cwd, hook_event_name }

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json

    # Only check for Bash commands referencing authhub or the SDK path
    if ($input.tool_name -ne "Bash") { exit 0 }

    $command = $input.tool_input.command
    if (-not $command) { exit 0 }
    if ($command -notmatch 'authhub|AuthHubClient|sdk-typescript') { exit 0 }

    # Check Node.js is installed
    $nodePath = Get-Command "node" -ErrorAction SilentlyContinue
    if (-not $nodePath) {
        $result = @{
            decision = "block"
            reason   = "Node.js is not installed or not in PATH. Install from: https://nodejs.org — required for AuthHub SDK image generation."
        } | ConvertTo-Json -Compress
        Write-Output $result
        exit 2
    }

    # Check AuthHub SDK dist file exists
    $sdkPath = ".\packages\authhub-sdk\dist\index.cjs"
    if (-not (Test-Path $sdkPath)) {
        $result = @{
            decision = "block"
            reason   = "AuthHub SDK not found at: $sdkPath — Run 'npm install && npm run build' in packages/authhub-sdk/ to build the SDK."
        } | ConvertTo-Json -Compress
        Write-Output $result
        exit 2
    }

    exit 0
} catch {
    exit 0
}
