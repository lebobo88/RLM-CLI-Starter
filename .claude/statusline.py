#!/usr/bin/env python3
"""RLM Pipeline status line for Claude Code.

Reads Claude Code session JSON from stdin, RLM pipeline state, observability logs,
and task progress from disk. Outputs an ANSI-colored status line with:
  - Color-coded phase progress bar
  - Gradient context usage meter
  - Sub-agent & tool observability metrics
  - Task completion tracking
  - Cost and session duration
"""
import csv
import io
import json
import os
import sys
import time
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# ANSI helpers
# ---------------------------------------------------------------------------
RST = "\x1b[0m"
BOLD = "\x1b[1m"
DIM = "\x1b[2m"
ITALIC = "\x1b[3m"

# Foreground
FG_BLACK   = "\x1b[30m"
FG_RED     = "\x1b[31m"
FG_GREEN   = "\x1b[32m"
FG_YELLOW  = "\x1b[33m"
FG_BLUE    = "\x1b[34m"
FG_MAGENTA = "\x1b[35m"
FG_CYAN    = "\x1b[36m"
FG_WHITE   = "\x1b[37m"
FG_GRAY    = "\x1b[90m"
FG_BR_RED  = "\x1b[91m"
FG_BR_GREEN = "\x1b[92m"
FG_BR_YELLOW = "\x1b[93m"
FG_BR_CYAN = "\x1b[96m"

# Background
BG_GREEN   = "\x1b[42m"
BG_YELLOW  = "\x1b[43m"
BG_RED     = "\x1b[41m"
BG_BLUE    = "\x1b[44m"
BG_MAGENTA = "\x1b[45m"
BG_GRAY    = "\x1b[100m"


def c(text, *codes):
    """Wrap text in ANSI codes."""
    return "".join(codes) + str(text) + RST


