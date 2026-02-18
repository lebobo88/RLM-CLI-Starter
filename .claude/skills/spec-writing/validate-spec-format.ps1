# Spec Format Validation Hook (Claude Code)
# Validates FTR-XXX/ADR-XXX naming in spec paths after Edit/Write
# Claude Code stdin JSON: { tool_name, tool_input, session_id, cwd, hook_event_name }

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $toolName = $input.tool_name

    if ($toolName -ne "Edit" -and $toolName -ne "Write") {
        exit 0
    }

    $filePath = $input.tool_input.file_path
    if (-not $filePath) { exit 0 }

    $filePath = $filePath -replace '\\', '/'

    # Only validate spec files
    if ($filePath -notlike "*/RLM/specs/*") { exit 0 }

    $cwd = if ($input.PSObject.Properties['cwd']) { $input.cwd } else { $env:CLAUDE_PROJECT_DIR }
    if (-not $cwd) { $cwd = "." }

    # Validate feature spec paths match FTR-XXX pattern
    if ($filePath -like "*/RLM/specs/features/*") {
        if ($filePath -notmatch '/features/FTR-\d{3}') {
            $logDir = Join-Path $cwd "RLM" "progress" "logs"
            if (-not (Test-Path $logDir)) {
                New-Item -ItemType Directory -Force -Path $logDir | Out-Null
            }
            $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
            $logEntry = @{
                timestamp = $now
                event = "spec.validate.warn"
                file = $filePath
                warning = "Feature spec path does not match FTR-XXX pattern"
            } | ConvertTo-Json -Compress
            Add-Content -Path (Join-Path $logDir "spec-validation.jsonl") -Value $logEntry

            # Output warning (non-blocking)
            Write-Host "WARNING: Feature spec path '$filePath' does not match expected FTR-XXX pattern" -ForegroundColor Yellow
        }
    }

    # Validate ADR paths match ADR-XXX pattern
    if ($filePath -like "*/RLM/specs/architecture/decisions/*") {
        if ($filePath -notmatch '/decisions/ADR-\d{3}') {
            $logDir = Join-Path $cwd "RLM" "progress" "logs"
            if (-not (Test-Path $logDir)) {
                New-Item -ItemType Directory -Force -Path $logDir | Out-Null
            }
            $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
            $logEntry = @{
                timestamp = $now
                event = "spec.validate.warn"
                file = $filePath
                warning = "ADR path does not match ADR-XXX pattern"
            } | ConvertTo-Json -Compress
            Add-Content -Path (Join-Path $logDir "spec-validation.jsonl") -Value $logEntry

            Write-Host "WARNING: ADR path '$filePath' does not match expected ADR-XXX pattern" -ForegroundColor Yellow
        }
    }

    exit 0
} catch {
    exit 0
}
