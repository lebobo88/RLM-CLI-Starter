#!/usr/bin/env bash
# RLM Status Bar Module (Bash)
# Displays real-time pipeline state in terminal status bar

# ANSI Color Codes
COLOR_RESET="\033[0m"
COLOR_BOLD="\033[1m"
COLOR_GREEN="\033[32m"
COLOR_YELLOW="\033[33m"
COLOR_RED="\033[31m"
COLOR_CYAN="\033[36m"
COLOR_MAGENTA="\033[35m"
COLOR_GRAY="\033[90m"

# Find RLM root directory
get_rlm_root() {
    local current="$PWD"
    while [[ "$current" != "/" ]]; do
        if [[ -d "$current/RLM" ]]; then
            echo "$current"
            return 0
        fi
        current="$(dirname "$current")"
    done
    return 1
}

# Test for ANSI color support
test_ansi_support() {
    [[ -n "$TERM" ]] && [[ "$TERM" != "dumb" ]] && [[ "$TERM" =~ (xterm|color) || -n "$COLORTERM" ]]
}

# Read JSON file with jq
read_json() {
    local file="$1"
    if [[ -f "$file" ]] && command -v jq &> /dev/null; then
        cat "$file"
    else
        echo "{}"
    fi
}

# Get pipeline state
get_pipeline_state() {
    local root
    root=$(get_rlm_root) || return 1
    read_json "$root/RLM/progress/pipeline-state.json"
}

# Get status JSON
get_status_json() {
    local root
    root=$(get_rlm_root) || return 1
    read_json "$root/RLM/progress/status.json"
}

# Get context percentage
get_context_percentage() {
    local root
    root=$(get_rlm_root) || return 1
    
    local token_dir="$root/RLM/progress/token-usage"
    [[ -d "$token_dir" ]] || { echo "0"; return; }
    
    # Find most recent session file
    local latest_file
    latest_file=$(find "$token_dir" -name "session-*.json" -type f 2>/dev/null | sort -r | head -n 1)
    
    if [[ -n "$latest_file" ]] && command -v jq &> /dev/null; then
        local total
        local limit
        total=$(jq -r '.total_tokens // 0' "$latest_file" 2>/dev/null)
        limit=$(jq -r '.context_limit // 200000' "$latest_file" 2>/dev/null)
        
        if [[ "$total" -gt 0 ]] && [[ "$limit" -gt 0 ]]; then
            echo $(( total * 100 / limit ))
            return
        fi
    fi
    
    echo "0"
}

