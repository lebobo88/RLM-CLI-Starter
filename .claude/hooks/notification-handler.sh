#!/bin/bash
# RLM Notification Hook — Log notifications for observability
# Claude Code stdin JSON: { message, session_id, cwd, hook_event_name }
# Non-blocking: logs notification

INPUT=$(cat)

CWD=$(echo "$INPUT" | grep -o '"cwd"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"cwd"[[:space:]]*:[[:space:]]*"//;s/"$//' 2>/dev/null)
if [ -z "$CWD" ]; then CWD="${CLAUDE_PROJECT_DIR:-.}"; fi

SESSION_ID=$(echo "$INPUT" | grep -o '"session_id"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"session_id"[[:space:]]*:[[:space:]]*"//;s/"$//' 2>/dev/null)
MESSAGE=$(echo "$INPUT" | grep -o '"message"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"message"[[:space:]]*:[[:space:]]*"//;s/"$//' 2>/dev/null)

LOG_DIR="$CWD/RLM/progress/logs"
mkdir -p "$LOG_DIR" 2>/dev/null

NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%SZ")

echo "{\"timestamp\":\"$NOW\",\"event_type\":\"notification\",\"session_id\":\"$SESSION_ID\",\"message\":\"$MESSAGE\"}" >> "$LOG_DIR/events.jsonl"

exit 0
