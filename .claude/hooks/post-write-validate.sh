#!/bin/bash
# RLM PostToolUse Validation Hook — Validates source file quality after Write/Edit
# Claude Code stdin JSON: { tool_name, tool_input, tool_result, session_id, cwd }
# Blocking: exit 2 with structured JSON on quality issues

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"tool_name"[[:space:]]*:[[:space:]]*"//;s/"$//' 2>/dev/null)

if [ "$TOOL_NAME" != "Write" ] && [ "$TOOL_NAME" != "Edit" ]; then exit 0; fi

FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//;s/"$//' 2>/dev/null)
if [ -z "$FILE_PATH" ]; then exit 0; fi

# Skip non-source files
case "$FILE_PATH" in
    *.ts|*.tsx|*.js|*.jsx|*.py|*.css) ;;
    *) exit 0 ;;
esac

# Skip test files
case "$FILE_PATH" in
    *.test.*|*.spec.*) exit 0 ;;
esac

# Skip RLM artifacts
case "$FILE_PATH" in
    */RLM/*) exit 0 ;;
esac

CWD=$(echo "$INPUT" | grep -o '"cwd"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"cwd"[[:space:]]*:[[:space:]]*"//;s/"$//' 2>/dev/null)
if [ -z "$CWD" ]; then CWD="${CLAUDE_PROJECT_DIR:-.}"; fi

RESOLVED="$FILE_PATH"
case "$FILE_PATH" in
    /*) ;;
    *) RESOLVED="$CWD/$FILE_PATH" ;;
esac

if [ ! -f "$RESOLVED" ]; then exit 0; fi

ISSUES=""

# Check for TypeScript 'any' usage
case "$FILE_PATH" in
    *.ts|*.tsx)
        ANY_COUNT=$(grep -c ':\s*any\b' "$RESOLVED" 2>/dev/null || echo "0")
        if [ "$ANY_COUNT" -gt 0 ]; then
            ISSUES="TypeScript 'any' detected ($ANY_COUNT instances)"
        fi
        ;;
esac

# Check for TODO/FIXME markers
MARKER_COUNT=$(grep -cE '\b(TODO|FIXME|HACK|XXX|PLACEHOLDER)\b' "$RESOLVED" 2>/dev/null || echo "0")
if [ "$MARKER_COUNT" -gt 0 ]; then
    MARKERS=$(grep -oE '\b(TODO|FIXME|HACK|XXX|PLACEHOLDER)\b' "$RESOLVED" 2>/dev/null | sort -u | tr '\n' ',' | sed 's/,$//')
    if [ -n "$ISSUES" ]; then ISSUES="$ISSUES; "; fi
    ISSUES="${ISSUES}Incomplete markers found: $MARKERS"
fi

if [ -n "$ISSUES" ]; then
    echo "{\"decision\":\"block\",\"reason\":\"$ISSUES\",\"additionalContext\":\"Fix these code quality issues before continuing. File: $FILE_PATH\"}"
    exit 2
fi

exit 0
