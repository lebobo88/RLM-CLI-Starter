---
name: rlm-pipeline
description: Guide for navigating the 9-phase RLM software development pipeline. Use this when working on project discovery, specifications, task breakdown, implementation, quality, or verification.
---

# RLM Pipeline Navigation

The RLM (Research, Lead, Manage) Method is a 9-phase pipeline for transforming ideas into production-ready code.

## Phases

### Phase 1: Discovery (rlm-discover)
- Transform a raw idea into a PRD and constitution
- Read `RLM/prompts/01-DISCOVER.md` for the workflow
- Output: `RLM/specs/PRD.md`, `RLM/specs/constitution.md`

### Phase 2: Design System (rlm-design)
- Generate design tokens, component library (UI projects only)
- Skip if project is non-UI (CLI, API, library)
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
- TDD implementation: Red → Green → Refactor
- Read `RLM/prompts/04-IMPLEMENT-TASK.md`
- 5-step process: Load Context → Write Tests → Implement → Verify → Review

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

## Automation Levels
- **AUTO**: Full autonomy, minimal pauses
- **SUPERVISED**: Pause between phases for review
- **MANUAL**: Step-by-step approval
