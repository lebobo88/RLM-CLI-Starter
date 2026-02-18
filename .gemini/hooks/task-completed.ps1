# RLM Task Completed Hook (Gemini CLI)
# Quality gate: verify no TODO/FIXME markers
# Gemini CLI stdin JSON: { hook_event_name }

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $cwd = if ($input.PSObject.Properties['cwd']) { $input.cwd } else { $env:GEMINI_PROJECT_DIR }

    if (-not $cwd) { $cwd = "." }

    $logDir = Join-Path $cwd "RLM" "progress" "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    }

    $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'

    # Check for incomplete markers in src/
    $issues = @()
    $srcDir = Join-Path $cwd "src"
    if (Test-Path $srcDir) {
        $markers = @('TODO', 'FIXME', 'HACK', 'XXX', 'PLACEHOLDER')
        foreach ($marker in $markers) {
            $found = Get-ChildItem -Path $srcDir -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" |
                Select-String -Pattern "\b$marker\b" -ErrorAction SilentlyContinue
            if ($found) {
                $issues += "Marker '$marker' found in $($found.Count) locations"
            }
        }
    }

    $logEntry = @{
        timestamp = $now
        event = "task.completed"
        source = "gemini-cli"
        qualityIssues = $issues.Count
    } | ConvertTo-Json -Compress
    Add-Content -Path (Join-Path $logDir "team-coordination.jsonl") -Value $logEntry

    if ($issues.Count -gt 0) {
        $result = @{
            status = "blocked"
            reason = "Quality gate failed"
            issues = $issues
        } | ConvertTo-Json -Compress
        Write-Output $result
        exit 2
    }

    @{ status = "ok" } | ConvertTo-Json -Compress | Write-Output
    exit 0
} catch {
    @{ status = "ok" } | ConvertTo-Json -Compress | Write-Output
    exit 0
}
