# Architecture Overview

## System Context
The **Agentic CLI** is a terminal-based application designed to act as an autonomous coding partner. It integrates with an AI Provider (LLM) to understand user intent, plan modifications, and execute them on the local filesystem.

## High-Level Architecture Diagram
```mermaid
graph TD
    User((User)) -->|CLI Command| CLI[CLI Interface (oclif)]
    CLI -->|Parses Args| Workflow[Workflow Manager]
    Workflow -->|Manages State| Engine[RLM Engine]
    Engine -->|Reads/Writes| Ledger[Task Ledger (.rlm/ledger.json)]
    Engine -->|Invokes| Agents[Agent System]
    
    subgraph "Agent System"
        Orchestrator[Orchestrator Agent]
        Coder[Coder Agent]
        Reviewer[Reviewer Agent]
    end
    
    Agents -->|Uses| Tools[Tool Registry]
    Tools -->|Read/Write| FS[FileSystem]
    Tools -->|Execute| Shell[Shell Execution]
    
    Agents -->|Generate Prompt| AI[AI Service Integration]
    AI -->|API Call| LLM[LLM Provider (Anthropic/OpenAI)]
```

## Core Components

### 1. CLI Interface (`src/commands`)
- Built with **oclif**.
- Handles user input, flags, and configuration.
- Displays rich UI (spinners, progress bars) via `ora` and `chalk`.
- Delegates execution to the `WorkflowManager`.

### 2. Workflow Manager (`src/core/workflow`)
- High-level controller for a user session.
- Initializes the `RLMEngine`.
- Handles interruptions (Ctrl+C) and error reporting.
- Manages the global `Config` state.

### 3. RLM Engine (`src/core/engine`)
- The brain of the operation.
- Implements the **PLAN → SEARCH → NARROW → ACT → VERIFY** cycle.
- Persists state to the `TaskLedger`.
- Decides which agent to invoke based on the current phase.

### 4. Agent System (`src/core/agents`)
- **BaseAgent**: Abstract class defining common behavior (prompt construction, tool execution).
- **OrchestratorAgent**: Responsible for planning and high-level decision making.
- **CoderAgent**: Specialized in writing code.
- **ReviewerAgent**: Specialized in reading and critiquing code.

### 5. Tool Registry (`src/core/tools`)
- A collection of atomic capabilities exposed to the LLM.
- **FileSystem**: Read, Write, Search (grep), List files.
- **Shell**: Execute safe commands (npm test, git status).
- **Git**: Manage version control operations.

### 6. AI Service Integration (`src/services/ai`)
- Abstraction layer for LLM providers.
- Handles rate limiting, retries, and error mapping.
- Standardizes prompt format (messages array) and response parsing.

## Data Flow
1.  **Start**: User runs `agentic start "Fix login bug"`.
2.  **Init**: CLI initializes `WorkflowManager`, loads config.
3.  **Plan**: `RLMEngine` uses `OrchestratorAgent` to create a plan based on the prompt.
4.  **Execute**:
    *   **Search**: Engine uses file search tools to find relevant context.
    *   **Narrow**: Engine selects specific files to read.
    *   **Act**: Engine delegates to `CoderAgent` to modify files.
    *   **Verify**: Engine runs tests (via `Shell` tool) to confirm the fix.
5.  **Finish**: Results are displayed to the user; state is saved to `ledger.json`.

## Key Design Principles
- **Modularity**: Components are loosely coupled (Dependency Injection where possible).
- **Transparency**: All AI actions are logged to the ledger and visible to the user.
- **Safety**: File modifications are sandboxed or require confirmation (unless overridden).
- **Resumability**: State is persisted at every step to handle crashes or interruptions.
