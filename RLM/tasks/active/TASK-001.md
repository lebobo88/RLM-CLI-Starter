# Task: Project Setup & CLI Skeleton

## Task ID: TASK-001
## Feature: FTR-001
## Type: architecture
## Status: pending
## Priority: Critical
## Estimated Effort: 2 hours

## Description
Initialize the project structure using `oclif` (or manually if preferred, but following the spec) to establish the CLI entry point. Configure the development environment with TypeScript, linting, formatting, and testing infrastructure. Ensure the binary is executable.

## Acceptance Criteria
- [ ] Project initialized with `package.json` having necessary dependencies (`oclif`, `typescript`, `ts-node`, etc.).
- [ ] TypeScript configured (`tsconfig.json`) for Node.js environment.
- [ ] ESLint and Prettier configured and running without errors.
- [ ] Jest configured for unit testing (`npm test` runs).
- [ ] `bin/run` (or similar) exists and prints a "Hello World" or basic help message when executed.
- [ ] `src/index.ts` (or `src/main.ts`) serves as the entry point.

## Technical Details
- **Framework:** `oclif` (recommended per spec) or Commander.js if lighter weight is desired (spec says oclif).
- **Language:** TypeScript 5.x
- **Testing:** Jest with `ts-jest`.

## Dependencies
- None

## Test Requirements
- [ ] Verify `npm start` or `./bin/run` executes successfully.
- [ ] Verify a dummy test passes in Jest.

## Files to Modify/Create
- `package.json`
- `tsconfig.json`
- `.eslintrc.json` / `.prettierrc`
- `jest.config.js`
- `bin/run`
- `src/index.ts`

## Definition of Done
- [ ] Code implemented according to spec
- [ ] All tests passing
- [ ] Linter checks pass
- [ ] Executable runs in the terminal
