#!/usr/bin/env bash
# RLM After-Agent Hook (Gemini CLI)
# Logs sub-agent completion (maps to Claude's SubagentStop)

set -euo pipefail

INPUT=$(cat)

AGENT_NAME=$(echo "$INPUT" | grep -o '"agent_name":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$AGENT_NAME" ] && AGENT_NAME="unknown"

CWD=$(echo "$INPUT" | grep -o '"cwd":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$CWD" ] && CWD="${GEMINI_PROJECT_DIR:-.}"

LOG_DIR="$CWD/RLM/progress/logs"
mkdir -p "$LOG_DIR"

NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%SZ")

LOG_ENTRY="{\"timestamp\":\"$NOW\",\"event\":\"agent.stop\",\"agentName\":\"$AGENT_NAME\",\"source\":\"gemini-cli\"}"
echo "$LOG_ENTRY" >> "$LOG_DIR/subagents.jsonl"

echo '{"status":"ok"}'
exit 0
