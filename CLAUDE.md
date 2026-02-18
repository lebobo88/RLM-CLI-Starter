# CLAUDE.md — RLM Method Copilot CLI Starter Kit

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## What This Repo Is

A **starter kit**, not an application. It provides the RLM (Research, Lead, Manage) Method — a 9-phase AI-agent pipeline that transforms ideas into production-ready code. There is no `package.json`, no build system, and no test suite until Phase 6 scaffolds your actual application.

## How the Pipeline Is Invoked

The pipeline runs through Copilot CLI custom agents (`.github/agents/`). Each agent reads prompts from `RLM/prompts/` and writes artifacts to `RLM/specs/`, `RLM/tasks/`, and `RLM/progress/`. The orchestrator (`rlm-orchestrator`) coordinates all phases; individual agents can be run standalone.

## Architecture

Three CLI integrations drive the same pipeline:
1. **Copilot CLI agents** (`.github/agents/`) — 24 custom agents
2. **Claude Code commands** (`.claude/commands/`) — 21 slash commands + 6 sub-agents + 6 skills
3. **Gemini CLI agents + commands** (`.gemini/agents/`, `.gemini/commands/`) — 24 sub-agents + 22 TOML commands

Shared layers:
- **Pipeline prompts** (`RLM/prompts/`) — Canonical workflow instructions (00-DETECT through 09-VERIFY-FEATURE)
- **Generated artifacts** (`RLM/specs/`, `RLM/tasks/`, `RLM/progress/`) — Specifications, tasks, and tracking

Key reference files:
- `RLM/START-HERE.md` — Entry point and pipeline guide
- `RLM/specs/PRD.md` — Product Requirements Document (Phase 1 output)
- `RLM/specs/constitution.md` — Project standards and conventions (Phase 1 output)
- `RLM/progress/status.json` — Current pipeline state
- `RLM/progress/checkpoint.json` — Incremental progress tracking
- `AGENTS.md` — Agent registry

## 9-Phase Pipeline

| Phase | Agent | What It Does | Key Artifacts |
|-------|-------|--------------|---------------|
| 1 | rlm-discover | Idea → PRD + Constitution | `RLM/specs/PRD.md`, `RLM/specs/constitution.md` |
| 2 | rlm-design | Design system (**UI only**) | `RLM/specs/design/` |
| 3 | rlm-specs | PRD → Feature specs + architecture | `RLM/specs/features/FTR-XXX/` |
| 4 | rlm-feature-design | Per-feature UI/UX (**UI only**) | `RLM/specs/features/FTR-XXX/design-spec.md` |
| 5 | rlm-tasks | Feature specs → Task breakdown | `RLM/tasks/active/TASK-XXX.md` |
| 6 | rlm-implement | TDD implementation | Source code + tests |
| 7 | rlm-quality | Code review + testing | `RLM/progress/reviews/` |
| 8 | rlm-verify | E2E verification | `RLM/progress/verification/` |
| 9 | rlm-report | Progress reports | `RLM/progress/reports/` |

Support agents: `rlm-orchestrator` (all phases), `rlm-implement-all` (batch implementation), `rlm-fix-bug` (root-cause analysis), `rlm-prime` (context pre-loading), `rlm-resume` (continue interrupted sessions), `rlm-debug` (diagnose/repair state), `rlm-sandbox` (sandbox management).

## DESIGN_REQUIRED Flag

Phase 1 scores the idea against UI indicators (+1 each: UI mentions, screens/pages, interactive elements, visual structure, frontend frameworks, responsive, design references, user flows, components, accessibility) and Non-UI indicators (-1 each: CLI explicit, API-only, library/package, server-side only, no frontend, data processing, infrastructure).

- **Net score >= 3** → `DESIGN_REQUIRED = true` — Phases 2 & 4 activate
- **Net score <= -2** → `DESIGN_REQUIRED = false` — Phases 2 & 4 skip
- **-1 to 2** → Ambiguous — ask user

The result is stored in `RLM/progress/config.json` (generated at runtime by Phase 1) under `design.design_required`.

## TDD 5-Step Process (Phase 6+, Mandatory)

| Step | Phase | Progress |
|------|-------|----------|
| 1 | Load specs and context (task spec, feature spec, constitution) | 0–20% |
| 2 | Write failing tests first (TDD Red) | 20–40% |
| 3 | Implement minimum code to pass (TDD Green) | 40–70% |
| 4 | Run tests, check coverage (80%+ target) | 70–85% |
| 5 | Quality checks, update progress | 85–100% |

