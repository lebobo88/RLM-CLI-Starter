#!/bin/bash
# RLM Session Start Hook — logs session start and loads pipeline state
INPUT=$(cat)
SOURCE=$(echo "$INPUT" | jq -r '.source // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
SESSION_ID=$(echo "$INPUT" | jq -r '.sessionId // empty')

LOG_DIR="$CWD/RLM/progress/logs"
mkdir -p "$LOG_DIR"

NOW=$(date -Iseconds)

# Backward-compatible log
echo "$NOW | START | source=$SOURCE" >> "$LOG_DIR/sessions.log"

# Check for existing pipeline state
PHASE=""
STATE_FILE="$CWD/RLM/progress/pipeline-state.json"
if [ -f "$STATE_FILE" ]; then
  PHASE=$(jq -r '.current_phase // empty' "$STATE_FILE")
  echo "$NOW | INFO  | Resuming pipeline at phase $PHASE" >> "$LOG_DIR/sessions.log"
fi

# Structured JSONL log
JSONL_ENTRY=$(jq -n --arg ts "$NOW" --arg src "$SOURCE" --arg sid "$SESSION_ID" --arg ph "$PHASE" \
  '{timestamp:$ts, event:"session.start", source:$src, sessionId:$sid} + (if $ph != "" then {pipelinePhase:($ph | tonumber? // $ph)} else {} end)')
echo "$JSONL_ENTRY" >> "$LOG_DIR/sessions.jsonl"

# --- Sandbox Detection ---
SANDBOX_MODE="false"
SANDBOX_ID=""
CONFIG_FILE="$CWD/RLM/progress/config.json"
if [ -f "$CONFIG_FILE" ]; then
  SANDBOX_ENABLED=$(jq -r '.sandbox.enabled // false' "$CONFIG_FILE" 2>/dev/null)
  if [ "$SANDBOX_ENABLED" = "true" ]; then
    SANDBOX_MODE="true"
  fi
fi
SANDBOX_STATE_FILE="$CWD/sandbox/.sandbox-state.json"
if [ -f "$SANDBOX_STATE_FILE" ]; then
  SANDBOX_ID=$(jq -r '.sandbox_id // empty' "$SANDBOX_STATE_FILE" 2>/dev/null)
fi
if [ "$SANDBOX_MODE" = "true" ]; then
  echo "$NOW | INFO  | Sandbox mode active (ID: ${SANDBOX_ID:-none})" >> "$LOG_DIR/sessions.log"
fi

exit 0
