# Feature: Agent Management System
## Feature ID: FTR-003
## Priority: Critical
## Status: Draft

## Description
This feature defines the multi-agent architecture where distinct "Personas" handle specific tasks. Each persona (Agent) has a specialized prompt template, context window, and a set of available tools. The system manages switching between agents (e.g., from Orchestrator to Coder) and ensures they collaborate effectively by sharing the `TaskLedger`.

## User Stories
- As a developer, I want an "Orchestrator Agent" to break down complex tasks and delegate them to a "Coder Agent" so that the plan is comprehensive.
- As a reviewer, I want a "Reviewer Agent" to check the "Coder Agent's" work for errors and security issues before committing.
- As a user, I want the system to dynamically select the best agent for the current sub-task (e.g., "Write tests" -> "Tester Agent").

## Acceptance Criteria
- [ ] Implement at least 3 distinct agents:
    - **Orchestrator**: High-level planning, task delegation, and re-planning.
    - **Coder**: Implementation of specific code changes.
    - **Reviewer**: Code analysis and verification.
- [ ] Implement an `Agent` base class or interface with:
    - `name`: string
    - `description`: string
    - `systemPrompt`: string (template)
    - `tools`: array of Tool definitions
    - `run(task: Task, context: Context): Promise<Result>`
- [ ] Agents can pass context and control back to the main workflow.
- [ ] Supports dynamic prompt construction based on the current task and available file context.

## Technical Approach
- **Agent Registry**: A singleton or factory to instantiate agents by name.
- **Prompt Engineering**: Use template literals or a template engine (like handlebars or simple string replacement) for prompts.
- **Tool Mapping**: Each agent has a specific subset of tools. For example, the `Reviewer` agent might only have read access, while `Coder` has write access.
- **Message History**: Agents maintain a conversation history relevant to their specific task execution.

## Dependencies
- Internal: FTR-002 (RLM Engine), FTR-005 (AI Integration).
- External: LangChain (optional, for prompt management if complexity grows), `zod` (for structured output).

## Data Model Changes
- **Agent Configuration**:
  ```typescript
  interface AgentConfig {
    role: string;
    model: string; // e.g. "claude-3-5-sonnet"
    temperature: number;
    tools: string[]; // List of tool names
    systemPromptPath: string; // Path to prompt template file
  }
  ```

## Security Considerations
- Prompt injection: Ensure user inputs are clearly demarcated in prompts to prevent hijacking instructions.
- Tool restriction: Reviewer agent should ideally be read-only to prevent accidental modification during review.

## Testing Strategy
- **Unit**: Verify prompt template rendering with various inputs.
- **Mocking**: Test agent tool selection logic by mocking the LLM response.
- **Integration**: Verify handoff between Orchestrator and Coder (Orchestrator plan -> Coder execution).
