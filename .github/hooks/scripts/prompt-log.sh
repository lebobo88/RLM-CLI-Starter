#!/bin/bash
# RLM Prompt Post Hook — logs prompt responses for progress tracking
INPUT=$(cat)
AGENT=$(echo "$INPUT" | jq -r '.agent')
RESPONSE=$(echo "$INPUT" | jq -r '.response')
CWD=$(echo "$INPUT" | jq -r '.cwd')

RESPONSE_LEN=${#RESPONSE}

LOG_DIR="$CWD/RLM/progress/logs"
mkdir -p "$LOG_DIR"

echo "$(date -Iseconds) | $AGENT | $RESPONSE_LEN" >> "$LOG_DIR/prompts.log"

exit 0
