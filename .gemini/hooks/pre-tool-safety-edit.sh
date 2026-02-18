#!/bin/bash
# RLM Pre-Tool Safety Hook for write_file/replace (Gemini CLI)
# Validates structure of protected RLM progress files and blocks directory-level paths
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

# --- Validate protected progress files via required field checks ---
if [ "$TOOL_NAME" = "write_file" ]; then
  validate_progress_file() {
    local file_pattern="$1"
    shift
    local required_fields=("$@")

    case "$FILE_PATH" in
      *"$file_pattern")
        CONTENT_LEN=${#NEW_CONTENT}
        if [ "$CONTENT_LEN" -lt 10 ]; then
          echo '{"blocked":true,"reason":"Blocked: write_file with near-empty content to protected RLM progress file ('"$FILE_PATH"'). Use replace for incremental updates."}' >&1
          exit 2
        fi

        if command -v jq >/dev/null 2>&1; then
          if ! echo "$NEW_CONTENT" | jq empty 2>/dev/null; then
            echo '{"blocked":true,"reason":"Blocked: write_file to '"$FILE_PATH"' contains invalid JSON."}' >&1
            exit 2
          fi

          for field in "${required_fields[@]}"; do
            if ! echo "$NEW_CONTENT" | jq -e "has(\"$field\")" >/dev/null 2>&1; then
              echo '{"blocked":true,"reason":"Blocked: write_file to '"$FILE_PATH"' missing required field '"'$field'"'. Destructive payload rejected."}' >&1
              exit 2
            fi
          done

          # Extra check for status.json: block empty arrays
          if [ "$file_pattern" = "RLM/progress/status.json" ]; then
            for array_field in tasks completedTasks; do
              has_field=$(echo "$NEW_CONTENT" | jq -e "has(\"$array_field\")" 2>/dev/null)
              if [ "$has_field" = "true" ]; then
                array_len=$(echo "$NEW_CONTENT" | jq -r ".$array_field | length" 2>/dev/null)
                if [ "$array_len" = "0" ]; then
                  echo '{"blocked":true,"reason":"Blocked: write_file to '"$FILE_PATH"' has empty array '"'$array_field'"'. This looks like a destructive payload."}' >&1
                  exit 2
                fi
              fi
            done
          fi
        fi
        ;;
    esac
  }

  validate_progress_file "RLM/progress/status.json" "status"
  validate_progress_file "RLM/progress/checkpoint.json" "lastSession"
  validate_progress_file "RLM/progress/pipeline-state.json" "current_phase"
fi

# --- Block any write_file/replace that targets a directory-level path ---
case "$FILE_PATH" in
  */RLM/specs/|*/RLM/specs|*/RLM/tasks/|*/RLM/tasks|*/RLM/progress/|*/RLM/progress)
    echo '{"blocked":true,"reason":"Blocked: cannot write_file/replace a directory path ('"$FILE_PATH"'). Target individual files instead."}' >&1
    exit 2
    ;;
esac

# Allow by default
exit 0
