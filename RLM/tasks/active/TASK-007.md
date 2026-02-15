# Task: Task Ledger & State Schema

## Task ID: TASK-007
## Feature: FTR-002
## Type: architecture
## Status: pending
## Priority: High
## Estimated Effort: 3 hours

## Description
Define the data structure for tracking the RLM process (Task Ledger) and implement the persistence layer to save/load this state from disk. This enables pausing and resuming tasks.

## Acceptance Criteria
- [ ] Define `TaskLedger` schema using Zod:
    - `taskId`, `status`, `prompt`, `steps` (array), `context`.
- [ ] Define `Step` schema: `id`, `type` (plan/search/act...), `status`, `result`.
- [ ] Implement `LedgerService`:
    - `initialize(prompt)`: Creates a new ledger.
    - `load()`: Loads existing ledger from `.rlm/ledger.json`.
    - `save(ledger)`: Writes ledger to disk.
    - `addStep(step)`, `updateStep(id, update)`.

## Technical Details
- **Libraries:** `zod`.
- **Storage:** JSON file in `.rlm/` directory.

## Dependencies
- [ ] TASK-004 (File System - needed to write ledger)

## Test Requirements
- [ ] Unit test: Zod schema validation works.
- [ ] Unit test: `LedgerService` correctly reads/writes to a temp file.

## Files to Modify/Create
- `src/rlm/schema.ts`
- `src/rlm/LedgerService.ts`
- `tests/rlm/LedgerService.test.ts`

## Definition of Done
- [ ] Code implemented according to spec
- [ ] All tests passing
- [ ] Can create, save, and reload a task state