### Hard Gates (must pass before task completion)
1. No incomplete markers (`TODO`, `FIXME`, `HACK`, `XXX`, `PLACEHOLDER`)
2. Every function under 50 lines (extract helpers if over)
3. No empty/stub source files (minimum 5 non-blank lines)
4. Test framework config present (`vitest.config.ts` or jest config)
5. Manifest task ID matches `TASK-NNN` format

### Feature Auto-Verification
When the last task of a feature completes, the pipeline auto-generates E2E tests from acceptance criteria, runs them, and either marks the feature verified or creates bug tasks for failures.

## Key Control Flows

### Enhancement Routing
When modifying an existing feature's behavior:
1. Load the original feature spec and extract **behavioral invariants** (what must NOT change)
2. Route through: Specs delta → Feature design delta (if UI) → Tasks → Implement
3. Never invoke a single agent directly for behavioral changes — always use the full downstream path

### Plan-Mode Lock
When the user is in plan mode or requests a "plan"/"proposal"/"advisory"/"draft":
- **Prohibited**: Launching agents that modify source code, test files, or config files
- **Allowed**: Creating/updating spec documents, review documents, planning artifacts in `RLM/`
- **Transition to execute**: Requires explicit user approval ("start", "implement", "execute", "approved")

### Output Acceptance Gates
Before accepting output from any sub-agent, the orchestrator verifies:
1. **Spec alignment** — Output cites which feature specs it references
2. **Contradiction check** — Output does not contradict existing acceptance criteria or behavioral invariants
3. **Scope check** — Output only modifies files within expected scope for the current phase

If any check fails, output is rejected and the agent re-invoked with corrective instructions.

## Hook Safety

Two layers of pre-tool safety hooks protect RLM artifacts:

1. **Bash tool guard** (`.claude/hooks/pre-tool-safety.ps1` / `.sh`) — Blocks destructive shell operations on `RLM/specs` and `RLM/tasks` directories (recursive delete, `rm -rf`, `Remove-Item -Recurse`). Individual file operations are allowed.

2. **Edit/Write tool guard** (`.claude/hooks/pre-tool-safety-edit.ps1` / `.sh`) — Blocks Write operations with near-empty content to protected progress files (`status.json`, `checkpoint.json`, `pipeline-state.json`) and prevents Edit/Write targeting directory-level paths.

Copilot CLI equivalents live in `.github/hooks/scripts/`.

## Wiring Tasks

After implementation tasks are created, Phase 3.5 generates integration wiring tasks for cross-module dependencies.

**Naming**: `TASK-XXX-WIRE-[FROM]-to-[TO].md` (e.g., `TASK-XXX-WIRE-052-to-049`)

Each wiring task includes a **Module Integration Contract** specifying provider exports, consumer imports, and contract validation. Acceptance criteria require: barrel file exports validated, import paths correct, type contracts match, contract test passes, integration test passes (no mocks).

## Checkpoint / Generation System

`RLM/progress/checkpoint.json` tracks incremental task creation to avoid overwrites:
- Each batch of tasks gets a **generation number**
- New features continue numbering from `max(all_tasks) + 1`
- Before creating tasks, Phase 5 reads the checkpoint, scans existing tasks, compares features in specs vs. checkpoint, and determines next IDs

Tasks carry a `Generation` metadata field linking them to their checkpoint entry.

## Path-Specific Instruction Scopes

Two instruction files in `.github/instructions/` apply coding standards by file pattern:

| File | Applies To | Key Rules |
|------|-----------|-----------|
| `source-code.instructions.md` | `**/*.ts, *.tsx, *.js, *.jsx, *.css, *.py` | TDD mandatory, TypeScript strict (no `any`), functions < 50 lines, import order, WCAG 2.1 AA, 80%+ coverage |
| `rlm-artifacts.instructions.md` | `RLM/**/*.md, RLM/**/*.json` | Use canonical templates, follow naming conventions, never overwrite progress, valid JSON with ISO 8601 dates |

## Artifact Conventions

- **Features**: `FTR-XXX` — specs at `RLM/specs/features/FTR-XXX/specification.md`
- **Tasks**: `TASK-XXX` — active at `RLM/tasks/active/`, completed at `RLM/tasks/completed/`, blocked at `RLM/tasks/blocked/`
- **Architecture decisions**: `ADR-XXX`
- **Progress**: Never overwrite; always append or update incrementally. All JSON uses ISO 8601 dates, arrays sorted by ID.
- **Git commits**: `<type>(<scope>): <description> (FTR-XXX, TASK-YYY)` — types: feat, fix, refactor, test, docs, style, perf, chore

## Automation Levels

