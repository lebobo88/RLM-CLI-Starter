#!/bin/bash
# RLM Pre-Tool Safety Hook — blocks destructive operations on RLM specs
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName')

if [ "$TOOL_NAME" != "bash" ] && [ "$TOOL_NAME" != "shell" ] && [ "$TOOL_NAME" != "powershell" ]; then
  echo '{"permissionDecision":"allow"}'
  exit 0
fi

COMMAND=$(echo "$INPUT" | jq -r '.toolArgs' | jq -r '.command')

if echo "$COMMAND" | grep -qE "rm -rf RLM/specs|rm -rf RLM/tasks"; then
  echo '{"permissionDecision":"deny","permissionDecisionReason":"Blocked: destructive operation on RLM artifacts."}'
  exit 0
fi

# Allow by default — explicit permission decision
echo '{"permissionDecision":"allow"}'
exit 0
