# Feature: AI Gateway
## Feature ID: FTR-005
## Priority: High
## Status: Draft

## Description
The AI Gateway acts as the abstraction layer between the RLM Engine and the specific LLM provider (e.g., Anthropic Claude, OpenAI GPT-4). It handles authentication, request formatting, response parsing, error handling (rate limits, timeouts), and logging.

## User Stories
- As a developer, I want to switch between `claude-3-5-sonnet` and `gpt-4o` via config without changing code.
- As a user, I want the system to retry automatically if the API returns a 500 or rate limit error.
- As a developer, I want to see the raw prompt and response when debugging (`--verbose`).

## Acceptance Criteria
- [ ] Implement an `AIClient` interface.
- [ ] Implement `AnthropicClient` using `@anthropic-ai/sdk`.
- [ ] Implement `OpenAIClient` (optional/secondary) using `openai`.
- [ ] Handle `429 Too Many Requests` with exponential backoff.
- [ ] Parse "Tool Use" or "Function Calling" responses from the LLM into a structured format the RLM Engine understands.
- [ ] Log token usage and cost (estimated) for the session.

## Technical Approach
- **Adapter Pattern**: Use a common interface for all providers.
- **Message Format**: Normalize all messages to a standard array of `{role: 'user'|'assistant'|'system', content: string}`.
- **Stream Support**: Optionally support streaming responses to show real-time progress in the CLI (nice to have).

## Dependencies
- Internal: FTR-001 (Config), FTR-002 (Engine consumes this).
- External: AI SDKs.

## API Interface
```typescript
interface AIProvider {
  complete(messages: Message[], tools?: ToolDef[]): Promise<AIResponse>;
}

interface AIResponse {
  content: string;
  toolCalls?: ToolCall[];
  usage: { inputTokens: number; outputTokens: number };
}
```

## Security Considerations
- Never log API keys.
- Redact PII from logs if possible (though difficult in a dev tool).

## Testing Strategy
- **Mocking**: Absolutely required. Do not hit real APIs in unit tests. Use `nock` or simple mocks.
- **Manual**: Verify connection with real keys during development.
