# RLM Status Bar & Agent Spawning System

Real-time pipeline state visibility and visual feedback for GitHub Copilot CLI sessions.

## Features

### 1. Terminal Status Bar
Displays real-time RLM pipeline state, progress, and metrics.

**Format:** `[🔄 Phase 4/9 | TASK-042 | ✅ 23 ⏳ 5 ❌ 2 | Ctx: 45% | [AUTO]]`

**Components:**
- **Phase indicator**: Current pipeline phase (1-9) with emoji
- **Current task**: Active task ID or `--` if none
- **Task counters**: Completed ✅, in-progress ⏳, blocked ❌
- **Context usage**: Token usage percentage (warns at 75%, critical at 90%)
- **Automation level**: AUTO | SUPERVISED | MANUAL

**Colors:**
- Green: Completed phases, success states
- Yellow: Active phase, in-progress
- Red: Blocked tasks, context > 75%
- Cyan: Task IDs, metrics
- Magenta: Automation level

### 2. Spinner Messages
Rotating messages displayed during long-running operations.

**Message Types:**
- **33% Roasts**: Humorous jabs at Gemini, Claude Code, and Codex
  - *"🤡 Gemini's thinking so hard, the GPU's sweating..."*
  - *"😴 Claude Code dozed off. Someone poke it."*
  - *"🐢 Codex running at 0.5x speed. Classic Microsoft."*

- **33% Tips**: Helpful RLM pipeline navigation advice
  - *"💡 TIP: Use @rlm-prime to preload feature context"*
  - *"🔍 TIP: @rlm-debug fixes orphaned tasks and state issues"*
  - *"⚡ TIP: Set automation=AUTO for hands-free pipeline runs"*

- **34% Progress**: Current operation status
  - *"🧪 Running test suite with 80%+ coverage target..."*
  - *"🔨 Implementing: src/components/Dashboard.tsx..."*
  - *"📖 Reading specs from RLM/specs/features/..."*

Messages rotate every 3 seconds, spinner frames update every 80ms.

### 3. Agent Spawning Animation
ASCII art animation when spawning sub-agents or teams.

**Triggers:**
- `@rlm-team` invocation → Spawns 5-agent team (team-lead, code-writer, test-writer, reviewer, tester)
- `@rlm-implement-all` → Spawns N agents (1 per task, max 10)
- Keywords in prompt: "parallel", "team", "batch", "swarm"

**Animation:**
```
      _____
     /     \
    | [O] [O] |
    |    ^    |
     \  ===  /
      |||||||
   [code-writer-1]
   Task: TASK-042
   Status: 🟢 Active
```

Agents spawn with 200ms stagger delay and optional glitch effect (5% probability).

## Configuration

Edit `.github/hooks/config/status-bar-config.json`:

```json
{
  "status_bar": {
    "enabled": true,
    "format": "compact",
    "update_interval_ms": 500,
    "show_emojis": true,
    "context_threshold_warning": 75,
    "context_threshold_critical": 90
  },
  "spinner": {
    "enabled": true,
    "frame_interval_ms": 80,
    "message_interval_ms": 3000
  },
  "agent_spawner": {
    "enabled": true,
    "max_parallel_agents": 10,
    "animation_duration_ms": 1000,
    "glitch_probability": 0.05
  }
}
```

## Usage

### Automatic Initialization
Status bar initializes automatically when starting a Copilot CLI session in an RLM project directory.

### Manual Display
```powershell
# PowerShell
. .github/hooks/scripts/lib/status-bar.ps1
Show-StatusBar -Format "compact"

# Bash
source .github/hooks/scripts/lib/status-bar.sh
show_status_bar compact
```

### Manual Agent Spawn
```powershell
# PowerShell
. .github/hooks/scripts/lib/agent-spawner.ps1
Invoke-TeamSpawn
Invoke-AgentSwarm -Count 5 -Type "parallel"

# Bash
source .github/hooks/scripts/lib/agent-spawner.sh
invoke_team_spawn
invoke_agent_swarm 5 parallel
```

### Manual Spinner
```powershell
# PowerShell
. .github/hooks/scripts/lib/spinner.ps1
$spinner = Start-Spinner -InitialMessage "Processing..."
# ... do work ...
Stop-Spinner -SpinnerHandle $spinner -FinalMessage "Complete!" -Success $true

# Bash
source .github/hooks/scripts/lib/spinner.sh
state_file=$(start_spinner "Processing...")
# ... do work ...
stop_spinner "$state_file" "Complete!" "true"
```

## Data Sources

Status bar reads from these JSON files:

| File | Data Extracted |
|------|---------------|
| `RLM/progress/pipeline-state.json` | Phase, automation level, pipeline ID |
| `RLM/progress/status.json` | Current task, completed/blocked task IDs |
| `RLM/progress/checkpoint.json` | Last session info |
| `RLM/progress/token-usage/session-*.json` | Token usage for context % |
| `RLM/tasks/active/*.md` | In-progress task count |