# ---------------------------------------------------------------------------
# File I/O
# ---------------------------------------------------------------------------
def read_json_file(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return None


def read_lines_tail(path, n=50):
    """Read the last N lines of a file."""
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()
            return lines[-n:] if len(lines) > n else lines
    except (FileNotFoundError, OSError):
        return []


# ---------------------------------------------------------------------------
# Phase progress bar (color-coded)
# ---------------------------------------------------------------------------
PHASE_LABELS = {
    1: "Discover", 2: "Design",  3: "Specs",
    4: "FtrDesign", 5: "Tasks",   6: "Implement",
    7: "Quality",  8: "Verify",  9: "Report",
}

PHASE_ICONS = {
    1: "?",  2: "*",  3: "S",
    4: "D",  5: "T",  6: "I",
    7: "Q",  8: "V",  9: "R",
}


def build_phase_bar(phases):
    """Build a colored phase progress bar like [##>----]."""
    cells = []
    for key in sorted(phases.keys()):
        info = phases[key]
        s = info.get("status", "pending")
        idx = sorted(phases.keys()).index(key)
        icon = PHASE_ICONS.get(idx + 1, "?")
        if s == "completed":
            cells.append(c(icon, BOLD, FG_BR_GREEN))
        elif s == "active":
            cells.append(c(icon, BOLD, FG_BR_YELLOW))
        elif s == "skipped":
            cells.append(c("-", DIM, FG_GRAY))
        else:
            cells.append(c(".", DIM, FG_GRAY))
    return "".join(cells)


# ---------------------------------------------------------------------------
# Context gradient meter
# ---------------------------------------------------------------------------
def context_gradient(pct):
    """Return a colored context bar that darkens as usage increases.

    0-30%  : green
    30-55% : yellow
    55-75% : orange (yellow+bold)
    75-90% : red
    90%+   : bright red, bold
    """
    pct = max(0, min(100, int(pct)))
    bar_width = 10
    filled = max(0, min(bar_width, round(pct * bar_width / 100)))
    empty = bar_width - filled

    # Pick color based on fill level
    if pct < 30:
        fg = FG_BR_GREEN
    elif pct < 55:
        fg = FG_BR_YELLOW
    elif pct < 75:
        fg = FG_YELLOW + BOLD
    elif pct < 90:
        fg = FG_RED
    else:
        fg = FG_BR_RED + BOLD

    bar = fg + "|" * filled + RST + DIM + FG_GRAY + ":" * empty + RST
    label = fg + f"{pct}%" + RST
    return f"[{bar}] {label}"


# ---------------------------------------------------------------------------
# Observability metrics
# ---------------------------------------------------------------------------
def get_tool_metrics(project_dir):
    """Parse tool-usage.csv for success/failure counts in the current session."""
    csv_path = os.path.join(project_dir, "RLM", "progress", "logs", "tool-usage.csv")
    lines = read_lines_tail(csv_path, 500)
    if not lines:
        return 0, 0

    success = 0
    failure = 0
    for line in lines:
        line = line.strip()
        if not line or line.startswith("timestamp"):
            continue
        if ",success" in line:
            success += 1
        elif ",failure" in line:
            failure += 1
    return success, failure


def get_active_agents(project_dir):
    """Check agent trace logs for currently active sub-agents."""
    agents_dir = os.path.join(project_dir, "RLM", "progress", "logs", "agents")
    active = []
    try:
        if not os.path.isdir(agents_dir):
            return active
        for fname in os.listdir(agents_dir):
            if not fname.endswith(".jsonl"):
                continue
            agent_id = fname.replace(".jsonl", "")
            fpath = os.path.join(agents_dir, fname)
            lines = read_lines_tail(fpath, 5)
            last_event = None
            for line in reversed(lines):
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                    last_event = entry.get("event", "")
                    break
                except json.JSONDecodeError:
                    continue
            if last_event == "agent.start":
                active.append(agent_id)
    except OSError:
        pass
    return active


def is_team_mode_active(project_dir):
    """Check if agent teams are currently active (tmux or in-process)."""
    # Check for recent team coordination events
    coordination_log = os.path.join(project_dir, "RLM", "progress", "logs", "team-coordination.jsonl")
    if not os.path.exists(coordination_log):
        return False

    lines = read_lines_tail(coordination_log, 10)
    now = datetime.now(timezone.utc)

    for line in reversed(lines):
        line = line.strip()
        if not line:
            continue
        try:
            entry = json.loads(line)
            ts = entry.get("timestamp", "")
            event = entry.get("event", "")

            if ts:
                evt_time = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                # If a team event happened in the last 5 minutes, consider it active
                if (now - evt_time).total_seconds() < 300 and "team" in event.lower():
                    return True
        except (json.JSONDecodeError, ValueError):
            continue

    return False


def render_swarm_indicator(agent_count):
    """Render a swarm animation indicator based on agent count."""
    if agent_count == 0:
        return ""

    # Swarm animation frames (breathing effect)
    swarm_frames = [
        "◆",  # Small
        "◇",  # Medium
        "◆",  # Large (back to small)
    ]

    # Use timestamp to cycle through frames smoothly
    frame_idx = int(time.time() * 3) % len(swarm_frames)
    swarm_char = swarm_frames[frame_idx]

    # Color based on agent count
    if agent_count >= 6:
        color = FG_BR_GREEN  # All agents active
    elif agent_count >= 3:
        color = FG_BR_YELLOW  # Some agents
    else:
        color = FG_BR_CYAN  # Few agents

    return c(f"swarm:{swarm_char}x{agent_count}", color, BOLD)


def get_recent_events_count(project_dir):
    """Count events from the last hour in events.jsonl."""
    events_path = os.path.join(project_dir, "RLM", "progress", "logs", "events.jsonl")
    lines = read_lines_tail(events_path, 100)
    now = datetime.now(timezone.utc)
    count = 0
    for line in lines:
        line = line.strip()
        if not line:
            continue
        try:
            entry = json.loads(line)
            ts = entry.get("timestamp", "")
            if ts:
                evt_time = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                if (now - evt_time).total_seconds() < 3600:
                    count += 1
        except (json.JSONDecodeError, ValueError):
            continue
    return count


# ---------------------------------------------------------------------------
# Task metrics
# ---------------------------------------------------------------------------
def get_task_metrics(project_dir):
    """Count tasks by status from RLM/tasks/ directories."""
    tasks_base = os.path.join(project_dir, "RLM", "tasks")
    active_dir = os.path.join(tasks_base, "active")
    completed_dir = os.path.join(tasks_base, "completed")
    blocked_dir = os.path.join(tasks_base, "blocked")

    def count_md(d):
        try:
            return len([f for f in os.listdir(d) if f.endswith(".md") and f.startswith("TASK-")])
        except (FileNotFoundError, OSError):
            return 0

    active = count_md(active_dir)
    completed = count_md(completed_dir)
    blocked = count_md(blocked_dir)
    return active, completed, blocked


# ---------------------------------------------------------------------------
# Duration formatting
# ---------------------------------------------------------------------------
def fmt_duration(ms):
    """Format milliseconds into human-readable duration."""
    if not ms or ms <= 0:
        return "0s"
    secs = int(ms / 1000)
    if secs < 60:
        return f"{secs}s"
    mins = secs // 60
    secs = secs % 60
    if mins < 60:
        return f"{mins}m{secs}s" if secs else f"{mins}m"
    hours = mins // 60
    mins = mins % 60
    return f"{hours}h{mins}m"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    # Force UTF-8 output on Windows
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    # Read Claude Code session data from stdin
    try:
        session = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        session = {}

    model = session.get("model", {}).get("display_name", "?")
    ctx_pct = session.get("context_window", {}).get("used_percentage", 0)
    if isinstance(ctx_pct, float):
        ctx_pct = int(ctx_pct)
    cost = session.get("cost", {}).get("total_cost_usd", 0) or 0
    duration_ms = session.get("cost", {}).get("total_duration_ms", 0) or 0
    lines_added = session.get("cost", {}).get("total_lines_added", 0) or 0
    lines_removed = session.get("cost", {}).get("total_lines_removed", 0) or 0

    project_dir = session.get("workspace", {}).get("project_dir", os.getcwd())

    # --- Pipeline state ---
    state = read_json_file(os.path.join(project_dir, "RLM", "progress", "pipeline-state.json"))

    segments = []

    # 1. Model badge
    model_color = {
        "Opus": FG_MAGENTA + BOLD,
        "Sonnet": FG_CYAN + BOLD,
        "Haiku": FG_GREEN + BOLD,
    }.get(model, FG_WHITE + BOLD)
    segments.append(c(model, model_color))

    if state:
        current_phase = state.get("current_phase", "?")
        pipeline_status = state.get("status", "unknown")
        automation = state.get("automation_level", "?").upper()
        design_req = state.get("design_required", False)
        project_type = state.get("project_type", "")
        phases = state.get("phases", {})

        # 2. Phase bar
        phase_bar = build_phase_bar(phases)
        label = PHASE_LABELS.get(current_phase, f"P{current_phase}") if isinstance(current_phase, int) else str(current_phase)
        if pipeline_status == "completed":
            phase_info = f"{phase_bar} {c('DONE', BOLD, FG_BR_GREEN)}"
        else:
            phase_info = f"{phase_bar} {c(f'P{current_phase}', BOLD, FG_BR_YELLOW)}:{c(label, FG_WHITE)}"
        segments.append(phase_info)

        # 3. Automation level badge
        auto_colors = {
            "AUTO": FG_BR_GREEN,
            "SUPERVISED": FG_BR_YELLOW,
            "MANUAL": FG_BR_RED,
        }
        auto_c = auto_colors.get(automation, FG_WHITE)
        segments.append(c(automation, auto_c, BOLD))

        # 4. Project type / design flag
        type_seg = ""
        if project_type:
            type_seg = c(project_type.replace("TYPE_", ""), DIM, FG_CYAN)
        if design_req:
            type_seg += " " + c("UI", FG_MAGENTA, BOLD) if type_seg else c("UI", FG_MAGENTA, BOLD)
        if type_seg:
            segments.append(type_seg)
    else:
        segments.append(c("no pipeline", DIM, FG_GRAY))

    # 5. Task progress
    status_data = read_json_file(os.path.join(project_dir, "RLM", "progress", "status.json"))
    active_tasks, completed_tasks, blocked_tasks = get_task_metrics(project_dir)
    task_parts = []
    if status_data and status_data.get("currentTask"):
        task_parts.append(c(status_data["currentTask"], BOLD, FG_BR_CYAN))
    if completed_tasks or active_tasks or blocked_tasks:
        counts = []
        if completed_tasks:
            counts.append(c(f"{completed_tasks}ok", FG_BR_GREEN))
        if active_tasks:
            counts.append(c(f"{active_tasks}wip", FG_BR_YELLOW))
        if blocked_tasks:
            counts.append(c(f"{blocked_tasks}blk", FG_RED))
        task_parts.append("/".join(counts))
    if task_parts:
        segments.append(" ".join(task_parts))

    # 6. Context gradient meter
    segments.append(context_gradient(ctx_pct))

    # 7. Observability metrics
    tool_ok, tool_fail = get_tool_metrics(project_dir)
    active_agents = get_active_agents(project_dir)
    event_count = get_recent_events_count(project_dir)
    team_active = is_team_mode_active(project_dir)

    obs_parts = []
    if tool_ok or tool_fail:
        tool_str = c(f"{tool_ok}", FG_BR_GREEN)
        if tool_fail:
            tool_str += "/" + c(f"{tool_fail}!", FG_BR_RED)
        obs_parts.append(f"tools:{tool_str}")

    # Agent swarm indicator (animated)
    if active_agents:
        agent_count = len(active_agents)
        if team_active:
            swarm_ind = render_swarm_indicator(agent_count)
            obs_parts.append(swarm_ind)
        else:
            agent_names = ",".join(a[:8] for a in active_agents[:3])
            obs_parts.append(c(f"{agent_count}agents", BOLD, FG_BR_CYAN) + f"({c(agent_names, DIM, FG_CYAN)})")

    if event_count:
        obs_parts.append(c(f"{event_count}evt", DIM, FG_BLUE))
    if obs_parts:
        segments.append(" ".join(obs_parts))

    # 8. Lines changed
    if lines_added or lines_removed:
        delta = c(f"+{lines_added}", FG_BR_GREEN) + "/" + c(f"-{lines_removed}", FG_RED)
        segments.append(delta)

    # 9. Cost + duration
    tail_parts = []
    if cost > 0:
        if cost < 0.50:
            cost_color = FG_BR_GREEN
        elif cost < 2.00:
            cost_color = FG_BR_YELLOW
        else:
            cost_color = FG_BR_RED
        tail_parts.append(c(f"${cost:.2f}", cost_color))
    if duration_ms > 0:
        tail_parts.append(c(fmt_duration(duration_ms), DIM, FG_GRAY))
    if tail_parts:
        segments.append(" ".join(tail_parts))

    # Assemble
    output = " | ".join(segments)
    # Write raw bytes to handle ANSI on Windows
    sys.stdout.buffer.write(output.encode("utf-8"))
    sys.stdout.buffer.write(b"\n")
    sys.stdout.buffer.flush()


if __name__ == "__main__":
    main()
