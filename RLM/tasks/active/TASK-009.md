# Task: RLM State Machine - Act & Verify

## Task ID: TASK-009
## Feature: FTR-002
## Type: implementation
## Status: pending
## Priority: Critical
## Estimated Effort: 4 hours

## Description
Implement the second half of the RLM Orchestration Engine: The `Act` and `Verify` phases. The engine should execute the planned changes and then run checks to ensure correctness.

## Acceptance Criteria
- [ ] Extend `RLMEngine` with `act()` and `verify()` methods.
- [ ] `act()`: Generates code changes (via LLM) and applies them using `FileSystemTools`.
    - Must check for `--yes` flag or prompt user before writing.
- [ ] `verify()`: Runs validation commands (e.g., `npm test`, linter) or asks LLM to review.
- [ ] Handle loop/retry: If verification fails, add a new step to fix it.

## Technical Details
- **Safety:** Use `inquirer` for user confirmation.

## Dependencies
- [ ] TASK-008 (RLM Plan/Search)

## Test Requirements
- [ ] Unit test: `act()` prompts for confirmation (mocked).
- [ ] Unit test: `verify()` detects failure and triggers remediation logic.

## Files to Modify/Create
- `src/rlm/RLMEngine.ts` (update)
- `src/rlm/prompts.ts` (Act/Verify prompts)
- `tests/rlm/RLMEngine_ActVerify.test.ts`

## Definition of Done
- [ ] Code implemented according to spec
- [ ] All tests passing
- [ ] Engine can execute a code change and run a verification command
