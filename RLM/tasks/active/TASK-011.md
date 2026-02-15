# Task: Specific Agents Implementation

## Task ID: TASK-011
## Feature: FTR-003
## Type: implementation
## Status: pending
## Priority: High
## Estimated Effort: 4 hours

## Description
Implement the specialized agents defined in the spec: Orchestrator, Coder, and Reviewer. Each has a specific system prompt and set of allowed tools.

## Acceptance Criteria
- [ ] Implement `OrchestratorAgent`:
    - Role: High-level planning.
    - Tools: Search, Plan management.
- [ ] Implement `CoderAgent`:
    - Role: Writing code.
    - Tools: Read/Write files, Search.
- [ ] Implement `ReviewerAgent`:
    - Role: Checking code.
    - Tools: Read files (Read-only ideally).
- [ ] Create system prompts for each agent in `src/agents/prompts/`.

## Technical Details
- **Prompts:** Store in separate files or a constants file for easy editing.

## Dependencies
- [ ] TASK-010 (Agent Base)
- [ ] TASK-004 (Tools)

## Test Requirements
- [ ] Unit test: Each agent initializes with correct tools and prompt.
- [ ] Integration test: Mock AI response and verify `CoderAgent` calls `writeFile`.

## Files to Modify/Create
- `src/agents/definitions/OrchestratorAgent.ts`
- `src/agents/definitions/CoderAgent.ts`
- `src/agents/definitions/ReviewerAgent.ts`
- `src/agents/prompts/*.ts`

## Definition of Done
- [ ] Code implemented according to spec
- [ ] All tests passing
- [ ] Agents are registered and usable
