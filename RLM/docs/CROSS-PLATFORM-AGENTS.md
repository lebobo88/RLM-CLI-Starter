# Cross-Platform Agent Reference

> How to create and maintain agents across all three CLI platforms (Copilot CLI, Claude Code, Gemini CLI).

## Overview

Each RLM agent exists as **4 files** across 3 platforms:

| # | File | Platform | Purpose |
|---|------|----------|---------|
| 1 | `.github/agents/<name>.agent.md` | Copilot CLI | Agent definition (invoked with `@name`) |
| 2 | `.claude/commands/<name>.md` | Claude Code | Slash command (invoked with `/name`) |
| 3 | `.gemini/agents/<name>.md` | Gemini CLI | Sub-agent (delegatable by orchestrator) |
| 4 | `.gemini/commands/<name>.toml` | Gemini CLI | User command (invoked with `/name`) |

---

## 1. File Format Templates

### 1a. Copilot CLI Agent (`.github/agents/<name>.agent.md`)

```markdown
---
name: Display Name Here
description: "One-line description (RLM Method v2.7)"
tools: ['read', 'edit', 'execute', 'search']
---

# Agent Title

Prompt body goes here. Use `@other-agent` to delegate to other agents.
```

**Frontmatter fields:**
- `name` — Title Case display name (e.g., "RLM Prime", "RLM Debug")
- `description` — Quoted string, one line
- `tools` — Array of Copilot tool names (see Tool Mapping below)

### 1b. Claude Code Command (`.claude/commands/<name>.md`)

```markdown
---
description: "One-line description (RLM Method v2.7)"
argument-hint: "<hint text>"
model: opus|sonnet|haiku
context:
  - "!cat RLM/progress/pipeline-state.json"
  - "!cat RLM/progress/.current-context.md"
  - "RLM/specs/constitution.md"
skills:
  - tdd-workflow
  - spec-writing
---

# Command Title

Prompt body goes here. User arguments available as $ARGUMENTS.
Use `/other-command` to reference other commands.
```

**Frontmatter fields:**
- `description` — Quoted string, one line
- `argument-hint` — Optional. Shows placeholder text to the user (e.g., `<FTR-XXX or TASK-XXX>`)
- `model` — Which Claude model to use: `opus` (deep reasoning), `sonnet` (balanced), `haiku` (fast)
- `context` — Files/commands to auto-load at invocation; `!` prefix = dynamic injection (run command, inject output)
- `skills` — Pre-load these skills into the command's context

**Notes:**
- No `name` field — the filename is the command name
- No `tools` field — Claude Code commands have implicit access to all tools
- User input is injected via `$ARGUMENTS`
- Dynamic injection uses `!cat` (works in Git Bash on Windows and native shell on Unix)

### 1c. Gemini CLI Agent (`.gemini/agents/<name>.md`)

```markdown
---
name: agent-name
description: "One-line description (RLM Method v2.7)"
kind: local
tools:
  - read_file
  - write_file
  - replace
  - run_shell_command
  - grep_search
  - glob
  - list_directory
timeout_mins: 15
---

# Agent Title

Prompt body goes here. Delegate using `rlm-other-agent` (tool call, no prefix).
```

**Frontmatter fields:**
- `name` — kebab-case (e.g., `rlm-prime`, `rlm-debug`)
- `description` — Quoted string, one line
- `kind` — Always `local`
- `tools` — YAML list of Gemini tool names (see Tool Mapping below)
- `timeout_mins` — Integer, typically 10-15 for simple agents, 30+ for implementation

### 1d. Gemini CLI Command (`.gemini/commands/<name>.toml`)

```toml
description = "One-line description (RLM Method v2.7)"

prompt = """
# Command Title

Prompt body goes here. User arguments available as {{args}}.
Use `/other-command` to reference other commands.
"""
```

**Fields:**
- `description` — One-line string
- `prompt` — Triple-quoted string containing the full prompt

**Notes:**
- No `tools` field — commands have implicit access to all tools
- User input is injected via `{{args}}`

---

## 2. Tool Name Mapping

| Capability | Copilot CLI | Claude Code | Gemini Agent | Gemini Command |
|-----------|-------------|-------------|--------------|----------------|
| Read files | `read` | Read (implicit) | `read_file` | implicit |
| Write files | `edit` | Write/Edit (implicit) | `write_file` | implicit |
| Find/replace in files | `edit` | Edit (implicit) | `replace` | implicit |
| Run shell commands | `execute` | Bash (implicit) | `run_shell_command` | implicit |
| Search file contents | `search` | Grep (implicit) | `grep_search` | implicit |
| Find files by pattern | `search` | Glob (implicit) | `glob` | implicit |
| List directories | `search` | Bash `ls` (implicit) | `list_directory` | implicit |
| Delegate to agent | `agent` | N/A (inline) | sub-agent tool call | N/A |

