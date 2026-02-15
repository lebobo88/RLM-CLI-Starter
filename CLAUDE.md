# CLAUDE.md — RLM Method Copilot CLI Starter Kit

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## What This Repo Is

A **starter kit**, not an application. It provides the RLM (Research, Lead, Manage) Method — a 9-phase AI-agent pipeline that transforms ideas into production-ready code. There is no `package.json`, no build system, and no test suite until Phase 6 scaffolds your actual application.

## How the Pipeline Is Invoked

The pipeline runs through Copilot CLI custom agents (`.github/agents/`). Each agent reads prompts from `RLM/prompts/` and writes artifacts to `RLM/specs/`, `RLM/tasks/`, and `RLM/progress/`. The orchestrator (`rlm-orchestrator`) coordinates all phases; individual agents can be run standalone.

## Architecture

Three CLI integrations drive the same pipeline:
1. **Copilot CLI agents** (`.github/agents/`) — 17 custom agents
2. **Claude Code commands** (`.claude/commands/`) — 17 slash commands
3. **Gemini CLI agents + commands** (`.gemini/agents/`, `.gemini/commands/`) — 17 sub-agents + 17 TOML commands

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

The result is stored in `RLM/progress/config.json` under `design.design_required`.

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

Claude Code users can invoke the RLM pipeline using these slash commands (defined in `.claude/commands/`):

| Command | Phase | Purpose |
|---------|-------|---------|
| `/rlm` | All | Full 9-phase pipeline orchestration |
| `/rlm-discover` | 1 | Transform idea into PRD + Constitution |
| `/rlm-design` | 2 | Generate design system (UI only) |
| `/rlm-specs` | 3 | Feature specs + architecture |
| `/rlm-feature-design` | 4 | Per-feature UI/UX design |
| `/rlm-tasks` | 5 | Break features into tasks |
| `/rlm-implement` | 6 | TDD implementation (single task) |
| `/rlm-implement-all` | 6 | TDD implementation (all tasks) |
| `/rlm-quality` | 7 | Code review + testing + design QA |
| `/rlm-verify` | 8 | E2E feature verification |
| `/rlm-report` | 9 | Progress reports + metrics |
| `/rlm-resume` | — | Resume interrupted sessions |
| `/rlm-debug` | — | Diagnose/repair RLM state |
| `/rlm-fix-bug` | — | Structured bug investigation + fix |
| `/rlm-prime` | — | Pre-load feature/task context |
| `/rlm-new-agent` | — | Create a new agent across all CLI platforms |
| `/rlm-sandbox` | — | Manage E2B cloud sandboxes for isolated execution |

## Claude Code Sub-agents

Claude Code supports custom sub-agents in `.claude/agents/`. These are specialized expert wrappers that the main Claude agent can delegate to using `@<agent-name>`.

| Agent | Purpose |
|-------|---------|
| `@gemini-analyzer` | Expert wrapper for Gemini CLI. Use this for large-scale codebase analysis (1M+ context). |

## Claude Code Hooks

Session lifecycle hooks are configured in `.claude/settings.json` and live in `.claude/hooks/`:

| Hook Event | Script | Purpose |
|------------|--------|---------|
| `SessionStart` | `session-start.{sh,ps1}` | Log session start, detect active pipeline, generate context file |
| `SessionEnd` | `session-end.{sh,ps1}` | Log session end, update checkpoint |
| `PreToolUse` (Bash) | `pre-tool-safety.{sh,ps1}` | Block destructive `rm -rf RLM/specs` etc. |
| `PreToolUse` (Edit/Write) | `pre-tool-safety-edit.{sh,ps1}` | Block destructive overwrites of RLM progress files |
| `PostToolUse` (Bash/Edit/Write) | `post-tool-log.{sh,ps1}` | Log tool usage to CSV |

### Dynamic Context Injection

At session start, the hook generates `RLM/progress/.current-context.md` with the active pipeline phase, current agent, active task, and automation level. **Read this file at the start of any RLM workflow** to restore dynamic pipeline context (equivalent to Copilot CLI's `prompt.pre` hook).

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

## Skill-Equivalent Knowledge Sections

Claude Code does not have Copilot CLI's on-demand skills system. The equivalent knowledge is available at these locations — reference them selectively to conserve context:

| Copilot Skill | Claude Code Equivalent | When to Reference |
|---------------|----------------------|-------------------|
| `rlm-pipeline` | This file (9-Phase Pipeline, Automation Levels, Context Thresholds) | Navigating phases, state management |
| `spec-writing` | `RLM/templates/` + Artifact Conventions section above | Writing feature specs, PRDs, ADRs |
| `tdd-workflow` | TDD 5-Step Process section above + `.github/instructions/source-code.instructions.md` | During Phase 6+ implementation |
