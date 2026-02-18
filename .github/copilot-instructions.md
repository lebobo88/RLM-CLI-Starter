# Copilot Instructions — RLM Method Workspace

## Overview
This workspace follows the **RLM (Research, Lead, Manage) Method** — a 9-phase AI-powered software development pipeline that transforms raw ideas into production-ready, verified code using Copilot CLI custom agents.

### Workspace Context
- **Type**: Starter kit for new app development using RLM Method
- **RLM Artifacts**: `RLM/` (prompts, templates, specs, tasks, progress)
- **Custom Agents**: `.github/agents/` (23 pipeline-aligned agents)
- **Hooks**: `.github/hooks/` (session lifecycle automation)
- **Hook Libraries**: `.github/hooks/scripts/lib/` (4 shared libraries)
- **Skills**: `.github/skills/` (4 on-demand pipeline knowledge)

## Using RLM with Copilot CLI

### Starting a Pipeline
1. Run `copilot` from this directory
2. Use `/agent` to select an RLM agent (e.g., `rlm-orchestrator`, `rlm-discover`)
3. Use `Shift+Tab` for plan mode during design/planning phases
4. Agents read prompts from `RLM/prompts/` and write artifacts to `RLM/specs/`, `RLM/tasks/`, `RLM/progress/`

### Agent Delegation
Agents can delegate to each other using the `agent` tool. The orchestrator (`rlm-orchestrator`) coordinates all 9 phases automatically.

### Copilot Memory
Copilot Memory learns coding patterns from this repository over time. It complements RLM by:
- Remembering coding conventions discovered during implementation
- Reducing repeated instructions in future sessions
- Building persistent understanding of project architecture

**Memory-Worthy Patterns** — Copilot will naturally learn these as you work:
- Import ordering conventions specific to your project
- Error handling patterns (try/catch styles, error boundary patterns)
- Test structure preferences (describe/it nesting, fixture patterns)
- API contract patterns (request/response shapes, auth headers)
- Component composition patterns (HOCs, render props, hooks)

**RLM + Memory Division of Responsibility:**
- **Constitution** (`RLM/specs/constitution.md`): Hard rules that must always be followed
- **Copilot Memory**: Soft patterns that emerge from implementation practice
- **Don't duplicate**: If a rule is in the constitution, Memory doesn't need to store it

For detailed integration guidance, see `RLM/docs/COPILOT-MEMORY.md`.

## 9-Phase Pipeline

| Phase | Agent | Purpose | Key Artifacts |
|-------|-------|---------|---------------|
| 1 | @rlm-discover | Idea → PRD + Constitution | `RLM/specs/PRD.md`, `RLM/specs/constitution.md` |
| 2 | @rlm-design | Design system (UI only) | `RLM/specs/design/` |
| 3 | @rlm-specs | Feature specs + architecture | `RLM/specs/features/FTR-XXX/` |
| 4 | @rlm-feature-design | Per-feature UI/UX (UI only) | `RLM/specs/features/FTR-XXX/design-spec.md` |
| 5 | @rlm-tasks | Task breakdown | `RLM/tasks/active/TASK-XXX.md` |
| 6 | @rlm-implement | TDD implementation | Source code + tests |
| 7 | @rlm-quality | Code review + testing | `RLM/progress/reviews/` |
| 8 | @rlm-verify | E2E verification | `RLM/progress/verification/` |
| 9 | @rlm-report | Progress reports | `RLM/progress/reports/` |

### Support Agents
| Agent | Purpose |
|-------|---------|
| @rlm-orchestrator | Full pipeline automation (all 9 phases) |
| @rlm-implement-all | Batch TDD implementation (all tasks) |
| @rlm-fix-bug | Root-cause analysis and structured bug fixing |
| @rlm-prime | Pre-load feature/task context for complex sessions |
| @rlm-resume | Resume interrupted sessions |
| @rlm-debug | Diagnose and repair RLM state |
| @rlm-new-agent | Create new agents across all CLI platforms |
| @rlm-sandbox | Manage E2B cloud sandboxes for isolated execution |
| @rlm-team | Orchestrate agent teams for parallel phase execution |
| @rlm-observe | Generate observability reports for multi-agent workflows |
| @gemini-analyzer | Large-scale codebase analysis (1M+ tokens via Gemini CLI) |

## RLM Artifact Structure

```
RLM/
├── specs/                    # Specifications
│   ├── PRD.md               # Product Requirements Document
│   ├── constitution.md      # Project standards & conventions
│   ├── features/            # Feature specifications
│   ├── architecture/        # Architecture decisions
│   └── design/              # Design system
├── tasks/                   # Implementation tasks
│   ├── active/              # Ready for implementation
│   ├── completed/           # Finished tasks
│   └── blocked/             # Blocked tasks
├── progress/                # Progress tracking
│   ├── status.json          # Current pipeline state
│   ├── checkpoint.json      # Incremental tracking
│   ├── manifests/           # Agent completion manifests
│   ├── logs/                # Session logs
│   ├── reviews/             # Code review reports
│   ├── verification/        # Verification reports
│   └── reports/             # Pipeline reports
├── prompts/                 # Workflow prompts (01-09)
├── templates/               # Document templates
├── agents/                  # Agent role definitions
├── config/                  # Configuration files
└── docs/                    # Documentation
```

## Test-Driven Development (TDD)

**CRITICAL**: All implementation follows TDD:

### 5-Step Process
1. **Load Context** (0-20%): Read task spec, feature spec, constitution
2. **Write Tests** (20-40%): TDD Red — write failing tests first
3. **Implement** (40-70%): TDD Green — minimum code to pass
4. **Verify** (70-85%): Run tests, check coverage (80%+ target)
5. **Review** (85-100%): Quality checks, update progress

## Code Quality Standards

### General
- Functions < 50 lines
- Single Responsibility Principle
- Descriptive naming (no abbreviations)
- Error handling at boundaries
- No commented-out code

### TypeScript
- Strict mode enabled
- No `any` types (use `unknown` + type guards)
- Export interfaces for props, API responses, data models
- Import order: external → internal → relative → styles

### Accessibility (WCAG 2.1 AA)
- Color contrast 4.5:1 for text, 3:1 for UI elements
- Touch targets 44x44px minimum
- Keyboard navigation for all interactive elements
- Semantic HTML + ARIA labels

## Security Best Practices
- No secrets in code (use environment variables)
- Parameterized queries (no string concatenation for SQL)
- Input validation on all user inputs
- Proper authentication/authorization checks

## Git Commit Format
```
<type>(<scope>): <description> (FTR-XXX, TASK-YYY)
```
Types: feat, fix, refactor, test, docs, style, perf, chore

## Automation Levels
| Level | Description |
|-------|-------------|
| AUTO | Full autonomy — AI makes all decisions, only pauses for blockers |
| SUPERVISED | Checkpoints at key decisions, pause between phases |
| MANUAL | Step-by-step approval for every action |

## Context Management
| Threshold | Action |
|-----------|--------|
| 50% | Save checkpoint, log warning, continue |
| 75% | Save checkpoint, suggest wrapping up |
| 90% | Save checkpoint, complete current task only, pause |

## References
- **Entry Point**: `RLM/START-HERE.md`
- **Pipeline Prompts**: `RLM/prompts/` (01-DISCOVER through 09-VERIFY-FEATURE)
- **Agent Definitions**: `RLM/agents/` (role definitions)
- **Templates**: `RLM/templates/` (PRD, spec, task, design templates)
- **Documentation**: `RLM/docs/` (user guide, troubleshooting)
