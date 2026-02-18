#!/bin/bash
# RLM Pre-Tool Safety Hook for Edit/Write tools (Copilot CLI)
# Validates structure of protected RLM progress files and blocks directory-level paths
# Copilot CLI stdin JSON: { toolName, toolArgs, ... }
# Output: JSON with permissionDecision
INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName')

# Only check edit/write type tools
if [ "$TOOL_NAME" != "editFile" ] && [ "$TOOL_NAME" != "writeFile" ] && [ "$TOOL_NAME" != "insertEdit" ]; then
  echo '{"permissionDecision":"allow"}'
  exit 0
fi

# Parse file path from toolArgs
FILE_PATH=$(echo "$INPUT" | jq -r '.toolArgs' | jq -r '.filePath // .file_path // empty')
if [ -z "$FILE_PATH" ]; then
  echo '{"permissionDecision":"allow"}'
  exit 0
fi

# Normalize path separators
FILE_PATH=$(echo "$FILE_PATH" | sed 's|\\|/|g')

# --- Validate protected progress files ---
if [ "$TOOL_NAME" = "writeFile" ]; then
  NEW_CONTENT=$(echo "$INPUT" | jq -r '.toolArgs' | jq -r '.content // empty')

  validate_progress_file() {
    local file_pattern="$1"
    shift
    local required_fields=("$@")

    case "$FILE_PATH" in
      *"$file_pattern")
        CONTENT_LEN=${#NEW_CONTENT}
        if [ "$CONTENT_LEN" -lt 10 ]; then
          echo '{"permissionDecision":"deny","permissionDecisionReason":"Blocked: writeFile with near-empty content to protected RLM progress file ('"$FILE_PATH"')."}'
          exit 0
        fi

        if ! echo "$NEW_CONTENT" | jq empty 2>/dev/null; then
          echo '{"permissionDecision":"deny","permissionDecisionReason":"Blocked: writeFile to '"$FILE_PATH"' contains invalid JSON."}'
          exit 0
        fi

        for field in "${required_fields[@]}"; do
          if ! echo "$NEW_CONTENT" | jq -e "has(\"$field\")" >/dev/null 2>&1; then
            echo '{"permissionDecision":"deny","permissionDecisionReason":"Blocked: writeFile to '"$FILE_PATH"' missing required field '"'$field'"'. Destructive payload rejected."}'
            exit 0
          fi
        done

        # Extra check for status.json: block empty arrays
        if [ "$file_pattern" = "RLM/progress/status.json" ]; then
          for array_field in tasks completedTasks; do
            has_field=$(echo "$NEW_CONTENT" | jq -e "has(\"$array_field\")" 2>/dev/null)
            if [ "$has_field" = "true" ]; then
              array_len=$(echo "$NEW_CONTENT" | jq -r ".$array_field | length" 2>/dev/null)
              if [ "$array_len" = "0" ]; then
                echo '{"permissionDecision":"deny","permissionDecisionReason":"Blocked: writeFile to '"$FILE_PATH"' has empty array '"'$array_field'"'. This looks like a destructive payload."}'
                exit 0
              fi
            fi
          done
        fi
        ;;
    esac
  }

  validate_progress_file "RLM/progress/status.json" "status"
  validate_progress_file "RLM/progress/checkpoint.json" "lastSession"
  validate_progress_file "RLM/progress/pipeline-state.json" "current_phase"
fi

# --- Block directory-level paths ---
case "$FILE_PATH" in
  */RLM/specs/|*/RLM/specs|*/RLM/tasks/|*/RLM/tasks|*/RLM/progress/|*/RLM/progress)
    echo '{"permissionDecision":"deny","permissionDecisionReason":"Blocked: cannot edit/write a directory path ('"$FILE_PATH"'). Target individual files instead."}'
    exit 0
    ;;
esac

# Allow by default
echo '{"permissionDecision":"allow"}'
exit 0
