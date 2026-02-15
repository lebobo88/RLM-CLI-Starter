# Task: Agent Base & Registry

## Task ID: TASK-010
## Feature: FTR-003
## Type: architecture
## Status: pending
## Priority: Medium
## Estimated Effort: 2 hours

## Description
Set up the architecture for multi-agent support. Define what an "Agent" is and create a registry to manage them.

## Acceptance Criteria
- [ ] Define `Agent` abstract class/interface:
    - `name`, `role`, `tools`, `systemPrompt`.
    - `execute(task, context)` method.
- [ ] Implement `AgentRegistry` singleton to register and retrieve agents by name.
- [ ] Create a `BaseAgent` class that implements common logic (calling AI, parsing tools).

## Technical Details
- **Pattern:** Factory / Registry.

## Dependencies
- [ ] TASK-005 (AI Gateway)

## Test Requirements
- [ ] Unit test: Register and retrieve an agent.
- [ ] Unit test: `BaseAgent` handles AI communication correctly.

## Files to Modify/Create
- `src/agents/Agent.ts`
- `src/agents/AgentRegistry.ts`
- `tests/agents/AgentRegistry.test.ts`

## Definition of Done
- [ ] Code implemented according to spec
- [ ] All tests passing
- [ ] Infrastructure ready for specific agent implementations