### Tool Presets

| Preset | Copilot `tools` | Gemini Agent `tools` |
|--------|----------------|---------------------|
| **read-only** | `['read', 'search']` | `read_file`, `grep_search`, `glob`, `list_directory` |
| **read-write** | `['read', 'edit', 'search']` | `read_file`, `write_file`, `replace`, `grep_search`, `glob` |
| **full** | `['read', 'edit', 'execute', 'search']` | `read_file`, `write_file`, `replace`, `run_shell_command`, `grep_search`, `glob`, `list_directory` |
| **orchestrator** | `['read', 'edit', 'execute', 'search', 'agent']` | `read_file`, `write_file`, `replace`, `run_shell_command`, `grep_search`, `glob`, `list_directory` |

*Note: In Gemini CLI agents, sub-agents are NOT listed in the `tools` array. They are implicitly available as tools to the main agent.*

Claude Code commands and Gemini commands do not declare tools (they have implicit access).

---

## 3. Argument Conventions

| Platform | Syntax | Example |
|----------|--------|---------|
| Copilot CLI | User input passed naturally; no placeholder variable | Agent reads from conversation context |
| Claude Code | `$ARGUMENTS` | `Target to prime: $ARGUMENTS` |
| Gemini Agent | User input passed naturally; no placeholder variable | Agent reads from conversation context |
| Gemini Command | `{{args}}` | `Target to prime: {{args}}` |

**Rules:**
- Only Claude Code commands and Gemini commands use argument placeholders
- Copilot agents and Gemini agents receive input from the conversation context
- If the agent accepts arguments, add `argument-hint` in the Claude Code frontmatter

---

## 4. Delegation Syntax

How one agent references or delegates to another:

| Platform | Syntax | Example |
|----------|--------|---------|
| Copilot CLI | `@agent-name` | `@rlm-implement` |
| Claude Code | `/command-name` | `/rlm-implement` |
| Gemini Agent | `rlm-agent-name` (tool call) | `rlm-implement` |
| Gemini Command | `/command-name` | `/rlm-implement` |

**Key difference**: Copilot uses `@` prefix, Claude Code and Gemini commands use `/` prefix, Gemini agents use bare name (as a sub-agent tool call).

---

## 5. Name Conventions

| Field | Copilot CLI | Gemini Agent |
|-------|-------------|--------------|
| `name` in frontmatter | Title Case: `RLM Prime` | kebab-case: `rlm-prime` |
| Filename | `rlm-prime.agent.md` | `rlm-prime.md` |

Claude Code and Gemini commands derive the name from the filename only.

---

## 6. Checklist — Adding a New Agent

When creating a new RLM agent, complete all of these:

### Files to Create
- [ ] `.github/agents/<name>.agent.md` — Copilot CLI agent
- [ ] `.claude/commands/<name>.md` — Claude Code command
- [ ] `.gemini/agents/<name>.md` — Gemini CLI agent
- [ ] `.gemini/commands/<name>.toml` — Gemini CLI command
- [ ] `RLM/prompts/<NN>-<NAME>.prompt.md` — Canonical prompt (optional, for complex agents)

### Registries to Update
- [ ] `AGENTS.md` — Add to Pipeline Agents or Support Agents table
- [ ] `CLAUDE.md` — Add to Claude Code Slash Commands table
- [ ] `GEMINI.md` — Add to Gemini CLI Commands table
- [ ] Update agent counts (all references to "16 agents" become "17 agents", etc.)

### Cross-Platform Consistency
- [ ] All 4 files have the same description string
- [ ] Tool names are correctly mapped per platform
- [ ] Delegation references use correct platform syntax
- [ ] Argument placeholders use correct syntax (`$ARGUMENTS` / `{{args}}`)
- [ ] Prompt body is functionally equivalent across all 4 files

---

## 7. Worked Example — `rlm-prime` in All 4 Formats

### 7a. Copilot CLI (`rlm-prime.agent.md`)

```yaml
---
name: RLM Prime
description: "Pre-load feature or task context into the conversation (RLM Method v2.7)"
tools: ['read', 'search']
---
```
- Tools: read-only preset
- Delegates with: `@rlm-implement`, `@rlm-debug`
- No argument placeholder (reads from conversation)

