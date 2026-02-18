#!/usr/bin/env bash
# RLM Agent Spawner Module (Bash)
# Animated ASCII agent spawning for sub-agent teams

# ASCII Agent Template
AGENT_TEMPLATE="      _____
     /     \\
    | [O] [O] |
    |    ^    |
     \\  ===  /
      |||||||"

# Glitch characters
GLITCH_CHARS=('!' '@' '#' '$' '%' '^' '&' '*' '(' ')' '_' '+')

# Create agent ASCII art
new_agent_ascii() {
    local agent_id="$1"
    local task_id="$2"
    local status="${3:-Active}"
    
    echo "$AGENT_TEMPLATE"
    echo "   [$agent_id]"
    
    if [[ -n "$task_id" ]]; then
        echo "   Task: $task_id"
        echo "   Status: 🟢 $status"
    fi
}

# Show agent spawn
show_agent_spawn() {
    local agent_id="$1"
    local task_id="${2:-}"
    local delay_ms="${3:-200}"
    
    local agent
    agent=$(new_agent_ascii "$agent_id" "$task_id")
    
    echo -e "\033[36m$agent\033[0m"
    
    if [[ $delay_ms -gt 0 ]]; then
        sleep "$(echo "scale=3; $delay_ms / 1000" | bc)"
    fi
}

# Invoke agent swarm
invoke_agent_swarm() {
    local count="${1:-5}"
    local type="${2:-parallel}"
    shift 2
    local task_ids=("$@")
    
    echo -e "\n\033[33m🔀 Spawning $count sub-agents for $type execution...\033[0m\n"
    
    for ((i=0; i<count; i++)); do
        local agent_id="$type-agent-$((i + 1))"
        local task_id="${task_ids[$i]:-}"
        
        show_agent_spawn "$agent_id" "$task_id" 200
    done
    
    echo -e "\n\033[32m✅ Agent swarm spawned successfully!\033[0m\n"
}

# Invoke team spawn
invoke_team_spawn() {
    local agent_types=("team-lead" "code-writer" "test-writer" "reviewer" "tester")
    
    echo -e "\n\033[33m🎪 Spawning agent team...\033[0m\n"
    
    for type in "${agent_types[@]}"; do
        show_agent_spawn "$type" "" 200
    done
    
    echo -e "\n\033[32m✅ Team assembled and ready!\033[0m\n"
}

# Show agent banner
show_agent_banner() {
    local message="${1:-RLM Pipeline Active}"
    
    cat << 'EOF'

╔═══════════════════════════════════════════╗
║                                           ║
║     RLM Pipeline Active                   ║
║                                           ║
╚═══════════════════════════════════════════╝

EOF
}

# Main entry point for testing
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    invoke_team_spawn
fi
