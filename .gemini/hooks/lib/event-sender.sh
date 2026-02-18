#!/bin/bash
# Universal Event Sender for RLM Observability
# Source: . "$SCRIPT_DIR/lib/event-sender.sh"
# Single point of event emission for all hooks

send_rlm_event() {
    local event_type="$1"
    local session_id="${2:-}"
    local agent_id="${3:-}"
    local project_dir="${4:-.}"
    local extra_data="${5:-}"

    local log_dir="$project_dir/RLM/progress/logs"
    mkdir -p "$log_dir" 2>/dev/null

    local trace_id="${RLM_TRACE_ID:-}"
    local parent_trace_id="${RLM_PARENT_TRACE_ID:-}"
    local now
    now=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%SZ")

    local data_field
    if [ -n "$extra_data" ]; then
        data_field="$extra_data"
    else
        data_field="{}"
    fi

    echo "{\"timestamp\":\"$now\",\"event_type\":\"$event_type\",\"session_id\":\"$session_id\",\"agent_id\":\"$agent_id\",\"trace_id\":\"$trace_id\",\"parent_trace_id\":\"$parent_trace_id\",\"data\":$data_field}" >> "$log_dir/events.jsonl"
}
