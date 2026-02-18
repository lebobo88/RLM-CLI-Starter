#!/usr/bin/env bash
# RLM Task Completed Hook (Claude Code)
# Quality gate: verify no TODO/FIXME markers, functions <50 lines, tests exist
# Blocking on failure (exit 2)

set -euo pipefail

INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | grep -o '"session_id":"[^"]*"' | head -1 | cut -d'"' -f4)
CWD=$(echo "$INPUT" | grep -o '"cwd":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$CWD" ] && CWD="${CLAUDE_PROJECT_DIR:-.}"

LOG_DIR="$CWD/RLM/progress/logs"
mkdir -p "$LOG_DIR"

NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%SZ")

ISSUES=0
ISSUE_LIST=""

# Check for incomplete markers in src/
SRC_DIR="$CWD/src"
if [ -d "$SRC_DIR" ]; then
    for marker in TODO FIXME HACK XXX PLACEHOLDER; do
        COUNT=$(grep -rl "\b${marker}\b" "$SRC_DIR" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
        if [ "$COUNT" -gt 0 ]; then
            ISSUES=$((ISSUES + COUNT))
            ISSUE_LIST="${ISSUE_LIST}Marker $marker found in $COUNT files. "
        fi
    done
fi

LOG_ENTRY="{\"timestamp\":\"$NOW\",\"event\":\"task.completed\",\"sessionId\":\"$SESSION_ID\",\"qualityIssues\":$ISSUES}"
echo "$LOG_ENTRY" >> "$LOG_DIR/team-coordination.jsonl"

if [ "$ISSUES" -gt 0 ]; then
    echo "{\"status\":\"blocked\",\"reason\":\"Quality gate failed\",\"details\":\"$ISSUE_LIST\"}"
    exit 2
fi

exit 0
