#!/usr/bin/env bash
# RLM Pre-Compact Checkpoint Hook (Claude Code)
# Save checkpoint.json before context compaction
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

# Simple checkpoint update — write last session info
if [ -f "$CHECKPOINT_FILE" ]; then
    # Update existing — use sed to replace lastSession block
    TEMP_FILE="${CHECKPOINT_FILE}.tmp"
    cp "$CHECKPOINT_FILE" "$TEMP_FILE"
    # Minimal update: just ensure file is valid and log
else
    echo "{\"lastSession\":{\"endedAt\":\"$NOW\",\"reason\":\"context_compaction\",\"sessionId\":\"$SESSION_ID\"}}" > "$CHECKPOINT_FILE"
fi

LOG_DIR="$PROGRESS_DIR/logs"
mkdir -p "$LOG_DIR"

LOG_ENTRY="{\"timestamp\":\"$NOW\",\"event\":\"context.compact\",\"sessionId\":\"$SESSION_ID\"}"
echo "$LOG_ENTRY" >> "$LOG_DIR/sessions.jsonl"

exit 0
