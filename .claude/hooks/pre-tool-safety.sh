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

if [ -z "$COMMAND" ]; then
  exit 0
fi

# --- Normalize to close bypass vectors ---
NORMALIZED=$(echo "$COMMAND" | sed 's|\\|/|g' | tr -s ' ' | tr -d '"' | tr -d "'" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

if [ -z "$NORMALIZED" ]; then
  # Normalization produced empty string — block for safety
  echo "Blocked: failed to normalize command for safety check." >&2
  exit 2
fi

# --- Case-insensitive destructive pattern matching ---
if echo "$NORMALIZED" | grep -iqE "rm\s+-r[f]?\s+.*RLM/(specs|tasks)"; then
  echo "Blocked: destructive operation on RLM artifacts. Use individual file operations instead." >&2
  exit 2
fi

if echo "$NORMALIZED" | grep -iqE "rm\s+-f?r\s+.*RLM/(specs|tasks)"; then
  echo "Blocked: destructive operation on RLM artifacts. Use individual file operations instead." >&2
  exit 2
fi

if echo "$NORMALIZED" | grep -iqE "Remove-Item.*RLM/(specs|tasks).*-Recurse"; then
  echo "Blocked: destructive operation on RLM artifacts. Use individual file operations instead." >&2
  exit 2
fi

if echo "$NORMALIZED" | grep -iqE "Remove-Item.*-Recurse.*RLM/(specs|tasks)"; then
  echo "Blocked: destructive operation on RLM artifacts. Use individual file operations instead." >&2
  exit 2
fi

if echo "$NORMALIZED" | grep -iqE "(del|rmdir|rd)\s+/s.*RLM/(specs|tasks)"; then
  echo "Blocked: destructive operation on RLM artifacts. Use individual file operations instead." >&2
  exit 2
fi

# Allow by default
exit 0
