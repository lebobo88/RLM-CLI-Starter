#!/usr/bin/env bash
# RLM Stop Checkpoint Hook (Claude Code)
# Ensure progress is saved before session ends
# Non-blocking

set -euo pipefail

INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | grep -o '"session_id":"[^"]*"' | head -1 | cut -d'"' -f4)
CWD=$(echo "$INPUT" | grep -o '"cwd":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$CWD" ] && CWD="${CLAUDE_PROJECT_DIR:-.}"

NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%SZ")

PROGRESS_DIR="$CWD/RLM/progress"
mkdir -p "$PROGRESS_DIR"

CHECKPOINT_FILE="$PROGRESS_DIR/checkpoint.json"

if [ -f "$CHECKPOINT_FILE" ]; then
    # File exists, just log the stop event
    :
else
    echo "{\"lastSession\":{\"endedAt\":\"$NOW\",\"reason\":\"session_stop\",\"sessionId\":\"$SESSION_ID\"}}" > "$CHECKPOINT_FILE"
fi

LOG_DIR="$PROGRESS_DIR/logs"
mkdir -p "$LOG_DIR"

LOG_ENTRY="{\"timestamp\":\"$NOW\",\"event\":\"session.stop\",\"sessionId\":\"$SESSION_ID\"}"
echo "$LOG_ENTRY" >> "$LOG_DIR/sessions.jsonl"

exit 0
