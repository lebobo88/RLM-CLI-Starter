#!/bin/bash
# RLM Session End Hook (Claude Code) — saves checkpoint and logs session summary
# Claude Code stdin JSON: { session_id, cwd, hook_event_name }
INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

# Fallback to CLAUDE_PROJECT_DIR if cwd not in input
if [ -z "$CWD" ]; then
  CWD="${CLAUDE_PROJECT_DIR:-.}"
fi

LOG_DIR="$CWD/RLM/progress/logs"
mkdir -p "$LOG_DIR"

NOW=$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)

# Backward-compatible log
echo "$NOW | END   | reason=session_end" >> "$LOG_DIR/sessions.log"

# Structured JSONL log
jq -n --arg ts "$NOW" --arg reason "session_end" --arg sid "$SESSION_ID" \
  '{timestamp:$ts, event:"session.end", reason:$reason, sessionId:$sid}' >> "$LOG_DIR/sessions.jsonl"

# Update checkpoint with sessionId
CHECKPOINT="$CWD/RLM/progress/checkpoint.json"
jq -n --arg ts "$NOW" --arg reason "session_end" --arg sid "$SESSION_ID" \
  '{lastSession:{endedAt:$ts, reason:$reason, sessionId:$sid}}' > "$CHECKPOINT"

# --- Sandbox State Logging (read-only, no teardown) ---
SANDBOX_STATE_FILE="$CWD/sandbox/.sandbox-state.json"
if [ -f "$SANDBOX_STATE_FILE" ]; then
  SANDBOX_ID=$(jq -r '.sandbox_id // empty' "$SANDBOX_STATE_FILE" 2>/dev/null)
  if [ -n "$SANDBOX_ID" ]; then
    echo "$NOW | INFO  | Sandbox $SANDBOX_ID was active during session" >> "$LOG_DIR/sessions.log"
  fi
fi

exit 0
