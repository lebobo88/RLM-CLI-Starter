#!/bin/bash
# RLM Post-Tool Log Hook — tracks tool usage for progress reporting
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName // empty')
RESULT_TYPE=$(echo "$INPUT" | jq -r '.toolResult.resultType // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
SESSION_ID=$(echo "$INPUT" | jq -r '.sessionId // empty')

LOG_DIR="$CWD/RLM/progress/logs"
mkdir -p "$LOG_DIR"

LOG_FILE="$LOG_DIR/tool-usage.csv"
if [ ! -f "$LOG_FILE" ]; then
  echo "timestamp,sessionId,tool,result" > "$LOG_FILE"
fi

echo "$(date -Iseconds),$SESSION_ID,$TOOL_NAME,$RESULT_TYPE" >> "$LOG_FILE"

exit 0
