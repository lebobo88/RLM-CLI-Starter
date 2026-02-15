# Feature: RLM Orchestration Engine
## Feature ID: FTR-002
## Priority: Critical
## Status: Draft

## Description
The Recursive Language Model (RLM) Orchestration Engine is the core intelligence of the CLI tool. It implements the **PLAN → SEARCH → NARROW → ACT → VERIFY** loop. It breaks down a high-level user request (prompt) into atomic sub-tasks, executes them sequentially or in parallel, and maintains the state of the overall task in a persistent ledger. It handles the decision-making process of what tool to use and when.

## User Stories
- As a developer, I want the CLI to automatically break down "implement feature X" into "create file A", "update file B", "run tests" so that I don't have to manually manage dependencies.
- As a user, I want the tool to first *search* for existing files relevant to my request before attempting to modify them, ensuring it has the correct context.
- As a developer, I want the CLI to verify its work (e.g., run tests) after modifying code to ensure it didn't break anything.
- As a user, I want to be able to resume a task if the process was interrupted (e.g., by a crash or manual stop).

## Acceptance Criteria
- [ ] Implements the 5-step RLM cycle:
    1.  **Plan**: Decompose the user prompt into a list of executable sub-tasks.
    2.  **Search**: Locate relevant files/symbols in the codebase (using `grep`/`glob`).
    3.  **Narrow**: Select the specific files to operate on and load their content into context.
    4.  **Act**: Generate code modifications or execute commands based on the plan.
    5.  **Verify**: Run tests or lint checks to confirm success.
- [ ] Maintains a `TaskLedger` (state file) tracking progress, completed tasks, and current context.
- [ ] Automatically updates the plan if a step fails or new information is discovered (dynamic re-planning).
- [ ] Correctly handles context window limits by summarizing or truncating file content during the 'Narrow' phase.
- [ ] Persists state to disk (JSON/SQLite) after each step to allow resumption.

## Technical Approach
- **State Machine**: Use a state machine (e.g., `xstate` or custom class) to manage the RLM lifecycle.
- **Task Ledger**: A JSON file (`.rlm/ledger.json` in the project root) storing the task list, status, and history.
- **Context Management**: A `ContextManager` class to track token usage and decide what file content to include in the prompt.
- **Tool Abstraction**: Define a `Tool` interface for all capabilities (Search, ReadFile, WriteFile, RunCommand) that the LLM can invoke.

## Dependencies
- Internal: FTR-001 (CLI Interface), FTR-003 (Agent Management), FTR-005 (AI Integration).
- External: `zod` (schema validation for tool outputs), `tiktoken` (or similar for token counting).

## Data Model Changes
- **TaskLedger Schema**:
  ```json
  {
    "taskId": "uuid",
    "prompt": "user request",
    "status": "pending|in_progress|completed|failed",
    "steps": [
      {
        "id": "step-1",
        "description": "Search for file...",
        "status": "completed",
        "result": "Found 3 matches..."
      }
    ],
    "context": {
      "files": ["src/index.ts"],
      "variables": {}
    }
  }
  ```

## Security Considerations
- The engine must respect `.gitignore` and `.rlmignore` to avoid leaking sensitive files.
- The `Act` phase must confirm with the user before executing destructive commands (unless `--yes` is set).

## Testing Strategy
- **Unit**: Test individual state transitions (e.g., Plan -> Search).
- **Mocking**: Mock LLM responses to simulate different scenarios (success, failure, hallucinations).
- **Integration**: Run a full cycle with a mocked file system to verify the ledger updates correctly.
