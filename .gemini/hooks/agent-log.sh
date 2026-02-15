#!/bin/bash
# RLM Agent Log Hook (Gemini CLI) — logs BeforeAgent and AfterAgent events
# Gemini CLI stdin JSON: { agent_name, hook_event_name, session_id, cwd }
INPUT=$(cat)

# Parse JSON fields
if command -v jq >/dev/null 2>&1; then
  AGENT_NAME=$(echo "$INPUT" | jq -r '.agent_name // "unknown"')
  HOOK_EVENT=$(echo "$INPUT" | jq -r '.hook_event_name // "agent"')
  SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
  CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
else
  AGENT_NAME=$(echo "$INPUT" | grep -o '"agent_name"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"agent_name"[[:space:]]*:[[:space:]]*"//;s/"$//')
  HOOK_EVENT=$(echo "$INPUT" | grep -o '"hook_event_name"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"hook_event_name"[[:space:]]*:[[:space:]]*"//;s/"$//')
  SESSION_ID=$(echo "$INPUT" | grep -o '"session_id"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"session_id"[[:space:]]*:[[:space:]]*"//;s/"$//')
  CWD=$(echo "$INPUT" | grep -o '"cwd"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"cwd"[[:space:]]*:[[:space:]]*"//;s/"$//')
fi

if [ -z "$CWD" ]; then
  CWD="${GEMINI_PROJECT_DIR:-.}"
fi

LOG_DIR="$CWD/RLM/progress/logs"
mkdir -p "$LOG_DIR"

NOW=$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)

# Determine event type from hook name
case "$HOOK_EVENT" in
  *Before*) EVENT_TYPE="agent.start"; LABEL="START" ;;
  *)        EVENT_TYPE="agent.end";   LABEL="END  " ;;
esac

# Structured JSONL log
if command -v jq >/dev/null 2>&1; then
  jq -n --arg ts "$NOW" --arg evt "$EVENT_TYPE" --arg agent "$AGENT_NAME" --arg src "gemini-cli" --arg sid "$SESSION_ID" \
    '{timestamp:$ts, event:$evt, agent:$agent, source:$src, sessionId:$sid}' >> "$LOG_DIR/agents.jsonl"
else
  echo "{\"timestamp\":\"$NOW\",\"event\":\"$EVENT_TYPE\",\"agent\":\"$AGENT_NAME\",\"source\":\"gemini-cli\",\"sessionId\":\"$SESSION_ID\"}" >> "$LOG_DIR/agents.jsonl"
fi

# Human-readable log
echo "$NOW | $LABEL | agent=$AGENT_NAME" >> "$LOG_DIR/agents.log"

exit 0
