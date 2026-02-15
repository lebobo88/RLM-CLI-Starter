# Task: File System Tools

## Task ID: TASK-004
## Feature: FTR-004
## Type: implementation
## Status: pending
## Priority: High
## Estimated Effort: 4 hours

## Description
Implement the core file system tools that the agent will use to interact with the codebase. These tools must be safe, robust, and respect ignore files.

## Acceptance Criteria
- [ ] Implement `FileSystemTools` class/module.
- [ ] `readFile(path)`: Returns file content, throws if not found.
- [ ] `writeFile(path, content)`: Writes content, creating directories if needed.
- [ ] `listDir(path)`: Lists files, respecting `.gitignore`.
- [ ] `glob(pattern)`: Finds files matching pattern.
- [ ] `grep(pattern, path)`: Searches for text in files (simple implementation via `grep` command or node logic).
- [ ] All file paths should be resolved relative to the project root.
- [ ] Security check: Prevent access outside the project root (directory traversal).

## Technical Details
- **Libraries:** `fs-extra` (or native fs), `globby`, `ignore`.

## Dependencies
- [ ] TASK-001 (Project Setup)

## Test Requirements
- [ ] Unit tests for each tool function.
- [ ] Test respecting `.gitignore` (mock a directory structure).
- [ ] Test path sanitization (e.g., `../` access denied).

## Files to Modify/Create
- `src/tools/FileSystemTools.ts`
- `tests/tools/FileSystemTools.test.ts`

## Definition of Done
- [ ] Code implemented according to spec
- [ ] All tests passing
- [ ] Tools can read/write files and search safely
