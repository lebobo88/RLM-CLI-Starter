---
description: "Create a new RLM agent across all CLI platforms (Copilot, Claude Code, Gemini)"
argument-hint: "<agent-name> <description>"
model: sonnet
---

# RLM New Agent — Cross-Platform Agent Scaffolding

Create a new RLM agent across all three CLI platforms with correct formatting and conventions.

User input: $ARGUMENTS

## Step 1: Load Reference

Read `RLM/docs/CROSS-PLATFORM-AGENTS.md` to understand file formats, tool name mappings, argument conventions, and delegation syntax for all platforms.

## Step 2: Gather Requirements

Parse the user input or ask for any missing information:

1. **Agent name** — kebab-case with `rlm-` prefix (e.g., `rlm-my-agent`)
2. **Display name** — Title Case (e.g., "RLM My Agent")
3. **Description** — One-line description ending with `(RLM Method v2.7)`
4. **Phase** — Which RLM phase (1-9) or "support" for utility agents
5. **Tool preset** — One of:
   - `read-only` — Analysis, reporting
   - `read-write` — Implementation without shell
   - `full` — Full access including shell
   - `orchestrator` — Full + agent delegation
6. **Accepts arguments?** — Whether users pass arguments
7. **Argument hint** — If yes, placeholder text (e.g., `<FTR-XXX or TASK-XXX>`)
8. **Purpose summary** — Brief description of what the agent does

## Step 3: Read a Similar Agent

Based on the complexity, read an existing agent as a format reference:
- Simple/read-only → Read the `rlm-prime` files across all 4 locations
- Read-write/full → Read the `rlm-debug` files across all 4 locations
- Orchestrator → Read the `rlm-orchestrator` files (first 50 lines of each)

This confirms current format conventions before generating.

## Step 4: Generate All 4 Files

Create each file using the correct platform format from the reference doc:

### 4a. Copilot CLI Agent (`.github/agents/<name>.agent.md`)
- Frontmatter: `name` (Title Case), `description`, `tools` (Copilot tool names)
- Body: Full prompt. Use `@agent-name` for delegation

### 4b. Claude Code Command (`.claude/commands/<name>.md`)
- Frontmatter: `description`, optional `argument-hint`
- Body: Full prompt. Use `$ARGUMENTS` for input, `/command-name` for delegation

### 4c. Gemini CLI Agent (`.gemini/agents/<name>.md`)
- Frontmatter: `name` (kebab-case), `description`, `kind: local`, `tools` (Gemini tool names), `timeout_mins`
- Body: Full prompt. Use bare `rlm-agent-name` for delegation

### 4d. Gemini CLI Command (`.gemini/commands/<name>.toml`)
- Fields: `description`, `prompt` (triple-quoted)
- Body: Full prompt. Use `{{args}}` for input, `/command-name` for delegation

## Tool Preset Mapping

| Preset | Copilot `tools` | Gemini Agent `tools` |
|--------|----------------|---------------------|
| `read-only` | `['read', 'search']` | `read_file`, `grep_search`, `glob`, `list_directory` |
| `read-write` | `['read', 'edit', 'search']` | `read_file`, `write_file`, `replace`, `grep_search`, `glob` |
| `full` | `['read', 'edit', 'execute', 'search']` | `read_file`, `write_file`, `replace`, `run_shell_command`, `grep_search`, `glob`, `list_directory` |
| `orchestrator` | `['read', 'edit', 'execute', 'search', 'agent']` | All above + sub-agent tools |

## Step 5: Create Canonical Prompt (Optional)

If the agent has complex workflow logic, create `RLM/prompts/patterns/<name>.prompt.md` and reference it from all 4 agent files. For simple agents, embed the prompt directly.

## Step 6: Update Registries

1. **AGENTS.md** — Add to Pipeline Agents (phases 1-9) or Support Agents table
2. **CLAUDE.md** — Add to the Claude Code Slash Commands table
3. **GEMINI.md** — Add to the Gemini CLI Commands table
4. **Agent counts** — Search for current count references (e.g., "16") across all three files and increment

## Step 7: Report

Output a summary listing all files created, registries updated, and next steps for testing.
