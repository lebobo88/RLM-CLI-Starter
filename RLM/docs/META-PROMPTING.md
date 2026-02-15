---

# RLM Meta-Prompting System

## Overview

The RLM Meta-Prompting System uses **YAML frontmatter** in agent definition files to create structured, programmatically-parseable agent configurations. This enables:

- **Validation**: Automated checking of agent definitions for correctness
- **Dynamic Spawning**: Programmatic agent invocation with tool restrictions
- **Tool Control**: Fine-grained permissions and directory scoping
- **Completion Protocols**: Standardized task completion requirements
- **Context Optimization**: Agent-specific context loading strategies

## Architecture

### Agent Definition Structure

```markdown
---
# YAML Frontmatter (Programmatically Parseable)
agent_name: coder
model: sonnet-4.5
tools:
  - Read
  - Write
  - Edit
---

# Markdown Instructions (Human-Readable)
You are the Coder agent...
```

### Two-Layer System

| Layer | Purpose | Format | Consumers |
|-------|---------|--------|-----------|
| **Frontmatter** | Machine-readable metadata | YAML | Scripts, validators, spawners |
| **Markdown** | Human-readable instructions | Markdown | Agents, developers |

## YAML Frontmatter Schema

### Required Fields

```yaml
agent_name: AgentName  # Unique identifier
model: sonnet-4.5      # Default model (sonnet-4.5, opus-4.5, haiku-4)
tools:                 # List of allowed tools
  - Read
  - Write
  - Edit
```

### Optional Fields

#### Tool Restrictions

```yaml
restricted_tools:
  Bash:
    allowed_commands:
      - npm test
      - npm run build
    forbidden_patterns:
      - rm -rf
      - git push --force
  Write:
    forbidden_paths:
      - .env
      - .*secrets.*
```

#### Directory Scope

```yaml
directory_scope:
  - src/
  - __tests__/
  - RLM/tasks/
```

Limits where the agent can read/write files.

#### Hooks

```yaml
hooks:
  post_write:
    - validate-new-file.ps1
    - post-write-validation.ps1
  pre_commit:
    - ensure-tests-pass.ps1
```

#### Completion Protocol

```yaml
completion_protocol:
  required_files:
    manifest: RLM/progress/manifests/{task_id}.json
    tests: __tests__/**/*.test.*
  verification_steps:
    - Run tests and ensure they pass
    - Verify manifest exists and is valid
  failure_handling:
    - Create recovery task if needed
```

#### Context Configuration

```yaml
context:
  max_tokens: 8000
  priority_files:
    - RLM/specs/constitution.md
    - RLM/specs/features/{feature_id}.md
  truncation_strategy: mutual-information
```

#### Metadata

```yaml
description: Brief description of agent purpose
version: 1.0
author: RLM Framework
last_updated: 2025-01-15
tags:
  - implementation
  - testing
```

## Scripts

### validate-agent-definition.ps1

Validates agent definition files for correctness.

**Parameters:**
- `-AgentFile` (required): Path to agent definition file
- `-WorkspaceRoot` (optional): Workspace root directory
- `-Strict` (optional): Fail on warnings

**Example:**
```powershell
.\validate-agent-definition.ps1 -AgentFile ".github/agents/rlm-implement.agent.md"
```

**What it checks:**
- YAML frontmatter present and parseable
- Required fields: `agent_name`, `model`, `tools`
- Valid model selection
- Valid tool names
- Directory scope paths exist
- Markdown content present
- Recommended sections (Identity, Operating Principles)

**Exit codes:**
- `0`: Valid
- `1`: Validation failed