### 7b. Claude Code (`rlm-prime.md`)

```yaml
---
description: "Pre-load feature or task context into the conversation (RLM Method v2.7)"
argument-hint: "<FTR-XXX or TASK-XXX>"
model: sonnet
context:
  - "!cat RLM/progress/.current-context.md"
---
```
- `model: sonnet` — balanced speed/quality for context loading
- `context:` with dynamic injection of current pipeline state
- No tools field (implicit access)
- Arguments via: `$ARGUMENTS`
- Delegates with: `/rlm-implement`, `/rlm-quality`, `/rlm-verify`

### 7c. Gemini Agent (`rlm-prime.md`)

```yaml
---
name: rlm-prime
description: "Pre-load feature or task context into the conversation (RLM Method v2.7)"
kind: local
tools:
  - read_file
  - grep_search
  - glob
  - list_directory
timeout_mins: 10
---
```
- Tools: read-only preset (Gemini names)
- Delegates with: `rlm-implement`, `rlm-debug` (bare names)
- `kind: local` always

### 7d. Gemini Command (`rlm-prime.toml`)

```toml
description = "Pre-load feature or task context into the conversation (RLM Method v2.7)"

prompt = """
# RLM Prime — Context Priming

Pre-load context for a specific feature or task.

Target to prime: {{args}}
...
"""
```
- Arguments via: `{{args}}`
- Delegates with: `/rlm-implement`, `/rlm-quality`, `/rlm-verify`

---

## 7b. Worked Example — `rlm-sandbox` in All 4 Formats

### 7b-a. Copilot CLI (`rlm-sandbox.agent.md`)

```yaml
---
name: RLM Sandbox
description: "Manage E2B cloud sandboxes for isolated code execution and testing (RLM Method v2.7)"
tools: ['read', 'edit', 'execute', 'search']
---
```
- Tools: full preset (needs `execute` for `uv run sbx ...`)
- Delegates with: `@rlm-implement`, `@rlm-verify`
- References: `RLM/prompts/10-SANDBOX.md`, `sandbox/SKILL.md`

### 7b-b. Claude Code (`rlm-sandbox.md`)

```yaml
---
description: "Manage E2B cloud sandboxes for isolated code execution and testing (RLM Method v2.7)"
argument-hint: "<create|exec|host|test|browse|download|kill> [options]"
---
```
- Arguments via: `$ARGUMENTS`
- Delegates with: `/rlm-implement`, `/rlm-verify`

### 7b-c. Gemini Agent (`rlm-sandbox.md`)

```yaml
---
name: rlm-sandbox
description: "Manage E2B cloud sandboxes for isolated code execution and testing (RLM Method v2.7)"
kind: local
tools:
  - read_file
  - write_file
  - replace
  - run_shell_command
  - grep_search
  - glob
  - list_directory
timeout_mins: 30
---
```
- Tools: full preset (Gemini names)
- `kind: local` always

### 7b-d. Gemini Command (`rlm-sandbox.toml`)

```toml
description = "Manage E2B cloud sandboxes for isolated code execution and testing (RLM Method v2.7)"

[prompt]
text = """
# RLM Sandbox Command
...
Target: {{args}}
"""
```
- Arguments via: `{{args}}`

---

## 8. Platform-Specific Quirks

| Topic | Detail |
|-------|--------|
| **Gemini `experimental` flag** | Sub-agents require `"experimental": {"enableAgents": true}` in `.gemini/settings.json` |
| **Gemini hook events** | `BeforeTool`/`AfterTool` (not `PreToolUse`/`PostToolUse`) |
| **Gemini hook blocking** | stdout JSON with exit code 2 (not stderr) |
| **Gemini env var** | `$env:GEMINI_PROJECT_DIR` (not `$env:CLAUDE_PROJECT_DIR`) |
| **Claude Code sub-agents (v2)** | Frontmatter supports `model`, `disallowedTools`, `maxTurns`, `context` (with `!` injection), `skills`, `hooks` (PreToolUse, PostToolUse, Stop) |
| **Claude Code agent teams** | Set `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` and `teammateMode: auto` in settings |
| **Claude Code skills (v2)** | Skills support `model`, `context: fork`, `allowed-tools`, dynamic `!`backtick in body, prompt hooks with `model: haiku` |
| **Claude Code hooks (v2)** | 14 hook events with structured JSON output; 3 handler types: `command`, `prompt`, `agent` |
| **Claude Code commands (v2)** | Frontmatter supports `model`, `context` (with `!cat` dynamic injection), `skills` pre-loading |
| **Copilot/Gemini constraints** | Copilot CLI and Gemini CLI don't support `model`/`disallowedTools`/`maxTurns` in frontmatter — use body-text `## Constraints (v2)` sections instead |
| **Copilot agent tool** | Copilot agents can delegate with `agent` tool to other agents |

