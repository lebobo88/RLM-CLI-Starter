---
applyTo: "RLM/**/*.md,RLM/**/*.json"
---

# RLM Artifact Instructions

When working with RLM artifacts (specs, tasks, progress files):

## Artifact Standards
- Use the canonical templates from `RLM/templates/`
- Follow naming conventions: FTR-XXX for features, TASK-XXX for tasks, ADR-XXX for decisions
- Keep all specs in `RLM/specs/`, tasks in `RLM/tasks/`, progress in `RLM/progress/`
- Always update `RLM/progress/status.json` after state changes
- Update `RLM/progress/checkpoint.json` incrementally

## Feature Specs
- Location: `RLM/specs/features/FTR-XXX/specification.md`
- Must include: description, user stories, acceptance criteria, technical approach, dependencies
- Design specs (UI): `RLM/specs/features/FTR-XXX/design-spec.md`

## Task Files
- Active tasks: `RLM/tasks/active/TASK-XXX.md`
- Completed tasks: `RLM/tasks/completed/TASK-XXX.md`
- Blocked tasks: `RLM/tasks/blocked/TASK-XXX.md`
- Must include: task ID, feature ID, type, status, priority, acceptance criteria, dependencies, test requirements

## Progress Tracking
- `RLM/progress/status.json` — Current state (completed, inProgress, pending, blocked)
- `RLM/progress/checkpoint.json` — Incremental tracking with generation numbers
- `RLM/progress/pipeline-state.json` — Pipeline phase state
- Never overwrite progress; always append or update incrementally

## JSON Files
- All JSON must be valid and properly formatted
- Use ISO 8601 dates for timestamps
- Keep arrays sorted by ID when applicable
