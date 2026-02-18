#!/bin/bash
# File Locking Library for RLM Progress Files
# Provides file-based mutex with timeout to prevent concurrent write corruption

lock_file() {
  local path="$1"
  local timeout="${2:-10}"
  local lock_file="${path}.lock"
  local deadline=$(($(date +%s) + timeout))

  while [ "$(date +%s)" -lt "$deadline" ]; do
    # Attempt to create lock file exclusively using mkdir (atomic on all platforms)
    if mkdir "$lock_file" 2>/dev/null; then
      echo "$$|$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)" > "$lock_file/pid"
      echo "$lock_file"
      return 0
    fi

    # Check if stale (> 60 seconds old)
    if [ -d "$lock_file" ]; then
      lock_mtime=$(stat -c %Y "$lock_file" 2>/dev/null || stat -f %m "$lock_file" 2>/dev/null)
      now=$(date +%s)
      if [ -n "$lock_mtime" ] && [ $((now - lock_mtime)) -gt 60 ]; then
        # Stale lock — force remove and retry
        rm -rf "$lock_file" 2>/dev/null
        continue
      fi
    fi

    sleep 0.1
  done

  # Timeout
  echo ""
  return 1
}

unlock_file() {
  local lock_token="$1"
  if [ -n "$lock_token" ] && [ -d "$lock_token" ]; then
    rm -rf "$lock_token" 2>/dev/null
  fi
}
