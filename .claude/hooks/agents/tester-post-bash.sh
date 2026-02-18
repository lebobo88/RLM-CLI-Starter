#!/usr/bin/env bash
# Tester Post-Bash Hook
# Captures test results from Bash commands to logs

set -euo pipefail

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name":"[^"]*"' | head -1 | cut -d'"' -f4)
[ "$TOOL_NAME" != "Bash" ] && exit 0

COMMAND=$(echo "$INPUT" | grep -o '"command":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$COMMAND" ] && exit 0

# Only log test-related commands
IS_TEST=false
echo "$COMMAND" | grep -q '\bnpm test\b' && IS_TEST=true
echo "$COMMAND" | grep -qE '\bnpx (vitest|jest)\b' && IS_TEST=true
echo "$COMMAND" | grep -q 'test.*--coverage' && IS_TEST=true

[ "$IS_TEST" = "false" ] && exit 0

SESSION_ID=$(echo "$INPUT" | grep -o '"session_id":"[^"]*"' | head -1 | cut -d'"' -f4)
CWD=$(echo "$INPUT" | grep -o '"cwd":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$CWD" ] && CWD="${CLAUDE_PROJECT_DIR:-.}"

LOG_DIR="$CWD/RLM/progress/logs"
mkdir -p "$LOG_DIR"

NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%SZ")

LOG_ENTRY="{\"timestamp\":\"$NOW\",\"event\":\"test.execution\",\"command\":\"$COMMAND\",\"sessionId\":\"$SESSION_ID\",\"agentId\":\"tester\"}"
echo "$LOG_ENTRY" >> "$LOG_DIR/test-executions.jsonl"

exit 0
