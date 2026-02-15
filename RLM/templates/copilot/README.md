# GitHub Copilot Integration Templates (RLM v2.7)

This directory contains templates that enable GitHub Copilot features in RLM-generated projects.

## Overview

When RLM generates a new project, these templates are copied to enable Copilot's autonomous coding capabilities.

**Entry Point**: Read `RLM/START-HERE.md` for the complete workflow overview.

> **Note:** The `.github/` directory at the repository root is the **live reference implementation** of these templates. It contains the fully configured agents, prompts, and instructions used by this starter kit. Templates here are for **scaffolding new projects** that adopt the RLM Method — they provide simplified, role-based defaults suitable as a starting point. When in doubt, refer to `.github/` for the canonical, up-to-date configuration.

| Template | Destination | Purpose |
|----------|-------------|---------|
| `copilot-instructions.md.template` | `.github/copilot-instructions.md` | Repository-wide Copilot instructions |
| `AGENTS.md.template` | `AGENTS.md` | Coding agent guidance |
| `instructions/*.instructions.md` | `.github/instructions/` | Path-specific instructions |
| `prompts/*.prompt.md` | `.github/prompts/` | Reusable prompts (slash commands) |
| `agents/*.agent.md` | `.github/agents/` | Custom agent profiles (if supported) |
| `workflows/*.yml` | `.github/workflows/` | GitHub Actions automation |

## Directory Structure

```
copilot/
├── README.md                            # This file
├── copilot-instructions.md.template     # Repository-wide instructions
├── AGENTS.md.template                   # Coding agent instructions
├── instructions/                        # Path-specific instructions
│   ├── tasks.instructions.md            # For RLM/tasks/**
│   ├── specs.instructions.md            # For RLM/specs/**
│   ├── implementation.instructions.md   # For src/**
│   └── prompts.instructions.md          # For RLM/prompts/**
├── prompts/                             # Reusable prompts (slash commands)
│   ├── discover.prompt.md               # Idea → PRD
│   ├── create-specs.prompt.md           # PRD → Specs
│   ├── create-tasks.prompt.md           # Specs → Tasks
│   ├── implement.prompt.md              # Single task
│   ├── implement-all.prompt.md          # All tasks
│   ├── resume.prompt.md                 # Resume work
│   ├── test.prompt.md                   # Testing
│   └── status.prompt.md                 # Check status
├── agents/                              # Custom agent definitions (if supported)
│   ├── rlm-architect.agent.md           # Architecture decisions
│   ├── rlm-coder.agent.md               # TDD implementation
│   ├── rlm-tester.agent.md              # Test writing
│   ├── rlm-reviewer.agent.md            # Code review
│   └── rlm-research.agent.md            # Research
└── workflows/                           # GitHub Actions
    └── rlm-task-to-issue.yml            # Task → Issue automation
```

## Template Variables

Templates use these variables that are replaced during project generation:

| Variable | Source | Description |
|----------|--------|-------------|
| `{{PROJECT_NAME}}` | PRD.md | Project name |
| `{{PROJECT_DESCRIPTION}}` | PRD.md | Project description |
| `{{TECH_STACK_SUMMARY}}` | constitution.md | Technology stack overview |

## Copilot Features

### 1. Custom Instructions (`.github/copilot-instructions.md`)

Repository-wide guidance for all Copilot interactions:
- RLM methodology explanation
- Coding standards
- Testing requirements
- File structure conventions

**Requires**: Any Copilot tier

### 2. AGENTS.md

Instructions specifically for Copilot coding agent:
- Pre-implementation checklist
- TDD workflow requirements
- Completion criteria
- Error handling guidance

**Requires**: Copilot Pro+/Enterprise with coding agent enabled

### 3. Path-Specific Instructions (`.github/instructions/*.instructions.md`)

Context-aware instructions that apply to specific file paths:

| File | Applies To | Purpose |
|------|------------|---------|
| `tasks.instructions.md` | `RLM/tasks/active/**/*.md` | Task implementation guidance |
| `specs.instructions.md` | `RLM/specs/**/*.md` | Specification standards |
| `implementation.instructions.md` | `src/**/*` | Code implementation standards |
| `prompts.instructions.md` | `RLM/prompts/**/*.md` | Prompt file guidance |

