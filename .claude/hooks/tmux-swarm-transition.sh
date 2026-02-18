#!/bin/bash
# tmux-swarm-transition.sh
# Plays a swarm animation transition when entering tmux team mode
# Usage: tmux-swarm-transition.sh [duration-seconds]

DURATION="${1:-2}"

# ANSI colors
RESET="\033[0m"
BRIGHT_GREEN="\033[92m"
BRIGHT_MAGENTA="\033[95m"
BRIGHT_CYAN="\033[96m"
BOLD="\033[1m"

# Swarm frames
AGENT_FRAMES=(
    "◆"
    "◇"
    "◆"
)

SPINNER_FRAMES=(
    "◐"
    "◓"
    "◑"
    "◒"
)

echo ""
echo -e "${BRIGHT_CYAN}${BOLD}⚡ Spawning Agent Swarm${RESET}"
echo ""

# Animation loop
AGENT_COUNT=0
FRAME_INDEX=0
SPINNER_INDEX=0
START_TIME=$(date +%s)

while true; do
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))

    if [ $ELAPSED -ge $DURATION ]; then
        break
    fi

    # Gradually spawn agents
    if [ $AGENT_COUNT -lt 8 ]; then
        AGENT_COUNT=$((AGENT_COUNT + 1))
    fi

    # Spinner animation
    SPINNER=${SPINNER_FRAMES[$((SPINNER_INDEX % 4))]}
    SPINNER_INDEX=$((SPINNER_INDEX + 1))

    # Agent animation
    AGENT_FRAME=${AGENT_FRAMES[$((FRAME_INDEX % 3))]}
    FRAME_INDEX=$((FRAME_INDEX + 1))

    # Build output
    AGENT_VISUAL=""
    for ((i=0; i<AGENT_COUNT; i++)); do
        if [ $i -lt 3 ]; then
            AGENT_VISUAL="${AGENT_VISUAL}${BRIGHT_GREEN}${AGENT_FRAME}${RESET} "
        elif [ $i -lt 6 ]; then
            AGENT_VISUAL="${AGENT_VISUAL}${BRIGHT_MAGENTA}◆${RESET} "
        else
            AGENT_VISUAL="${AGENT_VISUAL}${BRIGHT_CYAN}◇${RESET} "
        fi
    done

    # Progress bar
    PROGRESS=$((ELAPSED * 20 / DURATION))
    BAR=""
    for ((i=0; i<20; i++)); do
        if [ $i -lt $PROGRESS ]; then
            BAR="${BAR}${BRIGHT_GREEN}█${RESET}"
        else
            BAR="${BAR}░"
        fi
    done

    # Print with carriage return
    echo -ne "\r${SPINNER} Team Mode: [${BAR}] (${AGENT_COUNT}/8)\n${AGENT_VISUAL}\r"

    sleep 0.15
done

# Final message
echo -ne "\033[2K\r"  # Clear line
echo -e "${BRIGHT_GREEN}${BOLD}✓ Swarm initialized${RESET}"
echo ""
