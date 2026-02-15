#!/bin/bash
# RLM Prompt Pre Hook — injects active pipeline context into the system prompt
INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd')

STATE_FILE="$CWD/RLM/progress/pipeline-state.json"
if [ -f "$STATE_FILE" ]; then
  PHASE=$(jq -r '.current_phase' "$STATE_FILE")
  AGENT=$(jq -r '.current_agent' "$STATE_FILE")
  echo "{\"systemPromptAddendum\":\"Active RLM pipeline at phase $PHASE. Current agent: $AGENT.\"}"
fi

exit 0
