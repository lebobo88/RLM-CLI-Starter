# Contract Testing Pattern

## Purpose
Validate module boundaries: provider exports match consumer expectations.

## When to Use
- After wiring tasks (TASK-XXX-WIRE)
- Before E2E tests
- When refactoring module boundaries
- After dependency updates

## Pattern Structure

### Step 1: Define Contract Schema

```typescript
// src/lib/[module]/__tests__/contracts/provider.contract.ts
import { z } from 'zod';

export const AgentConfigSchema = z.object({
  type: z.enum(['coder', 'tester', 'reviewer']),
  taskId: z.string().optional(),
});

export const AgentHandleSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['running', 'completed', 'failed']),
  startedAt: z.date(),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;
export type AgentHandle = z.infer<typeof AgentHandleSchema>;
```

### Step 2: Provider Contract Test

```typescript
// src/lib/agents/__tests__/spawn-agent.contract.test.ts
import { describe, it, expect } from 'vitest';
import { spawnBackgroundAgent } from '../index';
import { AgentConfigSchema, AgentHandleSchema } from './contracts/provider.contract';

describe('SpawnAgent Provider Contract', () => {
  it('accepts valid config, returns valid handle', async () => {
    const config = { type: 'coder', taskId: 'TASK-001' };

    // Validate input contract
    const validated = AgentConfigSchema.parse(config);

    // Call provider
    const handle = await spawnBackgroundAgent(validated);

    // Validate output contract
    const validatedHandle = AgentHandleSchema.parse(handle);
    expect(validatedHandle.status).toBe('running');
  });

  it('rejects invalid config', () => {
    const invalid = { type: 'invalid' };
    expect(() => AgentConfigSchema.parse(invalid)).toThrow();
  });

  it('exports required types', () => {
    // Type-level test (fails at compile time if missing)
    type _ConfigExists = typeof import('../index').AgentConfig;
    type _HandleExists = typeof import('../index').AgentHandle;
  });
});
```

### Step 3: Consumer Contract Test

```typescript
// src/lib/terminal/__tests__/session-manager.contract.test.ts
import { describe, it, expect, vi } from 'vitest';
import { TerminalSessionManager } from '../session-manager';
import { AgentConfigSchema } from '@/lib/agents/__tests__/contracts/provider.contract';

describe('Terminal Manager Consumer Contract', () => {
  it('calls spawnAgent with valid contract', async () => {
    const manager = new TerminalSessionManager();
    const spy = vi.spyOn(manager, 'spawnAgent');

    await manager.createSession({ type: 'coder' });

    // Verify consumer sends valid contract
    const callArgs = spy.mock.calls[0][0];
    expect(() => AgentConfigSchema.parse(callArgs)).not.toThrow();
  });
});
```

### Step 4: Integration Contract Test

```typescript
// src/__tests__/integration/agent-terminal.contract.test.ts
import { describe, it, expect } from 'vitest';
import { TerminalSessionManager } from '@/lib/terminal';

describe('SpawnAgent <-> Terminal Integration', () => {
  it('integrates without mocks', async () => {
    const manager = new TerminalSessionManager();

    // Real call (NO MOCKS)
    const session = await manager.createSession({
      type: 'coder',
      taskId: 'TASK-001',
    });

    // Verify contract fulfilled
    expect(session.agentId).toMatch(/^[0-9a-f-]{36}$/);
    expect(session.status).toBe('running');
  });

  it('fails gracefully on violation', async () => {
    const manager = new TerminalSessionManager();

    await expect(
      manager.createSession({ type: 'invalid' as any })
    ).rejects.toThrow(/Invalid agent type/);
  });
});
```

## Test Naming Convention

- `[module].contract.test.ts` - Provider tests
- `[consumer].contract.test.ts` - Consumer tests
- `[provider]-[consumer].contract.test.ts` - Integration tests

## Coverage Requirements

Contract tests validate:
- ✅ Input schema (required fields, types)
- ✅ Output schema (expected fields, types)
- ✅ Error cases (invalid inputs rejected)
- ✅ Type exports (TypeScript compilation)
- ✅ Runtime behavior (integration test)

## When to Run

**Phase 7b (Contract Tests)** - After unit tests, before E2E:

```bash
npm run test:contracts
```

Failures BLOCK Phase 8 (Verification).

## Tools

**Recommended**:
- `zod` - Runtime schema validation
- `vitest` - Test runner with type checking
- `ts-expect-error` - Type-level assertions

**Alternative**:
- `io-ts` - Alternative to zod
- `ajv` - JSON Schema validation
- `jest` - Alternative test runner

## Integration with Wiring Tasks

Contract tests are **required** in wiring tasks (TASK-XXX-WIRE):

1. **Provider test**: Validates exports match contract
2. **Consumer test**: Validates imports match contract
3. **Integration test**: Validates end-to-end without mocks

## Example Workflow

For TASK-052-WIRE-049:

```bash
# 1. Create contract schema
touch src/lib/agents/__tests__/contracts/provider.contract.ts

# 2. Write provider test
touch src/lib/agents/__tests__/spawn-agent.contract.test.ts

# 3. Write integration test
touch src/__tests__/integration/agent-terminal.contract.test.ts

# 4. Run tests
npm run test:contracts

# 5. Verify all pass before marking wiring task complete
```

## Benefits

- **Early detection** of type mismatches
- **Runtime validation** beyond TypeScript
- **Documentation** of module contracts
- **Regression prevention** when refactoring
- **Integration confidence** without full E2E overhead
