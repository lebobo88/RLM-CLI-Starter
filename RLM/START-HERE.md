# RLM Method — Copilot CLI

## AI-Powered Software Development Pipeline

RLM transforms raw ideas into production-ready code through a structured 9-phase pipeline, powered by **GitHub Copilot CLI** custom agents.

---

## Quick Start

```
1. Navigate to your project folder
2. Run `copilot` to start Copilot CLI
3. Use `/agent` to select an RLM agent (e.g., rlm-orchestrator, rlm-discover)
4. Use Shift+Tab for plan mode during design phases
```

---

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

---

## Copilot CLI Integration Points

- **Custom Agents** (`.github/agents/`): 12 pipeline-aligned agents covering all 9 phases plus orchestration, resume, and debug
- **Custom Instructions** (`.github/copilot-instructions.md`): Repository-wide context and coding standards
- **Path-Specific Instructions** (`.github/instructions/`): Targeted rules for source code and RLM artifacts
- **Hooks** (`.github/hooks/`): Session lifecycle, safety checks, progress tracking
- **Skills** (`.github/skills/`): On-demand pipeline knowledge and reference material
- **Copilot Memory**: Learns coding patterns over time, complements RLM specs

---

## Using RLM Agents

Select agents via `/agent` in Copilot CLI:

```
# Start full pipeline orchestration
Use @rlm-orchestrator to run the complete 9-phase pipeline

# Or run individual phases
Use @rlm-discover to transform your idea into a PRD
Use @rlm-specs to generate feature specifications
Use @rlm-tasks to break features into implementation tasks
Use @rlm-implement to implement tasks with TDD

# Support agents
Use @rlm-resume to continue interrupted sessions
Use @rlm-debug to diagnose and repair RLM state
```

---

## TDD Implementation (5-Step Process)

All implementation follows Test-Driven Development:

| Step | Phase | Progress |
|------|-------|----------|
| 1 | Load specs and context | 0–20% |
| 2 | Write tests (TDD Red) | 20–40% |
| 3 | Implement code (TDD Green) | 40–70% |
| 4 | Run tests and fix | 70–85% |
| 5 | Quality checks and review | 85–100% |

---

## Automation Levels

| Level | Description |
|-------|-------------|
| **AUTO** | Full autonomy — AI makes all decisions |
| **SUPERVISED** | Checkpoints at key decisions |
| **MANUAL** | Step-by-step approval |

---

## Context Management

| Threshold | Action |
|-----------|--------|
| **50%** | Save checkpoint, continue |
| **75%** | Save checkpoint, suggest wrapping up |
| **90%** | Save checkpoint, pause |

Use @rlm-resume or read `RLM/prompts/06-RESUME.md` to continue after a pause.

---

## Key Directories

| Directory | Purpose |
|-----------|---------|
| `RLM/prompts/` | Workflow prompts |
| `RLM/templates/` | Document templates |
| `RLM/specs/` | Generated specifications |
| `RLM/tasks/` | Implementation tasks |
| `RLM/progress/` | Progress tracking |
| `RLM/docs/` | Documentation |
| `RLM/agents/` | Agent role definitions |
| `RLM/config/` | Configuration files |
| `.github/agents/` | Copilot CLI custom agents |
| `.github/hooks/` | Copilot CLI hooks |
| `.github/skills/` | Copilot CLI skills |
| `.github/instructions/` | Path-specific instructions |

---

## Prompts Reference

| Prompt | Purpose |
|--------|---------|
| `01-DISCOVER.md` | Transform idea into PRD |
| `02-CREATE-SPECS.md` | Generate specs from PRD |
| `03-CREATE-TASKS.md` | Break features into tasks |
| `04-IMPLEMENT-TASK.md` | Implement single task (TDD) |
| `05-IMPLEMENT-ALL.md` | Implement all active tasks |
| `06-RESUME.md` | Resume interrupted work |
| `07-TEST.md` | Run and fix tests |
| `08-REPORT.md` | Generate progress report |
| `09-VERIFY-FEATURE.md` | Verify feature E2E |

---

## Documentation

| Document | Purpose |
|----------|---------|
| [User Guide](docs/USER-GUIDE.md) | Complete step-by-step guide |
| [Quick Reference](docs/QUICK-REFERENCE.md) | One-page cheat sheet |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Common issues and solutions |


---

## Example: Starting a New Project

```
1. Run `copilot` from your project folder
2. Select @rlm-discover via `/agent`
3. Tell the agent: "Help me discover specs for: [your idea]"
4. Answer clarifying questions (3-4 rounds)
5. Review PRD at RLM/specs/PRD.md
6. Select @rlm-specs via `/agent` to generate specifications
7. Select @rlm-tasks via `/agent` to create implementation tasks
8. Select @rlm-implement via `/agent` to start TDD implementation
```

---

## Need Help?

1. Read `RLM/docs/USER-GUIDE.md` for detailed instructions
2. Use @rlm-debug to diagnose state issues
3. Check `RLM/docs/TROUBLESHOOTING.md` for common issues
4. Review the prompts in `RLM/prompts/` — they contain detailed instructions
