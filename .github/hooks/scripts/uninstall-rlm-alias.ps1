# RLM Alias Uninstaller for PowerShell
# Removes 'rlm' function from PowerShell profile

$ErrorActionPreference = "Stop"

Write-Host "`n🗑️  RLM Alias Uninstaller for PowerShell`n" -ForegroundColor Cyan

# Detect PowerShell profile path
$profilePath = $PROFILE.CurrentUserAllHosts

if (-not (Test-Path $profilePath)) {
    Write-Host "❌ Profile file not found: $profilePath" -ForegroundColor Red
    Write-Host "   Nothing to uninstall." -ForegroundColor Gray
    exit 0
}

Write-Host "📁 Profile path: $profilePath" -ForegroundColor Gray

# Check if alias exists
$profileContent = Get-Content $profilePath -Raw
if ($profileContent -notmatch "function rlm") {
    Write-Host "❌ 'rlm' function not found in profile." -ForegroundColor Red
    Write-Host "   Nothing to uninstall." -ForegroundColor Gray
    exit 0
}

# Backup profile before modification
$backupPath = "$profilePath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item $profilePath $backupPath
Write-Host "✅ Backed up profile to: $backupPath" -ForegroundColor Green

# Remove RLM function
$profileContent = $profileContent -replace '(?ms)# RLM Method.*?^}', ''
$profileContent = $profileContent.TrimEnd()
Set-Content -Path $profilePath -Value $profileContent

Write-Host "`n✅ Successfully removed 'rlm' alias!`n" -ForegroundColor Green
Write-Host "📝 To apply changes:" -ForegroundColor Cyan
Write-Host "   Restart PowerShell (or run: . `$PROFILE)`n" -ForegroundColor Gray
