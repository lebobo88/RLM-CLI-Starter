# Data Model

## Overview
The data model focuses on representing the state of the task, the configuration, and the history of actions.

## 1. Task Ledger (`.rlm/ledger.json`)
The ledger tracks the current state of a user's request. It is persisted to disk and loaded on startup.

```typescript
interface TaskLedger {
  id: string; // Unique UUID
  prompt: string; // User's original request
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  context: {
    cwd: string; // Current working directory
    files: string[]; // List of files currently "narrowed" into context
    variables: Record<string, unknown>; // Arbitrary variables
  };
  steps: Step[]; // List of executed steps
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

interface Step {
  id: string;
  type: 'plan' | 'search' | 'act' | 'verify';
  description: string;
  toolUse?: {
    tool: string; // Name of the tool invoked
    args: any; // Arguments passed
  };
  result?: any; // Output from the tool or agent
  status: 'pending' | 'success' | 'failure';
  error?: string; // Error message if failed
  timestamp: string;
}
```

## 2. Configuration (`~/.config/agentic-cli/config.json`)
User preferences and API keys.

```typescript
interface Config {
  ai: {
    provider: 'anthropic' | 'openai';
    apiKey?: string; // Stored securely if possible
    model: string; // e.g., 'claude-3-5-sonnet'
    temperature: number; // 0.0 - 1.0
  };
  features: {
    autoConfirm: boolean; // If true, skips 'Are you sure?' prompts (default: false)
    verbose: boolean; // Detailed logging (default: false)
  };
  ignore: {
    patterns: string[]; // Additional ignore patterns beyond .gitignore
  };
}
```

## 3. Agent Definition
Internal representation of an Agent.

```typescript
interface AgentDefinition {
  name: string; // e.g., 'Orchestrator'
  role: string; // e.g., 'planner'
  systemPrompt: string; // Template string
  tools: ToolDefinition[]; // Allowed tools
}

interface ToolDefinition {
  name: string; // e.g., 'readFile'
  description: string;
  schema: ZodSchema; // Validation schema for arguments
  execute: (args: any) => Promise<any>;
}
```

## 4. Prompt Template
Structure for constructing prompts sent to the LLM.

```typescript
interface PromptContext {
  task: string;
  files: FileContext[]; // Content of narrowed files
  history: Message[]; // Chat history
}

interface FileContext {
  path: string;
  content: string; // Truncated if necessary
}
```

## Relationships
- A `TaskLedger` contains multiple `Step`s.
- Each `Step` corresponds to an action taken by an `Agent` using a `Tool`.
- `Config` is global but can be overridden by CLI flags.