| Level | Behavior |
|-------|----------|
| **AUTO** | Full autonomy — AI makes all decisions, only pauses for blockers |
| **SUPERVISED** | Checkpoints at key decisions, pause between phases |
| **MANUAL** | Step-by-step approval for every action |

## Context Thresholds

| Threshold | Action |
|-----------|--------|
| **50%** | Save checkpoint, log warning, continue |
| **75%** | Save checkpoint, suggest wrapping up |
| **90%** | Save checkpoint, complete current task only, pause |

## Claude Code Slash Commands

Claude Code users can invoke the RLM pipeline using these slash commands (defined in `.claude/commands/`). Each command specifies a `model` for optimal cost/quality and uses `context:` with `!` dynamic injection to auto-load pipeline state at invocation time.

| Command | Phase | Model | Purpose |
|---------|-------|-------|---------|
| `/rlm` | All | opus | Full 9-phase pipeline orchestration |
| `/rlm-discover` | 1 | opus | Transform idea into PRD + Constitution |
| `/rlm-analyst` | 2 | sonnet | Financial analysis, XBRL parsing, and data cleaning |
| `/rlm-design` | 2 | opus | Generate design system (UI only) |
| `/rlm-specs` | 3 | opus | Feature specs + architecture |
| `/rlm-feature-design` | 4 | opus | Per-feature UI/UX design |
| `/rlm-tasks` | 5 | sonnet | Break features into tasks |
| `/rlm-implement` | 6 | sonnet | TDD implementation (single task) |
| `/rlm-implement-all` | 6 | sonnet | TDD implementation (all tasks) |
| `/rlm-quality` | 7 | sonnet | Code review + testing + design QA |
| `/rlm-verify` | 8 | sonnet | E2E feature verification |
| `/rlm-report` | 9 | sonnet | Progress reports + metrics |
| `/rlm-resume` | — | sonnet | Resume interrupted sessions |
| `/rlm-debug` | — | sonnet | Diagnose/repair RLM state |
| `/rlm-fix-bug` | — | sonnet | Structured bug investigation + fix |
| `/rlm-prime` | — | sonnet | Pre-load feature/task context |
| `/rlm-new-agent` | — | sonnet | Create a new agent across all CLI platforms |
| `/rlm-sandbox` | — | sonnet | Manage E2B cloud sandboxes for isolated execution |
| `/rlm-team` | — | opus | Orchestrate agent teams for parallel phase execution |
| `/rlm-observe` | — | sonnet | Generate observability reports for multi-agent workflows |
| `/gemini-analyzer` | — | sonnet | Invoke Gemini CLI for large-scale codebase analysis |

### Command Frontmatter v2

All commands use the v2 frontmatter schema with dynamic context injection:

```yaml
---
description: "One-line description"
argument-hint: "<hint>"
model: opus|sonnet|haiku
context:
  - "!cat RLM/progress/pipeline-state.json"
  - "!cat RLM/progress/.current-context.md"
skills:
  - tdd-workflow
  - spec-writing
---
```

- `model` — Which Claude model to use (opus for deep reasoning, sonnet for balanced, haiku for fast)
- `context` — Files/commands to auto-load; `!` prefix runs shell command and injects output
- `skills` — Pre-load these skills into the command's context

## Claude Code Skills

Skills provide on-demand knowledge, hooks, and dynamic context. Defined in `.claude/skills/`:

| Skill | User-Invocable | Model | Context | Purpose |
|-------|---------------|-------|---------|---------|
| `rlm-pipeline` | Yes | — | — | 9-phase pipeline navigation guide with state management |
| `spec-writing` | Yes | sonnet | — | Feature spec, PRD, ADR writing with prompt-based validation |
| `tdd-workflow` | Yes | sonnet | — | TDD red-green-refactor with prompt-based enforcement |
| `sandbox` | Yes | — | — | E2B/Docker sandbox management reference |
| `fork-terminal` | Yes | haiku | fork | Spawn isolated terminal contexts for experiments |
| `observability` | No | haiku | fork | Agent monitoring and trace logging (auto-invoked) |

### Skill Features (v2)

- **Dynamic `!` injection**: Skill bodies use `!`backtick`!` syntax to inject live pipeline state (e.g., `!cat RLM/progress/pipeline-state.json`)
- **`allowed-tools`**: Each skill restricts which tools are available (e.g., observability is read-only: `Read, Grep, Glob`)
- **`context: fork`**: Skills like `observability` and `fork-terminal` run in isolated context windows to save tokens
- **Prompt hooks**: Skills like `spec-writing` and `tdd-workflow` use `type: prompt` hooks with `model: haiku` for fast semantic validation

