# State Health Monitor for RLM Progress Files
# Checks integrity, freshness, and cross-file consistency
# Called during session-start hook for passive health checking

function Test-StateHealth {
    param(
        [Parameter(Mandatory)][string]$ProjectDir
    )

    $progressDir = Join-Path $ProjectDir "RLM" "progress"
    $issues = @()
    $status = "HEALTHY"

    $stateFiles = @(
        @{ name = "checkpoint.json"; path = Join-Path $progressDir "checkpoint.json" },
        @{ name = "pipeline-state.json"; path = Join-Path $progressDir "pipeline-state.json" },
        @{ name = "status.json"; path = Join-Path $progressDir "status.json" }
    )

    # Load schema validators
    $schemaLib = Join-Path $PSScriptRoot "schema-validators.ps1"
    $hasSchemaLib = Test-Path $schemaLib
    if ($hasSchemaLib) { . $schemaLib }

    foreach ($sf in $stateFiles) {
        if (-not (Test-Path $sf.path)) { continue }

        # 1. JSON validity
        $content = Get-Content $sf.path -Raw -ErrorAction SilentlyContinue
        if (-not $content) {
            $issues += "EMPTY: $($sf.name) exists but is empty"
            continue
        }

        try {
            $null = $content | ConvertFrom-Json
        } catch {
            $issues += "CORRUPT: $($sf.name) contains invalid JSON"
            continue
        }

        # 2. Schema compliance
        if ($hasSchemaLib) {
            $validator = Get-SchemaValidator -FilePath $sf.path
            if ($validator) {
                $schemaError = & $validator $content
                if ($schemaError) {
                    $issues += "SCHEMA: $($sf.name) — $schemaError"
                }
            }
        }

        # 3. Timestamp freshness (warn if > 24h old with active pipeline)
        $lastWrite = (Get-Item $sf.path).LastWriteTime
        $age = (Get-Date) - $lastWrite
        if ($age.TotalHours -gt 24) {
            $pipelineState = Join-Path $progressDir "pipeline-state.json"
            if ((Test-Path $pipelineState) -and $sf.name -ne "pipeline-state.json") {
                $issues += "STALE: $($sf.name) last modified $([math]::Round($age.TotalHours, 1))h ago"
            }
        }
    }

    # 4. Cross-file consistency
    $checkpointPath = Join-Path $progressDir "checkpoint.json"
    $statusPath = Join-Path $progressDir "status.json"

    if ((Test-Path $checkpointPath) -and (Test-Path $statusPath)) {
        try {
            $checkpoint = Get-Content $checkpointPath -Raw | ConvertFrom-Json
            $statusObj = Get-Content $statusPath -Raw | ConvertFrom-Json

            # Check if checkpoint references tasks that status doesn't know about
            if ($checkpoint.PSObject.Properties['lastTaskId'] -and $statusObj.PSObject.Properties['currentTask']) {
                # Basic consistency — no detailed cross-validation for now
            }
        } catch {
            # Skip cross-file checks if parsing fails
        }
    }

    # Determine overall status
    if ($issues.Count -ge 3) {
        $status = "CRITICAL"
    } elseif ($issues.Count -ge 1) {
        $status = "DEGRADED"
    }

    return @{
        status = $status
        issues = $issues
        checkedAt = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
    }
}

function Restore-StateFromBackup {
    param(
        [Parameter(Mandatory)][string]$FilePath
    )

    $bakPaths = @(
        "$FilePath.bak",
        "$FilePath.bak.2",
        "$FilePath.bak.3"
    )

    foreach ($bakPath in $bakPaths) {
        if (Test-Path $bakPath) {
            $content = Get-Content $bakPath -Raw -ErrorAction SilentlyContinue
            if ($content) {
                try {
                    $null = $content | ConvertFrom-Json
                    # Valid backup found — restore
                    Copy-Item -Path $bakPath -Destination $FilePath -Force

                    # Log restoration
                    $logDir = Split-Path $FilePath -Parent | Split-Path -Parent
                    $logDir = Join-Path (Split-Path $logDir -Parent) "RLM" "progress" "logs"
                    if (Test-Path $logDir) {
                        $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
                        $logEntry = @{
                            timestamp = $now
                            event = "state.restore"
                            file = $FilePath
                            backup = $bakPath
                        } | ConvertTo-Json -Compress
                        Add-Content -Path (Join-Path $logDir "state-verification.jsonl") -Value $logEntry
                    }

                    return @{ success = $true; backup = $bakPath }
                } catch {
                    continue  # Try next backup
                }
            }
        }
    }

    return @{ success = $false; error = "No valid backups found" }
}
