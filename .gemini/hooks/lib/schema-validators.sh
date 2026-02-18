#!/bin/bash
# Schema Validators for RLM State Files
# Lightweight structural validation (requires jq)

# Validate checkpoint.json structure
# Returns: empty string on success, error message on failure
validate_checkpoint_schema() {
  local json_content="$1"

  if ! command -v jq >/dev/null 2>&1; then
    echo ""  # Can't validate without jq, pass
    return 0
  fi

  # Required: lastSession object
  if ! echo "$json_content" | jq -e 'has("lastSession")' >/dev/null 2>&1; then
    echo "Missing required field: lastSession"
    return 1
  fi

  # Required: lastSession.endedAt
  if ! echo "$json_content" | jq -e '.lastSession | has("endedAt")' >/dev/null 2>&1; then
    echo "Missing required field: lastSession.endedAt"
    return 1
  fi

  # Validate ISO 8601 date format
  local ended_at
  ended_at=$(echo "$json_content" | jq -r '.lastSession.endedAt // empty')
  if [ -n "$ended_at" ]; then
    if ! echo "$ended_at" | grep -qE '^[0-9]{4}-[0-9]{2}-[0-9]{2}T'; then
      echo "lastSession.endedAt is not ISO 8601 format: $ended_at"
      return 1
    fi
  fi

  # Optional: generations must be array if present
  has_gen=$(echo "$json_content" | jq -e 'has("generations")' 2>/dev/null)
  if [ "$has_gen" = "true" ]; then
    if ! echo "$json_content" | jq -e '.generations | type == "array"' >/dev/null 2>&1; then
      echo "generations must be an array"
      return 1
    fi
  fi

  echo ""
  return 0
}

# Validate pipeline-state.json structure
validate_pipeline_state_schema() {
  local json_content="$1"

  if ! command -v jq >/dev/null 2>&1; then
    echo ""
    return 0
  fi

  if ! echo "$json_content" | jq -e 'has("current_phase")' >/dev/null 2>&1; then
    echo "Missing required field: current_phase"
    return 1
  fi

  echo ""
  return 0
}

# Validate status.json structure
validate_status_schema() {
  local json_content="$1"

  if ! command -v jq >/dev/null 2>&1; then
    echo ""
    return 0
  fi

  if ! echo "$json_content" | jq -e 'has("status")' >/dev/null 2>&1; then
    echo "Missing required field: status"
    return 1
  fi

  # Optional: currentTask must match TASK-NNN
  local current_task
  current_task=$(echo "$json_content" | jq -r '.currentTask // empty')
  if [ -n "$current_task" ]; then
    if ! echo "$current_task" | grep -qE '^TASK-[0-9]{3}'; then
      echo "currentTask must match TASK-NNN format, got: $current_task"
      return 1
    fi
  fi

  echo ""
  return 0
}
