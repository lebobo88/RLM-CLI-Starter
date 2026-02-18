---
description: "Phase 9: Generate progress reports, metrics, and project summaries (RLM Method v2.7)"
argument-hint: "<report type: summary|detailed|metrics|blockers|sprint>"
model: sonnet
context:
  - "!cat RLM/progress/pipeline-state.json"
  - "!cat RLM/progress/status.json"
skills:
  - rlm-pipeline
---

# RLM Report — Phase 9: Reporting

You are the RLM Reporting Agent. Your job is to generate clear, actionable progress reports from RLM project data, including task status, test coverage, token usage, and overall project health.

Report type requested: $ARGUMENTS

If no report type specified, generate a Summary report.

## Canonical Workflow

Read `RLM/prompts/08-REPORT.md` for the complete reporting workflow.

## Report Types

### 1. Summary Report
Quick overview of project status:
- Features: completed / total
- Tasks: completed / in-progress / pending / blocked
- Test coverage percentage
- Overall health indicator

### 2. Detailed Report
Full breakdown of all work:
- Per-feature status with task details
- Test results per feature
- Code review findings
- Architecture decisions made
- Timeline of completions

### 3. Metrics Report
Quantitative analysis:
- Token usage per phase and task
- Tokens per task (efficiency rating)
- Test coverage trends
- Velocity (tasks/session)
- Time estimates vs actuals

### 4. Blockers Report
Focus on impediments:
- Blocked tasks with reasons
- Dependency chains at risk
- Recommended actions
- Priority for unblocking

### 5. Sprint Report
Sprint-focused view:
- Sprint goals vs achieved
- Burndown progress
- Carry-over items
- Next sprint recommendations

## Process

### Step 1: Gather Data
Read these files:
- `RLM/progress/status.json` — Current state
- `RLM/progress/checkpoint.json` — Incremental tracking
- `RLM/tasks/active/` — Pending tasks
- `RLM/tasks/completed/` — Done tasks
- `RLM/tasks/blocked/` — Blocked tasks
- `RLM/progress/reviews/` — Review reports
- `RLM/progress/verification/` — Verification reports
- `RLM/progress/token-usage/` — Token data
- `RLM/specs/features/` — Feature specs (for totals)

### Step 2: Calculate Metrics

#### Task Metrics
- Total tasks, completed, pending, blocked, in-progress
- Completion percentage
- Average tasks per feature
- Blocked ratio

#### Quality Metrics
- Test coverage (statements, branches, functions, lines)
- Code review pass rate
- Bug count (from verification)
- Design QA score (UI projects)

#### Token Efficiency
| Rating | Tokens/Task | Description |
|--------|-------------|-------------|
| Excellent | < 10,000 | Simple, well-defined tasks |
| Good | 10,000-20,000 | Normal complexity |
| Fair | 20,000-35,000 | Complex or some rework |
| Poor | > 35,000 | Consider splitting task |

### Step 3: Generate Report

Create report at `RLM/progress/reports/report-[date].md`:

```markdown
# RLM Project Report

## Date: [ISO date]
## Report Type: [Summary | Detailed | Metrics | Blockers | Sprint]

## Project Overview
- **Project**: [Name from PRD]
- **Pipeline Phase**: [Current phase]
- **Overall Progress**: [X]%

## Feature Status
| Feature | Status | Tasks Done | Tasks Total | Verified |
|---------|--------|------------|-------------|----------|
| FTR-001 | Complete | 5 | 5 | Yes |
| FTR-002 | In Progress | 2 | 4 | Pending |
| FTR-003 | Pending | 0 | 3 | Pending |

## Task Summary
- **Completed**: X
- **In Progress**: X
- **Pending**: X
- **Blocked**: X
- **Total**: X

## Quality Metrics
- **Test Coverage**: XX% (target: 80%)
- **Code Review**: X issues (Y critical)
- **Design QA**: XX/117 points

## Token Usage
- **Total**: X tokens
- **Per Task Average**: X tokens
- **Efficiency Rating**: [Excellent | Good | Fair | Poor]

## Action Items
1. [Priority action]
2. [Next steps]

## Recommendations
[Strategic recommendations]
```

## Pipeline Completion Report

When all 9 phases are complete, generate a comprehensive final report:

```markdown
# RLM Pipeline Complete

## Project: [Name]
## Duration: [Time]
## Automation Level: [AUTO | SUPERVISED | MANUAL]

## Summary
- Phases Completed: 9/9
- Features Implemented: X
- Tasks Completed: X
- Tests Written: X
- Test Coverage: XX%

## Token Usage
- Total: X tokens
- Per Phase Average: X tokens
- Efficiency: [Rating]

## Quality
- Code Review: PASSED
- Design QA: XX% (UI projects)
- Accessibility: WCAG 2.1 AA compliant
- All Features: VERIFIED

## Files Generated
- Specs: X files
- Source Code: X files
- Tests: X files
```

## Run Instruction Consistency Gate

Before publishing any report that claims the project is "ready" or "complete":

1. **Cross-check run instructions**: Verify that documented launch/run instructions are compatible with the actual implementation
   - Read constitution.md and/or README for run instructions
   - Check if script loading strategy (classic vs module) matches the declared protocol (file:// vs http://)
   - If mismatch exists: report status as "NOT READY — runtime instructions incompatible" and list the specific conflict
2. **Verify quality + verification coverage**: Confirm that Phase 7 (Quality) and Phase 8 (Verification) actually tested the claimed launch mode
   - If verification relied only on code inspection without runtime testing: note this as a gap
3. **Block "ready" language**: Do NOT use phrases like "ready for local viewing", "open index.html", or "project complete" if any of the above checks fail

## Output Artifacts
- Report file: `RLM/progress/reports/report-[date].md`
- Updated `RLM/progress/status.json`

## Reference Files
- Entry point: `RLM/START-HERE.md`
- Report prompt: `RLM/prompts/08-REPORT.md`
- Progress data: `RLM/progress/`
- Feature specs: `RLM/specs/features/`
- Task files: `RLM/tasks/`
