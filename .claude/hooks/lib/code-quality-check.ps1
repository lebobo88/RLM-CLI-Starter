# Code Quality Check Library
# Reusable quality verification: function length, markers, minimum content
# Dot-source this file to use: . $PSScriptRoot/lib/code-quality-check.ps1

function Test-CodeQuality {
    param(
        [string]$ProjectDir = ".",
        [string[]]$TargetFiles = @()
    )

    $issues = @()

    # If no specific files, scan src/ directory
    if ($TargetFiles.Count -eq 0) {
        $srcDir = Join-Path $ProjectDir "src"
        if (Test-Path $srcDir) {
            $TargetFiles = Get-ChildItem -Path $srcDir -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" |
                Where-Object { $_.Name -notmatch '\.(test|spec)\.' } |
                Select-Object -ExpandProperty FullName
        }
    }

    foreach ($file in $TargetFiles) {
        if (-not (Test-Path $file)) { continue }

        $content = Get-Content $file -Raw
        $lines = Get-Content $file

        # Check for incomplete markers
        $markers = @('TODO', 'FIXME', 'HACK', 'XXX', 'PLACEHOLDER')
        foreach ($marker in $markers) {
            if ($content -match "\b$marker\b") {
                $issues += "Incomplete marker '$marker' found in $file"
            }
        }

        # Check for empty/stub files (minimum 5 non-blank lines)
        $nonBlankLines = ($lines | Where-Object { $_.Trim().Length -gt 0 }).Count
        if ($nonBlankLines -lt 5) {
            $issues += "File has fewer than 5 non-blank lines: $file ($nonBlankLines lines)"
        }

        # Check function length (< 50 lines)
        $functionPattern = '^\s*(export\s+)?(async\s+)?function\s+\w+'
        $arrowPattern = '^\s*(export\s+)?(const|let)\s+\w+\s*=\s*(async\s+)?\('
        $inFunction = $false
        $functionStart = 0
        $braceDepth = 0
        $functionName = ""

        for ($i = 0; $i -lt $lines.Count; $i++) {
            $line = $lines[$i]

            if (-not $inFunction -and ($line -match $functionPattern -or $line -match $arrowPattern)) {
                $inFunction = $true
                $functionStart = $i
                $braceDepth = 0
                if ($line -match 'function\s+(\w+)') { $functionName = $Matches[1] }
                elseif ($line -match '(const|let)\s+(\w+)') { $functionName = $Matches[2] }
            }

            if ($inFunction) {
                $braceDepth += ([regex]::Matches($line, '\{')).Count
                $braceDepth -= ([regex]::Matches($line, '\}')).Count

                if ($braceDepth -le 0 -and $i -gt $functionStart) {
                    $length = $i - $functionStart + 1
                    if ($length -gt 50) {
                        $issues += "Function '$functionName' is $length lines (max 50) in $file:$($functionStart + 1)"
                    }
                    $inFunction = $false
                }
            }
        }
    }

    return @{
        issues = $issues
        passed = ($issues.Count -eq 0)
        checkedFiles = $TargetFiles.Count
    }
}
