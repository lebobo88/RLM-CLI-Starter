# Agent Swarm Animations

This directory contains animations for visualizing RLM agent teams and multi-agent operations.

## Files

### 1. **agent-swarm.html** — Interactive Browser Animation
Full 3D swarm visualization with cascading terminal windows, ASCII agents with breathing effects, and CRT scanlines.

**Features:**
- 8 spawning terminal windows with staggered animation
- ASCII agents with glitch effects and breathing animations
- CRT scanline and flicker overlay effects
- 3D perspective transforms
- Green glow aesthetic (Matrix-style)

**Usage:**
```bash
# Open in default browser
open .claude/animations/agent-swarm.html

# Or with specific browser
firefox .claude/animations/agent-swarm.html
```

**Duration:** ~5 seconds for full spawn sequence

---

### 2. **swarm-spinner.py** — Terminal Spinner
Lightweight terminal animation showing agent swarm spawning in real-time. Use during long-running operations.

**Features:**
- Cascading agent spawn indicator (0-8 agents)
- Color-coded status based on agent count
- Optional progress bar with time tracking
- Threading support for non-blocking animation

**Usage in Python:**
```python
from swarm_spinner import SwarmSpinner

# Simple animation
spinner = SwarmSpinner("Initializing team mode")
spinner.start()
time.sleep(5)
spinner.stop("Team ready")

# With duration and progress
with SwarmSpinner("Running parallel tasks", duration=10) as spinner:
    # Do work...
    pass
```

**CLI Usage:**
```bash
# Run standalone demo
python .claude/animations/swarm-spinner.py
```

---

### 3. **tmux-swarm-transition.sh** — Shell Script Transition
Bash animation for tmux pane splitting and team mode activation (Unix/Linux/macOS).

**Usage:**
```bash
# Quick 2-second transition
./.claude/hooks/tmux-swarm-transition.sh

# Custom duration
./.claude/hooks/tmux-swarm-transition.sh 3
```

**Integration in session hooks:**
```bash
# In .claude/hooks/session-start.sh
if [ "$CLAUDE_TEAM_MODE" = "1" ]; then
    ./.claude/hooks/tmux-swarm-transition.sh 2
fi
```

---

### 4. **tmux-swarm-transition.ps1** — PowerShell Transition
PowerShell animation for Windows team mode activation.

**Usage:**
```powershell
# Quick transition
.\.claude\hooks\tmux-swarm-transition.ps1

# Custom duration
.\.claude\hooks\tmux-swarm-transition.ps1 -Duration 3
```

---

## Integration Points

### Status Bar Animation
When teams are active, the statusline displays a swarm indicator:

```
Opus | ?*SDTIQVR P6:Implement | AUTO | tools:5 | swarm:◆x8 | 2agents(team...) | [████████░░] 70% | +42/-8 | $0.85 | 12m30s
                                                    ↑
                          Animated agent count indicator
```

The indicator shows:
- `◆` or `◇` — Breathing animation frame
- `x8` — 8 agents active
- Color changes based on team size (cyan → yellow → green)

---

### Team Mode Hook Integration

Add to `.claude/settings.json`:

```json
{
  "hooks": {
    "TeammateIdle": {
      "tmux-swarm": {
        "handler": "command",
        "script": "./.claude/hooks/tmux-swarm-transition.sh",
        "condition": "team_mode_active"
      }
    }
  }
}
```

---

## Customization

### Colors
Edit the color constants in `swarm-spinner.py`:

```python
BRIGHT_GREEN = "\x1b[92m"   # Agent spawning
BRIGHT_MAGENTA = "\x1b[95m" # Team status
BRIGHT_CYAN = "\x1b[96m"    # Activity indicator
```

### Agent Count
Modify in JavaScript/HTML:

```javascript
const count = 8;  // Number of terminal windows
```

Or in Python:

```python
self.max_agents = 8  # Change here
```

### Animation Speed
Adjust timing:

```javascript
// HTML: Stagger between spawns
}, i * 200);  // milliseconds

// Python: Spawn delay
time.sleep(0.15)  # seconds

// Shell: Frame delay
sleep 0.15  # seconds
```

### Aesthetic
Change the ASCII agent frame in `agent.js`:

```javascript
const ASCII_AGENT = `
      _____
     /     \
    | [O] [O] |  ← Custom eyes
    |    ^    |  ← Custom mouth
     \  ===  /
      |||||||
`;
```

---

## Performance Considerations

- **HTML animation**: Smooth 60fps on modern browsers, uses CSS transforms
- **Python spinner**: ~150ms per frame, minimal CPU usage
- **Shell scripts**: ~150ms per frame, suitable for terminal output
- **Status bar**: Sub-1ms refresh (uses cached calculations)

---

## Accessibility

- All animations respect `prefers-reduced-motion` in browsers
- Terminal animations can be disabled with `--no-animation` flag
- Status bar remains readable with or without animation
- Spinner gracefully degrades to static indicator if terminal doesn't support ANSI colors

---

## Demo

View the browser animation:

```bash
# macOS
open .claude/animations/agent-swarm.html

# Linux
xdg-open .claude/animations/agent-swarm.html

# Windows
start .claude\animations\agent-swarm.html
```

Or run the terminal demo:

```bash
python .claude/animations/swarm-spinner.py
```
