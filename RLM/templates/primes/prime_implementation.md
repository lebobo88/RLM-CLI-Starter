# Context Prime: Implementation (TDD)

## Purpose
Implement features using Test-Driven Development: write tests first, then code to pass those tests.

## Essential Context Only
- Project constitution (coding standards only)
- Task specification
- Architecture plan for this feature
- Acceptance criteria

## Run Step
1. **Read** task specification and acceptance criteria
2. **Write** comprehensive test suite (unit + integration)
3. **Verify** tests fail (red state)
4. **Implement** minimal code to pass tests
5. **Refactor** for quality and maintainability
6. **Verify** all tests pass (green state)
7. **Document** code with inline comments
8. **Log** progress and token usage

## Read Step
**Input Files:**
- `RLM/specs/constitution.md` (coding standards section only)
- `RLM/tasks/active/[TASK-XXX].md` (task specification)
- `RLM/specs/architecture/[FTR-XXX]/plan.md` (architecture guidance)

**Focus Areas:**
- Acceptance criteria (what must work)
- Technical specifications (how to implement)
- Error cases and edge cases
- Performance requirements

## Report Step
**Output Files:**
- Test files: `tests/**/*.test.ts`
- Source files: `src/**/*.ts`
- Progress log: `RLM/progress/logs/[TASK-XXX].md`

**Report Format:**
```markdown
# Implementation: [Task Name]

## Tests Written
- [List of test files and test count]

## Code Implemented
- [List of source files and purpose]

## Test Results
- Total: X tests
- Passing: X tests
- Coverage: X%

## Token Usage
- Input: X tokens
- Output: X tokens
- Total: X tokens
- Cost: $X.XX
```

## Context Isolation
This prime excludes:
- Other features' code
- Old implementation attempts
- Design discussions
- Full constitution (only coding standards)

Focuses on:
- This specific task
- Required architecture
- Testing requirements

## Token Budget
**Target:** 50,000-100,000 tokens
**Includes:** Task spec + architecture plan + coding standards
**Excludes:** Full codebase, full constitution, historical context

## TDD Workflow
```
Read Spec → Write Tests → Run Tests (Fail) →
Write Code → Run Tests (Pass) → Refactor →
Run Tests (Pass) → Document → Report
```

---
*Use this prime: `./RLM/commands/utils/context-manager.sh prime implementation`*

