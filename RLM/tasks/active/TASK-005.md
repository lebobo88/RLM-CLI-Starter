# Task: AI Gateway Interface

## Task ID: TASK-005
## Feature: FTR-005
## Type: implementation
## Status: pending
## Priority: Critical
## Estimated Effort: 4 hours

## Description
Create the abstraction layer for AI providers. Implement the connection to the primary LLM (e.g., Anthropic) and handle the request/response lifecycle, including error handling and retries.

## Acceptance Criteria
- [ ] Define `AIProvider` interface (complete, usage stats).
- [ ] Implement `AnthropicProvider` using the official SDK.
- [ ] Implement a `MockProvider` for testing purposes (returns canned responses).
- [ ] Implement `AIClient` wrapper that handles:
    - Retries (exponential backoff) for 429/5xx errors.
    - Logging of token usage.
- [ ] Support switching providers via configuration (dependency injection).

## Technical Details
- **Libraries:** `@anthropic-ai/sdk`.
- **Pattern:** Strategy/Adapter pattern for providers.

## Dependencies
- [ ] TASK-001 (Project Setup)
- [ ] TASK-003 (Config - for API keys)

## Test Requirements
- [ ] Unit test: `AIClient` retries on failure (using MockProvider).
- [ ] Integration test: Connect to Anthropic (if key available, otherwise skip or mock).

## Files to Modify/Create
- `src/ai/AIProvider.ts` (Interface)
- `src/ai/AnthropicProvider.ts`
- `src/ai/MockProvider.ts`
- `src/ai/AIClient.ts`
- `tests/ai/AIClient.test.ts`

## Definition of Done
- [ ] Code implemented according to spec
- [ ] All tests passing
- [ ] Can send a "Hello" prompt and get a response (simulated or real)
