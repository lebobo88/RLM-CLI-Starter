---
name: tdd-workflow
description: Guide for Test-Driven Development workflow. Use this when implementing features, writing tests, or following the red-green-refactor cycle.
---

# TDD Workflow

All implementation in RLM follows Test-Driven Development with a 5-step process.

## 5-Step Implementation Process

### Step 1: Load Context (0-20%)
1. Read the task file: `RLM/tasks/active/TASK-XXX.md`
2. Read the feature spec: `RLM/specs/features/FTR-XXX/specification.md`
3. Read project standards: `RLM/specs/constitution.md`
4. Check design system: `RLM/specs/design/` (UI code only)

### Step 2: Write Tests — Red Phase (20-40%)
Write failing tests FIRST. Tests define the expected behavior.

```typescript
describe('[Component/Module]', () => {
  describe('[method/function]', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange — set up test data
      // Act — call the function/method
      // Assert — verify the result
    });
  });
});
```

Guidelines:
- One assertion per test (prefer)
- Test edge cases and error conditions
- Use descriptive test names
- Mock external dependencies

### Step 3: Implement — Green Phase (40-70%)
Write the minimum code to make tests pass:
- No premature optimization
- No extra features beyond what tests require
- Functions < 50 lines
- Single Responsibility Principle

### Step 4: Verify (70-85%)
- Run all tests: `npm test`
- Check coverage: target 80%+
- Run linter: `npm run lint`
- Type check: `npx tsc --noEmit`

### Step 5: Review (85-100%)
- Quality checks pass
- Update `RLM/progress/status.json`
- Move task from `active/` to `completed/`
- Commit: `type(scope): description (FTR-XXX, TASK-YYY)`

## Coverage Targets
| Rating | Coverage | Action |
|--------|----------|--------|
| Excellent | 90%+ | Ship it |
| Good | 80-89% | Acceptable |
| Fair | 70-79% | Add more tests |
| Poor | < 70% | Must improve |
