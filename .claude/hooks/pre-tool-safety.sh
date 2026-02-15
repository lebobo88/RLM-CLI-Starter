#!/bin/bash
# RLM Pre-Tool Safety Hook (Claude Code) — blocks destructive operations on RLM specs
# Claude Code stdin JSON: { tool_name, tool_input, session_id, cwd, hook_event_name }
# Blocking: exit code 2 with reason on stderr
INPUT=$(cat)

# Parse JSON fields — use jq if available, fall back to grep/sed
if command -v jq >/dev/null 2>&1; then
  TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
  COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
else
  TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"tool_name"[[:space:]]*:[[:space:]]*"//;s/"$//')
  COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"command"[[:space:]]*:[[:space:]]*"//;s/"$//')
fi

# Only check Bash tool (Claude Code tool name)
if [ "$TOOL_NAME" != "Bash" ]; then
  exit 0
fi

# Block destructive operations on RLM artifacts
if echo "$COMMAND" | grep -qE "rm -rf RLM/specs|rm -rf RLM/tasks|rm -rf ./RLM/specs|rm -rf ./RLM/tasks"; then
  echo "Blocked: destructive operation on RLM artifacts. Use individual file operations instead." >&2
  exit 2
fi

# Allow by default
exit 0
