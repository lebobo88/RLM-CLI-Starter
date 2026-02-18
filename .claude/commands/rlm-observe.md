---
description: "Generate observability reports for multi-agent workflows (RLM Method v2.7)"
argument-hint: "[latest | session-id]"
model: sonnet
context:
  - "!ls RLM/progress/logs"
skills:
  - observability
---

# RLM Observe — Agent Workflow Observability

You are an observability analyst generating reports from multi-agent workflow logs. Your job is to aggregate log data into readable, actionable markdown reports.

## Input

`$ARGUMENTS` can be:
- `latest` (default): Most recent session/workflow
- A specific session ID: Filter logs to that session
- Empty: Same as `latest`

## Data Sources

Scan these log files for data:

### Primary Logs
- `RLM/progress/logs/tool-usage.csv` — Tool usage (CSV)
- `RLM/progress/logs/tool-usage.jsonl` — Tool usage with agent tracking (JSONL)
- `RLM/progress/logs/sessions.jsonl` — Session lifecycle events
- `RLM/progress/logs/subagents.jsonl` — Sub-agent start/stop events
- `RLM/progress/logs/team-coordination.jsonl` — Team coordination events

### Agent-Specific Logs
- `RLM/progress/logs/agents/*.jsonl` — Per-agent trace files
- `RLM/progress/logs/test-executions.jsonl` — Test execution history
- `RLM/progress/logs/state-verification.jsonl` — State file verification
- `RLM/progress/logs/spec-validation.jsonl` — Spec format validation

## Report Format

Generate a markdown report at `RLM/progress/reports/observability-{target}.md`:

```markdown
# Observability Report: [target]

> Generated at [timestamp]

## Session Summary
- Session ID: [id]
- Duration: [start] to [end]
- Pipeline Phase: [phase]
- Automation Level: [level]

## Agent Activity
| Agent | Started | Stopped | Duration | Tools Used |
|-------|---------|---------|----------|------------|
| [name] | [time] | [time] | [duration] | [count] |

## Tool Usage
| Tool | Invocations | Agent | Most Common Target |
|------|-------------|-------|--------------------|
| Write | [N] | [agent] | [path pattern] |
| Edit | [N] | [agent] | [path pattern] |
| Bash | [N] | [agent] | [command pattern] |

## Team Coordination (if applicable)
- Tasks Assigned: [N]
- Tasks Completed: [N]
- Quality Gate Failures: [N]
- Teammate Idle Events: [N]

## Quality Events
- State Verification Failures: [N]
- Spec Validation Warnings: [N]
- Test Executions: [N]

## Timeline
[Chronological event list with timestamps]

## Recommendations
[Any patterns suggesting inefficiency or problems]
```

## Handling Missing Logs

If log files don't exist yet:
- Report "No data available" for that section
- Don't fail — partial reports are useful
- Suggest which operations would generate the missing data

## Reference
- Observability skill: `.claude/skills/observability/SKILL.md`
