---
name: tdd-workflow
description: "TDD red-green-refactor workflow with 5-step process and quality gates."
user-invocable: true
model: sonnet
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
hooks:
  PreToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: prompt
          prompt: "TDD Gate: If the tool_input targets an implementation source file (not a test file, not a config, not a spec/doc), verify that a corresponding test file exists in the project. Check the file path — if it's under src/ or lib/ and ends in .ts/.tsx/.js/.jsx (but NOT .test. or .spec.), confirm a matching test file exists. Return JSON: {\"decision\": \"allow\"} if a test file exists or the target is not an implementation file, or {\"decision\": \"block\", \"reason\": \"No test file found for [path]. Write tests first (TDD Red phase).\"} if an implementation file is being written without tests."
          model: haiku
          timeout: 10
---

## Current Task Context

!`cat RLM/progress/.current-context.md 2>/dev/null || echo "No active task"`

# TDD Workflow

All implementation in RLM follows Test-Driven Development with a 5-step process.

## 5-Step Implementation Process

### Step 1: Load Context (0-20%)
1. Read the task file: `RLM/tasks/active/TASK-XXX.md`
2. Read the feature spec: `RLM/specs/features/FTR-XXX/specification.md`
3. Read project standards: `RLM/specs/constitution.md`
4. Check design system: `RLM/specs/design/` (UI code only)

### Step 2: Write Tests -- Red Phase (20-40%)
Write failing tests FIRST. Tests define the expected behavior.

```typescript
describe('[Component/Module]', () => {
  describe('[method/function]', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange -- set up test data
      // Act -- call the function/method
      // Assert -- verify the result
    });
  });
});
```

Guidelines:
- One assertion per test (prefer)
- Test edge cases and error conditions
- Use descriptive test names
- Mock external dependencies

### Step 3: Implement -- Green Phase (40-70%)
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

## Hard Gates (must pass before task completion)
1. No incomplete markers (`TODO`, `FIXME`, `HACK`, `XXX`, `PLACEHOLDER`)
2. Every function under 50 lines (extract helpers if over)
3. No empty/stub source files (minimum 5 non-blank lines)
4. Test framework config present (`vitest.config.ts` or jest config)
5. Manifest task ID matches `TASK-NNN` format

## Coverage Targets
| Rating | Coverage | Action |
|--------|----------|--------|
| Excellent | 90%+ | Ship it |
| Good | 80-89% | Acceptable |
| Fair | 70-79% | Add more tests |
| Poor | < 70% | Must improve |
