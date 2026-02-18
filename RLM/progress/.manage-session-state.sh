#!/usr/bin/env bash
# Session State Management Utility for RLM Pipeline
# This script provides functions to read, update, and manage session state

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROGRESS_DIR="$SCRIPT_DIR"
SESSION_STATE_FILE="$PROGRESS_DIR/session-state.json"
CHECKPOINT_FILE="$PROGRESS_DIR/checkpoint.json"
CONTEXT_FILE="$PROGRESS_DIR/.session-context.md"

# Action to perform (init, update, read, checkpoint, history)
ACTION="${1:-read}"

get_timestamp() {
    date -u +"%Y-%m-%dT%H:%M:%SZ"
}

read_session_state() {
    if [[ -f "$SESSION_STATE_FILE" ]]; then
        cat "$SESSION_STATE_FILE"
    else
        echo "null"
    fi
}

write_session_state() {
    local state="$1"
    echo "$state" | jq '.' > "$SESSION_STATE_FILE"
}

initialize_session_state() {
    local session_id="$2"
    local pipeline_id="$3"
    local phase="${4:-1}"
    local automation_level="${5:-auto}"
    local timestamp
    timestamp="$(get_timestamp)"
    
    local branch
    branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
    
    local commit
    commit="$(git rev-parse --short HEAD 2>/dev/null || echo 'null')"
    
    local state
    state=$(cat <<EOF
{
  "session_id": "$session_id",
  "pipeline_id": "$pipeline_id",
  "started_at": "$timestamp",
  "last_activity": "$timestamp",
  "status": "active",
  "current_phase": $phase,
  "current_agent": "rlm-orchestrator",
  "automation_level": "$automation_level",
  "context": {
    "active_feature": null,
    "active_task": null,
    "last_checkpoint": "$timestamp",
    "token_usage": 0,
    "token_threshold_50_warned": false,
    "token_threshold_75_warned": false,
    "token_threshold_90_warned": false
  },
  "history": [
    {
      "timestamp": "$timestamp",
      "event": "session_started",
      "phase": $phase,
      "agent": "rlm-orchestrator",
      "description": "Session initialized"
    }
  ],
  "metadata": {
    "workspace": "$PWD",
    "branch": "$branch",
    "last_commit": "$commit"
  }
}
EOF
)
    
    write_session_state "$state"
    echo "✓ Session state initialized: $session_id"
}

update_session_state() {
    local event="$2"
    local description="${3:-}"
    local timestamp
    timestamp="$(get_timestamp)"
    
    local state
    state="$(read_session_state)"
    
    if [[ "$state" == "null" ]]; then
        echo "Error: No active session state found. Initialize first." >&2
        exit 1
    fi
    
    # Update last_activity
    state=$(echo "$state" | jq --arg ts "$timestamp" '.last_activity = $ts')
    
    # Add history entry
    if [[ -n "$event" ]]; then
        local phase
        phase=$(echo "$state" | jq -r '.current_phase')
        local agent
        agent=$(echo "$state" | jq -r '.current_agent')
        
        local history_entry
        history_entry=$(cat <<EOF
{
  "timestamp": "$timestamp",
  "event": "$event",
  "phase": $phase,
  "agent": "$agent",
  "description": "$description"
}
EOF
)
        
        state=$(echo "$state" | jq --argjson entry "$history_entry" '.history += [$entry]')
    fi
    
    write_session_state "$state"
    echo "✓ Session state updated: $event"
}

save_checkpoint() {
    local state
    state="$(read_session_state)"
    
    if [[ "$state" == "null" ]]; then
        echo "Error: No active session state found." >&2
        exit 1
    fi
    
    local session_id
    session_id=$(echo "$state" | jq -r '.session_id')
    local pipeline_id
    pipeline_id=$(echo "$state" | jq -r '.pipeline_id')
    local phase
    phase=$(echo "$state" | jq -r '.current_phase')
    local status
    status=$(echo "$state" | jq -r '.status')
    local started_at
    started_at=$(echo "$state" | jq -r '.started_at')
    local last_activity
    last_activity=$(echo "$state" | jq -r '.last_activity')
    
    local checkpoint
    checkpoint="$(cat "$CHECKPOINT_FILE")"
    
    # Update last session
    checkpoint=$(echo "$checkpoint" | jq \
        --arg sid "$session_id" \
        --arg pid "$pipeline_id" \
        --arg sa "$started_at" \
        --arg st "$status" \
        --argjson ph "$phase" \
        '.lastSession.sessionId = $sid | 
         .lastSession.startedAt = $sa |
         .lastSession.pipeline_id = $pid |
         .lastSession.phase = $ph |
         .lastSession.status = $st')
    
    # Check if session exists in sessions array
    local session_exists
    session_exists=$(echo "$checkpoint" | jq --arg sid "$session_id" '[.sessions[] | select(.sessionId == $sid)] | length')
    
    if [[ "$session_exists" -eq 0 ]]; then
        # Add new session to array
        local new_session
        new_session=$(cat <<EOF
{
  "sessionId": "$session_id",
  "reason": "checkpoint_save",
  "startedAt": "$started_at",
  "pipeline_id": "$pipeline_id",
  "phase": $phase,
  "status": "$status",
  "lastActivity": "$last_activity"
}
EOF
)
        checkpoint=$(echo "$checkpoint" | jq --argjson sess "$new_session" '.sessions += [$sess]')
    else
        # Update existing session
        checkpoint=$(echo "$checkpoint" | jq \
            --arg sid "$session_id" \
            --argjson ph "$phase" \
            --arg st "$status" \
            --arg la "$last_activity" \
            '(.sessions[] | select(.sessionId == $sid)) |= 
             (.phase = $ph | .status = $st | .lastActivity = $la)')
    fi
    
    echo "$checkpoint" | jq '.' > "$CHECKPOINT_FILE"
    
    # Update checkpoint timestamp in session state
    local timestamp
    timestamp="$(get_timestamp)"
    state=$(echo "$state" | jq --arg ts "$timestamp" '.context.last_checkpoint = $ts')
    write_session_state "$state"
    
    echo "✓ Checkpoint saved"
}

show_session_history() {
    local state
    state="$(read_session_state)"
    
    if [[ "$state" == "null" ]]; then
        echo "Error: No active session state found." >&2
        exit 1
    fi
    
    local session_id
    session_id=$(echo "$state" | jq -r '.session_id')
    local pipeline_id
    pipeline_id=$(echo "$state" | jq -r '.pipeline_id')
    
    echo ""
    echo "=== Session History ==="
    echo "Session: $session_id"
    echo "Pipeline: $pipeline_id"
    echo ""
    
    echo "$state" | jq -r '.history[] | "[\(.timestamp)] \(.event)\n  → \(.description)"'
    echo ""
}

# Main execution
case "$ACTION" in
    init)
        initialize_session_state "$@"
        ;;
    update)
        update_session_state "$@"
        ;;
    read)
        read_session_state
        ;;
    checkpoint)
        save_checkpoint
        ;;
    history)
        show_session_history
        ;;
    *)
        echo "Usage: $0 {init|update|read|checkpoint|history} [arguments...]"
        exit 1
        ;;
esac
