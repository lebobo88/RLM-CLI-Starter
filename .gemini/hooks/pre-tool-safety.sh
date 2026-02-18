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

if [ -z "$COMMAND" ]; then
  exit 0
fi

# --- Normalize to close bypass vectors ---
NORMALIZED=$(echo "$COMMAND" | sed 's|\\|/|g' | tr -s ' ' | tr -d '"' | tr -d "'" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

if [ -z "$NORMALIZED" ]; then
  echo '{"blocked":true,"reason":"Blocked: failed to normalize command for safety check."}' >&1
  exit 2
fi

# --- Case-insensitive destructive pattern matching ---
BLOCK_MSG='{"blocked":true,"reason":"Blocked: destructive operation on RLM artifacts. Use individual file operations instead."}'

if echo "$NORMALIZED" | grep -iqE "rm\s+-r[f]?\s+.*RLM/(specs|tasks)"; then
  echo "$BLOCK_MSG" >&1
  exit 2
fi

if echo "$NORMALIZED" | grep -iqE "rm\s+-f?r\s+.*RLM/(specs|tasks)"; then
  echo "$BLOCK_MSG" >&1
  exit 2
fi

if echo "$NORMALIZED" | grep -iqE "Remove-Item.*RLM/(specs|tasks).*-Recurse"; then
  echo "$BLOCK_MSG" >&1
  exit 2
fi

if echo "$NORMALIZED" | grep -iqE "Remove-Item.*-Recurse.*RLM/(specs|tasks)"; then
  echo "$BLOCK_MSG" >&1
  exit 2
fi

if echo "$NORMALIZED" | grep -iqE "(del|rmdir|rd)\s+/s.*RLM/(specs|tasks)"; then
  echo "$BLOCK_MSG" >&1
  exit 2
fi

# Allow by default
exit 0
