# Feature: Tooling & Context System
## Feature ID: FTR-004
## Priority: High
## Status: Draft

## Description
This feature provides the "hands" and "eyes" of the agent. It includes a suite of file system tools (`readFile`, `writeFile`, `grep`, `glob`) and the logic to manage the context window (token budget). It ensures that the agent sees only what is relevant and doesn't exceed LLM token limits.

## User Stories
- As a user, I want the agent to find "where the user login is defined" without me giving the exact path.
- As a developer, I want to ensure the agent doesn't read my entire `node_modules` folder, wasting tokens and time.
- As a user, I want the agent to search for string patterns (grep) to find usages of a function.

## Acceptance Criteria
- [ ] Implement `listDir(path)`: List files in a directory (respecting `.gitignore`).
- [ ] Implement `readFile(path)`: Read file content.
- [ ] Implement `writeFile(path, content)`: Write content to a file (atomic).
- [ ] Implement `grep(pattern, path)`: Search for regex in files.
- [ ] Implement `glob(pattern)`: Find files matching a glob pattern.
- [ ] Implement `TokenManager`: Count tokens in strings and truncate file content if it exceeds the limit.
- [ ] Support "smart context": Summarize large files if exact content isn't needed (optional/advanced).

## Technical Approach
- **Libraries**: `globby` for file finding, `ripgrep` (via `execa`) or pure JS regex for search. `tiktoken` (or `gpt-3-encoder`) for token counting.
- **Ignore Strategy**: Always respect `.gitignore` and `.rlmignore`.
- **Safety**: `writeFile` should check for existence and potentially backup the original file before overwriting.

## Dependencies
- Internal: FTR-001 (CLI), FTR-002 (RLM Engine uses these tools).

## Tool Interface
```typescript
interface Tool {
  name: string;
  description: string;
  parameters: ZodSchema;
  execute(params: any): Promise<string>;
}
```

## Security Considerations
- Prevent directory traversal attacks (e.g., `readFile('../../etc/passwd')`).
- Restrict file operations to the current working directory or subdirectories.

## Testing Strategy
- **Unit**: specific tests for each tool function.
- **Integration**: verify that `grep` returns correct line numbers and file paths.
