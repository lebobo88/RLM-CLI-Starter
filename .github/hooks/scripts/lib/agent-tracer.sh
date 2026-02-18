#!/usr/bin/env bash
# Agent Tracer Library
# Sub-agent trace logging for observability
# Source this file: . "$(dirname "$0")/lib/agent-tracer.sh"

start_agent_trace() {
    local agent_id="$1"
    local session_id="${2:-}"
    local project_dir="${3:-.}"

    local log_dir="$project_dir/RLM/progress/logs/agents"
    mkdir -p "$log_dir"

    local now
    now=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%SZ")

    local log_entry="{\"timestamp\":\"$now\",\"event\":\"agent.start\",\"agentId\":\"$agent_id\",\"sessionId\":\"$session_id\"}"
    echo "$log_entry" >> "$log_dir/$agent_id.jsonl"
}

stop_agent_trace() {
    local agent_id="$1"
    local session_id="${2:-}"
    local project_dir="${3:-.}"

    local log_dir="$project_dir/RLM/progress/logs/agents"
    mkdir -p "$log_dir"

    local now
    now=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%SZ")

    local log_entry="{\"timestamp\":\"$now\",\"event\":\"agent.stop\",\"agentId\":\"$agent_id\",\"sessionId\":\"$session_id\"}"
    echo "$log_entry" >> "$log_dir/$agent_id.jsonl"
}

add_agent_event() {
    local agent_id="$1"
    local event_type="$2"
    local session_id="${3:-}"
    local project_dir="${4:-.}"

    local log_dir="$project_dir/RLM/progress/logs/agents"
    mkdir -p "$log_dir"

    local now
    now=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%SZ")

    local log_entry="{\"timestamp\":\"$now\",\"event\":\"$event_type\",\"agentId\":\"$agent_id\",\"sessionId\":\"$session_id\"}"
    echo "$log_entry" >> "$log_dir/$agent_id.jsonl"
}
