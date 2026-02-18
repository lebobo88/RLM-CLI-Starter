#!/usr/bin/env bash
# Test Writer Pre-Write Hook
# Blocks writes to implementation files

set -euo pipefail

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name":"[^"]*"' | head -1 | cut -d'"' -f4)
[ "$TOOL_NAME" != "Write" ] && [ "$TOOL_NAME" != "Edit" ] && exit 0

FILE_PATH=$(echo "$INPUT" | grep -o '"file_path":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$FILE_PATH" ] && exit 0

FILE_PATH=$(echo "$FILE_PATH" | tr '\' '/')

# Allow test files, config, and non-source files
echo "$FILE_PATH" | grep -qE '\.(test|spec)\.(ts|tsx|js|jsx)$' && exit 0
echo "$FILE_PATH" | grep -qE '\.(json|md|yaml|yml|toml|cfg|ini)$' && exit 0
echo "$FILE_PATH" | grep -q '/RLM/' && exit 0

# Block implementation source files
if echo "$FILE_PATH" | grep -qE '\.(ts|tsx|js|jsx)$'; then
    echo '{"decision":"block","reason":"Test writer agent cannot write to implementation files."}'
    exit 2
fi

exit 0
