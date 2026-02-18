# RLM Method — Multi-Platform AI Development

## AI-Powered Software Development Pipeline

RLM transforms raw ideas into production-ready code through a structured 9-phase pipeline, powered by **GitHub Copilot CLI**, **Claude Code**, or **Gemini CLI**.

---

## Quick Start

### Copilot CLI

**Fastest Method — Shell Alias:**
```bash
# One-time setup:
.github\hooks\scripts\setup-rlm-alias.ps1  # PowerShell
# or
bash .github/hooks/scripts/setup-rlm-alias.sh  # Bash/Zsh

# Then every time:
rlm  # Instant orchestrator! 🚀
```

**Alternative Methods:**
```bash
# CLI Flag:
copilot --agent rlm-orchestrator

# Interactive Menu:
1. Navigate to your project folder
2. Run `copilot` to start Copilot CLI
3. Use `/agent` to select an RLM agent (e.g., rlm-orchestrator, rlm-discover)
4. Use Shift+Tab for plan mode during design phases
```

See [`RLM/docs/SETUP-ALIAS.md`](docs/SETUP-ALIAS.md) for detailed alias setup.

### Claude Code
```
1. Navigate to your project folder
2. Run `claude` to start Claude Code
3. Use slash commands: /rlm-discover, /rlm-specs, /rlm-tasks, /rlm-implement
4. Use /rlm for full pipeline orchestration
```

### Gemini CLI
```
1. Navigate to your project folder
2. Run `gemini` to start Gemini CLI
3. Use slash commands: /rlm-discover, /rlm-specs, /rlm-tasks, /rlm-implement
4. Use /rlm for full pipeline orchestration
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

## Platform Integration Points

### Copilot CLI
- **Custom Agents** (`.github/agents/`): 18 pipeline-aligned agents
- **Custom Instructions** (`.github/copilot-instructions.md`): Repository-wide context
- **Path-Specific Instructions** (`.github/instructions/`): Targeted coding rules
- **Hooks** (`.github/hooks/`): Session lifecycle, safety checks, progress tracking
- **Skills** (`.github/skills/`): On-demand pipeline knowledge

### Claude Code
- **Slash Commands** (`.claude/commands/`): 18 user-facing pipeline commands (`/rlm-*`)
- **Hooks** (`.claude/hooks/`): Session lifecycle, safety checks, logging
- **Project Context** (`CLAUDE.md`): Claude Code project instructions

### Gemini CLI
- **Sub-Agents** (`.gemini/agents/`): 18 delegatable pipeline agents
- **Custom Commands** (`.gemini/commands/`): 17 user-facing commands (`/rlm-*`)
- **Hooks** (`.gemini/hooks/`): Session lifecycle, safety checks, agent logging
- **Skills** (`.gemini/skills/`): On-demand pipeline knowledge
- **Project Context** (`GEMINI.md`): Gemini CLI project instructions

---

## Using RLM Agents

### Copilot CLI
```
@rlm-orchestrator    # Full pipeline
@rlm-discover        # Phase 1: Idea → PRD
@rlm-specs           # Phase 3: PRD → Feature specs
@rlm-tasks           # Phase 5: Specs → Tasks
@rlm-implement       # Phase 6: TDD implementation
@rlm-resume          # Continue interrupted session
@rlm-debug           # Diagnose and repair state
```

### Claude Code / Gemini CLI
```
/rlm                 # Full pipeline orchestration
/rlm-discover        # Phase 1: Idea → PRD
/rlm-specs           # Phase 3: PRD → Feature specs
/rlm-tasks           # Phase 5: Specs → Tasks
/rlm-implement       # Phase 6: TDD implementation
/rlm-resume          # Continue interrupted session
/rlm-debug           # Diagnose and repair state
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
| `.github/agents/` | Copilot CLI custom agents (23) |
| `.github/hooks/` | Copilot CLI hooks |
| `.github/hooks/scripts/lib/` | Copilot CLI hook shared libraries (4) |
| `.github/skills/` | Copilot CLI skills (4) |
| `.github/instructions/` | Path-specific instructions |
| `.claude/commands/` | Claude Code slash commands (20) |
| `.claude/agents/` | Claude Code sub-agents (6) |
| `.claude/hooks/` | Claude Code hooks |
| `.claude/hooks/lib/` | Claude Code hook shared libraries (7) |
| `.claude/hooks/agents/` | Claude Code agent-specific hooks (7) |
| `.claude/skills/` | Claude Code skills (6) |
| `.gemini/agents/` | Gemini CLI sub-agents (23) |
| `.gemini/commands/` | Gemini CLI commands (21) |
| `.gemini/hooks/` | Gemini CLI hooks |
| `.gemini/hooks/lib/` | Gemini CLI hook shared libraries (4) |
| `.gemini/skills/` | Gemini CLI skills (4) |

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

### Copilot CLI
```
1. Run `copilot` from your project folder
2. Select @rlm-discover via `/agent`
3. Tell the agent: "Help me discover specs for: [your idea]"
4. Answer clarifying questions (3-4 rounds)
5. Review PRD at RLM/specs/PRD.md
6. Continue with @rlm-specs → @rlm-tasks → @rlm-implement
```

### Claude Code
```
1. Run `claude` from your project folder
2. Type: /rlm-discover [your idea]
3. Answer clarifying questions (3-4 rounds)
4. Review PRD at RLM/specs/PRD.md
5. Continue with /rlm-specs → /rlm-tasks → /rlm-implement
```

### Gemini CLI
```
1. Run `gemini` from your project folder
2. Type: /rlm-discover [your idea]
3. Answer clarifying questions (3-4 rounds)
4. Review PRD at RLM/specs/PRD.md
5. Continue with /rlm-specs → /rlm-tasks → /rlm-implement
```

---

## Need Help?

1. Read `RLM/docs/USER-GUIDE.md` for detailed instructions
2. Use @rlm-debug to diagnose state issues
3. Check `RLM/docs/TROUBLESHOOTING.md` for common issues
4. Review the prompts in `RLM/prompts/` — they contain detailed instructions
