# RLM Method — Copilot CLI Starter Kit

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Copilot CLI](https://img.shields.io/badge/GitHub%20Copilot-CLI-black?logo=github)](https://docs.github.com/en/copilot)
[![RLM Method](https://img.shields.io/badge/RLM%20Method-v2.7-green.svg)](RLM/START-HERE.md)

A pre-configured workspace for building software with **GitHub Copilot CLI** using the **RLM (Research, Lead, Manage) Method** — a structured 9-phase pipeline that transforms raw ideas into production-ready, verified code.

This starter kit provides **12 custom Copilot CLI agents**, lifecycle hooks, reusable skills, prompt templates, and path-specific coding standards — all wired together so you can go from idea to working app with AI-guided development.

## Quick Start

```bash
# 1. Clone this repo
git clone <repo-url> my-project
cd my-project

# 2. Launch Copilot CLI
copilot

# 3. List available RLM agents
/agent

# 4. Start the full pipeline (or pick a phase agent)
@rlm-orchestrator

# 5. Use Shift+Tab for plan mode during design phases
```

## Directory Structure

```
.github/
├── agents/          # 12 custom Copilot CLI agents (one per phase + support)
├── hooks/           # Session lifecycle automation (start, end, safety, logging)
│   ├── hooks.json
│   └── scripts/     # Cross-platform hook scripts (.sh + .ps1)
├── skills/          # On-demand pipeline knowledge (rlm-pipeline, tdd-workflow, spec-writing)
├── prompts/         # Reusable prompt templates (discover, create-specs, implement, etc.)
├── instructions/    # Path-specific standards for source code and RLM artifacts
└── copilot-instructions.md  # Repository-wide Copilot context

RLM/
├── START-HERE.md    # Detailed guide — start here
├── prompts/         # Canonical pipeline prompts (01-DISCOVER through 09-VERIFY-FEATURE)
├── templates/       # Document templates (PRD, spec, task, design)
├── agents/          # Agent role definitions
├── docs/            # User guide, troubleshooting
├── config/          # Pipeline configuration
├── specs/           # Your project's specifications (PRD, features, architecture, design)
├── tasks/           # Implementation tasks (active, completed, blocked)
├── progress/        # Status tracking, checkpoints, reports, reviews
└── research/        # Research materials and cached docs

AGENTS.md            # Agent registry for Copilot CLI discovery
```

## 9-Phase Pipeline

| Phase | Agent | Purpose |
|-------|-------|---------|
| 1 — Discovery | `@rlm-discover` | Transform ideas into PRD and constitution |
| 2 — Design | `@rlm-design` | Generate design system, tokens, and component library |
| 3 — Specs | `@rlm-specs` | Transform PRD into feature specs and architecture |
| 4 — Feature Design | `@rlm-feature-design` | Create per-feature UI/UX design specifications |
| 5 — Tasks | `@rlm-tasks` | Break feature specs into implementation tasks |
| 6 — Implementation | `@rlm-implement` | TDD implementation (Red → Green → Refactor) |
| 7 — Quality | `@rlm-quality` | Code review, testing, and design QA |
| 8 — Verification | `@rlm-verify` | E2E feature verification with acceptance testing |
| 9 — Reporting | `@rlm-report` | Generate progress reports and project summary |

**Support agents:** `@rlm-resume` (resume interrupted sessions), `@rlm-debug` (diagnose/repair RLM state)

Use `@rlm-orchestrator` to run all phases end-to-end, or invoke individual agents for targeted work.

## Features

- **TDD by default** — All implementation follows Test-Driven Development (Red → Green → Refactor)
- **3 automation levels** — `AUTO` (full autonomy), `SUPERVISED` (checkpoints at decisions), `MANUAL` (step-by-step approval)
- **Resume capability** — `@rlm-resume` restores context and continues from where you left off
- **Copilot Memory integration** — Agents leverage session state and checkpoint tracking
- **Cross-platform hooks** — Lifecycle scripts in both `.sh` and `.ps1` (macOS/Linux/Windows)
- **Path-specific instructions** — Different coding standards for source code vs. RLM artifacts
- **Structured progress tracking** — JSON-based status, checkpoints, and pipeline state

## Getting Started

For a detailed walkthrough of the RLM Method and pipeline, see **[`RLM/START-HERE.md`](RLM/START-HERE.md)**.

## Customization

To adapt this starter kit for your project:

1. **Run the discovery phase** — Start with `@rlm-discover` or `@rlm-orchestrator` to generate your PRD and project constitution from your idea
2. **Review generated specs** — The pipeline creates all specifications, architecture decisions, and task breakdowns in `RLM/specs/` and `RLM/tasks/`
3. **Adjust standards** — Edit `.github/instructions/` and `RLM/specs/constitution.md` to match your project's conventions
4. **Add your code** — Implementation goes in your project directories; RLM artifacts stay in `RLM/`

## License

[MIT](LICENSE)
