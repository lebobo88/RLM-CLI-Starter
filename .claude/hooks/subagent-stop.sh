#!/usr/bin/env bash
# RLM Sub-agent Stop Hook (Claude Code)
# Logs sub-agent completion and captures results

set -euo pipefail

INPUT=$(cat)

AGENT_NAME=$(echo "$INPUT" | grep -o '"agent_name":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$AGENT_NAME" ] && AGENT_NAME="unknown"

SESSION_ID=$(echo "$INPUT" | grep -o '"session_id":"[^"]*"' | head -1 | cut -d'"' -f4)
CWD=$(echo "$INPUT" | grep -o '"cwd":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$CWD" ] && CWD="${CLAUDE_PROJECT_DIR:-.}"

LOG_DIR="$CWD/RLM/progress/logs"
mkdir -p "$LOG_DIR"

NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%SZ")

LOG_ENTRY="{\"timestamp\":\"$NOW\",\"event\":\"subagent.stop\",\"agentName\":\"$AGENT_NAME\",\"sessionId\":\"$SESSION_ID\"}"
echo "$LOG_ENTRY" >> "$LOG_DIR/subagents.jsonl"

exit 0
