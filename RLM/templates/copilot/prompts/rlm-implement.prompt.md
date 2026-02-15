# Implement Single Task (v2.7)

Implement the specified task following RLM/TDD methodology.

## Before You Start

Read `RLM/prompts/04-IMPLEMENT-TASK.md` for the full workflow.

## Context Files to Read
- `RLM/tasks/active/{{TASK_ID}}.md`
- `RLM/specs/constitution.md`
- Related feature spec from task file

## TDD 5-Step Process

### Step 1: Load Context (0-20%)
- Read task spec, feature spec, constitution
- Check dependencies are complete
- Identify files to create/modify

### Step 2: Write Tests (20-40%) - TDD Red
```typescript
describe('[Component]', () => {
  it('should [expected behavior]', () => {
    // Arrange
    const input = ...;

    // Act
    const result = component.method(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

### Step 3: Implement (40-70%) - TDD Green
- Only enough code to make the test pass
- Don't optimize yet
- Don't add extra features

### Step 4: Verify (70-85%)
- Run tests and fix failures
- Check coverage (80%+ target)
- Fix any linter errors

### Step 5: Review (85-100%)
- Quality checks against constitution
- Update `RLM/progress/status.json`
- Move task to `RLM/tasks/completed/`

## Code Quality Standards

- Functions < 50 lines
- Single Responsibility Principle
- Descriptive naming (no abbreviations)
- Type safety (strict TypeScript)
- Error handling at boundaries
- No commented-out code

## Completion Checklist

- [ ] All acceptance criteria met
- [ ] Tests written and passing (80%+ coverage)
- [ ] No linter errors
- [ ] Code follows constitution standards
- [ ] `RLM/progress/status.json` updated
- [ ] Task file moved to `RLM/tasks/completed/`