## Claude Code Sub-agents

Sub-agents in `.claude/agents/` are specialized agents with enforced constraints. Each agent specifies `model`, `disallowedTools`, `maxTurns`, `context`, and `skills` in frontmatter.

| Agent | Model | maxTurns | disallowedTools | Skills | Purpose |
|-------|-------|----------|-----------------|--------|---------|
| `@gemini-analyzer` | sonnet | 10 | — | — | Expert wrapper for Gemini CLI (1M+ context) |
| `@gemini-research` | sonnet | 15 | — | — | Deep research via Gemini 3 Pro Preview + Google Search Grounding |
| `@gemini-image` | haiku | 5 | — | — | AI image generation via AuthHub SDK (nano-banana-pro / gemini-2.5-flash-image) |
| `@gemini-content` | haiku | 10 | — | — | Rapid content generation via Gemini 3 Flash (blog, docs, copy, email) |
| `@gemini-frontend-designer` | sonnet | 20 | — | — | Frontend design spec + mockups via Gemini 3 Pro Preview + @gemini-image |
| `@team-lead` | opus | 100 | — | rlm-pipeline, observability | Orchestrate agent teams for parallel task execution |
| `@code-writer` | sonnet | 50 | Bash | tdd-workflow | TDD Green phase — write implementation code |
| `@test-writer` | sonnet | 30 | Bash, Edit | tdd-workflow | TDD Red phase — write test files |
| `@reviewer` | sonnet | 20 | Write, Edit | spec-writing | Code review and security audit (read-only) |
| `@tester` | sonnet | 40 | — | tdd-workflow | QA — run tests, analyze failures, validate coverage |

### Sub-agent Hardening (v2)

- **`disallowedTools`**: Explicit deny lists prevent agents from exceeding their role (e.g., code-writer cannot use Bash, reviewer cannot Write)
- **`maxTurns`**: Prevents runaway agent loops (10-100 depending on task complexity)
- **Dynamic context**: All agents auto-load `RLM/progress/.current-context.md` and `RLM/specs/constitution.md` via `!cat` injection
- **Prompt hooks**: Agents use `type: prompt` hooks with `model: haiku` for fast role enforcement (e.g., code-writer is blocked from writing test files)
- **Stop hooks**: Agents like reviewer have Stop hooks that verify required outputs before allowing completion

## Agent Teams

Agent teams enable parallel execution of independent tasks. Configuration in `.claude/settings.json`:
- `"env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" }` — Enable feature
- `"teammateMode": "auto"` — Auto-detect tmux for split panes, else in-process
- Use `/rlm-team implement` to start parallel implementation
- Falls back to sequential execution if teams unavailable

## Claude Code Hooks

Session lifecycle hooks are configured in `.claude/settings.json` and live in `.claude/hooks/`. All hooks output structured JSON to stdout for Claude to consume (`{decision, reason, additionalContext}`).

| Hook Event | Script | Purpose |
|------------|--------|---------|
| `UserPromptSubmit` | `user-prompt-inject.{sh,ps1}` | Inject pipeline context before every user prompt |
| `SessionStart` | `session-start.{sh,ps1}` | Log session start, detect active pipeline, generate context file |
| `SessionEnd` | `session-end.{sh,ps1}` | Log session end, update checkpoint |
| `PreToolUse` (Bash) | `pre-tool-safety.{sh,ps1}` | Block destructive `rm -rf RLM/specs` etc. |
| `PreToolUse` (Edit/Write) | `pre-tool-safety-edit.{sh,ps1}` | Block destructive overwrites of RLM progress files |
| `PostToolUse` (Bash/Edit/Write) | `post-tool-log.{sh,ps1}` | Log tool usage to CSV + JSONL |
| `PostToolUse` (Edit/Write) | `post-state-write-verify.{sh,ps1}` | Validate RLM state files after writes |
| `PostToolUse` (Write/Edit) | `post-write-validate.{sh,ps1}` | Source code validation (TypeScript `any`, function length) |
| `PostToolUseFailure` | `post-tool-failure.{sh,ps1}` | Track and log failed tool operations |
| `SubagentStart` | `subagent-start.{sh,ps1}` | Log sub-agent invocation |
| `SubagentStop` | `subagent-stop.{sh,ps1}` | Log sub-agent completion |
| `TaskCompleted` | `task-completed.{sh,ps1}` | Quality gate — verify markers, function length, tests + update checkpoint |
| `TeammateIdle` | `teammate-idle.{sh,ps1}` | Check for pending tasks, keep teammate working |
| `PreCompact` | `pre-compact-checkpoint.{sh,ps1}` | Save checkpoint before context compaction |
| `Stop` | `stop-checkpoint.{sh,ps1}` | Save progress before session ends |
| `Notification` | `notification-handler.{sh,ps1}` | Log notifications, optional toast/TTS |