---

## 9. Skills Cross-Reference

Skills provide on-demand knowledge and hooks. Each platform has its own skills directory:

| Skill | Copilot CLI | Claude Code | Gemini CLI |
|-------|------------|-------------|------------|
| rlm-pipeline | `.github/skills/rlm-pipeline/` | `.claude/skills/rlm-pipeline/` | `.gemini/skills/rlm-pipeline/` |
| spec-writing | `.github/skills/spec-writing/` | `.claude/skills/spec-writing/` | `.gemini/skills/spec-writing/` |
| tdd-workflow | `.github/skills/tdd-workflow/` | `.claude/skills/tdd-workflow/` | `.gemini/skills/tdd-workflow/` |
| sandbox | `.github/skills/sandbox/` | `.claude/skills/sandbox/` | `.gemini/skills/sandbox/` |
| fork-terminal | N/A | `.claude/skills/fork-terminal/` | N/A |
| observability | N/A | `.claude/skills/observability/` | N/A |

### Claude Code Skill Features (v2)

Claude Code skills support frontmatter hooks, model selection, tool restrictions, and dynamic context:

```yaml
---
name: spec-writing
description: "Feature spec and PRD writing with validation hooks"
user-invocable: true
model: sonnet
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: prompt
          prompt: "Validate spec follows FTR-XXX naming and has required sections."
          model: haiku
          timeout: 10
---

## Current Context
!`cat RLM/progress/.current-context.md 2>/dev/null || echo "No active context"`
```

- **Hook types**: `command` (shell script), `prompt` (AI model check with haiku for fast validation), `agent` (delegate to sub-agent)
- **Dynamic injection**: Use `!`backtick in the skill body to inject live state at invocation time
- **`context: fork`**: Isolate skill context to save tokens (used by observability, fork-terminal)
- **`allowed-tools`**: Restrict which tools the skill can use (e.g., observability is read-only)

---

## 10. Specialist Sub-Agents

These sub-agents are used by the team lead for focused, single-responsibility work:

| Role | Copilot CLI | Claude Code | Gemini CLI |
|------|------------|-------------|------------|
| Team Lead | N/A (orchestrator handles) | `@team-lead` | N/A (orchestrator handles) |
| Code Writer | `@code-writer-agent` | `@code-writer` | `@rlm-code-writer` |
| Test Writer | `@test-writer-agent` | `@test-writer` | `@rlm-test-writer` |
| Reviewer | `@reviewer-agent` | `@reviewer` | `@rlm-reviewer` |
| Tester | `@tester-agent` | `@tester` | `@rlm-tester` |

### Sub-Agent Hardening (v2)

Claude Code sub-agents use frontmatter fields for constraint enforcement. Copilot CLI and Gemini CLI use body-text `## Constraints (v2)` sections.

**Claude Code agent frontmatter (v2):**
```yaml
---
name: "Agent Name"
description: "Description"
model: sonnet
tools:
  - Read
  - Write
disallowedTools:
  - Bash
maxTurns: 50
context:
  - "!cat RLM/progress/.current-context.md"
  - "RLM/specs/constitution.md"
skills:
  - tdd-workflow
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: prompt
          prompt: "Validate this write is within scope."
          model: haiku
  Stop:
    - hooks:
        - type: prompt
          prompt: "Verify all tasks completed before stopping."
---
```

### Sub-Agent Hook Enforcement

| Sub-Agent | Hook Type | Effect |
|-----------|-----------|--------|
| `code-writer` | PreToolUse prompt (haiku) | Blocks writes to test files (*.test.ts, *.spec.ts) |
| `code-writer` | PostToolUse command | Validates source code quality (no `any`, function length) |
| `test-writer` | PreToolUse prompt (haiku) | Blocks writes to implementation files |
| `reviewer` | Stop prompt | Blocks stop without generating review report |
| `tester` | PostToolUse (Bash) | Captures test execution results + metrics to logs |
| `gemini-analyzer` | PreToolUse command | Verifies gemini CLI is installed |
| All agents | Stop prompt | Verify assigned tasks are completed before stopping |
