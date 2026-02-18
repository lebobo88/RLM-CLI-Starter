#!/usr/bin/env bash
# RLM Post-Tool Agent Spawn Hook
# Triggers agent spawning animation when team/batch agents are invoked

set +e  # Don't fail on errors

# Read JSON input
input=$(cat)

# Parse tool and arguments
tool=$(echo "$input" | jq -r '.tool // ""')
agent_type=$(echo "$input" | jq -r '.arguments.agent_type // ""')
description=$(echo "$input" | jq -r '.arguments.description // ""')
prompt=$(echo "$input" | jq -r '.arguments.prompt // ""')
cwd=$(echo "$input" | jq -r '.cwd // "."')

# Import agent spawner module
spawner_module="$cwd/.github/hooks/scripts/lib/agent-spawner.sh"
[[ -f "$spawner_module" ]] || exit 0

source "$spawner_module"

# Check if this is a sub-agent invocation
[[ "$tool" == "task" ]] || exit 0

# Detect team/swarm invocations
is_team=false
is_batch=false

[[ "$agent_type" =~ (team-lead|rlm-team) ]] && is_team=true
[[ "$agent_type" =~ rlm-implement-all ]] && is_batch=true
[[ "$description$prompt" =~ (parallel|team|batch|swarm) ]] && is_batch=true

[[ "$is_team" == "false" && "$is_batch" == "false" ]] && exit 0

# Extract task count if mentioned
task_count=5
if [[ "$prompt" =~ ([0-9]+)[[:space:]]+(tasks?|agents?|sub-?agents?) ]]; then
    task_count="${BASH_REMATCH[1]}"
fi

# Trigger appropriate animation
if [[ "$is_team" == "true" ]]; then
    invoke_team_spawn
elif [[ "$is_batch" == "true" ]]; then
    invoke_agent_swarm "$((task_count < 10 ? task_count : 10))" "implement"
fi

exit 0
