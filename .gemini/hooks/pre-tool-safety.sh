#!/bin/bash
# RLM Pre-Tool Safety Hook (Gemini CLI) — blocks destructive operations on RLM specs
# Gemini CLI stdin JSON: { tool_name, arguments, session_id, cwd, hook_event_name }
# Blocking: exit code 2 with reason as JSON on stdout
INPUT=$(cat)

# Parse JSON fields — use jq if available, fall back to grep/sed
if command -v jq >/dev/null 2>&1; then
  TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
  COMMAND=$(echo "$INPUT" | jq -r '.arguments.command // empty')
else
  TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"tool_name"[[:space:]]*:[[:space:]]*"//;s/"$//')
  COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"command"[[:space:]]*:[[:space:]]*"//;s/"$//')
fi

# Only check run_shell_command tool (Gemini CLI tool name)
if [ "$TOOL_NAME" != "run_shell_command" ]; then
  exit 0
fi

# Block destructive operations on RLM artifacts
if echo "$COMMAND" | grep -qE "rm -rf RLM/specs|rm -rf RLM/tasks|rm -rf ./RLM/specs|rm -rf ./RLM/tasks"; then
  # Gemini CLI: block via JSON on stdout
  echo '{"blocked":true,"reason":"Blocked: destructive operation on RLM artifacts. Use individual file operations instead."}' >&1
  exit 2
fi

# Allow by default
exit 0
