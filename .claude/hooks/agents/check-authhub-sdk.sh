#!/usr/bin/env bash
# Check AuthHub SDK Prerequisites
# Verifies Node.js and AuthHub SDK are available before gemini-image sub-agent use

set -euo pipefail

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name":"[^"]*"' | head -1 | cut -d'"' -f4)
[ "$TOOL_NAME" != "Bash" ] && exit 0

COMMAND=$(echo "$INPUT" | grep -o '"command":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$COMMAND" ] && exit 0
echo "$COMMAND" | grep -qE 'authhub|AuthHubClient|sdk-typescript' || exit 0

# Check Node.js is installed
if ! command -v node &>/dev/null; then
    echo '{"decision":"block","reason":"Node.js is not installed or not in PATH. Install from: https://nodejs.org — required for AuthHub SDK image generation."}'
    exit 2
fi

# Check AuthHub SDK dist file exists
SDK_PATH="./packages/authhub-sdk/dist/index.cjs"
if [ ! -f "$SDK_PATH" ]; then
    echo "{\"decision\":\"block\",\"reason\":\"AuthHub SDK not found at: $SDK_PATH — Run 'npm install' in the sdk-typescript directory to build the SDK.\"}"
    exit 2
fi

exit 0
