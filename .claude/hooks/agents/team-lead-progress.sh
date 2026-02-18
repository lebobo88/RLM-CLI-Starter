#!/bin/bash
# Team Lead Progress Tracking Hook
# Logs team coordination events for observability
# Claude Code stdin JSON: { tool_name, tool_input, session_id, cwd }

INPUT=$(cat)

CWD=$(echo "$INPUT" | grep -o '"cwd"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"cwd"[[:space:]]*:[[:space:]]*"//;s/"$//' 2>/dev/null)
if [ -z "$CWD" ]; then CWD="${CLAUDE_PROJECT_DIR:-.}"; fi

SESSION_ID=$(echo "$INPUT" | grep -o '"session_id"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"session_id"[[:space:]]*:[[:space:]]*"//;s/"$//' 2>/dev/null)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EVENT_SENDER="$SCRIPT_DIR/../lib/event-sender.sh"
if [ -f "$EVENT_SENDER" ]; then
    . "$EVENT_SENDER"
    send_rlm_event "team.progress_check" "$SESSION_ID" "" "$CWD"
fi

exit 0
