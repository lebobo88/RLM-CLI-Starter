#!/usr/bin/env bash
# Code Writer Pre-Write Hook
# Blocks writes to test files

set -euo pipefail

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name":"[^"]*"' | head -1 | cut -d'"' -f4)
[ "$TOOL_NAME" != "Write" ] && [ "$TOOL_NAME" != "Edit" ] && exit 0

FILE_PATH=$(echo "$INPUT" | grep -o '"file_path":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$FILE_PATH" ] && exit 0

FILE_PATH=$(echo "$FILE_PATH" | tr '\' '/')

if echo "$FILE_PATH" | grep -qE '\.(test|spec)\.(ts|tsx|js|jsx)$'; then
    echo '{"decision":"block","reason":"Code writer agent cannot write to test files."}'
    exit 2
fi

exit 0
