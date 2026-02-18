#!/bin/bash
# RLM PostToolUseFailure Hook — Track and log failed tool operations
# Claude Code stdin JSON: { tool_name, tool_input, tool_error, session_id, cwd }
# Non-blocking: logs failure for observability

INPUT=$(cat)

CWD=$(echo "$INPUT" | grep -o '"cwd"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"cwd"[[:space:]]*:[[:space:]]*"//;s/"$//' 2>/dev/null)
if [ -z "$CWD" ]; then CWD="${CLAUDE_PROJECT_DIR:-.}"; fi

SESSION_ID=$(echo "$INPUT" | grep -o '"session_id"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"session_id"[[:space:]]*:[[:space:]]*"//;s/"$//' 2>/dev/null)
TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"tool_name"[[:space:]]*:[[:space:]]*"//;s/"$//' 2>/dev/null)
TOOL_ERROR=$(echo "$INPUT" | grep -o '"tool_error"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"tool_error"[[:space:]]*:[[:space:]]*"//;s/"$//' 2>/dev/null)
TRACE_ID="${RLM_TRACE_ID:-}"

LOG_DIR="$CWD/RLM/progress/logs"
mkdir -p "$LOG_DIR" 2>/dev/null

NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%SZ")

# Truncate error to 500 chars
ERROR_TRUNC=$(echo "$TOOL_ERROR" | head -c 500)

echo "{\"timestamp\":\"$NOW\",\"event_type\":\"tool_failure\",\"session_id\":\"$SESSION_ID\",\"trace_id\":\"$TRACE_ID\",\"tool\":\"$TOOL_NAME\",\"error\":\"$ERROR_TRUNC\"}" >> "$LOG_DIR/events.jsonl"

exit 0