# Get task counts
get_task_counts() {
    local root
    root=$(get_rlm_root) || return 1
    
    local status_json
    status_json=$(get_status_json)
    
    local completed=0
    local blocked=0
    local in_progress=0
    
    if command -v jq &> /dev/null; then
        completed=$(echo "$status_json" | jq -r '.completedTasks | length // 0' 2>/dev/null)
        blocked=$(echo "$status_json" | jq -r '.blockedTasks | length // 0' 2>/dev/null)
    fi
    
    # Count active tasks
    local active_dir="$root/RLM/tasks/active"
    if [[ -d "$active_dir" ]]; then
        in_progress=$(find "$active_dir" -name "TASK-*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
    fi
    
    echo "$completed:$in_progress:$blocked"
}

# Format phase indicator
format_phase_indicator() {
    local pipeline_state="$1"
    local use_color="$2"
    
    if [[ -z "$pipeline_state" ]] || ! command -v jq &> /dev/null; then
        echo "⚠️  No pipeline"
        return
    fi
    
    local phase
    phase=$(echo "$pipeline_state" | jq -r '.current_phase // 1')
    
    local icon="🔄"
    local color=""
    local reset=""
    
    if [[ "$use_color" == "true" ]]; then
        color="$COLOR_YELLOW"
        reset="$COLOR_RESET"
    fi
    
    echo -ne "${color}${icon} Phase ${phase}/9${reset}"
}

# Format current task
format_current_task() {
    local status_json="$1"
    local use_color="$2"
    
    if [[ -z "$status_json" ]] || ! command -v jq &> /dev/null; then
        echo "--"
        return
    fi
    
    local task_id
    task_id=$(echo "$status_json" | jq -r '.currentTask // "--"')
    
    local color=""
    local reset=""
    
    if [[ "$use_color" == "true" ]]; then
        color="$COLOR_CYAN"
        reset="$COLOR_RESET"
    fi
    
    echo -ne "${color}${task_id}${reset}"
}

# Format task counters
format_task_counters() {
    local counts="$1"
    local use_color="$2"
    
    IFS=':' read -r completed in_progress blocked <<< "$counts"
    
    local green=""
    local yellow=""
    local red=""
    local reset=""
    
    if [[ "$use_color" == "true" ]]; then
        green="$COLOR_GREEN"
        yellow="$COLOR_YELLOW"
        red="$COLOR_RED"
        reset="$COLOR_RESET"
    fi
    
    local parts=()
    [[ "$completed" -gt 0 ]] && parts+=("${green}✅ ${completed}${reset}")
    [[ "$in_progress" -gt 0 ]] && parts+=("${yellow}⏳ ${in_progress}${reset}")
    [[ "$blocked" -gt 0 ]] && parts+=("${red}❌ ${blocked}${reset}")
    
    if [[ ${#parts[@]} -eq 0 ]]; then
        echo -ne "${yellow}⏳ 0${reset}"
    else
        echo -ne "${parts[*]}"
    fi
}

# Format context usage
format_context_usage() {
    local percentage="$1"
    local use_color="$2"
    local warn_threshold="${3:-75}"
    local critical_threshold="${4:-90}"
    
    local color=""
    local reset=""
    
    if [[ "$use_color" == "true" ]]; then
        if [[ "$percentage" -ge "$critical_threshold" ]]; then
            color="$COLOR_RED"
        elif [[ "$percentage" -ge "$warn_threshold" ]]; then
            color="$COLOR_YELLOW"
        else
            color="$COLOR_GRAY"
        fi
        reset="$COLOR_RESET"
    fi
    
    echo -ne "${color}Ctx: ${percentage}%${reset}"
}

# Format automation level
format_automation_level() {
    local level="$1"
    local use_color="$2"
    
    [[ -z "$level" ]] && level="MANUAL"
    level=$(echo "$level" | tr '[:lower:]' '[:upper:]')
    
    local color=""
    local reset=""
    
    if [[ "$use_color" == "true" ]]; then
        color="$COLOR_MAGENTA"
        reset="$COLOR_RESET"
    fi
    
    echo -ne "${color}[${level}]${reset}"
}

# Get status bar text
get_status_bar_text() {
    local format="${1:-compact}"
    
    local use_color="false"
    test_ansi_support && use_color="true"
    
    local pipeline_state
    local status_json
    local task_counts
    local context_pct
    
    pipeline_state=$(get_pipeline_state)
    status_json=$(get_status_json)
    task_counts=$(get_task_counts)
    context_pct=$(get_context_percentage)
    
    local phase_text
    local task_text
    local counters_text
    local context_text
    local auto_text
    
    phase_text=$(format_phase_indicator "$pipeline_state" "$use_color")
    task_text=$(format_current_task "$status_json" "$use_color")
    counters_text=$(format_task_counters "$task_counts" "$use_color")
    context_text=$(format_context_usage "$context_pct" "$use_color" 75 90)
    
    local automation_level="manual"
    if command -v jq &> /dev/null && [[ -n "$pipeline_state" ]]; then
        automation_level=$(echo "$pipeline_state" | jq -r '.automation_level // "manual"')
    fi
    auto_text=$(format_automation_level "$automation_level" "$use_color")
    
    if [[ "$format" == "compact" ]]; then
        echo "[$phase_text | $task_text | $counters_text | $context_text | $auto_text]"
    elif [[ "$format" == "wide" ]]; then
        echo "$phase_text | Task: $task_text | $counters_text | $context_text | Mode: $auto_text"
    else
        # Minimal
        echo "$phase_text | $task_text"
    fi
}

# Show status bar
show_status_bar() {
    local format="${1:-compact}"
    get_status_bar_text "$format"
}

# Main entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    show_status_bar "$@"
fi
