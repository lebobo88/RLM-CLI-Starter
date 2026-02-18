# AGENTS.md — RLM Method Starter Kit

> This file provides context about the custom agents available in this workspace.
> Three CLI integrations drive the same 9-phase pipeline: Copilot CLI, Claude Code, and Gemini CLI.

## Quick Start

**Three Ways to Start:**

### ⭐ Option 1: Shell Alias (Fastest)
```bash
# One-time setup:
.github\hooks\scripts\setup-rlm-alias.ps1  # PowerShell
# or
bash .github/hooks/scripts/setup-rlm-alias.sh  # Bash/Zsh/Fish

# Then every time:
rlm  # Instant orchestrator! 🚀
```

### 🔧 Option 2: CLI Flag
```bash
copilot --agent rlm-orchestrator
```

### 🖱️ Option 3: Interactive Menu
```bash
1. Run `copilot` from this directory
2. Enter `/agent` to see available agents
3. Select an agent (e.g., rlm-orchestrator for full pipeline)
4. Follow the agent's guided workflow
```

**Recommended:** Install the `rlm` alias for the fastest workflow. See [`RLM/docs/SETUP-ALIAS.md`](RLM/docs/SETUP-ALIAS.md) for setup instructions.

## Pipeline Agents

| Agent | Phase | Purpose |
|-------|-------|---------|
| rlm-orchestrator | All | Full 9-phase pipeline automation — idea to verified code |
| rlm-discover | 1 | Transform ideas into PRD and constitution |
| rlm-analyst | 2 | Financial analysis, XBRL parsing, and data cleaning specialist |
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
| rlm-team | Orchestrate agent teams for parallel phase execution (implement, quality, verify) |
| rlm-observe | Generate observability reports for multi-agent workflows |
| gemini-analyzer | Expert wrapper for Gemini CLI to perform large-scale codebase analysis (1M+ tokens) |
| gemini-research | Deep research with Gemini 3 Pro Preview + Google Search Grounding (competitive analysis, CVEs, market sizing) |
| gemini-image | AI image generation via AuthHub SDK — nano-banana-pro (quality/thinking) or gemini-2.5-flash-image (fast) |
| gemini-content | Rapid content generation with Gemini 3 Flash (blog posts, release notes, docs, marketing copy, email drafts) |
| gemini-frontend-designer | Frontend design with Gemini 3 Pro Preview — design spec (user flows, wireframes, component specs, WCAG 2.1 AA) + image mockups |

## Specialist Sub-Agents

These sub-agents are used by the team lead and orchestrator for focused, single-responsibility work. Claude Code agents enforce constraints via frontmatter (`disallowedTools`, `maxTurns`); Copilot CLI and Gemini CLI enforce constraints as body-text instructions.

| Sub-Agent | Responsibility | Model | maxTurns | Disallowed | Platforms |
|-----------|---------------|-------|----------|------------|-----------|
| team-lead | Coordinate agent teams for parallel task execution | opus | 100 | — | Claude Code |
| code-writer | TDD Green phase — write implementation code | sonnet | 50 | Bash | Claude Code, Copilot CLI, Gemini CLI |
| test-writer | TDD Red phase — write test files from criteria | sonnet | 30 | Bash, Edit | Claude Code, Copilot CLI, Gemini CLI |
| reviewer | Code review and security audit (read-only) | sonnet | 20 | Write, Edit | Claude Code, Copilot CLI, Gemini CLI |
| tester | QA — run tests, analyze failures, validate coverage | sonnet | 40 | — | Claude Code, Copilot CLI, Gemini CLI |

## Adding New Agents

Use `rlm-new-agent` to scaffold a new agent across all 3 platforms in one step:
- **Copilot CLI**: `@rlm-new-agent`
- **Claude Code**: `/rlm-new-agent <name> <description>`
- **Gemini CLI**: `/rlm-new-agent <name> <description>`

See `RLM/docs/CROSS-PLATFORM-AGENTS.md` for the full cross-platform format reference.

## Copilot CLI Integration Points

| Feature | Location | Purpose |
|---------|----------|---------|
| Custom Agents | `.github/agents/` | 24 specialized pipeline agents (19 pipeline + 5 specialist) |
| Hooks | `.github/hooks/` | Session lifecycle, safety, context injection, logging |
| Skills | `.github/skills/` | 4 on-demand pipeline knowledge skills (rlm-pipeline, sandbox, spec-writing, tdd-workflow) |
| Prompt Files | `.github/prompts/` | Quick-access prompt templates (11 prompts) |
| Instructions | `.github/copilot-instructions.md` | Repository-wide context |
| Path Instructions | `.github/instructions/` | Code and artifact standards |

