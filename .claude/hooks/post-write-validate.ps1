# RLM PostToolUse Validation Hook — Validates source file quality after Write/Edit
# Claude Code stdin JSON: { tool_name, tool_input, tool_result, session_id, cwd }
# Blocking: exit 2 with structured JSON on quality issues

$ErrorActionPreference = "Stop"

try {
    $input = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $toolName = $input.tool_name

    if ($toolName -ne "Write" -and $toolName -ne "Edit") { exit 0 }

    $filePath = $input.tool_input.file_path
    if (-not $filePath) { exit 0 }

    $filePath = $filePath -replace '\\', '/'

    # Skip non-source files
    if ($filePath -notmatch '\.(ts|tsx|js|jsx|py|css)$') { exit 0 }

    # Skip test files (don't validate test code the same way)
    if ($filePath -match '\.(test|spec)\.(ts|tsx|js|jsx)$') { exit 0 }

    # Skip RLM artifacts
    if ($filePath -like "*/RLM/*") { exit 0 }

    $issues = @()

    # Only validate if the file exists
    $resolvedPath = $filePath
    if (-not [System.IO.Path]::IsPathRooted($filePath)) {
        $cwd = if ($input.PSObject.Properties['cwd']) { $input.cwd } else { $env:CLAUDE_PROJECT_DIR }
        if ($cwd) { $resolvedPath = Join-Path $cwd $filePath }
    }

    if (Test-Path $resolvedPath) {
        $content = Get-Content $resolvedPath -Raw -ErrorAction SilentlyContinue

        if ($content) {
            # Check for TypeScript 'any' usage
            if ($resolvedPath -match '\.tsx?$') {
                $anyMatches = [regex]::Matches($content, ':\s*any\b')
                if ($anyMatches.Count -gt 0) {
                    $issues += "TypeScript 'any' detected ($($anyMatches.Count) instances) — use specific types"
                }
            }

            # Check for TODO/FIXME markers
            $markerMatches = [regex]::Matches($content, '\b(TODO|FIXME|HACK|XXX|PLACEHOLDER)\b')
            if ($markerMatches.Count -gt 0) {
                $markers = ($markerMatches | ForEach-Object { $_.Value } | Select-Object -Unique) -join ', '
                $issues += "Incomplete markers found: $markers"
            }

            # Check function length (rough heuristic: count lines between function/method declarations)
            $lines = $content -split "`n"
            $funcStart = -1
            $funcName = ""
            for ($i = 0; $i -lt $lines.Count; $i++) {
                $line = $lines[$i]
                if ($line -match '^\s*(export\s+)?(async\s+)?function\s+(\w+)|^\s*(export\s+)?(const|let)\s+(\w+)\s*=\s*(async\s+)?\(') {
                    if ($funcStart -ge 0 -and ($i - $funcStart) -gt 50) {
                        $issues += "Function '$funcName' exceeds 50 lines (started at line $($funcStart+1))"
                    }
                    $funcStart = $i
                    $funcName = if ($Matches[3]) { $Matches[3] } elseif ($Matches[6]) { $Matches[6] } else { "anonymous" }
                }
            }
        }
    }

    if ($issues.Count -gt 0) {
        @{
            decision = "block"
            reason = ($issues -join "; ")
            additionalContext = "Fix these code quality issues before continuing. File: $filePath"
        } | ConvertTo-Json -Compress
        exit 2
    }

    exit 0
} catch {
    exit 0
}
