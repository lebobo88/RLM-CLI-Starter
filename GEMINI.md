# GEMINI.md — RLM Method Copilot CLI Starter Kit

This file provides guidance to Gemini CLI (geminicli.com) when working in this repository.

## What This Repo Is

A **starter kit**, not an application. It provides the RLM (Research, Lead, Manage) Method — a 9-phase AI-agent pipeline that transforms ideas into production-ready code. There is no `package.json`, no build system, and no test suite until Phase 6 scaffolds your actual application.

## How the Pipeline Is Invoked

The pipeline runs through three CLI integrations — all driving the same canonical prompts:

1. **Copilot CLI agents** (`.github/agents/`) — `@rlm-discover`, `@rlm-specs`, etc.
2. **Claude Code commands** (`.claude/commands/`) — `/rlm-discover`, `/rlm-specs`, etc.
3. **Gemini CLI commands** (`.gemini/commands/`) — `/rlm-discover`, `/rlm-specs`, etc.

Each reads prompts from `RLM/prompts/` and writes artifacts to `RLM/specs/`, `RLM/tasks/`, and `RLM/progress/`. The orchestrator (`rlm-orchestrator`) coordinates all phases; individual agents can be run standalone.

## Architecture

Four layers:
1. **Gemini CLI sub-agents** (`.gemini/agents/`) — 17 delegatable agents the orchestrator can invoke
2. **Gemini CLI commands** (`.gemini/commands/`) — 17 user-facing entry points
3. **Pipeline prompts** (`RLM/prompts/`) — Canonical workflow instructions (00-DETECT through 09-VERIFY-FEATURE)
4. **Generated artifacts** (`RLM/specs/`, `RLM/tasks/`, `RLM/progress/`) — Specifications, tasks, and tracking

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

1. **Shell command guard** (`.gemini/hooks/pre-tool-safety.ps1` / `.sh`) — Blocks destructive shell operations on `RLM/specs` and `RLM/tasks` directories (recursive delete, `rm -rf`, `Remove-Item -Recurse`). Individual file operations are allowed.

2. **Write/Replace guard** (`.gemini/hooks/pre-tool-safety-edit.ps1` / `.sh`) — Blocks write_file operations with near-empty content to protected progress files (`status.json`, `checkpoint.json`, `pipeline-state.json`) and prevents write_file/replace targeting directory-level paths.

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

## Gemini CLI Commands

Gemini CLI users can invoke the RLM pipeline using these commands (defined in `.gemini/commands/`):

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
| `/gemini-analyzer` | Support | Large-scale codebase analysis (1M+ tokens) |
| `/rlm-resume` | — | Resume interrupted sessions |
| `/rlm-debug` | — | Diagnose/repair RLM state |
| `/rlm-fix-bug` | — | Structured bug investigation + fix |
| `/rlm-prime` | — | Pre-load feature/task context |
| `/rlm-new-agent` | — | Create a new agent across all CLI platforms |
| `/rlm-sandbox` | — | Manage E2B cloud sandboxes for isolated execution |

## Gemini CLI Sub-Agents

Sub-agents (`.gemini/agents/`) are delegatable tools that the orchestrator can invoke. They require `"experimental": {"enableAgents": true}` in `.gemini/settings.json`.

The orchestrator agent's `tools` array includes all 14 other sub-agent names, enabling automatic delegation across phases.

## Gemini CLI Hooks

Session lifecycle hooks are configured in `.gemini/settings.json` and live in `.gemini/hooks/`:

| Hook Event | Script | Purpose |
|------------|--------|---------|
| `SessionStart` | `session-start.{sh,ps1}` | Log session start, detect active pipeline, generate context file |
| `SessionEnd` | `session-end.{sh,ps1}` | Log session end, update checkpoint |
| `BeforeTool` (run_shell_command) | `pre-tool-safety.{sh,ps1}` | Block destructive `rm -rf RLM/specs` etc. |
| `BeforeTool` (write_file/replace) | `pre-tool-safety-edit.{sh,ps1}` | Block destructive overwrites of RLM progress files |
| `AfterTool` (run_shell_command/write_file/replace) | `post-tool-log.{sh,ps1}` | Log tool usage to CSV |
| `BeforeAgent` | `agent-log.{sh,ps1}` | Log agent invocation start |
| `AfterAgent` | `agent-log.{sh,ps1}` | Log agent invocation end |

### Dynamic Context Injection

At session start, the hook generates `RLM/progress/.current-context.md` with the active pipeline phase, current agent, active task, and automation level. **Read this file at the start of any RLM workflow** to restore dynamic pipeline context.

### Platform-Specific Settings

Two settings variants are provided:

| File | Platform | Notes |
|------|----------|-------|
| `.gemini/settings.json` | **Windows** (PowerShell) | Default — uses `powershell -ExecutionPolicy Bypass -File` |
| `.gemini/settings-unix.json` | **Linux / macOS / WSL** | Uses `.sh` scripts directly |

**To switch platforms**: Copy the appropriate variant over `settings.json`. For example, on Linux/macOS:
```bash
cp .gemini/settings-unix.json .gemini/settings.json
```

### Gemini-Specific Hook Differences

Compared to Claude Code hooks:
- **Stdout JSON** for blocking responses (not stderr)
- **Exit code 2** to block (same as Claude Code)
- **`$env:GEMINI_PROJECT_DIR`** environment variable (not `$env:CLAUDE_PROJECT_DIR`)
- Tool names: `run_shell_command` (not `Bash`), `write_file`/`replace` (not `Edit`/`Write`)
- Argument paths: `arguments.command` (not `tool_input.command`), `arguments.file_path` (not `tool_input.file_path`)
- Additional hook events: `BeforeAgent` and `AfterAgent` for sub-agent logging

## Gemini CLI Skills

On-demand knowledge skills are available in `.gemini/skills/`:

| Skill | Purpose | When to Reference |
|-------|---------|-------------------|
| `rlm-pipeline` | 9-phase pipeline navigation | Navigating phases, state management |
| `spec-writing` | Feature spec, PRD, ADR writing guide | Writing feature specs, PRDs, ADRs |
| `tdd-workflow` | TDD 5-step implementation process | During Phase 6+ implementation |