## File Watcher

Status bar uses file watchers for real-time updates:

- **Windows**: `System.IO.FileSystemWatcher` (PowerShell)
- **Linux**: `inotifywait` (requires `inotify-tools` package)
- **macOS**: `fswatch` (install via Homebrew)

Fallback: 500ms polling if watchers unavailable.

## Cross-Platform Support

All modules ship in dual formats:
- `.ps1` for Windows (PowerShell 7+)
- `.sh` for Linux/macOS (Bash 4+)

Hooks auto-select correct version based on platform.

## CLI Flags (Planned)

Disable features via environment variables:

```bash
export RLM_STATUS_BAR_ENABLED=false
export RLM_SPINNER_ENABLED=false
export RLM_AGENT_SPAWNER_ENABLED=false
```

## Troubleshooting

### Status Bar Not Displaying
1. Verify RLM directory exists: `ls RLM/progress/`
2. Check config file: `.github/hooks/config/status-bar-config.json`
3. Ensure terminal supports ANSI colors: `echo $TERM`
4. Check PowerShell version: `$PSVersionTable.PSVersion` (need 7+)

### File Watcher Not Working
**Linux:**
```bash
# Install inotify-tools
sudo apt install inotify-tools

# Test manually
inotifywait -m RLM/progress/*.json
```

**macOS:**
```bash
# Install fswatch
brew install fswatch

# Test manually
fswatch RLM/progress/*.json
```

### Agent Animation Not Showing
1. Check post-tool hook is registered in `.github/hooks/hooks.json`
2. Verify agent spawner module exists: `.github/hooks/scripts/lib/agent-spawner.ps1`
3. Test manually:
   ```powershell
   . .github/hooks/scripts/lib/agent-spawner.ps1
   Invoke-TeamSpawn
   ```

### Colors Not Displaying
- **Windows**: Use Windows Terminal (not cmd.exe or old PowerShell console)
- **Linux/macOS**: Verify `$TERM` is set (e.g., `xterm-256color`)
- **VS Code Terminal**: Update to latest VS Code version

## Performance

- Status bar refresh: Max 2 updates/second (500ms debounce)
- File watcher overhead: ~0.1% CPU idle, ~1% during updates
- Agent animation: Completes in 1-2 seconds for 5 agents
- Spinner: Negligible overhead (~0.01% CPU)

## Dependencies

### PowerShell
- PowerShell 7+ (for ANSI color support)
- `PSReadLine` module (usually included)
- `System.IO.FileSystemWatcher` (.NET class)

### Bash
- Bash 4+ (for array support)
- `jq` (JSON parsing) — Install: `apt install jq` or `brew install jq`
- `tput` (terminal control) — Usually pre-installed
- **Linux**: `inotify-tools` — Install: `apt install inotify-tools`
- **macOS**: `fswatch` — Install: `brew install fswatch`

## Architecture

```
.github/hooks/
├── config/
│   └── status-bar-config.json     # Configuration
├── scripts/
│   ├── lib/
│   │   ├── status-bar.ps1         # Status bar module (PowerShell)
│   │   ├── status-bar.sh          # Status bar module (Bash)
│   │   ├── spinner.ps1            # Spinner module (PowerShell)
│   │   ├── spinner.sh             # Spinner module (Bash)
│   │   ├── agent-spawner.ps1      # Agent animation (PowerShell)
│   │   ├── agent-spawner.sh       # Agent animation (Bash)
│   │   ├── orchestrator-welcome.ps1  # Welcome screen (PowerShell)
│   │   └── orchestrator-welcome.sh   # Welcome screen (Bash)
│   ├── session-start.ps1          # Initialize status bar on session start
│   ├── post-tool-agent-spawn.ps1  # Trigger agent animation
│   ├── post-tool-agent-spawn.sh   # (Bash version)
│   ├── setup-rlm-alias.ps1        # Install shell alias (PowerShell)
│   ├── setup-rlm-alias.sh         # Install shell alias (Bash/Zsh)
│   ├── setup-rlm-alias.fish       # Install shell alias (Fish)
│   └── uninstall-rlm-alias.ps1    # Uninstall shell alias
└── hooks.json                     # Hook registration
```

## Orchestrator Auto-Load & Welcome Screen

The RLM starter kit now includes an orchestrator welcome screen and quick-launch alias system.

### Features

#### 1. Welcome Screen
Displayed on session start (if enabled), showing:
- **Pipeline state**: Current phase, status, automation level
- **Active task**: Current task ID and progress
- **Three ways to start**: Shell alias, CLI flag, interactive menu
- **Shell detection**: Auto-detects PowerShell, Bash, Zsh, or Fish
- **Alias installation status**: Shows if `rlm` alias is installed

