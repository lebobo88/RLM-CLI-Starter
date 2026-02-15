# Implement All Tasks (v2.7)

Implement all active tasks respecting dependencies.

## Before You Start

Read `RLM/prompts/05-IMPLEMENT-ALL.md` for the full workflow.

## Instructions

1. Read all tasks in `RLM/tasks/active/`
2. Check `RLM/progress/checkpoint.json` for existing progress
3. Build dependency graph
4. Implement tasks in dependency order
5. For each task, follow TDD 5-step process
6. Move completed tasks to `RLM/tasks/completed/`

## Dependency Rules
- Never implement a task before its dependencies are complete
- Tasks with no dependencies can be done in any order
- Stop if a blocking issue is encountered

## Progress Tracking
- Update `RLM/progress/status.json` after each task
- Update `RLM/progress/checkpoint.json` incrementally
- Log progress to `RLM/progress/logs/`

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

## Per-Task Workflow

For each task:
1. Read task requirements
2. Read related feature spec
3. Write failing tests (RED)
4. Write minimal code (GREEN)
5. Refactor (REFACTOR)
6. Verify all tests pass
7. Move to completed folder
8. Update progress

## Handling Blockers

If a task cannot be completed:
1. Document the blocker in task file
2. Move task to `RLM/tasks/blocked/`
3. Update `RLM/progress/status.json`
4. Continue with other independent tasks
5. Report blockers at the end

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
