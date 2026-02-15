# Task: Context & Token Management

## Task ID: TASK-006
## Feature: FTR-004
## Type: implementation
## Status: pending
## Priority: Medium
## Estimated Effort: 3 hours

## Description
Implement logic to manage the context window of the LLM. This involves counting tokens and truncating or summarizing content to fit within limits.

## Acceptance Criteria
- [ ] Implement `TokenManager` class.
- [ ] `countTokens(text)`: Returns estimated token count (can use character count approximation or `tiktoken` for accuracy).
- [ ] `truncate(text, maxTokens)`: Truncates text to fit limit.
- [ ] `ContextBuilder` helper to assemble the system prompt, user prompt, and file context, ensuring the total doesn't exceed the model's limit.

## Technical Details
- **Libraries:** `tiktoken` (optional) or simple estimation (4 chars ~= 1 token).

## Dependencies
- [ ] TASK-001 (Project Setup)

## Test Requirements
- [ ] Unit test: Token counting accuracy (approximate).
- [ ] Unit test: Truncation logic preserves the beginning/important parts.

## Files to Modify/Create
- `src/ai/TokenManager.ts`
- `src/ai/ContextBuilder.ts`
- `tests/ai/TokenManager.test.ts`

## Definition of Done
- [ ] Code implemented according to spec
- [ ] All tests passing
- [ ] Context builder throws or warns if content is too large
