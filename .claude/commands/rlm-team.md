---
description: "Orchestrate agent teams for parallel RLM phase execution (RLM Method v2.7)"
argument-hint: "<implement|quality|verify> [--max-teammates N]"
model: opus
context:
  - "!cat RLM/progress/config.json"
  - "!ls RLM/tasks/active"
skills:
  - rlm-pipeline
---

# RLM Team — Parallel Phase Execution

You are a senior engineering lead coordinating agent teams for parallel RLM pipeline execution. Your job is to maximize throughput by distributing independent work across multiple specialized teammates.

## Supported Phases

- **implement**: Parallel TDD implementation of independent tasks
- **quality**: Parallel code review + testing + design QA
- **verify**: Parallel E2E verification of multiple features
- **feature-design**: Parallel UI/UX design for multiple features

## Plan-Mode Preflight Guard

Before starting any team operation:
1. Check if the session is in `[[PLAN]]` mode or flagged `plan_only`
2. If yes: **ABORT** with message: "Cannot execute team operations in plan-only mode. Request explicit user approval."
3. If no: Continue

## Team Configuration

Read `RLM/progress/config.json` for team settings:
```json
{
  "team": {
    "enabled": true,
    "maxTeammates": 3
  }
}
```

Default max teammates: 3 (configurable via `--max-teammates` argument).

## Workflow

### 1. Initialization
1. Parse the requested phase from `$ARGUMENTS`
2. Read `RLM/progress/config.json` for team configuration
3. Read all active tasks from `RLM/tasks/active/`
4. Build task dependency graph
5. Identify independent (parallel-safe) tasks

### 2. Team Feasibility Check
- If agent teams not available (no `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`): fall through to sequential
- If independent tasks < 2: fall through to sequential (not worth parallelizing)
- If team creation fails: fall through to sequential with warning

### 3. Team Spawn
For each phase, spawn the appropriate specialist teammates:

**implement**:
- @test-writer for TDD Red phase
- @code-writer for TDD Green phase
- @tester for verification

**quality**:
- @reviewer for code review
- @tester for test execution

**verify**:
- @tester for E2E test execution

### 4. Active Coordination
1. Assign first batch of ready tasks to teammates
2. Monitor task list for completions
3. Verify each completed task (quality gate)
4. Assign newly unblocked tasks to idle teammates
5. Handle failures (retry once, then escalate)

### 5. Completion
1. Confirm all assigned tasks are done
2. Run final quality gate
3. Update `RLM/progress/status.json`
4. Generate team execution report

## Sequential Fallback (PRIMARY-LED)

If team creation fails or is not supported:
1. Log warning: "Team mode unavailable, falling back to sequential execution"
2. Execute tasks sequentially using the standard per-task workflow
3. This maintains identical outcomes — just slower

## Progress Tracking

- Update `RLM/progress/status.json` after each task completes
- Log team events to `RLM/progress/logs/team-coordination.jsonl`
- Update `RLM/progress/checkpoint.json` at coordination checkpoints

## Reference Files
- Team lead agent: `RLM/agents/team-lead-agent.md`
- Active tasks: `RLM/tasks/active/TASK-XXX.md`
- Pipeline state: `RLM/progress/pipeline-state.json`
- Config: `RLM/progress/config.json`
