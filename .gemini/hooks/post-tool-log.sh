#!/bin/bash
# RLM Post-Tool Log Hook (Gemini CLI) — tracks tool usage for progress reporting
# Gemini CLI stdin JSON: { tool_name, arguments, session_id, cwd, hook_event_name }
INPUT=$(cat)

# Parse JSON fields — use jq if available, fall back to grep/sed
if command -v jq >/dev/null 2>&1; then
  TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
  CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
  SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
else
  TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"tool_name"[[:space:]]*:[[:space:]]*"//;s/"$//')
  CWD=$(echo "$INPUT" | grep -o '"cwd"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"cwd"[[:space:]]*:[[:space:]]*"//;s/"$//')
  SESSION_ID=$(echo "$INPUT" | grep -o '"session_id"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"session_id"[[:space:]]*:[[:space:]]*"//;s/"$//')
fi

# Fallback to GEMINI_PROJECT_DIR if cwd not in input
if [ -z "$CWD" ]; then
  CWD="${GEMINI_PROJECT_DIR:-.}"
fi

LOG_DIR="$CWD/RLM/progress/logs"
mkdir -p "$LOG_DIR"

LOG_FILE="$LOG_DIR/tool-usage.csv"
if [ ! -f "$LOG_FILE" ]; then
  echo "timestamp,sessionId,tool,event,source" > "$LOG_FILE"
fi

NOW=$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)
echo "$NOW,$SESSION_ID,$TOOL_NAME,after_tool,gemini-cli" >> "$LOG_FILE"

exit 0
