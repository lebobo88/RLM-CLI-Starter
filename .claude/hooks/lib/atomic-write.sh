#!/bin/bash
# Atomic Write Library for RLM State Files
# Writes via temp file + validate + rename to prevent corruption from crashes/interrupts

# Write JSON data atomically with validation
# Usage: write_atomic_json "/path/to/file.json" '{"key":"value"}'
# Returns: 0 on success, 1 on failure (error on stderr)
write_atomic_json() {
  local file_path="$1"
  local json_content="$2"

  # Validate JSON if jq is available
  if command -v jq >/dev/null 2>&1; then
    if ! echo "$json_content" | jq empty 2>/dev/null; then
      echo "JSON validation failed" >&2
      return 1
    fi
  fi

  # Create backup of existing file
  if [ -f "$file_path" ]; then
    local bak_path="${file_path}.bak"
    local bak2="${bak_path}.2"
    local bak3="${bak_path}.3"

    # Rotate backups: keep last 3
    [ -f "$bak2" ] && mv -f "$bak2" "$bak3" 2>/dev/null
    [ -f "$bak_path" ] && cp -f "$bak_path" "$bak2" 2>/dev/null
    cp -f "$file_path" "$bak_path"
  fi

  # Write to temp file
  local temp_path
  temp_path=$(mktemp "${file_path}.tmp.XXXXXX") || {
    echo "Failed to create temp file" >&2
    return 1
  }

  echo "$json_content" > "$temp_path"

  # Verify temp file
  if command -v jq >/dev/null 2>&1; then
    if ! jq empty "$temp_path" 2>/dev/null; then
      rm -f "$temp_path"
      echo "Temp file JSON verification failed" >&2
      return 1
    fi
  fi

  # Atomic rename
  mv -f "$temp_path" "$file_path" || {
    rm -f "$temp_path"
    echo "Atomic rename failed" >&2
    return 1
  }

  return 0
}

# Write any file atomically
# Usage: write_atomic_file "/path/to/file" "content"
write_atomic_file() {
  local file_path="$1"
  local content="$2"

  local temp_path
  temp_path=$(mktemp "${file_path}.tmp.XXXXXX") || {
    echo "Failed to create temp file" >&2
    return 1
  }

  echo "$content" > "$temp_path"
  mv -f "$temp_path" "$file_path" || {
    rm -f "$temp_path"
    echo "Atomic rename failed" >&2
    return 1
  }

  return 0
}
