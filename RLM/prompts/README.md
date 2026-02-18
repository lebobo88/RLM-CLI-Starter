# RLM Prompts

These prompts power the RLM pipeline agents across **GitHub Copilot CLI**, **Claude Code**, and **Gemini CLI**. Each prompt is a canonical workflow definition shared by all three platforms.

## Canonical Prompts vs Platform-Specific Wrappers

- **`RLM/prompts/`** contains **canonical pipeline prompts** — the source of truth for all workflow logic, independent of any CLI platform.
- **`.github/prompts/`** contains **Copilot CLI-specific prompt wrappers** — these reference and extend the canonical versions with Copilot CLI-specific invocation patterns and context loading.
- **`.claude/commands/`** and **`.gemini/commands/`** similarly reference canonical prompts via frontmatter `context:` injection or inline prompt includes.

When updating pipeline logic, always edit the canonical prompt in `RLM/prompts/`. Platform-specific wrappers should only contain invocation boilerplate.

## Quick Reference

| Prompt | Purpose | Copilot CLI | Claude Code | Gemini CLI |
|--------|---------|-------------|-------------|------------|
| [00-DETECT-PROJECT-TYPE.md](00-DETECT-PROJECT-TYPE.md) | Classify project type | (internal) | (internal) | (internal) |
| [01-DISCOVER.md](01-DISCOVER.md) | Transform idea into PRD | `@rlm-discover` | `/rlm-discover` | `/rlm-discover` |
| [02-CREATE-SPECS.md](02-CREATE-SPECS.md) | Generate specs from PRD | `@rlm-specs` | `/rlm-specs` | `/rlm-specs` |
| [03-CREATE-TASKS.md](03-CREATE-TASKS.md) | Break features into tasks | `@rlm-tasks` | `/rlm-tasks` | `/rlm-tasks` |
| [04-IMPLEMENT-TASK.md](04-IMPLEMENT-TASK.md) | Implement single task (TDD) | `@rlm-implement` | `/rlm-implement` | `/rlm-implement` |
| [05-IMPLEMENT-ALL.md](05-IMPLEMENT-ALL.md) | Implement all active tasks | `@rlm-implement-all` | `/rlm-implement-all` | `/rlm-implement-all` |
| [06-RESUME.md](06-RESUME.md) | Resume interrupted session | `@rlm-resume` | `/rlm-resume` | `/rlm-resume` |
| [07-TEST.md](07-TEST.md) | Run and fix tests | `@rlm-quality` | `/rlm-quality` | `/rlm-quality` |
| [08-REPORT.md](08-REPORT.md) | Generate progress report | `@rlm-report` | `/rlm-report` | `/rlm-report` |
| [09-VERIFY-FEATURE.md](09-VERIFY-FEATURE.md) | E2E feature verification | `@rlm-verify` | `/rlm-verify` | `/rlm-verify` |
| [10-SANDBOX.md](10-SANDBOX.md) | Sandbox management | `@rlm-sandbox` | `/rlm-sandbox` | `/rlm-sandbox` |

## How to Use

### Copilot CLI
Use the `/agent` command to select an agent, then provide your request:
```
@rlm-discover Build a task management app
```

### Claude Code
Use slash commands:
```
/rlm-discover Build a task management app
```

### Gemini CLI
Use slash commands:
```
/rlm-discover Build a task management app
```

### Any AI (direct prompt)
Tell your AI to read and follow the prompt:
```
Read RLM/prompts/01-DISCOVER.md and help me discover specs for:
Build a task management app with AI prioritization
```

## Workflow

```
Start Here
    │
    ├─── Have an idea? ───────► 01-DISCOVER.md
    │                                  │
    │                                  ▼
    │                           [PRD Generated]
    │                                  │
    └─── Have a PRD? ─────────────────┘
                                       │
                                       ▼
                              02-CREATE-SPECS.md
                                       │
                                       ▼
                              03-CREATE-TASKS.md
                                       │
                                       ▼
                        ┌──────────────┼──────────────┐
                        │              │              │
                        ▼              ▼              ▼
              04-IMPLEMENT      05-IMPLEMENT     06-RESUME
              (one task)        (all tasks)      (continue)
                        │              │              │
                        └──────────────┴──────────────┘
                                       │
                                       ▼
                                 07-TEST.md
                                       │
                                       ▼
                                 08-REPORT.md
```

## Automation Levels

When implementing, you choose the level of AI autonomy:

| Level | Description | Best For |
|-------|-------------|----------|
| **AUTO** | AI makes all decisions | Simple tasks, overnight runs |
| **SUPERVISED** | AI pauses at checkpoints | Most development work |
| **MANUAL** | AI explains each step | Learning, complex decisions |

## File Dependencies

```
01-DISCOVER.md
├── Reads: (nothing required)
└── Creates: RLM/specs/PRD.md, RLM/specs/constitution.md

02-CREATE-SPECS.md
├── Reads: RLM/specs/PRD.md, RLM/templates/
└── Creates: RLM/specs/features/*, RLM/specs/architecture/*

03-CREATE-TASKS.md
├── Reads: RLM/specs/features/*, RLM/specs/epics/*
└── Creates: RLM/tasks/active/*.md, RLM/tasks/INDEX.md

04-IMPLEMENT-TASK.md
├── Reads: RLM/tasks/active/TASK-XXX.md, RLM/specs/constitution.md
└── Creates: Source code, tests, RLM/progress/logs/*

05-IMPLEMENT-ALL.md
├── Reads: RLM/tasks/active/*.md, RLM/progress/status.json
└── Creates: Source code, tests, session logs

06-RESUME.md
├── Reads: RLM/progress/status.json, session logs
└── Continues: Previous implementation session

07-TEST.md
├── Reads: Test files, source code
└── Creates: Test results, fixes

08-REPORT.md
├── Reads: RLM/progress/*, RLM/tasks/*
└── Creates: Progress reports
```

## Tips

1. **Start simple** - Use SUPERVISED mode until comfortable with the workflow
2. **Review PRD carefully** - It shapes everything downstream
3. **Keep tasks small** - 1-4 hours per task is ideal
4. **Run tests often** - Don't wait until the end
5. **Save progress** - The system tracks state for resume capability
