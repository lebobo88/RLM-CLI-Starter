#!/bin/bash
# RLM Pre-Tool Safety Hook (Copilot CLI) — blocks destructive operations on RLM specs
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName')

if [ "$TOOL_NAME" != "bash" ] && [ "$TOOL_NAME" != "shell" ] && [ "$TOOL_NAME" != "powershell" ]; then
  echo '{"permissionDecision":"allow"}'
  exit 0
fi

COMMAND=$(echo "$INPUT" | jq -r '.toolArgs' | jq -r '.command')

if [ -z "$COMMAND" ]; then
  echo '{"permissionDecision":"allow"}'
  exit 0
fi

# --- Normalize to close bypass vectors ---
NORMALIZED=$(echo "$COMMAND" | sed 's|\\|/|g' | tr -s ' ' | tr -d '"' | tr -d "'" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

if [ -z "$NORMALIZED" ]; then
  echo '{"permissionDecision":"deny","permissionDecisionReason":"Blocked: failed to normalize command for safety check."}'
  exit 0
fi

# --- Case-insensitive destructive pattern matching ---
DENY_MSG='{"permissionDecision":"deny","permissionDecisionReason":"Blocked: destructive operation on RLM artifacts. Use individual file operations instead."}'

if echo "$NORMALIZED" | grep -iqE "rm\s+-r[f]?\s+.*RLM/(specs|tasks)"; then
  echo "$DENY_MSG"
  exit 0
fi

if echo "$NORMALIZED" | grep -iqE "rm\s+-f?r\s+.*RLM/(specs|tasks)"; then
  echo "$DENY_MSG"
  exit 0
fi

if echo "$NORMALIZED" | grep -iqE "Remove-Item.*RLM/(specs|tasks).*-Recurse"; then
  echo "$DENY_MSG"
  exit 0
fi

if echo "$NORMALIZED" | grep -iqE "Remove-Item.*-Recurse.*RLM/(specs|tasks)"; then
  echo "$DENY_MSG"
  exit 0
fi

if echo "$NORMALIZED" | grep -iqE "(del|rmdir|rd)\s+/s.*RLM/(specs|tasks)"; then
  echo "$DENY_MSG"
  exit 0
fi

# Allow by default — explicit permission decision
echo '{"permissionDecision":"allow"}'
exit 0
