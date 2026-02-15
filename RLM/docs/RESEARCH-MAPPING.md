# Research Implementation Mapping

Maps findings from [`cli-ai-research.md`](../research/project/cli-ai-research.md) to what's implemented in this starter kit.

## Implemented Features

| Research Area | Implementation | Location |
|--------------|----------------|----------|
| Custom Agents | 12 RLM pipeline agents | `.github/agents/` |
| Hook System | Session lifecycle + safety hooks | `.github/hooks/` |
| Skills System | 3 on-demand skills (pipeline, TDD, spec-writing) | `.github/skills/` |
| Prompt Templates | 5 reusable prompts | `.github/prompts/` |
| Custom Instructions | Repository-wide + pattern-matched | `.github/copilot-instructions.md`, `.github/instructions/` |
| Agent Delegation | Orchestrator delegates to specialist agents | `@rlm-orchestrator` |
| TDD Workflow | Red-Green-Refactor with coverage gates | `@rlm-implement` agent |
| Design System Generation | Design tokens + component library | `@rlm-design` agent |
| 9-Phase Pipeline | Discovery → Verification → Reporting | All 12 agents |
| Memory Integration | Documented patterns for Copilot Memory | `RLM/docs/COPILOT-MEMORY.md` |
| Task DAG Orchestration | Dependency-aware task scheduling | `RLM/docs/TASK-ORCHESTRATION.md` |
| Observability | Event-based tracking via hooks | `RLM/docs/OBSERVABILITY.md` |

## Available for Extension

| Research Area | Notes |
|--------------|-------|
| MCP Servers | Organization-level only; not configurable per-repo |
| Multi-Model Routing | `model:` in agent YAML works in VS Code/JetBrains only |
| Docker Sandbox | Not built into Copilot CLI natively; use hooks for safety |
| Token Tracking | Copilot CLI doesn't expose token counts; use estimation via hooks |
| Infinite Agentic Loops | Use `@rlm-orchestrator` for multi-phase automation |

## Key Differences from Research

The research doc ([`cli-ai-research.md`](../research/project/cli-ai-research.md)) targets building a **custom CLI tool** that rivals Claude Code. This starter kit takes a different approach — it uses **GitHub Copilot CLI as-is** and extends it via:
- Custom agents for domain expertise
- Hooks for automation and safety
- Skills for on-demand knowledge loading
- Prompts for repeatable workflows
- RLM Method for structured development pipeline

This is a **harness** around Copilot CLI, not a replacement.
