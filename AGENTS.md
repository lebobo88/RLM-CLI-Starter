# AGENTS.md — RLM Method Starter Kit

> This file provides context about the custom agents available in this workspace.
> Three CLI integrations drive the same 9-phase pipeline: Copilot CLI, Claude Code, and Gemini CLI.

## Quick Start

```
1. Run `copilot` from this directory
2. Enter `/agent` to see available agents
3. Select an agent (e.g., rlm-orchestrator for full pipeline)
4. Follow the agent's guided workflow
```

## Pipeline Agents

| Agent | Phase | Purpose |
|-------|-------|---------|
| rlm-orchestrator | All | Full 9-phase pipeline automation — idea to verified code |
| rlm-discover | 1 | Transform ideas into PRD and constitution |
| rlm-design | 2 | Generate design system, tokens, and component library |
| rlm-specs | 3 | Transform PRD into feature specs and architecture |
| rlm-feature-design | 4 | Create per-feature UI/UX design specifications |
| rlm-tasks | 5 | Break feature specs into implementation tasks |
| rlm-implement | 6 | TDD implementation of tasks (Red → Green → Refactor) |
| rlm-quality | 7 | Code review, testing, and design QA |
| rlm-verify | 8 | E2E feature verification with acceptance testing |
| rlm-report | 9 | Generate progress reports and project summary |

## Support Agents

| Agent | Purpose |
|-------|---------|
| rlm-implement-all | Batch TDD implementation of all active tasks in dependency order |
| rlm-fix-bug | Debug and fix issues using structured root-cause analysis and TDD |
| rlm-prime | Pre-load feature or task context into the conversation |
| rlm-resume | Resume interrupted RLM sessions — restore context and continue |
| rlm-debug | Diagnose and repair RLM state — fix orphaned tasks, validate artifacts |
| rlm-new-agent | Create a new RLM agent across all CLI platforms (Copilot, Claude Code, Gemini) |
| rlm-sandbox | Manage isolated sandbox environments (E2B or Docker) for code execution and testing |
| gemini-analyzer | Expert wrapper for Gemini CLI to perform large-scale codebase analysis (1M+ tokens) |

## Adding New Agents

Use `rlm-new-agent` to scaffold a new agent across all 3 platforms in one step:
- **Copilot CLI**: `@rlm-new-agent`
- **Claude Code**: `/rlm-new-agent <name> <description>`
- **Gemini CLI**: `/rlm-new-agent <name> <description>`

See `RLM/docs/CROSS-PLATFORM-AGENTS.md` for the full cross-platform format reference.

## Copilot CLI Integration Points

| Feature | Location | Purpose |
|---------|----------|---------|
| Custom Agents | `.github/agents/` | 17 specialized pipeline agents |
| Hooks | `.github/hooks/` | Session lifecycle, safety, context injection, logging |
| Skills | `.github/skills/` | On-demand pipeline knowledge (rlm-pipeline, tdd-workflow, spec-writing) |
| Prompt Files | `.github/prompts/` | Quick-access prompt templates (11 prompts) |
| Instructions | `.github/copilot-instructions.md` | Repository-wide context |
| Path Instructions | `.github/instructions/` | Code and artifact standards |

## Agent Delegation

Agents can delegate work to each other using the `agent` tool. The orchestrator (`rlm-orchestrator`) coordinates all phases automatically, delegating to specialized agents as needed.

## Claude Code Integration Points

| Feature | Location | Purpose |
|---------|----------|---------|
| Slash Commands | `.claude/commands/` | 17 user-facing pipeline commands (`/rlm-*`) |
| Hooks | `.claude/hooks/` | Session lifecycle, safety, context injection, logging |
| Settings | `.claude/settings.json` | Windows (PowerShell) hook configuration |
| Settings (Unix) | `.claude/settings-unix.json` | Linux/macOS hook configuration |
| Project Context | `CLAUDE.md` | Claude Code project instructions |

## Gemini CLI Integration Points

| Feature | Location | Purpose |
|---------|----------|---------|
| Sub-Agents | `.gemini/agents/` | 17 delegatable pipeline agents |
| Custom Commands | `.gemini/commands/` | 17 user-facing pipeline commands (`/rlm-*`) |
| Hooks | `.gemini/hooks/` | Session lifecycle, safety, agent logging |
| Skills | `.gemini/skills/` | On-demand pipeline knowledge (rlm-pipeline, tdd-workflow, spec-writing) |
| Settings | `.gemini/settings.json` | Windows (PowerShell) hook configuration + experimental flags |
| Settings (Unix) | `.gemini/settings-unix.json` | Linux/macOS hook configuration |
| Project Context | `GEMINI.md` | Gemini CLI project instructions |

## Cross-Platform Parity

| Feature | Copilot CLI | Claude Code | Gemini CLI |
|---------|------------|-------------|------------|
| User invocation | `@rlm-discover` | `/rlm-discover` | `/rlm-discover` |
| Agent delegation | `@rlm-discover` | Inline workflow | `rlm-discover` tool call |
| Agent count | 17 `.agent.md` | 17 `.md` commands | 17 `.md` agents + 17 `.toml` commands |
| Canonical prompts | `RLM/prompts/` | `RLM/prompts/` | `RLM/prompts/` |
| Skills | 3 in `.github/skills/` | Inline in CLAUDE.md | 3 in `.gemini/skills/` |
| Safety hooks | `copilot:tool.pre` | `PreToolUse` | `BeforeTool` |
| Session hooks | `copilot:session.*` | `SessionStart/End` | `SessionStart/End` |
| Project context | `AGENTS.md` | `CLAUDE.md` | `GEMINI.md` |

## RLM Method Reference

- **Entry Point**: `RLM/START-HERE.md`
- **Pipeline Prompts**: `RLM/prompts/` (01-DISCOVER through 10-SANDBOX)
- **Templates**: `RLM/templates/`
- **Documentation**: `RLM/docs/`
