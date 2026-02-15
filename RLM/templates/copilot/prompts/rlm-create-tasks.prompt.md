# Create Implementation Tasks (v2.7)

Break feature specifications into fine-grained implementation tasks.

## Before You Start

Read `RLM/prompts/03-CREATE-TASKS.md` for the full workflow.

## Instructions

1. Read feature specs from `RLM/specs/features/`
2. Check `RLM/progress/checkpoint.json` for existing tasks
3. Break each feature into atomic tasks (TASK-001, TASK-002, etc.)
4. Define dependencies between tasks
5. Set priority and estimated effort
6. Create task files in `RLM/tasks/active/`
7. Update `RLM/tasks/INDEX.md`

## Task Requirements
- Each task should be completable in 1-4 hours
- Clear acceptance criteria
- Defined test requirements
- Listed file changes

## Output
- Task files in `RLM/tasks/active/TASK-XXX.md`

## Task File Structure

```markdown
# Task: [Task Title]

## Task ID: TASK-XXX
## Feature: FTR-XXX
## Type: [architecture | implementation | testing | deployment | documentation]
## Status: pending
## Priority: [Low | Medium | High | Critical]
## Estimated Effort: [X hours]

## Description
[Clear description of what needs to be done]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Details
- **Framework:** [Framework name]
- **Language:** [Programming language]
- **Patterns:** [Design patterns to use]

## Dependencies
- [ ] TASK-YYY (Description) - [Status]

## Test Requirements
- [ ] Unit tests for [component]
- [ ] Integration tests for [feature]

## Files to Modify/Create
- `src/path/to/file1.ts` - [What to do]
- `tests/file.test.ts` - [What to test]

## Definition of Done
- [ ] Code implemented according to spec
- [ ] All tests passing
- [ ] Code reviewed
- [ ] No linter errors
```

## Task Breakdown Guidelines

1. **Single Responsibility**: One task = one logical unit of work
2. **Testable**: Each task should produce testable output
3. **Independent**: Minimize dependencies where possible
4. **Ordered**: Respect dependency order
5. **Sized Right**: Not too big (>4 hours) or too small (<30 min)