**Example output:**
```
==========================================
Agent Definition Validation
==========================================
File: .github/agents/rlm-implement.agent.md
Strict Mode: False

✓ YAML frontmatter parsed successfully

✓ Required field present: agent_name
✓ Required field present: model
✓ Required field present: tools
✓ Valid model: sonnet-4.5
✓ Tools array: 6 tool(s)
  ✓ Read
  ✓ Write
  ✓ Edit
  ✓ Bash
  ✓ Grep
  ✓ Glob
✓ Tool restrictions defined
✓ Directory scope defined
✓ Completion protocol defined
✓ Markdown instructions present (5432 characters)
✓ Identity section found
✓ Operating principles section found

==========================================
Validation Summary
==========================================

==========================================
✓ Validation PASSED
==========================================
```

### spawn-agent.ps1

Generates agent invocation prompt from definition metadata.

**Parameters:**
- `-AgentName` (required): Name of agent to spawn
- `-TaskId` (required): Task ID being processed
- `-ContextPayload` (optional): Additional context
- `-WorkspaceRoot` (optional): Workspace root
- `-DryRun` (optional): Show prompt without spawning

**Example:**
```powershell
.\spawn-agent.ps1 -AgentName "coder" -TaskId "TASK-045" -ContextPayload "Implement authentication endpoint"
```

**What it does:**
1. Loads agent definition from `.github/agents/{AgentName}.agent.md`
2. Parses YAML frontmatter
3. Constructs context-aware prompt with:
   - Agent identity
   - Tool permissions
   - Directory scope
   - Task context
   - Completion protocol
   - Agent instructions
4. Saves prompt to temp file for PRIMARY to use

**Output:**
```
==========================================
Dynamic Agent Spawning
==========================================
Agent: coder
Task: TASK-045
Dry Run: False

Agent Configuration:
  Name: coder
  Model: sonnet-4.5
  Tools: Read, Write, Edit, Bash, Grep, Glob
  Directory Scope: src/, __tests__/, RLM/tasks/

==========================================
Agent Invocation Prompt
==========================================

You are the coder agent.

## Assignment

**TASK**: TASK-045
**TOOLS AVAILABLE**: Read, Write, Edit, Bash, Grep, Glob
**DIRECTORY SCOPE**: src/, __tests__/, RLM/tasks/
You should primarily work within these directories.

## Context

Implement authentication endpoint

## Completion Protocol
...

Prompt saved to: RLM/progress/.agent-prompt-coder-TASK-045.txt
```

## Workflow Integration

### Creating a New Agent

1. **Copy template:**
   ```powershell
   Copy-Item "RLM/templates/agent-definition-template.md" ".github/agents/my-agent.agent.md"
   ```

2. **Edit frontmatter:**
   ```yaml
   ---
   agent_name: my-agent
   model: sonnet-4.5
   tools:
     - Read
     - Write
   directory_scope:
     - src/my-feature/
   ---
   ```

3. **Write markdown instructions:**
   ```markdown
   # My Agent

   You are responsible for [specific task]...
   ```

4. **Validate:**
   ```powershell
   .\validate-agent-definition.ps1 -AgentFile ".github/agents/my-agent.agent.md"
   ```

### Using in PRIMARY-LED Orchestration

**OLD (Manual Prompting):**
```markdown
PRIMARY: Spawning coder for TASK-045

[Task tool call with manually written prompt]
```

**NEW (Meta-Prompted):**
```markdown
PRIMARY: Spawning coder for TASK-045

1. Generate prompt:
   .\spawn-agent.ps1 -AgentName "coder" -TaskId "TASK-045"

2. Read generated prompt:
   Read: RLM/progress/.agent-prompt-coder-TASK-045.txt

3. Spawn with Task tool:
   [Task tool call using generated prompt]
```

**Benefits:**
- Consistent agent invocations
- Tool restrictions enforced
- Directory scope enforced
- Completion protocol standardized
- Context optimized per agent

## Tool Restrictions

### Allowed Commands Pattern

```yaml
restricted_tools:
  Bash:
    allowed_commands:
      - npm test
      - npm run build
      - npx tsc --noEmit
```

Agent can ONLY run these exact commands.

### Forbidden Patterns

