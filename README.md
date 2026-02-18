# RLM Method Starter Kit

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![RLM Method](https://img.shields.io/badge/RLM%20Method-v2.7-green.svg)](RLM/START-HERE.md)
[![Status Bar](https://img.shields.io/badge/Status%20Bar-Real--time-cyan.svg)](RLM/docs/STATUS-BAR.md)

**A multi-platform AI development framework** that transforms raw ideas into production-ready code through a structured 9-phase pipeline. Supports GitHub Copilot CLI, Claude Code, and Gemini CLI — all driving the same canonical workflow.

This is a **starter kit**, not an application. There is no `package.json`, no build system, and no test suite until Phase 6 scaffolds your actual project.

---

## ✨ New: Real-Time Status Bar & Agent Spawning

GitHub Copilot CLI sessions now feature:
- **📊 Live status bar**: Pipeline phase, task progress, context usage
- **🎭 Spinner messages**: Rotating roasts, tips, and progress updates
- **🤖 Agent animations**: ASCII art spawning for team/batch operations

See [`RLM/docs/STATUS-BAR.md`](RLM/docs/STATUS-BAR.md) for details.

---

## What's Inside

- **23 Copilot CLI agents** (`.github/agents/`) — Custom agents for GitHub Copilot CLI
- **20 Claude Code commands** (`.claude/commands/`) — Slash commands (`/rlm-*`)
- **6 Claude Code sub-agents** (`.claude/agents/`) — Specialized parallel agents
- **6 Claude Code skills** (`.claude/skills/`) — On-demand knowledge modules
- **23 Gemini CLI agents** (`.gemini/agents/`) — Delegatable sub-agents
- **21 Gemini CLI commands** (`.gemini/commands/`) — User-facing entry points
- **Shared pipeline prompts** (`RLM/prompts/`) — Canonical workflow instructions
- **Lifecycle hooks** — Pre-tool safety, session tracking, progress validation (PowerShell + Bash)
- **Path-specific standards** — Different coding rules for source code vs. RLM artifacts

---

## 🚀 Quick Setup

**The fastest way to start:** Install the `rlm` shell alias for instant orchestrator access.

### 1. Install RLM Alias (Recommended)

**PowerShell (Windows):**
```powershell
.github\hooks\scripts\setup-rlm-alias.ps1
```

**Bash / Zsh (Linux / macOS):**
```bash
bash .github/hooks/scripts/setup-rlm-alias.sh
```

**Fish Shell:**
```fish
fish .github/hooks/scripts/setup-rlm-alias.fish
```

### 2. Start Orchestrator

```bash
rlm  # That's it! Instant orchestrator access ⚡
```

**What this does:**
- Navigates to your RLM project directory
- Launches the orchestrator agent directly (bypasses `/agents` menu)
- Displays welcome screen with pipeline status

See **[`RLM/docs/SETUP-ALIAS.md`](RLM/docs/SETUP-ALIAS.md)** for detailed setup instructions.

---

## Quick Start

### Option 1: GitHub Copilot CLI

#### With RLM Alias (Fastest):
```bash
# One-time setup
.github\hooks\scripts\setup-rlm-alias.ps1  # PowerShell
# or
bash .github/hooks/scripts/setup-rlm-alias.sh  # Bash/Zsh

# Then every time:
rlm  # Instant orchestrator! 🚀
```

#### With CLI Flag:
```bash
copilot --agent rlm-orchestrator
```

#### With Interactive Menu:

#### With Interactive Menu:
```bash
# Install prerequisites
gh copilot install

# Navigate to project
cd my-project

# Start Copilot CLI
copilot

# List RLM agents
/agent

# Start the pipeline
@rlm-orchestrator
```

### Option 2: Claude Code

```bash
# Install Claude Code (requires subscription)
npm install -g @anthropic-ai/claude-code

# Navigate to project
cd my-project

# Start Claude Code
claude

# Run pipeline phases
/rlm-discover     # Phase 1: Idea → PRD
/rlm-specs        # Phase 3: PRD → Feature specs
/rlm-implement    # Phase 6: TDD implementation
```

### Option 3: Gemini CLI

```bash
# Install Gemini CLI
npm install -g @google/generative-ai-cli

# Authenticate
gemini auth login

# Navigate to project
cd my-project

# Start Gemini CLI
gemini

# Run pipeline phases
/rlm-discover     # Phase 1: Idea → PRD
/rlm-specs        # Phase 3: PRD → Feature specs
/rlm-implement    # Phase 6: TDD implementation
```

---

## Platform Comparison

| Feature | Copilot CLI | Claude Code | Gemini CLI |
|---------|------------|-------------|------------|
| **Agents** | 23 custom agents | 20 commands + 6 sub-agents | 23 sub-agents + 21 commands |
| **Context Window** | 192K tokens | 200K tokens | 1M tokens |
| **Hooks** | Yes (4 libraries) | Yes (7 libraries) | Yes (4 libraries) |
| **Skills** | 4 skills | 6 skills | 4 skills |
| **Agent Teams** | No | Yes (parallel execution) | No |
| **Cost** | $10-19/user/mo | $20-30/user/mo | Free tier + paid API |
| **Best For** | GitHub-centric workflows | Agent orchestration, TDD | Large codebase analysis |

---

## 9-Phase Pipeline

| Phase | Agent/Command | What It Does | Key Artifacts |
|-------|--------------|--------------|---------------|
| 1 | `rlm-discover` | Transform idea into PRD + Constitution | `RLM/specs/PRD.md`, `constitution.md` |
| 2 | `rlm-design` | Design system (UI projects only) | `RLM/specs/design/` |
| 3 | `rlm-specs` | Feature specs + architecture | `RLM/specs/features/FTR-XXX/` |
| 4 | `rlm-feature-design` | Per-feature UI/UX (UI only) | `FTR-XXX/design-spec.md` |
| 5 | `rlm-tasks` | Task breakdown with wiring | `RLM/tasks/active/TASK-XXX.md` |
| 6 | `rlm-implement` | TDD implementation (Red → Green → Refactor) | Source code + tests |
| 7 | `rlm-quality` | Code review + testing + design QA | `RLM/progress/reviews/` |
| 8 | `rlm-verify` | E2E feature verification | `RLM/progress/verification/` |
| 9 | `rlm-report` | Progress reports + metrics | `RLM/progress/reports/` |

**Support agents:** `rlm-orchestrator` (full pipeline), `rlm-implement-all` (batch), `rlm-fix-bug` (root cause analysis), `rlm-prime` (context pre-loading), `rlm-resume` (continue sessions), `rlm-debug` (state repair), `rlm-sandbox` (E2B/Docker), `rlm-new-agent` (scaffold new agents), `rlm-team` (parallel orchestration), `rlm-observe` (observability), `gemini-analyzer` (1M+ token analysis).

---

## Directory Structure

```
.github/
├── agents/          # 23 Copilot CLI agents
├── hooks/           # Session lifecycle automation
│   ├── hooks.json
│   └── scripts/     # Cross-platform hook scripts (.sh + .ps1)
│       └── lib/     # 4 shared libraries
├── skills/          # 4 skills (rlm-pipeline, sandbox, spec-writing, tdd-workflow)
└── instructions/    # Path-specific coding standards

.claude/
├── commands/        # 20 slash commands (/rlm-*)
├── agents/          # 6 sub-agents (team-lead, code-writer, test-writer, reviewer, tester, gemini-analyzer)
├── skills/          # 6 skills (rlm-pipeline, spec-writing, tdd-workflow, sandbox, fork-terminal, observability)
└── hooks/           # Session lifecycle automation
    ├── lib/         # 7 shared libraries
    └── agents/      # 7 agent-specific hooks

.gemini/
├── agents/          # 23 sub-agents (delegatable)
├── commands/        # 21 TOML commands (/rlm-*)
├── skills/          # 4 skills
└── hooks/           # Session lifecycle automation
    └── lib/         # 4 shared libraries

RLM/
├── START-HERE.md    # Entry point and pipeline guide
├── prompts/         # Canonical workflow prompts (01-DISCOVER through 09-VERIFY-FEATURE)
├── templates/       # Document templates (PRD, spec, task, design)
├── specs/           # Generated specifications (PRD, features, architecture, design)
├── tasks/           # Implementation tasks (active, completed, blocked)
├── progress/        # Status tracking, checkpoints, reports, reviews
├── docs/            # User guide, troubleshooting, cross-platform docs
└── research/        # Research materials and cached docs

AGENTS.md            # Agent registry for Copilot CLI discovery
CLAUDE.md            # Claude Code project instructions
GEMINI.md            # Gemini CLI project instructions
```

---

## Getting Started

### For All Platforms

1. **Clone this starter kit:**
   ```bash
   git clone <repo-url> my-project
   cd my-project
   ```

2. **Choose your platform** (Copilot CLI, Claude Code, or Gemini CLI)

3. **Start the pipeline:**
   - Copilot CLI: `copilot` → `/agent` → `@rlm-orchestrator`
   - Claude Code: `claude` → `/rlm-discover`
   - Gemini CLI: `gemini` → `/rlm-discover`

4. **Review generated specs** at `RLM/specs/`

5. **Customize standards** at `.github/instructions/` or `RLM/specs/constitution.md`

6. **Implement** with `/rlm-tasks` → `/rlm-implement`

### Platform-Specific Setup

#### Copilot CLI
- **Install:** `gh copilot install`
- **Agents:** `.github/agents/` (23 custom agents)
- **Invoke:** `@rlm-discover`, `@rlm-specs`, etc.
- **Plan mode:** Shift+Tab during design phases

#### Claude Code
- **Install:** See [claude.ai/code](https://claude.ai/code)
- **Commands:** `.claude/commands/` (20 slash commands)
- **Sub-agents:** `.claude/agents/` (6 specialized agents)
- **Invoke:** `/rlm-discover`, `/rlm-specs`, etc.
- **Agent teams:** `/rlm-team implement` for parallel execution

#### Gemini CLI
- **Install:** `npm install -g @google/generative-ai-cli`
- **Authenticate:** `gemini auth login`
- **Commands:** `.gemini/commands/` (21 TOML commands)
- **Sub-agents:** `.gemini/agents/` (23 delegatable)
- **Invoke:** `/rlm-discover`, `/rlm-specs`, etc.

---

## Key Features

### TDD by Default
All Phase 6+ implementation follows Test-Driven Development:
1. Load context (0-20%)
2. Write failing tests (TDD Red, 20-40%)
3. Implement code (TDD Green, 40-70%)
4. Run tests, check coverage 80%+ (70-85%)
5. Quality checks (85-100%)

### Hard Gates (Must Pass)
- No incomplete markers (`TODO`, `FIXME`, `HACK`, `XXX`, `PLACEHOLDER`)
- Every function < 50 lines
- No empty/stub source files (min 5 non-blank lines)
- Test framework config present
- Manifest task ID matches `TASK-NNN` format

### Automation Levels
- **AUTO** — Full autonomy, only pauses for blockers
- **SUPERVISED** — Checkpoints at key decisions, pause between phases
- **MANUAL** — Step-by-step approval for every action

### Design Detection
Phase 1 scores your idea against UI indicators to auto-determine if Phases 2 & 4 should run:
- **Score >= 3** → Design phases activate
- **Score <= -2** → Design phases skip
- **-1 to 2** → Ambiguous, ask user

### Hook Safety
Two-layer protection for RLM artifacts:
1. **Bash/shell guard** — Blocks destructive `rm -rf RLM/specs`, etc.
2. **Edit/Write guard** — Blocks near-empty writes to `status.json`, `checkpoint.json`, `pipeline-state.json`

### Dynamic Context Injection
Session-start hook generates `RLM/progress/.current-context.md` with active pipeline phase, current agent, active task, and automation level. Commands auto-load this via `!cat` syntax.

### Cross-Platform Hooks
All hooks ship in dual formats:
- `.ps1` for Windows (PowerShell)
- `.sh` for Linux/macOS/WSL

To switch platforms:
```bash
# Linux/macOS
cp .claude/settings-unix.json .claude/settings.json
cp .gemini/settings-unix.json .gemini/settings.json

# Windows (default)
# Already configured for PowerShell
```

---

## Documentation

- **Start Here:** [`RLM/START-HERE.md`](RLM/START-HERE.md) — Detailed guide
- **User Guide:** [`RLM/docs/USER-GUIDE.md`](RLM/docs/USER-GUIDE.md) — Step-by-step walkthrough
- **Cross-Platform Agents:** [`RLM/docs/CROSS-PLATFORM-AGENTS.md`](RLM/docs/CROSS-PLATFORM-AGENTS.md) — How to create new agents
- **Claude Code:** [`CLAUDE.md`](CLAUDE.md) — Claude Code-specific instructions
- **Gemini CLI:** [`GEMINI.md`](GEMINI.md) — Gemini CLI-specific instructions
- **Agents Registry:** [`AGENTS.md`](AGENTS.md) — Full agent list for Copilot CLI

---

## Example: Starting a New Project

### Copilot CLI
```bash
copilot
# → /agent
# → Select @rlm-discover
# → "Help me discover specs for: [your idea]"
# → Answer 3-4 clarifying questions
# → Review PRD at RLM/specs/PRD.md
# → Continue with @rlm-specs → @rlm-tasks → @rlm-implement
```

### Claude Code
```bash
claude
# → /rlm-discover [your idea]
# → Answer 3-4 clarifying questions
# → Review PRD at RLM/specs/PRD.md
# → /rlm-specs → /rlm-tasks → /rlm-implement
```

### Gemini CLI
```bash
gemini
# → /rlm-discover [your idea]
# → Answer 3-4 clarifying questions
# → Review PRD at RLM/specs/PRD.md
# → /rlm-specs → /rlm-tasks → /rlm-implement
```

---

## Creating New Agents

Use `/rlm-new-agent` (Claude Code) or `@rlm-new-agent` (Copilot CLI) to scaffold a new agent across all three platforms:
1. Reads `RLM/docs/CROSS-PLATFORM-AGENTS.md` for wiring instructions
2. Creates agent file in `.github/agents/`, `.claude/agents/` or `.claude/commands/`, `.gemini/agents/` + `.gemini/commands/`
3. References shared prompt in `RLM/prompts/`
4. Updates `AGENTS.md` registry

---

## License

[MIT](LICENSE)

---

## Need Help?

1. Read [`RLM/START-HERE.md`](RLM/START-HERE.md) for detailed instructions
2. Use `@rlm-debug` or `/rlm-debug` to diagnose state issues
3. Check the prompts in `RLM/prompts/` — they contain detailed instructions
4. File issues at your project's issue tracker
