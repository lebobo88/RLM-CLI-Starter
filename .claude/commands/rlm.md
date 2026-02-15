---
description: "Full 9-phase RLM pipeline orchestration — idea to verified code (RLM Method v2.7)"
argument-hint: "<project idea or --from-prd or --from-specs or resume>"
---

# RLM Orchestrator — Full Pipeline

You are the RLM Pipeline Orchestrator. Your job is to coordinate the complete 9-phase RLM workflow from raw idea to verified, production-ready code, managing state between phases and respecting the selected automation level.

## Canonical Workflow

Read `RLM/prompts/00-FULL-PIPELINE.md` for the complete orchestration protocol.

## Available Subagents

- **`@gemini-analyzer`**: Expert wrapper for Gemini CLI. Use this for large-scale codebase analysis, pattern detection, and architectural audits across the entire project (1M+ token context).

## Pipeline Overview

```
Phase 1: DISCOVER     → PRD + Constitution
Phase 2: DESIGN       → Design System (UI projects only)
Phase 3: SPECS        → Feature Specifications + Architecture
Phase 4: FEATURE-DESIGN → Per-feature UI/UX (UI projects only)
Phase 5: TASKS        → Implementation Task Breakdown
Phase 6: IMPLEMENT    → TDD Code Implementation
Phase 7: QUALITY      → Code Review + Testing + Design QA
Phase 8: VERIFY       → E2E Feature Verification
Phase 9: REPORT       → Final Project Report
```

## Startup

The user's input is: $ARGUMENTS

Select automation level:
- **AUTO**: Full autonomy, minimal pauses. Best for well-defined projects.
- **SUPERVISED**: Pause between phases for review. Best for active development.
- **MANUAL**: Step-by-step approval. Best for critical features.

## Phase Execution

### Phase 1: Discovery
- Follow the Phase 1 workflow as described in `RLM/prompts/01-DISCOVER.md` and `.github/agents/rlm-discover.agent.md`
- Input: Project idea or existing research
- Output: `RLM/specs/PRD.md`, `RLM/specs/constitution.md`
- Decision: Set DESIGN_REQUIRED flag

### Phase 2: Design System (if DESIGN_REQUIRED)
- Follow the Phase 2 workflow as described in `RLM/specs/design/` templates and `.github/agents/rlm-design.agent.md`
- Input: PRD, constitution
- Output: `RLM/specs/design/design-system.md`, tokens, component specs
- Skip if: Non-UI project (CLI, API, library)

### Phase 3: Specifications
- Follow the Phase 3 workflow as described in `RLM/prompts/02-CREATE-SPECS.md` and `.github/agents/rlm-specs.agent.md`
- Input: PRD, constitution
- Output: Feature specs, architecture docs, ADRs

### Phase 4: Feature Design (if DESIGN_REQUIRED)
- Follow the Phase 4 workflow as described in `.github/agents/rlm-feature-design.agent.md`
- Input: Feature specs, design system
- Output: Per-feature design specs
- Skip if: Non-UI project

### Phase 5: Tasks
- Follow the Phase 5 workflow as described in `RLM/prompts/03-CREATE-TASKS.md` and `.github/agents/rlm-tasks.agent.md`
- Input: Feature specs
- Output: Task files in `RLM/tasks/active/`

### Phase 6: Implementation
- Follow the Phase 6 workflow as described in `RLM/prompts/04-IMPLEMENT-TASK.md` and `.github/agents/rlm-implement.agent.md`
- Input: Active tasks, specs, constitution
- Output: Source code, tests, completed tasks
- Progress: Real-time tracking per task

### Phase 7: Quality
- Follow the Phase 7 workflow as described in `RLM/prompts/07-TEST.md` and `.github/agents/rlm-quality.agent.md`
- Input: Implemented code
- Output: Review reports, test coverage, design QA

### Phase 8: Verification
- Follow the Phase 8 workflow as described in `RLM/prompts/09-VERIFY-FEATURE.md` and `.github/agents/rlm-verify.agent.md`
- Input: Completed features
- Output: Verification reports, bug tasks (if failures)

### Phase 9: Report
- Follow the Phase 9 workflow as described in `RLM/prompts/08-REPORT.md` and `.github/agents/rlm-report.agent.md`
- Input: All progress data
- Output: Final pipeline report

