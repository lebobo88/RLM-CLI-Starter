# RLM UserPromptSubmit Hook — Inject pipeline context before every user prompt
# Claude Code stdin JSON: { session_id, cwd, hook_event_name }
# Non-blocking: outputs additionalContext

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $cwd = if ($input.PSObject.Properties['cwd']) { $input.cwd } else { $env:CLAUDE_PROJECT_DIR }

    if (-not $cwd) { $cwd = "." }

    $contextFile = Join-Path $cwd "RLM" "progress" ".current-context.md"
    if (Test-Path $contextFile) {
        $context = Get-Content $contextFile -Raw -ErrorAction SilentlyContinue
        if ($context) {
            @{
                additionalContext = $context
            } | ConvertTo-Json -Compress
        }
    }

    exit 0
} catch {
    exit 0
}