Uses `applyTo` frontmatter to define glob patterns.

**Requires**: Any Copilot tier

### 4. Prompt Files (`.github/prompts/*.prompt.md`)

Reusable prompts that act as slash commands in Copilot Chat:

| Prompt | Command | Purpose |
|--------|---------|---------|
| `discover.prompt.md` | `/discover` | Idea → PRD |
| `create-specs.prompt.md` | `/create-specs` | PRD → Specs |
| `create-tasks.prompt.md` | `/create-tasks` | Specs → Tasks |
| `implement.prompt.md` | `/implement` | Single task TDD |
| `implement-all.prompt.md` | `/implement-all` | All tasks |
| `resume.prompt.md` | `/resume` | Resume work |
| `test.prompt.md` | `/test` | Run tests |
| `status.prompt.md` | `/status` | Check status |

**Requires**: Copilot Chat

### 5. Custom Agents (`.github/agents/*.agent.md`)

Specialized agent profiles (newer feature, may require specific Copilot tier):

| Agent | Purpose | Tools |
|-------|---------|-------|
| **rlm-coder** | TDD implementation | read_file, edit_file, run_in_terminal |
| **rlm-tester** | Test writing & coverage | read_file, edit_file, run_in_terminal |
| **rlm-reviewer** | Code review & security | read_file |
| **rlm-architect** | Architecture & ADRs | read_file, edit_file |
| **rlm-research** | Research & documentation | read_file, edit_file |

**Requires**: Copilot with custom agents support (Pro+/Enterprise)

### 6. GitHub Actions Workflow

Automates task-to-issue conversion:
- Triggers when task files are pushed
- Creates GitHub issues with proper labels
- Issues can be assigned to Copilot coding agent

**Requires**: GitHub repository with Actions enabled

## Usage

### Using Copilot Prompts

In VS Code with GitHub Copilot Chat:

```
/discover My new project idea
/implement TASK-001
/status
```

Prompts are loaded from `.github/prompts/*.prompt.md` files.

### Using Copilot Coding Agent

1. Push task files to `RLM/tasks/active/`
2. GitHub Actions creates issues automatically
3. Open issue on GitHub
4. Click "Assign to Copilot" in sidebar
5. Copilot implements and creates PR
6. Review and merge

### Manual Setup

If templates weren't copied during project generation:

1. Copy templates to your project:
   ```bash
   # Core files (recommended)
   cp RLM/templates/copilot/copilot-instructions.md.template .github/copilot-instructions.md
   cp RLM/templates/copilot/AGENTS.md.template AGENTS.md
   
   # Path-specific instructions
   cp -r RLM/templates/copilot/instructions .github/instructions
   
   # Prompt files (slash commands)
   cp -r RLM/templates/copilot/prompts .github/prompts
   
   # Optional: Custom agents (if supported)
   cp -r RLM/templates/copilot/agents .github/agents
   
   # Optional: GitHub Actions
   cp -r RLM/templates/copilot/workflows .github/workflows
   ```

2. Replace template variables in copied files

## Requirements

| Feature | Minimum Copilot Tier | Notes |
|---------|---------------------|-------|
| Custom Instructions | Any | `.github/copilot-instructions.md` |
| Path-Specific Instructions | Any | `.github/instructions/*.instructions.md` |
| Prompt Files | Any (with Chat) | `.github/prompts/*.prompt.md` |
| AGENTS.md | Pro+/Enterprise | Root `AGENTS.md` file |
| Custom Agents | Enterprise/Pro+ | `.github/agents/*.agent.md` |
| Coding Agent | Pro+/Enterprise | Autonomous implementation |

## Resources

- [Copilot Custom Instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-copilot)
- [Path-Specific Instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions)
- [Prompt Files](https://docs.github.com/en/copilot/how-tos/use-copilot-agents)
- [GitHub Copilot Coding Agent](https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent)
- [Content Exclusion](https://docs.github.com/en/copilot/how-tos/configure-content-exclusion/exclude-content-from-copilot)
