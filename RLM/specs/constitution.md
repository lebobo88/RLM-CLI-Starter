# Project Constitution: Agentic CLI

## Project Identity
*   **Name:** Agentic CLI
*   **Description:** A world-class, multi-agent AI coding tool that lives in your terminal, orchestrating complex development tasks autonomously.
*   **Core Values:**
    *   **Autonomy:** The tool should be capable of planning and executing tasks with minimal human intervention.
    *   **Reliability:** Changes must be safe, verified, and reversible (via Git integration).
    *   **Speed:** Startup and execution must be fast enough to feel like a native tool, not a slow remote service.
    *   **Transparency:** Always communicate what the agent is doing, why, and what files are affected.

## Technology Stack

### Core
*   **Language:** TypeScript (Strict Mode)
*   **Runtime:** Node.js (Latest LTS - v18+)
*   **Package Manager:** npm (or pnpm for speed)

### Frameworks & Libraries
*   **CLI Framework:** `oclif` (Open CLI Framework) - Industry standard, extensible.
*   **AI SDK:** Anthropic SDK (Primary), LangChain or similar for orchestration utilities (Optional/Lightweight).
*   **Validation:** Zod (for schema validation of config/inputs).
*   **Testing:** Vitest (Fast, modern unit testing).
*   **Git Integration:** `simple-git` or direct git command execution.
*   **State Management:** File-based JSON/YAML for persistence; `better-sqlite3` or local Vector store if needed for deep context.

### Infrastructure
*   **Build Tool:** `tsup` or `esbuild` for fast builds.
*   **Linting/Formatting:** ESLint + Prettier.

## Coding Standards

### General Principles
*   **Functional Core, Imperative Shell:** Keep business logic pure and testable; isolate side effects (file I/O, API calls) to the boundaries.
*   **TDD First:** Write tests for new features before implementation.
*   **Clean Code:** Follow SOLID principles; prioritize readability and maintainability.
*   **Error Handling:** Use custom error classes; never swallow errors silently. Graceful degradation when AI services fail.

### Naming Conventions
*   **Files:** `kebab-case.ts` (e.g., `user-service.ts`)
*   **Classes:** `PascalCase` (e.g., `UserService`)
*   **Variables/Functions:** `camelCase` (e.g., `getUserById`)
*   **Interfaces/Types:** `PascalCase` (e.g., `UserAttributes`)

### Structure
*   `src/commands`: CLI command definitions.
*   `src/core`: Core logic (RLM Engine, Agent Orchestration).
*   `src/services`: External integrations (AI API, Git, FileSystem).
*   `src/utils`: Shared utilities.
*   `tests`: Unit and integration tests mirroring `src` structure.

## Testing Standards

### Coverage Targets
*   **Unit Tests:** > 80% coverage for core logic (`src/core`).
*   **Integration Tests:** Verify critical user flows (e.g., "plan a task", "execute a file edit").
*   **E2E Tests:** Run against a sample repository to ensure real-world functionality.

### Test Patterns
*   **Mocking:** Mock external services (AI APIs, Git commands) in unit tests to ensure deterministic runs.
*   **Fixtures:** Use test fixtures for file system states.
*   **Snapshot Testing:** Useful for verifying complex object outputs or CLI output formatting.

## Git Workflow

### Branching Strategy
*   `main`: Stable, production-ready code.
*   `develop`: Integration branch for ongoing development.
*   `feat/feature-name`: New features.
*   `fix/bug-name`: Bug fixes.
*   `chore/maintenance`: Tooling, deps, docs.

### Commit Messages
*   Follow Conventional Commits specification (e.g., `feat: add RLM planning module`, `fix: handle API rate limits`).

### Pull Request Process
*   All changes must go through a PR.
*   CI checks (Lint, Test, Build) must pass.
*   Code review required from at least one peer (or self-review with AI assistant feedback).
