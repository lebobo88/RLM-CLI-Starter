#!/bin/bash
# RLM Pre-Tool Safety Hook for write_file/replace (Gemini CLI)
# Blocks bulk overwrites of protected RLM artifact directories via write_file/replace tools
# Gemini CLI stdin JSON: { tool_name, arguments, session_id, cwd, hook_event_name }
# Blocking: exit code 2 with reason as JSON on stdout
INPUT=$(cat)

# Parse JSON fields — use jq if available, fall back to grep/sed
if command -v jq >/dev/null 2>&1; then
  TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
  FILE_PATH=$(echo "$INPUT" | jq -r '.arguments.file_path // empty')
  NEW_CONTENT=$(echo "$INPUT" | jq -r '.arguments.content // empty')
else
  TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"tool_name"[[:space:]]*:[[:space:]]*"//;s/"$//')
  FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//;s/"$//')
  NEW_CONTENT=$(echo "$INPUT" | grep -o '"content"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"content"[[:space:]]*:[[:space:]]*"//;s/"$//')
fi

# Only check write_file and replace tools
if [ "$TOOL_NAME" != "write_file" ] && [ "$TOOL_NAME" != "replace" ]; then
  exit 0
fi

# Normalize path separators for cross-platform
FILE_PATH=$(echo "$FILE_PATH" | sed 's|\\|/|g')

# Block writes that target protected RLM progress tracking files with near-empty content
if [ "$TOOL_NAME" = "write_file" ]; then
  case "$FILE_PATH" in
    */RLM/progress/status.json|*/RLM/progress/checkpoint.json|*/RLM/progress/pipeline-state.json)
      CONTENT_LEN=${#NEW_CONTENT}
      if [ "$CONTENT_LEN" -lt 10 ]; then
        # Gemini CLI: block via JSON on stdout
        echo '{"blocked":true,"reason":"Blocked: write_file with near-empty content to protected RLM progress file ('"$FILE_PATH"'). Use replace for incremental updates."}' >&1
        exit 2
      fi
      ;;
  esac
fi

# Block any write_file/replace that targets a directory-level path
case "$FILE_PATH" in
  */RLM/specs/|*/RLM/specs|*/RLM/tasks/|*/RLM/tasks|*/RLM/progress/|*/RLM/progress)
    # Gemini CLI: block via JSON on stdout
    echo '{"blocked":true,"reason":"Blocked: cannot write_file/replace a directory path ('"$FILE_PATH"'). Target individual files instead."}' >&1
    exit 2
    ;;
esac

# Allow by default
exit 0
