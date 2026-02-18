#!/bin/bash
# RLM Session End Hook — saves checkpoint and logs session summary
INPUT=$(cat)
REASON=$(echo "$INPUT" | jq -r '.reason // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
SESSION_ID=$(echo "$INPUT" | jq -r '.sessionId // empty')

LOG_DIR="$CWD/RLM/progress/logs"
mkdir -p "$LOG_DIR"

NOW=$(date -Iseconds)

# Backward-compatible log
echo "$NOW | END   | reason=$REASON" >> "$LOG_DIR/sessions.log"

# Structured JSONL log
jq -n --arg ts "$NOW" --arg reason "$REASON" --arg sid "$SESSION_ID" \
  '{timestamp:$ts, event:"session.end", reason:$reason, sessionId:$sid}' >> "$LOG_DIR/sessions.jsonl"

# Update checkpoint with file locking
CHECKPOINT="$CWD/RLM/progress/checkpoint.json"
LIB_DIR="$(dirname "$0")/lib"

if [ -f "$LIB_DIR/file-locking.sh" ]; then
  . "$LIB_DIR/file-locking.sh"
  LOCK=$(lock_file "$CHECKPOINT" 10)
  jq -n --arg ts "$NOW" --arg reason "$REASON" --arg sid "$SESSION_ID" \
    '{lastSession:{endedAt:$ts, reason:$reason, sessionId:$sid}}' > "$CHECKPOINT"
  if [ -n "$LOCK" ]; then
    unlock_file "$LOCK"
  fi
else
  jq -n --arg ts "$NOW" --arg reason "$REASON" --arg sid "$SESSION_ID" \
    '{lastSession:{endedAt:$ts, reason:$reason, sessionId:$sid}}' > "$CHECKPOINT"
fi

# --- Sandbox State Logging (read-only, no teardown) ---
SANDBOX_STATE_FILE="$CWD/sandbox/.sandbox-state.json"
if [ -f "$SANDBOX_STATE_FILE" ]; then
  SANDBOX_ID=$(jq -r '.sandbox_id // empty' "$SANDBOX_STATE_FILE" 2>/dev/null)
  if [ -n "$SANDBOX_ID" ]; then
    echo "$NOW | INFO  | Sandbox $SANDBOX_ID was active during session" >> "$LOG_DIR/sessions.log"
  fi
fi

exit 0
