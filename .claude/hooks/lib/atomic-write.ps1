# Atomic Write Library for RLM State Files
# Writes via temp file + validate + rename to prevent corruption from crashes/interrupts

function Write-AtomicJson {
    param(
        [Parameter(Mandatory)][string]$FilePath,
        [Parameter(Mandatory)]$Data,
        [scriptblock]$Validator = $null
    )

    $result = @{ success = $false; error = $null }

    # Integrate file locking to prevent race conditions
    $lockLib = Join-Path $PSScriptRoot "file-locking.ps1"
    $lockToken = $null
    if (Test-Path $lockLib) {
        . $lockLib
        $lockToken = Lock-File -Path $FilePath -TimeoutSeconds 10
        if (-not $lockToken) {
            $result.error = "Could not acquire file lock on $FilePath"
            return $result
        }
    }

    try {
        # Convert to JSON
        $jsonContent = $Data | ConvertTo-Json -Depth 10 -Compress

        # Validate JSON roundtrips correctly
        try {
            $null = $jsonContent | ConvertFrom-Json
        } catch {
            $result.error = "JSON validation failed: $_"
            return $result
        }

        # Run custom validator if provided
        if ($Validator) {
            $validationError = & $Validator $jsonContent
            if ($validationError) {
                $result.error = "Schema validation failed: $validationError"
                return $result
            }
        }

        # Create backup of existing file
        if (Test-Path $FilePath) {
            $bakPath = "$FilePath.bak"
            Copy-Item -Path $FilePath -Destination $bakPath -Force

            # Rotate backups: keep last 3
            $bakDir = Split-Path $FilePath -Parent
            $bakName = (Split-Path $FilePath -Leaf) + ".bak"
            $bak2 = Join-Path $bakDir "$bakName.2"
            $bak3 = Join-Path $bakDir "$bakName.3"

            if (Test-Path $bak2) {
                if (Test-Path $bak3) { Remove-Item $bak3 -Force }
                Move-Item $bak2 $bak3 -Force
            }
            if (Test-Path $bakPath) {
                Copy-Item $bakPath $bak2 -Force
            }
        }

        # Write to temp file first
        $tempPath = "$FilePath.tmp"
        $jsonContent | Set-Content -Path $tempPath -NoNewline

        # Verify temp file is valid JSON
        try {
            $null = Get-Content $tempPath -Raw | ConvertFrom-Json
        } catch {
            Remove-Item $tempPath -Force -ErrorAction SilentlyContinue
            $result.error = "Temp file JSON verification failed: $_"
            return $result
        }

        # Atomic rename (Move-Item -Force is atomic on same filesystem)
        Move-Item -Path $tempPath -Destination $FilePath -Force

        if ($lockToken) { Unlock-File -LockToken $lockToken; $lockToken = $null }

        $result.success = $true
        return $result
    } catch {
        # Clean up temp file on error
        $tempPath = "$FilePath.tmp"
        if (Test-Path $tempPath) {
            Remove-Item $tempPath -Force -ErrorAction SilentlyContinue
        }
        if ($lockToken) { Unlock-File -LockToken $lockToken }
        $result.error = "Atomic write failed: $_"
        return $result
    }
}

function Write-AtomicFile {
    param(
        [Parameter(Mandatory)][string]$FilePath,
        [Parameter(Mandatory)][string]$Content
    )

    $result = @{ success = $false; error = $null }

    try {
        $tempPath = "$FilePath.tmp"
        $Content | Set-Content -Path $tempPath -NoNewline
        Move-Item -Path $tempPath -Destination $FilePath -Force
        $result.success = $true
        return $result
    } catch {
        $tempPath = "$FilePath.tmp"
        if (Test-Path $tempPath) {
            Remove-Item $tempPath -Force -ErrorAction SilentlyContinue
        }
        $result.error = "Atomic file write failed: $_"
        return $result
    }
}
