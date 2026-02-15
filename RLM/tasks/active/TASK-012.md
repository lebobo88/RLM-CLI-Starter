# Task: CLI Start Command Wiring

## Task ID: TASK-012
## Feature: FTR-001
## Type: integration
## Status: pending
## Priority: High
## Estimated Effort: 3 hours

## Description
Connect the user-facing `start` command (TASK-002) to the RLM Engine (TASK-008/009). This is the "glue" task that makes the CLI actually work.

## Acceptance Criteria
- [ ] Update `start` command to instantiate `RLMEngine`.
- [ ] Pass command-line arguments (prompt, flags) to the Engine.
- [ ] Subscribe to Engine events (or poll state) to update the UI (spinners, logs).
- [ ] Handle the end-of-process state (success/fail message).
- [ ] Ensure `SIGINT` (Ctrl+C) calls `LedgerService.save()` before exiting.

## Technical Details
- **UI:** Use `ora` dynamic updates.

## Dependencies
- [ ] TASK-002 (Start Command)
- [ ] TASK-009 (Full RLM Engine)

## Test Requirements
- [ ] Integration test: Full run-through (mocked AI) from CLI entry point.

## Files to Modify/Create
- `src/commands/start.ts`
- `src/index.ts` (Signal handling)

## Definition of Done
- [ ] Code implemented according to spec
- [ ] All tests passing
- [ ] Running `bin/run start "test"` triggers the full engine loop