```yaml
restricted_tools:
  Bash:
    forbidden_patterns:
      - rm -rf
      - git push --force
      - DROP TABLE
```

Agent CANNOT run commands matching these patterns.

### Forbidden Paths

```yaml
restricted_tools:
  Write:
    forbidden_paths:
      - .env
      - .*secrets.*
      - config/production.json
```

Agent CANNOT write to these paths (supports regex).

## Directory Scope

```yaml
directory_scope:
  - src/
  - __tests__/
  - RLM/tasks/
```

**Enforcement:**
- Agent should primarily work in these directories
- Validation scripts can check file operations
- Helps prevent accidental modifications outside scope

**Example:**
- **Coder** scoped to `src/`, `__tests__/`
- **Reviewer** scoped to all directories (for inspection)
- **Designer** scoped to `src/components/`, `RLM/specs/design/`

## Model Selection

### When to Use Each Model

| Model | Use Case | Cost | Speed |
|-------|----------|------|-------|
| **haiku-4** | Simple tasks, validation, quick checks | Low | Fast |
| **sonnet-4.5** | Standard implementation, reviews | Medium | Medium |
| **opus-4.5** | Complex architecture, critical decisions | High | Slow |

**Examples:**
```yaml
# Quick file validator
agent_name: validator
model: haiku-4  # Fast, low-cost

# Standard implementation
agent_name: coder
model: sonnet-4.5  # Balanced

# Architecture decisions
agent_name: architect
model: opus-4.5  # High-quality reasoning
```

## Completion Protocol Examples

### Example 1: Coder Agent

```yaml
completion_protocol:
  required_files:
    manifest: RLM/progress/manifests/{task_id}.json
    tests: __tests__/**/*.test.{ts,tsx}
    implementation: src/**/*.{ts,tsx}
  verification_steps:
    - Run: npm test
    - Check: All tests pass
    - Verify: Manifest exists
    - Verify: Coverage >= 80%
  failure_handling:
    - Log to: RLM/progress/logs/failures-{date}.json
    - Create: Recovery task if tests fail 3+ times
    - Notify: PRIMARY agent with error details
```

### Example 2: Reviewer Agent

```yaml
completion_protocol:
  required_files:
    review_report: RLM/progress/reviews/review-{date}-{scope}.md
    json_summary: RLM/progress/review-report.json
    manifest: RLM/progress/manifests/REVIEW-{scope}.json
  verification_steps:
    - Verify: Review report written
    - Verify: JSON summary written
    - Check: All severity levels populated
    - Create: Manifest
  failure_handling:
    - If critical issues: Block commit
    - If no issues: Approve and continue
```

## Context Optimization

### Priority Files

```yaml
context:
  priority_files:
    - RLM/specs/constitution.md
    - RLM/specs/features/{feature_id}.md
    - RLM/specs/design/components/{component}.md
```

These files are ALWAYS loaded for this agent.

### Truncation Strategy

```yaml
context:
  truncation_strategy: mutual-information
```

**Options:**
- **mutual-information**: Keep most relevant chunks based on MI scoring
- **recency**: Keep most recently modified files
- **priority**: Keep files based on priority list

### Max Tokens

```yaml
context:
  max_tokens: 8000
```

Limits context window for this agent. Useful for:
- **Low**: Simple validators (2000-4000 tokens)
- **Medium**: Standard implementation (6000-10000 tokens)
- **High**: Complex architecture (12000-20000 tokens)

## Validation Workflow

### Pre-Deployment Validation

Before deploying new agent definitions:

```powershell
# Validate all agents
Get-ChildItem ".github/agents/*.agent.md" | ForEach-Object {
    .\validate-agent-definition.ps1 -AgentFile $_.FullName
}
```

### Continuous Validation

Add to CI/CD pipeline:

```yaml
# .github/workflows/validate-agents.yml
name: Validate Agent Definitions

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Validate Agents
        run: |
          pwsh RLM/scripts/validate-agent-definition.ps1 -AgentFile ".github/agents/rlm-implement.agent.md"
          pwsh RLM/scripts/validate-agent-definition.ps1 -AgentFile ".github/agents/rlm-quality.agent.md"
          # ... validate all agents
```

## Agent Registry

### Discovering Available Agents

```powershell
# List all agents
Get-ChildItem ".github/agents/*.agent.md" | ForEach-Object {
    $name = $_.BaseName
    Write-Output "- $name"
}
```

### Agent Catalog

| Agent | Model | Primary Tools | Scope |
|-------|-------|---------------|-------|
| coder | sonnet-4.5 | Read, Write, Edit, Bash | src/, __tests__/ |
| reviewer | sonnet-4.5 | Read, Write, Grep, Glob | All |
| tester | sonnet-4.5 | Read, Write, Bash | __tests__/ |
| designer | opus-4.5 | Read, Write | src/components/, RLM/specs/design/ |
| architect | opus-4.5 | Read, Write | RLM/specs/architecture/ |

## Best Practices

### 1. Keep Frontmatter Minimal

**Bad:**
```yaml
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - Task
  - WebFetch
  - WebSearch
  - AskUserQuestion
  - TodoWrite
```
*Too permissive, agent has too many tools*

**Good:**
```yaml
tools:
  - Read
  - Write
  - Edit
```
*Minimal, focused on core needs*

### 2. Use Directory Scope Appropriately

**Bad:**
```yaml
directory_scope:
  - /  # Everything!
```

**Good:**
```yaml
directory_scope:
  - src/features/auth/
  - __tests__/features/auth/
```
*Specific to agent's responsibility*

### 3. Define Clear Completion Protocols

**Bad:**
```yaml
completion_protocol:
  - Do the thing
  - Make it work
```

**Good:**
```yaml
completion_protocol:
  required_files:
    manifest: RLM/progress/manifests/{task_id}.json
  verification_steps:
    - Run tests
    - Verify manifest exists
  failure_handling:
    - Create recovery task
```

### 4. Choose Appropriate Model

```yaml
# Simple validation - use cheap model
agent_name: syntax-validator
model: haiku-4

# Standard implementation - balanced
agent_name: coder
model: sonnet-4.5

# Critical decisions - best model
agent_name: architect
model: opus-4.5
```

## Troubleshooting

### "No YAML frontmatter found"

**Cause**: Agent definition missing `---` markers

**Fix:**
```markdown
---
agent_name: my-agent
model: sonnet-4.5
tools:
  - Read
---

# My Agent instructions...
```

### "Invalid model"

**Cause**: Model not in valid list

**Valid models**: `sonnet-4.5`, `opus-4.5`, `haiku-4`

### "Directory scope path not found"

**Cause**: Path in `directory_scope` doesn't exist

**Fix**: Create directory or fix typo in path

### Validation Passes but Agent Fails

**Cause**: YAML is valid but instructions are incomplete

**Fix**: Ensure markdown instructions are clear and complete

## Migration Guide

### Converting Legacy Agents

**Before (Legacy):**
```markdown
# Coder Agent

You are the Coder agent...
```

**After (Meta-Prompted):**
```markdown
---
agent_name: coder
model: sonnet-4.5
tools:
  - Read
  - Write
  - Edit
---

# Coder Agent

You are the Coder agent...
```

**Steps:**
1. Add YAML frontmatter at top of file
2. Fill in required fields
3. Add optional fields as needed
4. Validate with `validate-agent-definition.ps1`
5. Test with `spawn-agent.ps1 -DryRun`

## See Also

- [RLM/templates/agent-definition-template.md](../templates/agent-definition-template.md) - Complete template
- [VALIDATION-HOOKS.md](VALIDATION-HOOKS.md) - Hook system documentation
- [TASK-ORCHESTRATION.md](TASK-ORCHESTRATION.md) - DAG orchestration

---

*Part of the RLM Meta-Prompting System*
