#!/usr/bin/env bash
# Orchestrator Welcome Screen Module (Bash)
# Displays welcome banner and "Three Ways to Start" on session start

get_pipeline_state_info() {
    local status_path="RLM/progress/status.json"
    local pipeline_state_path="RLM/progress/pipeline-state.json"
    
    # Initialize state variables
    HAS_PIPELINE=false
    PIPELINE_ID=""
    PHASE=""
    STATUS=""
    AUTOMATION=""
    ACTIVE_TASK=""
    COMPLETED=0
    IN_PROGRESS=0
    BLOCKED=0
    
    # Check if pipeline state exists
    if [[ -f "$pipeline_state_path" ]]; then
        if command -v jq &> /dev/null; then
            HAS_PIPELINE=true
            PIPELINE_ID=$(jq -r '.pipeline_id // ""' "$pipeline_state_path")
            PHASE=$(jq -r '.current_phase // ""' "$pipeline_state_path")
            AUTOMATION=$(jq -r '.automation_level // "" | ascii_upcase' "$pipeline_state_path")
            
            # Determine status
            local completed_phases=$(jq '[.phases | to_entries[] | select(.value.status == "completed")] | length' "$pipeline_state_path")
            local total_phases=$(jq '.phases | length' "$pipeline_state_path")
            
            if [[ "$completed_phases" -eq "$total_phases" ]]; then
                STATUS="✅ Complete"
            elif [[ "$PHASE" -gt 0 ]]; then
                STATUS="🟢 Active"
            else
                STATUS="⏸️  Paused"
            fi
        fi
    fi
    
    # Check for active tasks
    if [[ -d "RLM/tasks/active" ]]; then
        local first_task=$(find RLM/tasks/active -name "*.md" -type f 2>/dev/null | head -n 1)
        if [[ -n "$first_task" ]]; then
            ACTIVE_TASK=$(basename "$first_task" .md)
        fi
    fi
    
    # Read status.json for progress
    if [[ -f "$status_path" ]] && command -v jq &> /dev/null; then
        COMPLETED=$(jq '(.completed_tasks // []) | length' "$status_path")
        IN_PROGRESS=$(jq '(.in_progress_tasks // []) | length' "$status_path")
        BLOCKED=$(jq '(.blocked_tasks // []) | length' "$status_path")
    fi
}

format_welcome_banner() {
    cat << 'EOF'
╔═══════════════════════════════════════════════════════════╗
║    RLM Method v2.7 - Pipeline Orchestrator                ║
║    Ready to transform ideas into code                     ║
╚═══════════════════════════════════════════════════════════╝
EOF
}

format_pipeline_status() {
    if [[ "$HAS_PIPELINE" != "true" ]]; then
        cat << 'EOF'

📊 No active pipeline detected
   Start a new pipeline by describing your idea to the orchestrator

EOF
        return
    fi
    
    local phase_name
    case $PHASE in
        1) phase_name="Discovery" ;;
        2) phase_name="Design" ;;
        3) phase_name="Specs" ;;
        4) phase_name="Feature Design" ;;
        5) phase_name="Tasks" ;;
        6) phase_name="Implementation" ;;
        7) phase_name="Quality" ;;
        8) phase_name="Verification" ;;
        9) phase_name="Report" ;;
        *) phase_name="Unknown" ;;
    esac
    
    echo ""
    echo "📊 Current Pipeline State"
    echo "   ID:          $PIPELINE_ID"
    echo "   Phase:       $PHASE/9 ($phase_name)"
    echo "   Status:      $STATUS"
    echo "   Automation:  $AUTOMATION"
    echo ""
    
    if [[ -n "$ACTIVE_TASK" ]]; then
        echo "📋 Active Task:  $ACTIVE_TASK"
    fi
    
    echo "📈 Progress:     ✅ $COMPLETED completed | ⏳ $IN_PROGRESS in progress | ❌ $BLOCKED blocked"
    echo ""
}

format_three_ways_to_start() {
    # Detect if alias is installed
    local alias_installed=false
    local config_file=""
    
    if [[ -n "$ZSH_VERSION" ]]; then
        config_file="$HOME/.zshrc"
    elif [[ -n "$BASH_VERSION" ]]; then
        config_file="$HOME/.bashrc"
    fi
    
    if [[ -f "$config_file" ]] && grep -q "alias rlm=" "$config_file" 2>/dev/null; then
        alias_installed=true
    fi
    
    echo "──────────────────────────────────────────────────────────────"
    echo ""
    echo "🚀 Three Ways to Start Orchestrator"
    echo ""
    
    if [[ "$alias_installed" == "true" ]]; then
        echo "   ⭐ Option 1: Shell Alias (Fastest) ✅ INSTALLED"
        echo "   → rlm"
    else
        echo "   ⭐ Option 1: Shell Alias (Fastest)"
        echo "   → rlm"
        echo ""
        echo "   📌 One-time setup (not yet installed):"
        echo "      Bash/Zsh:   .github/hooks/scripts/setup-rlm-alias.sh"
        echo "      Fish:       .github/hooks/scripts/setup-rlm-alias.fish"
    fi
    
    echo ""
    echo "   🔧 Option 2: CLI Flag"
    echo "   → copilot --agent rlm-orchestrator"
    echo ""
    echo "   🖱️  Option 3: Interactive Menu"
    echo "   → copilot"
    echo "   → Type: /agents"
    echo "   → Select: rlm-orchestrator"
    echo ""
    echo "──────────────────────────────────────────────────────────────"
}

show_orchestrator_welcome() {
    local format="${1:-verbose}"
    
    get_pipeline_state_info
    
    echo ""
    format_welcome_banner
    format_pipeline_status
    
    if [[ "$format" == "verbose" ]]; then
        format_three_ways_to_start
        
        echo ""
        if [[ "$HAS_PIPELINE" == "true" ]]; then
            echo "💡 TIP: Your pipeline is active! Once in orchestrator context:"
            echo "   • Resume: \"resume\""
            echo "   • Check status: \"show me the current state\""
        else
            echo "💡 TIP: Start a new pipeline by describing your idea!"
            echo "   Example: \"Build a task management API with authentication\""
        fi
        echo ""
    fi
}

# Make functions available
export -f get_pipeline_state_info
export -f format_welcome_banner
export -f format_pipeline_status
export -f format_three_ways_to_start
export -f show_orchestrator_welcome
