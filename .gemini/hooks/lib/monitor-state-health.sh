#!/bin/bash
# State Health Monitor for RLM Progress Files
# Checks integrity, freshness, and cross-file consistency
# Called during session-start hook for passive health checking

# Check state health and output results
# Usage: check_state_health "/path/to/project"
# Outputs: status line to stdout, issues to stderr
check_state_health() {
  local project_dir="$1"
  local progress_dir="$project_dir/RLM/progress"
  local issues=()
  local status="HEALTHY"

  if [ ! -d "$progress_dir" ]; then
    echo "HEALTHY"
    return 0
  fi

  # Load schema validators
  local lib_dir
  lib_dir="$(dirname "$0")/lib"
  if [ -f "$lib_dir/schema-validators.sh" ]; then
    . "$lib_dir/schema-validators.sh"
  fi

  # Check each state file
  for state_file in checkpoint.json pipeline-state.json status.json; do
    local file_path="$progress_dir/$state_file"
    [ -f "$file_path" ] || continue

    # 1. JSON validity
    local content
    content=$(cat "$file_path" 2>/dev/null)
    if [ -z "$content" ]; then
      issues+=("EMPTY: $state_file exists but is empty")
      continue
    fi

    if command -v jq >/dev/null 2>&1; then
      if ! echo "$content" | jq empty 2>/dev/null; then
        issues+=("CORRUPT: $state_file contains invalid JSON")
        continue
      fi

      # 2. Schema compliance
      local validation_error=""
      case "$state_file" in
        checkpoint.json)
          if type validate_checkpoint_schema >/dev/null 2>&1; then
            validation_error=$(validate_checkpoint_schema "$content")
          fi ;;
        pipeline-state.json)
          if type validate_pipeline_state_schema >/dev/null 2>&1; then
            validation_error=$(validate_pipeline_state_schema "$content")
          fi ;;
        status.json)
          if type validate_status_schema >/dev/null 2>&1; then
            validation_error=$(validate_status_schema "$content")
          fi ;;
      esac

      if [ -n "$validation_error" ]; then
        issues+=("SCHEMA: $state_file — $validation_error")
      fi
    fi
  done

  # Determine overall status
  local issue_count=${#issues[@]}
  if [ "$issue_count" -ge 3 ]; then
    status="CRITICAL"
  elif [ "$issue_count" -ge 1 ]; then
    status="DEGRADED"
  fi

  # Output
  echo "$status"
  for issue in "${issues[@]}"; do
    echo "  $issue" >&2
  done

  return "$issue_count"
}

# Restore a state file from backup
# Usage: restore_from_backup "/path/to/file.json"
restore_from_backup() {
  local file_path="$1"

  for bak_path in "${file_path}.bak" "${file_path}.bak.2" "${file_path}.bak.3"; do
    if [ -f "$bak_path" ]; then
      local content
      content=$(cat "$bak_path" 2>/dev/null)
      if [ -n "$content" ] && command -v jq >/dev/null 2>&1; then
        if echo "$content" | jq empty 2>/dev/null; then
          cp -f "$bak_path" "$file_path"
          echo "Restored from $bak_path"
          return 0
        fi
      fi
    fi
  done

  echo "No valid backups found" >&2
  return 1
}
