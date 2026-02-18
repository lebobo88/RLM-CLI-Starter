#!/usr/bin/env bash
# Spec Format Validation Hook (Claude Code)
# Validates FTR-XXX/ADR-XXX naming in spec paths after Edit/Write
# Claude Code stdin JSON: { tool_name, tool_input, session_id, cwd, hook_event_name }

set -euo pipefail

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ "$TOOL_NAME" != "Edit" ] && [ "$TOOL_NAME" != "Write" ]; then
    exit 0
fi

FILE_PATH=$(echo "$INPUT" | grep -o '"file_path":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Normalize path
FILE_PATH=$(echo "$FILE_PATH" | tr '\' '/')

# Only validate spec files
case "$FILE_PATH" in
    */RLM/specs/*) ;;
    *) exit 0 ;;
esac

CWD=$(echo "$INPUT" | grep -o '"cwd":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$CWD" ]; then
    CWD="${CLAUDE_PROJECT_DIR:-.}"
fi

LOG_DIR="$CWD/RLM/progress/logs"
mkdir -p "$LOG_DIR"

NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%SZ")

# Validate feature spec paths match FTR-XXX pattern
if echo "$FILE_PATH" | grep -q '/RLM/specs/features/'; then
    if ! echo "$FILE_PATH" | grep -qE '/features/FTR-[0-9]{3}'; then
        LOG_ENTRY="{\"timestamp\":\"$NOW\",\"event\":\"spec.validate.warn\",\"file\":\"$FILE_PATH\",\"warning\":\"Feature spec path does not match FTR-XXX pattern\"}"
        echo "$LOG_ENTRY" >> "$LOG_DIR/spec-validation.jsonl"
        echo "WARNING: Feature spec path '$FILE_PATH' does not match expected FTR-XXX pattern" >&2
    fi
fi

# Validate ADR paths match ADR-XXX pattern
if echo "$FILE_PATH" | grep -q '/RLM/specs/architecture/decisions/'; then
    if ! echo "$FILE_PATH" | grep -qE '/decisions/ADR-[0-9]{3}'; then
        LOG_ENTRY="{\"timestamp\":\"$NOW\",\"event\":\"spec.validate.warn\",\"file\":\"$FILE_PATH\",\"warning\":\"ADR path does not match ADR-XXX pattern\"}"
        echo "$LOG_ENTRY" >> "$LOG_DIR/spec-validation.jsonl"
        echo "WARNING: ADR path '$FILE_PATH' does not match expected ADR-XXX pattern" >&2
    fi
fi

exit 0
