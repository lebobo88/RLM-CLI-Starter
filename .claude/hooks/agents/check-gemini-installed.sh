#!/usr/bin/env bash
# Check Gemini CLI Installed
# Verifies gemini CLI exists before use by gemini-analyzer sub-agent

set -euo pipefail

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name":"[^"]*"' | head -1 | cut -d'"' -f4)
[ "$TOOL_NAME" != "Bash" ] && exit 0

COMMAND=$(echo "$INPUT" | grep -o '"command":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$COMMAND" ] && exit 0
echo "$COMMAND" | grep -q '\bgemini\b' || exit 0

if ! command -v gemini &>/dev/null; then
    echo '{"decision":"block","reason":"Gemini CLI is not installed or not in PATH."}'
    exit 2
fi

exit 0