Example output:
```
╔═══════════════════════════════════════════════════════════╗
║    RLM Method v2.7 - Pipeline Orchestrator                ║
║    Ready to transform ideas into code                     ║
╚═══════════════════════════════════════════════════════════╝

📊 Current Pipeline State
   ID:          PIPELINE-ENT-HUB-2026-002
   Phase:       4/9 (Specs)
   Status:      🟢 Active
   Automation:  AUTO

📋 Active Task:  TASK-042
📈 Progress:     ✅ 23 completed | ⏳ 5 in progress | ❌ 2 blocked

──────────────────────────────────────────────────────────────

🚀 Three Ways to Start Orchestrator

   ⭐ Option 1: Shell Alias (Fastest)
   → rlm
   
   📌 One-time setup (not yet installed):
      PowerShell: .github\hooks\scripts\setup-rlm-alias.ps1
      Bash/Zsh:   .github/hooks/scripts/setup-rlm-alias.sh
      Fish:       .github/hooks/scripts/setup-rlm-alias.fish
   
   🔧 Option 2: CLI Flag
   → copilot --agent rlm-orchestrator
   
   🖱️  Option 3: Interactive Menu
   → copilot
   → Type: /agents
   → Select: rlm-orchestrator

──────────────────────────────────────────────────────────────

💡 TIP: Your pipeline is active! Once in orchestrator context:
   • Resume: "resume"
   • Check status: "show me the current state"
```

#### 2. Shell Alias Installer
The `rlm` alias provides instant orchestrator access:

```bash
rlm  # Instead of: copilot --agent rlm-orchestrator
```

**Installation:**
- **PowerShell**: `.github\hooks\scripts\setup-rlm-alias.ps1`
- **Bash/Zsh**: `bash .github/hooks/scripts/setup-rlm-alias.sh`
- **Fish**: `fish .github/hooks/scripts/setup-rlm-alias.fish`

See [`RLM/docs/SETUP-ALIAS.md`](SETUP-ALIAS.md) for detailed setup instructions.

### Configuration

In `.github/hooks/config/status-bar-config.json`:

```json
{
  "orchestrator_autoload": {
    "enabled": true,
    "show_welcome": true,
    "welcome_format": "verbose",
    "suggest_alias": true,
    "detect_shell": true,
    "show_three_ways": true
  }
}
```

**Fields:**
- `enabled`: Master switch for orchestrator autoload features
- `show_welcome`: Display welcome screen on session start
- `welcome_format`: `"verbose"` (full menu) or `"minimal"` (status only)
- `suggest_alias`: Show alias setup instructions
- `detect_shell`: Auto-detect user's shell and show correct syntax
- `show_three_ways`: Display all 3 start options (alias, CLI flag, menu)

### Disabling Welcome Screen

To disable the welcome screen but keep the status bar:

```json
{
  "orchestrator_autoload": {
    "enabled": true,
    "show_welcome": false
  }
}
```

### Manual Welcome Display

You can manually display the welcome screen from PowerShell:

```powershell
Import-Module .github/hooks/scripts/lib/orchestrator-welcome.ps1
Show-OrchestratorWelcome -Format "verbose"
```

Or from Bash:

```bash
source .github/hooks/scripts/lib/orchestrator-welcome.sh
show_orchestrator_welcome verbose
```

## Future Enhancements

- Web dashboard (port `_test_runs/11/index.html` to Node.js/Electron)
- VS Code extension integration
- Desktop notifications on phase completion
- Metrics API for external monitoring tools
- Custom emoji/color themes
- Sound effects (optional beeps)
- Multi-session support (track multiple pipelines)

## Examples

### Compact Format (Default)
```
[🔄 Phase 4/9 | TASK-042 | ✅ 23 ⏳ 5 ❌ 2 | Ctx: 45% | [AUTO]]
```

### Wide Format
```
Phase 4/9 🔄 Specs | Task: TASK-042 @ 65% | Tasks: ✅ 23 ⏳ 5 ❌ 2 | Context: 45% | Mode: AUTO
```

### Minimal Format
```
🔄 Phase 4/9 | TASK-042
```

### High Context Warning
```
[🔄 Phase 6/9 | TASK-089 | ✅ 78 ⏳ 3 ❌ 0 | Ctx: 87% | [AUTO]]
                                               ^^^^^
                                               (shows in RED)
```

## Credits

Inspired by:
- `_test_runs/11/` terminal multiplier animation
- Classic terminal spinners (npm `ora` package)
- RLM Method v2.7 pipeline architecture

---

**Version:** 1.0.0  
**Platform:** GitHub Copilot CLI (Copilot-only, not Claude Code or Gemini CLI)  
**License:** MIT
