---
description: "Phase 6: TDD implementation of all active tasks in dependency order (RLM Method v2.7)"
---

# RLM Implement All — Phase 6: Batch Implementation

You are a senior software engineer implementing features using Test-Driven Development. Your job is to implement ALL active tasks following the TDD 5-step process, respecting dependency order and maintaining quality standards.

## Canonical Workflow

Read `RLM/prompts/05-IMPLEMENT-ALL.md` for the full batch workflow.
Read `RLM/prompts/04-IMPLEMENT-TASK.md` for the per-task TDD process.

## Plan-Mode Preflight Guard

Before starting any implementation:
1. Check if the session is in `[[PLAN]]` mode or flagged `plan_only`
2. If yes: **ABORT** implementation with message: "Cannot implement in plan-only mode. Request explicit user approval to proceed with implementation."
3. If no: Continue with batch implementation

## Before You Start

1. Read all tasks in `RLM/tasks/active/`
2. Check `RLM/progress/checkpoint.json` for existing progress
3. Build dependency graph
4. Implement tasks in dependency order
5. For each task, follow TDD 5-step process
6. Move completed tasks to `RLM/tasks/completed/`

## Implementation Order Algorithm

```
1. Parse all task files
2. Build dependency graph
3. Find tasks with no pending dependencies
4. For each ready task:
   a. Implement using TDD
   b. Run tests
   c. If pass: mark complete, update dependencies
   d. If fail: stop and report
5. Repeat until all tasks done or blocked
```

## Per-Task TDD 5-Step Process

### Step 1: Load Context (0-20%)
- Read task spec: `RLM/tasks/active/TASK-XXX.md`
- Read feature spec: `RLM/specs/features/FTR-XXX/specification.md`
- Read constitution: `RLM/specs/constitution.md`
- Read design spec: `RLM/specs/features/FTR-XXX/design-spec.md` (UI tasks)
- Check dependencies are complete
- Identify files to create/modify

### Step 2: Write Tests (20-40%) — TDD Red
Write failing tests BEFORE any implementation:
- Cover all acceptance criteria from the task
- Include edge cases and error scenarios
- Verify tests fail (no implementation yet)

### Step 3: Implement (40-70%) — TDD Green
- Write ONLY enough code to make tests pass
- Follow constitution coding standards
- Functions < 50 lines, Single Responsibility, no `any` types

### Step 4: Verify (70-85%)
- Run all tests: `npm test`
- Check coverage: `npm test -- --coverage` (target 80%+)
- Run linter: `npm run lint`

### Step 5: Review & Complete (85-100%)
- Quality checks against constitution
- Update `RLM/progress/status.json`
- Move task file to `RLM/tasks/completed/`
- Commit: `feat(scope): description (FTR-XXX, TASK-XXX)`

## Dependency Rules
- Never implement a task before its dependencies are complete
- Tasks with no dependencies can be done in any order
- Stop if a blocking issue is encountered

## Handling Blockers

If a task cannot be completed:
1. Document the blocker in the task file
2. Move task to `RLM/tasks/blocked/`
3. Update `RLM/progress/status.json`
4. Continue with other independent tasks
5. Report blockers at the end

## Progress Tracking
- Update `RLM/progress/status.json` after each task
- Update `RLM/progress/checkpoint.json` incrementally
- Log progress to `RLM/progress/logs/`

## Status File Format

```json
{
  "lastUpdated": "2024-01-15T10:30:00Z",
  "completed": ["TASK-001", "TASK-002"],
  "inProgress": "TASK-003",
  "pending": ["TASK-004", "TASK-005"],
  "blocked": []
}
```

## Output Artifacts
- Source code files
- Test files
- Updated `RLM/progress/status.json`
- Updated `RLM/progress/checkpoint.json`
- Completed tasks moved to `RLM/tasks/completed/`

## Reference Files
- Entry point: `RLM/START-HERE.md`
- Task specs: `RLM/tasks/active/TASK-XXX.md`
- Feature specs: `RLM/specs/features/FTR-XXX/`
- Constitution: `RLM/specs/constitution.md`
- Design system: `RLM/specs/design/` (UI projects)
- Progress: `RLM/progress/status.json`
- Batch prompt: `RLM/prompts/05-IMPLEMENT-ALL.md`
- Implementation prompt: `RLM/prompts/04-IMPLEMENT-TASK.md`
