# Product Requirements Document (PRD)

## Executive Summary
**Agentic CLI** is a world-class, autonomous coding tool designed to operate directly from the terminal. Built on a multi-agent architecture and the Recursive Language Model (RLM) pattern, it aims to match or exceed the capabilities of state-of-the-art tools like Claude Code. It empowers developers by intelligently planning, executing, and verifying complex coding tasks, reducing manual toil and context switching.

## Problem Statement
Modern software development involves repetitive tasks, complex refactoring, and constant context switching between IDEs, documentation, and terminals. Existing AI coding assistants are often limited to single-file context or lack the agency to perform multi-step operations reliably. Developers need a tool that lives in their terminal, understands their entire codebase, and can autonomously execute complex workflows with high reliability and verification.

## Target Users
*   **Software Engineers:** For accelerating feature development, refactoring, and bug fixing.
*   **DevOps Engineers:** For automating infrastructure scripts and configuration management.
*   **Technical Leads:** For architectural reviews and ensuring code consistency across large codebases.

## Core Features (MVP)

### 1. RLM Orchestration Engine
*   Implements the **PLAN → SEARCH → NARROW → ACT → VERIFY** cycle.
*   Decomposes high-level user prompts into executable sub-tasks.
*   Maintains a persistent "Task Ledger" to track progress and state.

### 2. Multi-Agent Architecture
*   **Orchestrator Agent:** Manages the overall plan and delegates tasks.
*   **Coder Agent:** Writes and modifies code based on specifications.
*   **Reviewer Agent:** Analyzes code for errors, security issues, and style violations.
*   **Tester Agent:** Runs tests and validates fixes.

### 3. Deep Context Management
*   File-based state persistence for transparent context tracking.
*   Intelligent file reading and searching (grep/glob) to understand codebase structure.
*   Git integration to manage branches, commits, and safe rollbacks.

### 4. Interactive Terminal Interface
*   Built with `oclif` for a robust command-line experience.
*   Rich UI elements (spinners, progress bars, diff views) to communicate agent status.
*   Human-in-the-loop confirmation steps for critical actions.

### 5. Pluggable AI Backend
*   Primary integration with Anthropic's Claude API.
*   Extensible design to support OpenAI, Gemini, or local LLMs in the future.

## User Stories

### Feature Development
*   "As a developer, I want to ask the CLI to 'implement the user login feature based on the auth-service spec', so that it creates the necessary controllers, services, and tests automatically."

### Refactoring
*   "As a developer, I want to say 'rename the User class to Customer across the entire project', so that the tool safely updates all references and imports without breaking the build."

### Debugging
*   "As a developer, I want to paste a stack trace and have the CLI identify the root cause, propose a fix, and run tests to verify it."

### Maintenance
*   "As a maintainer, I want the tool to autonomously run through the codebase and fix all linting errors adhering to the project's `.eslintrc`."

## Success Metrics
*   **Task Completion Rate:** > 90% success for well-defined coding tasks without human intervention.
*   **Startup Time:** < 500ms to ready state (using Node.js optimizations).
*   **Verification Accuracy:** < 5% rate of "hallucinated fixes" (code that looks correct but fails tests).
*   **User Retention:** > 50% of users returning to use the tool daily.

## Technical Constraints
*   **Runtime:** Node.js (v18+) / TypeScript.
*   **Compatibility:** Cross-platform (Linux, macOS, Windows).
*   **Performance:** Must not block the main thread for UI responsiveness; heavy processing offloaded or async.
*   **Security:** Sandbox execution where possible; explicit user permission for file writes and shell commands.

## Timeline & Phases

### Phase 1: Core Foundation (Weeks 1-2)
*   CLI skeleton setup with `oclif`.
*   Basic RLM Orchestrator implementation (Plan -> Act).
*   Integration with Claude API.

### Phase 2: Agentic Capabilities (Weeks 3-4)
*   Implement full RLM cycle (Search, Verify).
*   Add specialized agents (Reviewer, Tester).
*   Implement robust file system and Git tools.

### Phase 3: Advanced Features & Polish (Weeks 5-6)
*   Multi-agent coordination/parallelism (if applicable).
*   Context optimization (token management).
*   UX improvements (diff views, interactive prompts).

### Phase 4: Beta & Testing (Weeks 7-8)
*   Internal dogfooding.
*   Performance tuning (startup time).
*   Documentation and release.