### Hook Architecture v2

- **Structured JSON output**: Hooks return `{decision: "allow"|"block", reason, additionalContext}` for Claude to consume
- **13 hook events**: UserPromptSubmit, SessionStart, SessionEnd, PreToolUse, PostToolUse, PostToolUseFailure, SubagentStart, SubagentStop, TaskCompleted, TeammateIdle, PreCompact, Stop, Notification
- **Three handler types**: `command` (shell scripts), `prompt` (AI model check with haiku), `agent` (delegate to sub-agent)
- **Universal event sender**: `lib/event-sender.{ps1,sh}` provides `Send-RlmEvent` for all hooks to emit unified JSONL events

### Dynamic Context Injection

Two mechanisms provide runtime context:

1. **Session-start hook**: Generates `RLM/progress/.current-context.md` with active pipeline phase, current agent, active task, and automation level.

2. **`!` backtick syntax**: Commands and skills use `!cat RLM/progress/pipeline-state.json` in their `context:` field to inject live state at invocation time. This replaces the manual "read .current-context.md" pattern.

### Observability v2

All hooks emit events to a unified JSONL event stream via `lib/event-sender.{ps1,sh}`:
- **Event log**: `RLM/progress/logs/events.jsonl`
- **Tool usage**: `RLM/progress/logs/tool-usage.{csv,jsonl}`
- **Agent traces**: `RLM/progress/logs/agents/{agent-id}.jsonl` — with `trace_id`, `parent_trace_id`, `duration_ms`
- **Team coordination**: `RLM/progress/logs/team-coordination.jsonl`
- **Trace correlation**: `RLM_TRACE_ID` and `RLM_PARENT_TRACE_ID` env vars link parent → sub-agent → tool operations

### Platform-Specific Settings

Two settings variants are provided:

| File | Platform | Notes |
|------|----------|-------|
| `.claude/settings.json` | **Windows** (PowerShell) | Default — uses `powershell -ExecutionPolicy Bypass -File` |
| `.claude/settings-unix.json` | **Linux / macOS / WSL** | Uses `.sh` scripts directly |

**To switch platforms**: Copy the appropriate variant over `settings.json`. For example, on Linux/macOS:
```bash
cp .claude/settings-unix.json .claude/settings.json
```

## Hook Shared Libraries

Reusable PowerShell/Bash libraries in `.claude/hooks/lib/`:

| Library | Purpose |
|---------|---------|
| `atomic-write.{ps1,sh}` | `Write-AtomicJson` / `Write-AtomicFile` with file locking integration |
| `file-locking.{ps1,sh}` | `Lock-File` / `Unlock-File` for concurrent access protection |
| `agent-tracer.{ps1,sh}` | `Start-AgentTrace` / `Stop-AgentTrace` / `Add-AgentEvent` with trace correlation |
| `schema-validators.{ps1,sh}` | `Test-CheckpointSchema` / `Test-PipelineStateSchema` / `Test-StatusSchema` |
| `event-sender.{ps1,sh}` | `Send-RlmEvent` — universal event emitter for unified JSONL stream |
| `code-quality-check.{ps1,sh}` | Source code validation (TypeScript `any` detection, function length checks) |
| `monitor-state-health.{ps1,sh}` | Pipeline state file health monitoring and corruption detection |

## Skill-Equivalent Knowledge Sections

Claude Code has its own skills system (`.claude/skills/`) with dynamic context injection, hooks, and model selection. The following table maps Copilot CLI skills to Claude Code equivalents:

| Copilot Skill | Claude Code Skill | When to Reference |
|---------------|------------------|-------------------|
| `rlm-pipeline` | `.claude/skills/rlm-pipeline/SKILL.md` | Navigating phases, state management |
| `spec-writing` | `.claude/skills/spec-writing/SKILL.md` | Writing feature specs, PRDs, ADRs |
| `tdd-workflow` | `.claude/skills/tdd-workflow/SKILL.md` | During Phase 6+ implementation |
| `sandbox` | `.claude/skills/sandbox/SKILL.md` | E2B/Docker sandbox management |
| (none) | `.claude/skills/fork-terminal/SKILL.md` | Spawning isolated terminal contexts |
| (none) | `.claude/skills/observability/SKILL.md` | Agent monitoring (auto-invoked) |
