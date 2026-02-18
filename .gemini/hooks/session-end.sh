#!/bin/bash
# RLM Session End Hook (Gemini CLI) — saves checkpoint and logs session summary
# Gemini CLI stdin JSON: { session_id, cwd, hook_event_name }
INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

# Fallback to GEMINI_PROJECT_DIR if cwd not in input
if [ -z "$CWD" ]; then
  CWD="${GEMINI_PROJECT_DIR:-.}"
fi

LOG_DIR="$CWD/RLM/progress/logs"
mkdir -p "$LOG_DIR"

NOW=$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)

# Backward-compatible log
echo "$NOW | END   | reason=session_end" >> "$LOG_DIR/sessions.log"

# Structured JSONL log
jq -n --arg ts "$NOW" --arg reason "session_end" --arg sid "$SESSION_ID" \
  '{timestamp:$ts, event:"session.end", reason:$reason, sessionId:$sid}' >> "$LOG_DIR/sessions.jsonl"

# Update checkpoint with file locking
CHECKPOINT="$CWD/RLM/progress/checkpoint.json"
LIB_DIR="$(dirname "$0")/lib"

if [ -f "$LIB_DIR/file-locking.sh" ]; then
  . "$LIB_DIR/file-locking.sh"
  LOCK=$(lock_file "$CHECKPOINT" 10)
  jq -n --arg ts "$NOW" --arg reason "session_end" --arg sid "$SESSION_ID" \
    '{lastSession:{endedAt:$ts, reason:$reason, sessionId:$sid}}' > "$CHECKPOINT"
  if [ -n "$LOCK" ]; then
    unlock_file "$LOCK"
  fi
else
  jq -n --arg ts "$NOW" --arg reason "session_end" --arg sid "$SESSION_ID" \
    '{lastSession:{endedAt:$ts, reason:$reason, sessionId:$sid}}' > "$CHECKPOINT"
fi

# --- Clean up session-specific context file ---
if [ -n "$SESSION_ID" ]; then
  SESSION_CONTEXT_FILE="$CWD/RLM/progress/.session-contexts/session-$SESSION_ID.md"
  rm -f "$SESSION_CONTEXT_FILE" 2>/dev/null
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
