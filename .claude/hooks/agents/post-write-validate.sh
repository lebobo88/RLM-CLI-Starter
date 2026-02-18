#!/bin/bash
# Agent-level Post-Write Validation Hook
# Source code validation for agent-written files
# Claude Code stdin JSON: { tool_name, tool_input, session_id, cwd }

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"tool_name"[[:space:]]*:[[:space:]]*"//;s/"$//' 2>/dev/null)
if [ "$TOOL_NAME" != "Write" ] && [ "$TOOL_NAME" != "Edit" ]; then exit 0; fi

FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//;s/"$//' 2>/dev/null)
if [ -z "$FILE_PATH" ]; then exit 0; fi

# Skip non-source files
case "$FILE_PATH" in
    *.ts|*.tsx|*.js|*.jsx) ;;
    *) exit 0 ;;
esac

# Skip RLM artifacts
case "$FILE_PATH" in
    */RLM/*) exit 0 ;;
esac

CWD=$(echo "$INPUT" | grep -o '"cwd"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"cwd"[[:space:]]*:[[:space:]]*"//;s/"$//' 2>/dev/null)
if [ -z "$CWD" ]; then CWD="${CLAUDE_PROJECT_DIR:-.}"; fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EVENT_SENDER="$SCRIPT_DIR/../lib/event-sender.sh"
if [ -f "$EVENT_SENDER" ]; then
    . "$EVENT_SENDER"
    send_rlm_event "agent.file_written" "" "" "$CWD" "{\"file\":\"$FILE_PATH\"}"
fi

exit 0
