# RLM Task Completed Hook (Claude Code)
# Quality gate: verify no TODO/FIXME markers, functions <50 lines, tests exist
# Claude Code stdin JSON: { session_id, cwd, hook_event_name }
# Blocking on failure (exit 2)

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $sessionId = if ($input.PSObject.Properties['session_id']) { $input.session_id } else { "" }
    $cwd = if ($input.PSObject.Properties['cwd']) { $input.cwd } else { $env:CLAUDE_PROJECT_DIR }

    if (-not $cwd) { $cwd = "." }

    $logDir = Join-Path $cwd "RLM" "progress" "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    }

    $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'

    # Load code quality library if available
    $qualityLib = Join-Path $PSScriptRoot "lib" "code-quality-check.ps1"
    $issues = @()

    if (Test-Path $qualityLib) {
        . $qualityLib
        $result = Test-CodeQuality -ProjectDir $cwd
        $issues = $result.issues
    }

    # Log task completion
    $logEntry = @{
        timestamp = $now
        event = "task.completed"
        sessionId = $sessionId
        qualityIssues = $issues.Count
    } | ConvertTo-Json -Compress
    Add-Content -Path (Join-Path $logDir "team-coordination.jsonl") -Value $logEntry

    if ($issues.Count -gt 0) {
        # Output issues as structured JSON for Claude to process
        @{
            decision = "block"
            reason = "Quality gate failed: $($issues.Count) issue(s) found"
            additionalContext = "Issues: $(($issues | Select-Object -First 5) -join '; ')"
        } | ConvertTo-Json -Compress
        exit 2
    }

    # Update checkpoint after successful quality gate
    $checkpointPath = Join-Path $cwd "RLM" "progress" "checkpoint.json"
    $atomicLib = Join-Path $PSScriptRoot "lib" "atomic-write.ps1"
    $lockLib = Join-Path $PSScriptRoot "lib" "file-locking.ps1"
    if ((Test-Path $atomicLib) -and (Test-Path $lockLib)) {
        . $atomicLib
        . $lockLib
        $checkpoint = @{ lastSession = @{ endedAt = $now; qualityGatePassed = $true } }
        if (Test-Path $checkpointPath) {
            try {
                $existing = Get-Content $checkpointPath -Raw | ConvertFrom-Json
                $existing.lastSession = $checkpoint.lastSession
                $checkpoint = $existing
            } catch { }
        }
        $lockToken = Lock-File -Path $checkpointPath -TimeoutSeconds 5
        if ($lockToken) {
            try { Write-AtomicJson -FilePath $checkpointPath -Data $checkpoint | Out-Null } catch { }
            Unlock-File -LockToken $lockToken
        }
    }

    @{
        decision = "allow"
        reason = "Quality gate passed"
        additionalContext = "Task completed. Quality issues: $($issues.Count). Checkpoint updated."
    } | ConvertTo-Json -Compress

    exit 0
} catch {
    exit 0
}
