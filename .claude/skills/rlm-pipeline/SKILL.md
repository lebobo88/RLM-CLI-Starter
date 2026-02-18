---
name: rlm-pipeline
description: "9-phase RLM pipeline navigation guide. Auto-loaded during pipeline operations."
disable-model-invocation: false
user-invocable: true
allowed-tools:
  - Read
  - Grep
  - Glob
---

# RLM Pipeline Navigation

The RLM (Research, Lead, Manage) Method is a 9-phase pipeline for transforming ideas into production-ready code.

## Current Pipeline State

!`cat RLM/progress/pipeline-state.json 2>/dev/null || echo '{"current_phase": 0}'`

## Active Tasks

!`ls RLM/tasks/active/ 2>/dev/null | head -20 || echo "No active tasks"`

## Current Session Context

!`cat RLM/progress/.current-context.md 2>/dev/null || echo "No active session context"`

## Phases

### Phase 1: Discovery (rlm-discover)
- Transform a raw idea into a PRD and constitution
- Read `RLM/prompts/01-DISCOVER.md` for the workflow
- Output: `RLM/specs/PRD.md`, `RLM/specs/constitution.md`

### Phase 2: Design System (rlm-design)
- Generate design tokens, component library (UI projects only)
- Skip if `DESIGN_REQUIRED = false` in `RLM/progress/config.json`
- Output: `RLM/specs/design/`

### Phase 3: Specifications (rlm-specs)
- Break PRD into feature specs and architecture decisions
- Read `RLM/prompts/02-CREATE-SPECS.md`
- Output: `RLM/specs/features/FTR-XXX/specification.md`

### Phase 4: Feature Design (rlm-feature-design)
- Per-feature UI/UX design specifications (UI projects only)
- Output: `RLM/specs/features/FTR-XXX/design-spec.md`

### Phase 5: Tasks (rlm-tasks)
- Break features into fine-grained implementation tasks (1-4 hours each)
- Read `RLM/prompts/03-CREATE-TASKS.md`
- Output: `RLM/tasks/active/TASK-XXX.md`

### Phase 6: Implementation (rlm-implement)
- TDD implementation: Red -> Green -> Refactor
- Read `RLM/prompts/04-IMPLEMENT-TASK.md`
- 5-step process: Load Context -> Write Tests -> Implement -> Verify -> Review

### Phase 7: Quality (rlm-quality)
- Code review, testing, design QA
- Output: `RLM/progress/reviews/`

### Phase 8: Verification (rlm-verify)
- E2E feature verification with acceptance testing
- Output: `RLM/progress/verification/`

### Phase 9: Report (rlm-report)
- Generate progress reports and project summary
- Output: `RLM/progress/reports/`

## State Management
- Pipeline state: `RLM/progress/pipeline-state.json`
- Task status: `RLM/progress/status.json`
- Checkpoints: `RLM/progress/checkpoint.json`
- Config: `RLM/progress/config.json`

## Automation Levels
- **AUTO**: Full autonomy, minimal pauses
- **SUPERVISED**: Pause between phases for review
- **MANUAL**: Step-by-step approval

## Context Thresholds
| Threshold | Action |
|-----------|--------|
| **50%** | Save checkpoint, log warning, continue |
| **75%** | Save checkpoint, suggest wrapping up |
| **90%** | Save checkpoint, complete current task only, pause |
