#!/usr/bin/env bash
# Reviewer Stop Hook
# Verifies review report was generated before reviewer agent finishes

set -euo pipefail

INPUT=$(cat)

CWD=$(echo "$INPUT" | grep -o '"cwd":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$CWD" ] && CWD="${CLAUDE_PROJECT_DIR:-.}"

REVIEW_DIR="$CWD/RLM/progress/reviews"

if [ ! -d "$REVIEW_DIR" ]; then
    echo '{"decision":"block","reason":"Reviewer agent must generate a review report in RLM/progress/reviews/ before stopping."}'
    exit 2
fi

# Check for recent review files (modified in last 30 minutes)
RECENT=$(find "$REVIEW_DIR" -name "*.md" -mmin -30 2>/dev/null | head -1)
if [ -z "$RECENT" ]; then
    echo '{"decision":"block","reason":"No recent review report found. Generate a review report before finishing."}'
    exit 2
fi

exit 0
