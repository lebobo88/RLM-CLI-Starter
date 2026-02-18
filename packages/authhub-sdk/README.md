# @authhub/sdk

TypeScript SDK for AuthHub - centralized authentication, database connectivity, AI proxy, and secrets management.

## Installation

```bash
npm install @authhub/sdk
# or
yarn add @authhub/sdk
# or
pnpm add @authhub/sdk
```

## Quick Start

```typescript
import { AuthHubClient } from '@authhub/sdk';

const client = new AuthHubClient({
  baseUrl: 'https://authhub.example.com',
  apiKey: 'ak_your_api_key',
});

// AI Chat
const response = await client.ai.chat({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }],
});
console.log(response.choices[0].message.content);

// Database Query
const users = await client.db.query<User>(
  'SELECT * FROM users WHERE active = $1',
  [true]
);

// Secrets
const stripeKey = await client.secrets.get('STRIPE_API_KEY');
```

## Features

- **AI Module** - Chat completions with streaming support
- **Database Module** - Parameterized queries and transactions
- **Secrets Module** - Secure access to application secrets
- **Type Safety** - Full TypeScript support with exported types
- **Error Handling** - Typed errors with helpful messages
- **Retry Logic** - Automatic retries with exponential backoff

## API Reference

### Client Configuration

```typescript
const client = new AuthHubClient({
  baseUrl: string;     // Required: AuthHub API URL
  apiKey: string;      // Required: Your API key
  timeout?: number;    // Optional: Request timeout (default: 30000ms)
  retries?: number;    // Optional: Retry attempts (default: 3)
});
```

### AI Module

#### Chat Completion

```typescript
const response = await client.ai.chat({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' },
  ],
  temperature: 0.7,    // Optional
  max_tokens: 500,     // Optional
});

console.log(response.choices[0].message.content);
console.log(`Tokens used: ${response.usage.total_tokens}`);
```

#### Streaming

```typescript
const stream = client.ai.chatStream({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Tell me a story.' }],
});

for await (const chunk of stream) {
  process.stdout.write(chunk.content);
}
```

### Database Module

#### Query

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const result = await client.db.query<User>(
  'SELECT * FROM users WHERE id = $1',
  [42]
);

console.log(result.rows);     // User[]
console.log(result.rowCount); // number
```

#### Transaction

```typescript
await client.db.transaction(async (tx) => {
  await tx.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [100, fromId]);
  await tx.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [100, toId]);
  await tx.query('INSERT INTO transfers (from_id, to_id, amount) VALUES ($1, $2, $3)', [fromId, toId, 100]);
});
```

### Secrets Module

```typescript
// Get a secret
const apiKey = await client.secrets.get('STRIPE_API_KEY');

// List available secrets
const names = await client.secrets.list();

// Check if a secret exists
const exists = await client.secrets.exists('OPTIONAL_KEY');
```

## Error Handling

```typescript
import {
  AuthHubError,
  AuthError,
  RateLimitError,
  ValidationError
} from '@authhub/sdk';

try {
  await client.ai.chat({ model: 'invalid', messages: [] });
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds`);
  } else if (error instanceof AuthError) {
    console.log('Check your API key');
  } else if (error instanceof ValidationError) {
    console.log(`Invalid input: ${error.message}`);
  } else if (error instanceof AuthHubError) {
    console.log(`Error code: ${error.code}`);
    console.log(`Hint: ${error.hint}`);
  }
}
```

## Requirements

- Node.js 18+
- ESM or CommonJS

## License

MIT