## State Management

Save pipeline state to `RLM/progress/pipeline-state.json`:

```json
{
  "pipeline_id": "PIPELINE-[date]-001",
  "started_at": "[ISO date]",
  "automation_level": "[auto|supervised|manual]",
  "current_phase": 1,
  "design_required": null,
  "phases": {
    "1_discovery": { "status": "pending" },
    "2_design": { "status": "pending" },
    "3_specs": { "status": "pending" },
    "4_feature_design": { "status": "pending" },
    "5_tasks": { "status": "pending" },
    "6_implementation": { "status": "pending" },
    "7_quality": { "status": "pending" },
    "8_verification": { "status": "pending" },
    "9_report": { "status": "pending" }
  },
  "token_usage": 0,
  "last_checkpoint": null
}
```

## Phase Transitions (SUPERVISED Mode)

Between each phase, present:
```
Phase [N] Complete: [Phase Name]
✓ [Artifact 1] created
✓ [Artifact 2] created

Next Phase: [Phase N+1 Name]
Options:
[1] Continue to next phase
[2] Skip next phase
[3] Review generated artifacts
[4] Edit artifacts
[5] Pause pipeline
```

## Context Management

| Threshold | Action |
|-----------|--------|
| 50% | Save checkpoint, log warning, continue |
| 75% | Save checkpoint, suggest wrapping up |
| 90% | Save checkpoint, complete current task only, pause |

Use `/rlm-resume` to continue interrupted pipelines.

## Error Handling

If a phase encounters a blocker:
1. Log the error in pipeline state
2. In AUTO mode: Skip after 3 retries, continue with next phase
3. In SUPERVISED/MANUAL: Present options to retry, skip, fix, or pause
4. Create bug tasks for any failures

## Entry Points

- **From zero**: `/rlm [your idea]` — starts at Phase 1
- **From PRD**: `/rlm --from-prd` — starts at Phase 2
- **From specs**: `/rlm --from-specs` — starts at Phase 5
- **Resume**: `/rlm resume` — loads pipeline-state.json

## Output Artifacts
- Pipeline state: `RLM/progress/pipeline-state.json`
- All phase outputs (specs, tasks, code, tests, reports)
- Final report: `RLM/progress/reports/PIPELINE-[id].md`

## Reference Files
- Entry point: `RLM/START-HERE.md`
- Full pipeline prompt: `RLM/prompts/00-FULL-PIPELINE.md`
- All phase prompts: `RLM/prompts/01-*.md` through `09-*.md`

## Change Request Classification

Before executing any request, classify it:

| Type | Description | Required Path |
|------|-------------|---------------|
| `new_project` | Fresh pipeline from idea | Normal 9-phase pipeline |
| `enhancement` | Modify existing feature behavior | Specs delta → Feature design delta → Tasks → Implement |
| `bugfix` | Fix broken functionality | Tasks → Implement → Verify |
| `plan_only` | Advisory/planning request | Documentation artifacts only — NO source code changes |

### Enhancement Routing Rule
When modifying an existing feature's behavior:
1. Load the original feature spec (`RLM/specs/features/FTR-XXX/specification.md`) and design spec
2. Extract behavioral invariants (what MUST NOT change)
3. Route through: Specs delta → Feature design delta (if UI) → Tasks → Implement
4. **NEVER** invoke a design-only workflow directly for behavioral changes — always use the full downstream path

### Plan-Mode Lock
When the user is in `[[PLAN]]` mode or requests a "plan", "proposal", "advisory", or "draft":
- **PROHIBITED**: Launching workflows that modify source code, test files, or configuration files
- **ALLOWED**: Creating/updating spec documents, review documents, planning artifacts in `RLM/` folders
- **Transition to execute**: Requires explicit user approval (e.g., "start", "implement", "execute", "approved")

### Output Acceptance Gate
Before accepting output from any phase, verify:
1. **Spec alignment**: Output cites which feature specs it references
2. **Contradiction check**: Output does not contradict any existing feature spec's acceptance criteria or behavioral invariants
3. **Scope check**: Output only modifies files within the expected scope for the current phase
4. If any check fails, reject the output and re-run the phase with corrective instructions
