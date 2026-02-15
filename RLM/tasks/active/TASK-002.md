# Task: Command Parsing & Global Flags

## Task ID: TASK-002
## Feature: FTR-001
## Type: implementation
## Status: pending
## Priority: High
## Estimated Effort: 3 hours

## Description
Implement the primary `start` command and handle global flags defined in the spec. Create a centralized `Logger` service to handle output formatting and verbosity levels.

## Acceptance Criteria
- [ ] Implement `start [prompt]` command.
- [ ] Capture the `prompt` argument.
- [ ] Implement global flags:
    - `-v, --verbose`: Enables debug logging.
    - `-y, --yes`: Auto-confirms prompts.
    - `-m, --model`: Allows specifying the AI model.
- [ ] `Logger` class implements `info`, `warn`, `error`, `debug` methods.
- [ ] `debug` logs only appear when `--verbose` is set.

## Technical Details
- **Framework:** `oclif` command structure.
- **Pattern:** Singleton or exported instance for `Logger`.

## Dependencies
- [ ] TASK-001 (Project Setup)

## Test Requirements
- [ ] Unit test: `Logger` respects verbosity flag.
- [ ] Unit test: `start` command correctly parses arguments and flags.

## Files to Modify/Create
- `src/commands/start.ts`
- `src/utils/Logger.ts`
- `tests/commands/start.test.ts`
- `tests/utils/Logger.test.ts`

## Definition of Done
- [ ] Code implemented according to spec
- [ ] All tests passing
- [ ] `bin/run start "hello" --verbose` outputs debug info
