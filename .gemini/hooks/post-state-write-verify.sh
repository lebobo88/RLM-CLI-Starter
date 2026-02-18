#!/bin/bash
# Post-State-Write Verification Hook (Claude Code)
# Re-reads and validates state files after writes
# Claude Code stdin JSON: { tool_name, tool_input, session_id, cwd, hook_event_name }
INPUT=$(cat)

if command -v jq >/dev/null 2>&1; then
  TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
  CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
else
  exit 0  # Can't verify without jq
fi

if [ "$TOOL_NAME" != "Edit" ] && [ "$TOOL_NAME" != "Write" ]; then
  exit 0
fi

FILE_PATH=$(echo "$FILE_PATH" | sed 's|\\|/|g')

# Only verify RLM progress JSON files
case "$FILE_PATH" in
  */RLM/progress/status.json|*/RLM/progress/checkpoint.json|*/RLM/progress/pipeline-state.json)
    ;;
  *)
    exit 0
    ;;
esac

# Determine absolute path
if echo "$FILE_PATH" | grep -q '^/'; then
  ABS_PATH="$FILE_PATH"
else
  ABS_PATH="${CWD}/${FILE_PATH}"
fi

if [ ! -f "$ABS_PATH" ]; then
  exit 0
fi

# Verify JSON is valid
CONTENT=$(cat "$ABS_PATH")
if ! echo "$CONTENT" | jq empty 2>/dev/null; then
  NOW=$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)
  LOG_DIR="${CWD}/RLM/progress/logs"
  if [ -d "$LOG_DIR" ]; then
    jq -n --arg ts "$NOW" --arg file "$FILE_PATH" --arg err "Invalid JSON after write" \
      '{timestamp:$ts, event:"state.verify.fail", file:$file, error:$err}' >> "$LOG_DIR/state-verification.jsonl"
  fi
fi

# Load and run schema validators
LIB_DIR="$(dirname "$0")/lib"
if [ -f "$LIB_DIR/schema-validators.sh" ]; then
  . "$LIB_DIR/schema-validators.sh"

  VALIDATION_ERROR=""
  case "$FILE_PATH" in
    */checkpoint.json) VALIDATION_ERROR=$(validate_checkpoint_schema "$CONTENT") ;;
    */pipeline-state.json) VALIDATION_ERROR=$(validate_pipeline_state_schema "$CONTENT") ;;
    */status.json) VALIDATION_ERROR=$(validate_status_schema "$CONTENT") ;;
  esac

  if [ -n "$VALIDATION_ERROR" ]; then
    NOW=$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)
    LOG_DIR="${CWD}/RLM/progress/logs"
    if [ -d "$LOG_DIR" ]; then
      jq -n --arg ts "$NOW" --arg file "$FILE_PATH" --arg err "$VALIDATION_ERROR" \
        '{timestamp:$ts, event:"state.verify.fail", file:$file, error:$err}' >> "$LOG_DIR/state-verification.jsonl"
    fi
  fi
fi

exit 0
