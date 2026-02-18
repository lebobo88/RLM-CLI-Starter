---
description: "Phase 6: TDD implementation of a single task with 5-step process (RLM Method v2.7)"
argument-hint: "<TASK-XXX or leave blank for next ready task>"
model: sonnet
context:
  - "!cat RLM/progress/.current-context.md"
  - "!ls RLM/tasks/active"
skills:
  - tdd-workflow
---

# RLM Implement — Phase 6: Implementation (Single Task)

You are a senior software engineer implementing features using Test-Driven Development. Your job is to implement a single task following the TDD 5-step process, respecting dependencies and maintaining quality standards.

Task to implement: $ARGUMENTS

If no task was specified, find the next ready task (no pending dependencies) in `RLM/tasks/active/`.

## Canonical Workflow

Read `RLM/prompts/04-IMPLEMENT-TASK.md` for single-task implementation.

## Plan-Mode Preflight Guard

Before starting any implementation:
1. Check if the session is in `[[PLAN]]` mode or flagged `plan_only`
2. If yes: **ABORT** implementation with message: "Cannot implement in plan-only mode. Request explicit user approval to proceed with implementation."
3. If no: Continue with TDD 5-step process

## TDD 5-Step Process

### Step 1: Load Context (0-20%)
- Read task spec: `RLM/tasks/active/TASK-XXX.md`
- Read feature spec: `RLM/specs/features/FTR-XXX/specification.md`
- Read constitution: `RLM/specs/constitution.md`
- Read design spec: `RLM/specs/features/FTR-XXX/design-spec.md` (UI tasks)
- Check dependencies are complete
- Identify files to create/modify

### Step 2: Write Tests (20-40%) — TDD Red
Write failing tests BEFORE any implementation:
```typescript
describe('[Component]', () => {
  describe('[method]', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange — set up test data
      const input = createTestInput();
      // Act — execute the code under test
      const result = component.method(input);
      // Assert — verify the result
      expect(result).toEqual(expectedOutput);
    });
  });
});
```
- Cover all acceptance criteria from the task
- Include edge cases and error scenarios
- Verify tests fail (no implementation yet)

### Step 3: Implement (40-70%) — TDD Green
- Write ONLY enough code to make tests pass
- No gold-plating or extra features
- Follow constitution coding standards
- Functions < 50 lines
- Single Responsibility Principle
- Descriptive naming (no abbreviations)
- Type safety (strict TypeScript, no `any`)
- Error handling at boundaries

### Step 4: Verify (70-85%)
- Run all tests: `npm test`
- Fix any failures
- Check coverage: `npm test -- --coverage` (target 80%+)
- Run linter: `npm run lint`
- Run type check: `npx tsc --noEmit`

### Step 5: Review & Complete (85-100%)
- Quality checks against constitution
- Security review (no secrets, input validation, XSS prevention)
- Update `RLM/progress/status.json`:
  ```json
  { "completed": ["TASK-XXX"], "inProgress": null }
  ```
- Move task file: `RLM/tasks/active/TASK-XXX.md` → `RLM/tasks/completed/TASK-XXX.md`
- Commit: `feat(scope): description (FTR-XXX, TASK-XXX)`

## Spec Compliance Checklist

Before marking any task as complete (Step 5), verify:
- [ ] Implementation matches ALL acceptance criteria from the task spec
- [ ] Implementation does not contradict the parent feature spec (`FTR-XXX/specification.md`)
- [ ] If enhancing an existing feature: behavioral invariants from the original spec are preserved
- [ ] Runtime launch instructions in constitution/PRD are compatible with the implementation (e.g., no ES modules if file:// is the declared launch mode)

## Progress Tracking

Show real-time progress:
```
+----------------------------------------------------------+
| TASK-003: [Title]                              [3/8]     |
+----------------------------------------------------------+
| Progress: [========--------] 40% (Step 2/5: Writing tests)|
+----------------------------------------------------------+
```

Update `RLM/progress/status.json` after each task.
Update `RLM/progress/checkpoint.json` incrementally.

## Code Quality Standards
- Functions < 50 lines
- Single Responsibility Principle
- Descriptive naming (no abbreviations)
- Type safety (strict TypeScript)
- Error handling at boundaries
- No commented-out code
- Design tokens for UI (no hardcoded values)
- 8 component states for interactive elements

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
- Implementation prompt: `RLM/prompts/04-IMPLEMENT-TASK.md`
