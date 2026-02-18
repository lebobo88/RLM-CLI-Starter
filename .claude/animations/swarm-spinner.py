#!/usr/bin/env python3
"""Agent swarm spinner for terminal output during team mode operations.

Displays a cascading animated swarm of agents in the terminal with
color effects and smooth transitions.
"""
import sys
import time
import threading
from datetime import datetime

# ANSI colors
RESET = "\x1b[0m"
BOLD = "\x1b[1m"
DIM = "\x1b[2m"
BRIGHT_GREEN = "\x1b[92m"
BRIGHT_MAGENTA = "\x1b[95m"
BRIGHT_CYAN = "\x1b[96m"
GREEN = "\x1b[32m"
MAGENTA = "\x1b[35m"

# ASCII Agent frames (breathing effect)
AGENT_FRAMES = [
    f"{BRIGHT_GREEN}  ◆ ◆{RESET}",      # Small
    f"{BRIGHT_GREEN} ◇ ◇ ◇{RESET}",     # Medium
    f"{BRIGHT_GREEN}◆ ◆ ◆ ◆{RESET}",    # Large
    f"{BRIGHT_GREEN} ◇ ◆ ◇ {RESET}",    # Glitch
]

# Spinner frames (smooth rotation)
SPINNER_FRAMES = [
    "◐",
    "◓",
    "◑",
    "◒",
]

class SwarmSpinner:
    """Terminal-based agent swarm animation."""

    def __init__(self, message="Spawning agents", duration=None):
        self.message = message
        self.duration = duration
        self.start_time = None
        self.running = False
        self.agent_count = 0
        self.max_agents = 8
        self.frame_index = 0
        self.spinner_index = 0
        self.thread = None

    def _render_agents(self):
        """Render agent line based on current count."""
        if self.agent_count == 0:
            return ""

        # Build agent swarm visual
        agents = []
        for i in range(min(self.agent_count, self.max_agents)):
            agent_frame = AGENT_FRAMES[i % len(AGENT_FRAMES)]
            agents.append(agent_frame)

        return " ".join(agents)

    def _render_progress_bar(self):
        """Render progress bar if duration is set."""
        if not self.duration or not self.start_time:
            return ""

        elapsed = time.time() - self.start_time
        progress = min(elapsed / self.duration, 1.0)
        bar_width = 20
        filled = int(bar_width * progress)

        bar = (
            f"{BRIGHT_GREEN}{'█' * filled}{RESET}"
            f"{DIM}{'░' * (bar_width - filled)}{RESET}"
        )
        pct = int(progress * 100)
        return f" [{bar}] {pct}%"

    def _animate(self):
        """Animation loop."""
        while self.running:
            # Update spinner
            spinner = SPINNER_FRAMES[self.spinner_index % len(SPINNER_FRAMES)]
            self.spinner_index += 1

            # Gradually spawn agents
            if self.agent_count < self.max_agents:
                self.agent_count += 1
                time.sleep(0.15)  # Stagger agent spawn
            else:
                time.sleep(0.1)  # Keep animating even when full

            # Build output
            output = f"\r{BRIGHT_CYAN}{spinner}{RESET} {self.message}"
            output += f" {BRIGHT_MAGENTA}({self.agent_count}/{self.max_agents}){RESET}"

            agents_visual = self._render_agents()
            if agents_visual:
                output += f"\n  {agents_visual}"

            progress = self._render_progress_bar()
            if progress:
                output += progress

            sys.stdout.write(output)
            sys.stdout.flush()

    def start(self):
        """Start the animation."""
        self.running = True
        self.start_time = time.time()
        self.thread = threading.Thread(target=self._animate, daemon=True)
        self.thread.start()

    def stop(self, message=None):
        """Stop the animation."""
        self.running = False
        if self.thread:
            self.thread.join(timeout=1)

        # Clear line
        sys.stdout.write("\r" + " " * 80 + "\r")
        sys.stdout.flush()

        if message:
            print(f"{BRIGHT_GREEN}✓{RESET} {message}")


# Convenience functions
def show_swarm_animation(message="Spawning agents", duration=5):
    """Context manager for swarm animation."""
    class SwarmContext:
        def __init__(self, msg, dur):
            self.spinner = SwarmSpinner(msg, dur)

        def __enter__(self):
            self.spinner.start()
            return self.spinner

        def __exit__(self, *args):
            self.spinner.stop("Agents ready")

    return SwarmContext(message, duration)


if __name__ == "__main__":
    # Demo
    print(f"{BRIGHT_CYAN}Agent Swarm Spinner Demo{RESET}\n")

    spinner = SwarmSpinner("Initializing team mode", duration=3)
    spinner.start()
    time.sleep(3.5)
    spinner.stop("Team spawned successfully")

    print()
    time.sleep(1)

    spinner2 = SwarmSpinner("Running parallel tasks", duration=2)
    spinner2.start()
    time.sleep(2.5)
    spinner2.stop("Tasks completed")
