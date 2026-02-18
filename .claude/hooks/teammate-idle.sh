#!/usr/bin/env bash
# RLM Teammate Idle Hook (Claude Code)
# Verify last task completion, check manifest, assign next task
# Blocking on failure (exit 2) to keep teammate working

set -euo pipefail

INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | grep -o '"session_id":"[^"]*"' | head -1 | cut -d'"' -f4)
CWD=$(echo "$INPUT" | grep -o '"cwd":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$CWD" ] && CWD="${CLAUDE_PROJECT_DIR:-.}"

LOG_DIR="$CWD/RLM/progress/logs"
mkdir -p "$LOG_DIR"

NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%SZ")

# Check for pending tasks
ACTIVE_DIR="$CWD/RLM/tasks/active"
PENDING=0
NEXT_TASK=""
if [ -d "$ACTIVE_DIR" ]; then
    PENDING=$(ls "$ACTIVE_DIR"/TASK-*.md 2>/dev/null | wc -l)
    NEXT_TASK=$(ls "$ACTIVE_DIR"/TASK-*.md 2>/dev/null | head -1 | xargs basename 2>/dev/null || echo "")
fi

LOG_ENTRY="{\"timestamp\":\"$NOW\",\"event\":\"teammate.idle\",\"sessionId\":\"$SESSION_ID\",\"pendingTasks\":$PENDING}"
echo "$LOG_ENTRY" >> "$LOG_DIR/team-coordination.jsonl"

if [ "$PENDING" -gt 0 ]; then
    echo "{\"status\":\"has_work\",\"pendingTasks\":$PENDING,\"nextTask\":\"$NEXT_TASK\"}"
    exit 2
fi

exit 0
