# Post-State-Write Verification Hook (Claude Code)
# Re-reads and validates state files after writes
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

    # Only verify RLM progress JSON files
    $progressFiles = @(
        "RLM/progress/status.json",
        "RLM/progress/checkpoint.json",
        "RLM/progress/pipeline-state.json"
    )

    $isProgressFile = $false
    foreach ($pf in $progressFiles) {
        if ($filePath -like "*/$pf") {
            $isProgressFile = $true
            break
        }
    }

    if (-not $isProgressFile) { exit 0 }

    # Load schema validators
    $schemaLib = Join-Path $PSScriptRoot "lib" "schema-validators.ps1"
    if (-not (Test-Path $schemaLib)) { exit 0 }
    . $schemaLib

    # Re-read and validate the file
    $absPath = if ([System.IO.Path]::IsPathRooted($filePath)) { $filePath } else { Join-Path $input.cwd $filePath }

    if (-not (Test-Path $absPath)) { exit 0 }

    $content = Get-Content $absPath -Raw

    # Verify JSON is valid
    try {
        $null = $content | ConvertFrom-Json
    } catch {
        # Log verification failure
        $logDir = Join-Path $input.cwd "RLM" "progress" "logs"
        if (Test-Path $logDir) {
            $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
            $logEntry = @{
                timestamp = $now
                event = "state.verify.fail"
                file = $filePath
                error = "Invalid JSON after write"
            } | ConvertTo-Json -Compress
            Add-Content -Path (Join-Path $logDir "state-verification.jsonl") -Value $logEntry
        }
        exit 0  # Don't block — just log
    }

    # Run schema validation
    $validator = Get-SchemaValidator -FilePath $filePath
    if ($validator) {
        $error = & $validator $content
        if ($error) {
            $logDir = Join-Path $input.cwd "RLM" "progress" "logs"
            if (Test-Path $logDir) {
                $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
                $logEntry = @{
                    timestamp = $now
                    event = "state.verify.fail"
                    file = $filePath
                    error = $error
                } | ConvertTo-Json -Compress
                Add-Content -Path (Join-Path $logDir "state-verification.jsonl") -Value $logEntry
            }
        }
    }

    exit 0
} catch {
    exit 0
}