## Agent Delegation

Agents can delegate work to each other using the `agent` tool. The orchestrator (`rlm-orchestrator`) coordinates all phases automatically, delegating to specialized agents as needed.

## Claude Code Integration Points

| Feature | Location | Purpose |
|---------|----------|---------|
| Slash Commands | `.claude/commands/` | 21 user-facing pipeline commands with v2 frontmatter (model, context, skills) |
| Sub-Agents | `.claude/agents/` | 6 specialist sub-agents with hardened constraints (disallowedTools, maxTurns) |
| Skills | `.claude/skills/` | 6 skills with dynamic `!` injection, model selection, and allowed-tools |
| Hooks | `.claude/hooks/` | 14 hook events with structured JSON output (4 new in v2) |
| Hook Libraries | `.claude/hooks/lib/` | 7 shared libraries (atomic-write, file-locking, agent-tracer, schema-validators, event-sender, code-quality-check, monitor-state-health) |
| Agent Hooks | `.claude/hooks/agents/` | 7 agent-specific hook scripts (code-writer, test-writer, reviewer, tester, gemini-analyzer, post-write-validate, team-lead-progress) |
| Settings | `.claude/settings.json` | Windows (PowerShell) hook config + env vars + permissions (allow/deny) |
| Settings (Unix) | `.claude/settings-unix.json` | Linux/macOS hook configuration |
| Project Context | `CLAUDE.md` | Claude Code project instructions |

## Gemini CLI Integration Points

| Feature | Location | Purpose |
|---------|----------|---------|
| Sub-Agents | `.gemini/agents/` | 24 delegatable pipeline agents (19 pipeline + 5 specialist) |
| Custom Commands | `.gemini/commands/` | 22 TOML user-facing pipeline commands (`/rlm-*`) |
| Hooks | `.gemini/hooks/` | Session lifecycle, safety, agent logging, after-agent, task-completed |
| Skills | `.gemini/skills/` | On-demand pipeline knowledge (rlm-pipeline, tdd-workflow, spec-writing, sandbox) |
| Settings | `.gemini/settings.json` | Windows (PowerShell) hook configuration + experimental flags |
| Settings (Unix) | `.gemini/settings-unix.json` | Linux/macOS hook configuration |
| Project Context | `GEMINI.md` | Gemini CLI project instructions |

## Cross-Platform Parity

| Feature | Copilot CLI | Claude Code | Gemini CLI |
|---------|------------|-------------|------------|
| User invocation | `@rlm-discover` | `/rlm-discover` | `/rlm-discover` |
| Agent delegation | `@rlm-discover` | Inline workflow | `rlm-discover` tool call |
| Agent count | 24 `.agent.md` | 21 commands + 6 sub-agents | 24 `.md` agents + 22 `.toml` commands |
| Canonical prompts | `RLM/prompts/` | `RLM/prompts/` | `RLM/prompts/` |
| Skills | 4 in `.github/skills/` | 6 in `.claude/skills/` | 4 in `.gemini/skills/` |
| Agent teams | N/A | `teammateMode: auto` | Via sub-agent orchestration |
| Safety hooks | `copilot:tool.pre` | `PreToolUse` (14 events) | `BeforeTool` |
| Session hooks | `copilot:session.*` | `SessionStart/End` | `SessionStart/End` |
| Model selection | N/A | `model:` in frontmatter | N/A (body-text hints) |
| Sub-agent constraints | Body-text instructions | `disallowedTools`, `maxTurns` | Body-text instructions |
| Dynamic context | N/A | `!cat` in `context:` field | N/A |
| Structured hook output | N/A | JSON `{decision, reason}` | JSON stdout |
| Project context | `AGENTS.md` | `CLAUDE.md` | `GEMINI.md` |

## Platform-Specific Utilities

| Utility | Platform | Purpose |
|---------|----------|---------|
| `rlm-diagnose` | Gemini CLI only | Terminal diagnostic tool for validating Gemini CLI setup and hook wiring |

These utilities are not cross-platform and exist only where the platform's unique capabilities require them.

## RLM Method Reference

- **Entry Point**: `RLM/START-HERE.md`
- **Pipeline Prompts**: `RLM/prompts/` (01-DISCOVER through 10-SANDBOX)
- **Templates**: `RLM/templates/`
- **Documentation**: `RLM/docs/`
