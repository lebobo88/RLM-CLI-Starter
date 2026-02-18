# File Locking Library for RLM Progress Files
# Provides file-based mutex with timeout to prevent concurrent write corruption

function Lock-File {
    param(
        [Parameter(Mandatory)][string]$Path,
        [int]$TimeoutSeconds = 10
    )

    $lockFile = "$Path.lock"
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

    while ((Get-Date) -lt $deadline) {
        try {
            # Attempt to create lock file exclusively
            $stream = [System.IO.File]::Open(
                $lockFile,
                [System.IO.FileMode]::CreateNew,
                [System.IO.FileAccess]::Write,
                [System.IO.FileShare]::None
            )
            # Write PID and timestamp for debugging stale locks
            $writer = New-Object System.IO.StreamWriter($stream)
            $writer.Write("$PID|$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')")
            $writer.Close()
            $stream.Close()
            return $lockFile
        } catch [System.IO.IOException] {
            # Lock file exists — check if stale (> 60 seconds old)
            if (Test-Path $lockFile) {
                $lockAge = (Get-Date) - (Get-Item $lockFile).LastWriteTime
                if ($lockAge.TotalSeconds -gt 60) {
                    # Stale lock — force remove and retry
                    Remove-Item -Path $lockFile -Force -ErrorAction SilentlyContinue
                    continue
                }
            }
            Start-Sleep -Milliseconds 100
        }
    }

    # Timeout — return $null to indicate failure
    return $null
}

function Unlock-File {
    param(
        [Parameter(Mandatory)][string]$LockToken
    )

    if ($LockToken -and (Test-Path $LockToken)) {
        Remove-Item -Path $LockToken -Force -ErrorAction SilentlyContinue
    }
}
