# diagnose-ghost-lines.ps1
# This script diagnoses terminal rendering issues ("ghost lines") common in LLM CLI streaming.

Write-Host "--- Terminal Diagnostic: Ghost Lines ---" -ForegroundColor Cyan
Write-Host "Terminal: $($Host.Name)"
Write-Host "Window Width: $($Host.UI.RawUI.WindowSize.Width)"
Write-Host "Window Height: $($Host.UI.RawUI.WindowSize.Height)"
Write-Host ""

# Test 1: Carriage Return Overwriting
Write-Host "Testing Carriage Return Overwriting..." -NoNewline
Start-Sleep -Milliseconds 500
$cr = [char]13
Write-Host "$($cr)[PASS] Carriage Return works correctly.          " -ForegroundColor Green

# Test 2: ANSI Escape Codes (Clear Line)
Write-Host "Testing ANSI Clear Line (ESC[2K)..." -NoNewline
Start-Sleep -Milliseconds 500
$ESC = [char]27
Write-Host "$($ESC)[2K$($cr)[PASS] ANSI Clear Line works correctly." -ForegroundColor Green

# Test 3: Rapid Streaming Simulation (Potential Ghosting)
Write-Host "Simulating rapid output streaming (watching for flickers/ghosts):"
$testString = "This is a long line of text that will be updated rapidly to test for residual artifacts."
for ($i = 1; $i -le 20; $i++) {
    $progress = ("#" * $i) + ("." * (20 - $i))
    Write-Host "$($cr)[$progress] $testString" -NoNewline
    Start-Sleep -Milliseconds 50
}
Write-Host "`n[DONE] Streaming test complete." -ForegroundColor Cyan

# Test 4: ANSI Color and Formatting
Write-Host "Testing ANSI Colors: " -NoNewline
Write-Host "$($ESC)[31mRed $($ESC)[32mGreen $($ESC)[34mBlue $($ESC)[0m (Reset)"

Write-Host ""
Write-Host "If you saw any extra characters, flickering, or old text remaining,"
Write-Host "your terminal may have rendering issues with specific ANSI sequences."
