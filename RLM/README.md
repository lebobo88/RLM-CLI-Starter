# RLM - Research, Lead, Manage

**AI-Powered Software Development Method for Copilot CLI**

RLM transforms raw project ideas into production-ready code through a structured 9-phase pipeline, powered by custom Copilot CLI agents.

## Start Here

**New to RLM?** Read [START-HERE.md](START-HERE.md)

## Workflow

```
@rlm-discover  →  @rlm-specs  →  @rlm-tasks  →  @rlm-implement
      │                │              │                │
      ▼                ▼              ▼                ▼
   PRD.md         Specs +        Tasks in          Working
 constitution    Architecture     active/            Code
```

## Using RLM with Copilot CLI

1. Run `copilot` from your project folder
2. Use `/agent` to select an RLM agent
3. Follow the agent's guided workflow

### Available Agents

| Agent | Phase | Purpose |
|-------|-------|---------|
| @rlm-orchestrator | All | Full pipeline automation |
| @rlm-discover | 1 | Idea → PRD + Constitution |
| @rlm-design | 2 | Design system (UI projects) |
| @rlm-specs | 3 | Feature specs + architecture |
| @rlm-feature-design | 4 | Per-feature UI/UX design |
| @rlm-tasks | 5 | Task breakdown |
| @rlm-implement | 6 | TDD implementation |
| @rlm-quality | 7 | Code review + testing |
| @rlm-verify | 8 | E2E verification |
| @rlm-report | 9 | Progress reports |
| @rlm-resume | - | Resume interrupted sessions |
| @rlm-debug | - | Diagnose state issues |

## Agent Architecture

This project contains three distinct sets of agent files, each serving a different purpose:

### Three Agent Layers

1. **`.github/agents/`** — **Copilot CLI Agents** (12 files)
   These are the invokable agents registered with Copilot CLI. Each maps to a pipeline phase:
   - `rlm-orchestrator` — Full pipeline coordination
   - `rlm-discover` through `rlm-report` — Phase 1–9 agents
   - `rlm-resume`, `rlm-debug` — Support agents

2. **`RLM/agents/`** — **Role Definitions** (12 files)
   Detailed role specifications that define what each specialist does. These are the "job descriptions" that inform agent behavior:
   - `code-writer-agent` — TDD Green phase (implementation only)
   - `test-writer-agent` — TDD Red phase (tests only)
   - `reviewer-agent` — Code review + security audit
   - `design-agent` — UI/UX + design system
   - `master-architect` — Architecture + tech decisions
   - `research-agent` — Discovery + competitive analysis
   - `verifier-agent` — E2E verification
   - `team-lead-agent` — Orchestration + delegation
   - `implementation-agent` — Full TDD workflow
   - `testing-agent` — Comprehensive QA
   - `devops-agent` — CI/CD + infrastructure
   - `doc-validator-agent` — Documentation sync

3. **`RLM/templates/copilot/agents/`** — **Scaffolding Templates** (5 files)
   Simplified agent templates for generating new projects. Copy these when bootstrapping a new repo.

### Mapping

| Copilot CLI Agent | Primary Role Definition |
|-------------------|------------------------|
| `rlm-discover` | `research-agent` |
| `rlm-design` | `design-agent` |
| `rlm-specs` | `master-architect` |
| `rlm-feature-design` | `design-agent` |
| `rlm-tasks` | `team-lead-agent` |
| `rlm-implement` | `implementation-agent` + `code-writer-agent` + `test-writer-agent` |
| `rlm-quality` | `reviewer-agent` + `testing-agent` |
| `rlm-verify` | `verifier-agent` |
| `rlm-report` | `doc-validator-agent` |
| `rlm-orchestrator` | `team-lead-agent` |
| `rlm-debug` | `devops-agent` |

## Key Directories

| Directory | Purpose |
|-----------|---------|
| `prompts/` | Workflow prompts |
| `templates/` | Document templates |
| `specs/` | Generated specifications |
| `tasks/` | Implementation tasks |
| `progress/` | Progress tracking |
| `docs/` | Documentation |
| `agents/` | Agent role definitions |

## Features

- **9-Phase Pipeline**: Complete automation from idea to verified code
- **TDD by Default**: Test-Driven Development built in
- **Fine-Grained Tasks**: 1-4 hour tasks for predictable progress
- **3 Automation Levels**: AUTO, SUPERVISED, MANUAL
- **Resume Capability**: Stop and continue anytime
- **Hooks Integration**: Session lifecycle automation via `.github/hooks/`
- **Skills**: On-demand pipeline knowledge via `.github/skills/`
- **Copilot Memory**: Learns coding patterns over time

## Documentation

| Document | Purpose |
|----------|---------|
| [START-HERE.md](START-HERE.md) | Quick start guide |
| [User Guide](docs/USER-GUIDE.md) | Complete walkthrough |
| [Quick Reference](docs/QUICK-REFERENCE.md) | One-page cheat sheet |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Common issues |

## License

MIT
