#!/bin/bash
# RLM UserPromptSubmit Hook — Inject pipeline context before every user prompt
INPUT=$(cat)

CWD=$(echo "$INPUT" | grep -o '"cwd"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"cwd"[[:space:]]*:[[:space:]]*"//;s/"$//' 2>/dev/null)
if [ -z "$CWD" ]; then CWD="${CLAUDE_PROJECT_DIR:-.}"; fi

CONTEXT_FILE="$CWD/RLM/progress/.current-context.md"
if [ -f "$CONTEXT_FILE" ]; then
    CONTEXT=$(cat "$CONTEXT_FILE" 2>/dev/null)
    if [ -n "$CONTEXT" ]; then
        ESCAPED=$(echo "$CONTEXT" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))" 2>/dev/null || echo "\"$CONTEXT\"")
        echo "{\"additionalContext\":$ESCAPED}"
    fi
fi

exit 0
