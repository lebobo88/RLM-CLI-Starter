#!/usr/bin/env bash
# RLM Spinner Module (Bash)
# Animated spinner with rotating messages (roasts, tips, progress)

# Spinner frames (Braille characters)
SPINNER_FRAMES=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧')
CURRENT_FRAME=0

# Message arrays
ROASTS=(
    "🤡 Gemini's thinking so hard, the GPU's sweating..."
    "😴 Claude Code dozed off. Someone poke it."
    "🐢 Codex running at 0.5x speed. Classic Microsoft."
    "🔥 Gemini just hallucinated a framework. Impressive."
    "💤 Claude's 'thinking'... or napping. Hard to tell."
    "🎪 Codex suggested using jQuery. In 2026."
    "🤖 Gemini: 'I know kung fu.' Us: 'No, you don't.'"
    "⏳ Claude Code's ETA: 'Soon™'. Very helpful."
    "🧠 Codex forgot what we asked 3 prompts ago. Adorable."
    "🎭 Gemini roleplaying as a competent AI again..."
)

TIPS=(
    "💡 TIP: Use @rlm-prime to preload feature context"
    "📚 TIP: Check RLM/specs/constitution.md for standards"
    "🔍 TIP: @rlm-debug fixes orphaned tasks and state issues"
    "⚡ TIP: Set automation=AUTO for hands-free pipeline runs"
    "🎯 TIP: Phase 5 auto-generates wiring tasks"
    "🧪 TIP: All implementation follows TDD: Red → Green → Refactor"
    "📊 TIP: Context > 75%? Use @rlm-resume to continue"
    "🚀 TIP: @rlm-implement-all runs all tasks in order"
    "🔐 TIP: Pre-tool hooks block destructive rm -rf"
    "📝 TIP: Task manifests must pass 5 hard gates"
)

PROGRESS=(
    "📖 Reading specs from RLM/specs/features/..."
    "🧵 Tracing dependencies between tasks..."
    "✍️  Writing test file..."
    "🔨 Implementing component..."
    "🧪 Running test suite with 80%+ coverage..."
    "📋 Updating RLM/progress/status.json..."
    "🎨 Generating design tokens..."
    "🔗 Creating wiring task..."
    "📦 Scaffolding project structure..."
    "🎯 Verifying acceptance criteria..."
)

# Get random message
get_random_message() {
    local rand=$((RANDOM % 100))
    
    if [[ $rand -lt 33 ]]; then
        echo "${ROASTS[$((RANDOM % ${#ROASTS[@]}))]}"
    elif [[ $rand -lt 66 ]]; then
        echo "${TIPS[$((RANDOM % ${#TIPS[@]}))]}"
    else
        echo "${PROGRESS[$((RANDOM % ${#PROGRESS[@]}))]}"
    fi
}

# Get next spinner frame
get_next_frame() {
    local frame="${SPINNER_FRAMES[$CURRENT_FRAME]}"
    CURRENT_FRAME=$(((CURRENT_FRAME + 1) % ${#SPINNER_FRAMES[@]}))
    echo "$frame"
}

# Start spinner
start_spinner() {
    local initial_message="${1:-Working...}"
    local state_file="${TMPDIR:-/tmp}/rlm-spinner-state-$$.txt"
    
    echo "$initial_message" > "$state_file"
    echo "$state_file"
}

# Show spinner frame
show_spinner_frame() {
    local state_file="$1"
    
    [[ -f "$state_file" ]] || return 1
    
    local message
    message=$(cat "$state_file")
    local frame
    frame=$(get_next_frame)
    
    # Clear line and redraw
    echo -ne "\r\033[K$frame $message"
}

# Update spinner message
update_spinner_message() {
    local state_file="$1"
    local new_message="$2"
    
    [[ -f "$state_file" ]] || return 1
    echo "$new_message" > "$state_file"
}

# Stop spinner
stop_spinner() {
    local state_file="$1"
    local final_message="${2:-}"
    local success="${3:-true}"
    
    # Clear spinner line
    echo -ne "\r\033[K"
    
    if [[ -n "$final_message" ]]; then
        if [[ "$success" == "true" ]]; then
            echo "✅ $final_message"
        else
            echo "❌ $final_message"
        fi
    fi
    
    # Clean up
    [[ -f "$state_file" ]] && rm -f "$state_file"
}

# Main entry point for testing
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    state_file=$(start_spinner "Testing spinner...")
    
    for i in {1..20}; do
        show_spinner_frame "$state_file"
        sleep 0.1
        
        if [[ $((i % 10)) -eq 0 ]]; then
            update_spinner_message "$state_file" "$(get_random_message)"
        fi
    done
    
    stop_spinner "$state_file" "Spinner test complete" "true"
fi
