# Task: RLM State Machine - Plan & Search

## Task ID: TASK-008
## Feature: FTR-002
## Type: implementation
## Status: pending
## Priority: Critical
## Estimated Effort: 4 hours

## Description
Implement the first half of the RLM Orchestration Engine: The `Plan` and `Search` phases. The engine should take a user prompt, generate a plan (via LLM), and then execute search tools to gather context.

## Acceptance Criteria
- [ ] Implement `RLMEngine` class.
- [ ] `plan()`: Constructs a prompt for the LLM to decompose the user request into steps. Updates Ledger.
- [ ] `search()`: Analyzes the plan and uses `FileSystemTools` (grep/glob) to find relevant files. Updates Ledger with found files.
- [ ] Integrate with `AIClient` to generate the plan.
- [ ] Integrate with `FileSystemTools` for the search phase.

## Technical Details
- **Pattern:** State Machine (simple class-based state or `xstate`).

## Dependencies
- [ ] TASK-005 (AI Gateway)
- [ ] TASK-004 (FileSystem)
- [ ] TASK-007 (Ledger)

## Test Requirements
- [ ] Unit test: `plan()` creates correct prompt and parses response.
- [ ] Unit test: `search()` executes tools based on plan output.

## Files to Modify/Create
- `src/rlm/RLMEngine.ts`
- `src/rlm/prompts.ts` (Planning prompts)
- `tests/rlm/RLMEngine.test.ts`

## Definition of Done
- [ ] Code implemented according to spec
- [ ] All tests passing
- [ ] Engine can take a prompt and produce a plan + search results
