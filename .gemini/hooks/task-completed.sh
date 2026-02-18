#!/usr/bin/env bash
# RLM Task Completed Hook (Gemini CLI)
# Quality gate: verify no TODO/FIXME markers

set -euo pipefail

INPUT=$(cat)

CWD=$(echo "$INPUT" | grep -o '"cwd":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$CWD" ] && CWD="${GEMINI_PROJECT_DIR:-.}"

LOG_DIR="$CWD/RLM/progress/logs"
mkdir -p "$LOG_DIR"

NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%SZ")

ISSUES=0
SRC_DIR="$CWD/src"
if [ -d "$SRC_DIR" ]; then
    for marker in TODO FIXME HACK XXX PLACEHOLDER; do
        COUNT=$(grep -rl "\b${marker}\b" "$SRC_DIR" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
        if [ "$COUNT" -gt 0 ]; then
            ISSUES=$((ISSUES + COUNT))
        fi
    done
fi

LOG_ENTRY="{\"timestamp\":\"$NOW\",\"event\":\"task.completed\",\"source\":\"gemini-cli\",\"qualityIssues\":$ISSUES}"
echo "$LOG_ENTRY" >> "$LOG_DIR/team-coordination.jsonl"

if [ "$ISSUES" -gt 0 ]; then
    echo "{\"status\":\"blocked\",\"reason\":\"Quality gate failed: $ISSUES marker issues found\"}"
    exit 2
fi

echo '{"status":"ok"}'
exit 0
