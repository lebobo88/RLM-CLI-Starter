# Team Orchestration Guide

## Overview

RLM supports two orchestration modes for executing pipeline phases:

| Mode | Description | Best For | Token Cost |
|------|-------------|----------|------------|
| **PRIMARY-LED** (default) | Single Copilot CLI session orchestrates sub-agents | Most tasks, sequential work | Lower |
| **Team Mode** (opt-in) | Multiple independent Copilot CLI sessions coordinate | Parallel independent work | Higher |

## When to Use Team Mode

**Use Team Mode when:**
- Implementation phase has 5+ independent tasks with no shared file dependencies
- Quality phase needs parallel review, testing, and design QA
- Feature design phase has 3+ features to design independently
- Verification phase has multiple features to verify in parallel
- Debugging with competing hypotheses (each teammate tests a different theory)

**Stick with PRIMARY-LED when:**
- Tasks are sequential or have many dependencies
- Multiple tasks modify the same files
- Cost optimization is a priority
- The work fits in a single context window

## Activation

### Prerequisites

1. Enable team mode in the RLM configuration:
   ```json
   // RLM/progress/rlm-config.json
   {
     "team": {
       "enabled": true
     }
   }
   ```

2. Use the `--team` flag on supported agent commands:
   ```bash
   @rlm-implement all --team
   @rlm-orchestrator "idea" --team
   @rlm-feature-design all --team
   @rlm-verify all --team
   @rlm-quality --team
   ```

### Fallback Behavior

If team mode is not enabled in the RLM configuration, the `--team` flag is silently ignored and the command falls back to PRIMARY-LED orchestration.

## Phase Support Matrix

| Phase | Team Support | Notes |
|-------|-------------|-------|
| Phase 1: Discover | No | Sequential conversation, single context needed |
| Phase 2: Design System | No | Single designer produces one coherent system |
| Phase 3: Specs | No | Architect needs holistic project view |
| Phase 4: Feature Design | **Yes** | Each feature designed by a separate designer teammate |
| Phase 5: Tasks | No | Depends on all specs, sequential breakdown |
| Phase 6: Implement | **Yes** | Primary target -- independent tasks per feature |
| Phase 7a: Quality | **Yes** | QA, review, test coverage run simultaneously |
| Phase 7b: E2E | **Yes** | E2E test generation per feature |
| Phase 8: Verify | **Yes** | Each feature verifies independently |
| Phase 9: Report | No | Aggregation of all results, single agent |

## Architecture

### PRIMARY-LED (Default)

```
                 ┌──────────┐
                 │ PRIMARY  │
                 │  Agent   │
                 └────┬─────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
    ┌────┴────┐ ┌─────┴─────┐ ┌───┴────┐
    │TestWriter│ │CodeWriter  │ │Reviewer│
    │(sub-agent│ │(sub-agent) │ │(sub)   │
    └─────────┘ └───────────┘ └────────┘
         │            │            │
         └────────────┼────────────┘
                      ▼
              Results back to PRIMARY
```

- All sub-agents report to PRIMARY only
- PRIMARY verifies files and writes manifests
- Sub-agents have no peer communication
- Lower token cost, proven reliability

### Team Mode (Opt-in)

```
                 ┌──────────┐
                 │Team Lead │
                 │  Agent   │
                 └────┬─────┘
                      │ manages
         ┌────────────┼────────────┐
         │            │            │
    ┌────┴────┐ ┌─────┴─────┐ ┌───┴─────┐
    │  Coder  │ │  Coder    │ │ Coder   │
    │Teammate │◄►│Teammate   │◄►│Teammate │
    └─────────┘ └───────────┘ └─────────┘
         │            │            │
         ▼            ▼            ▼
    Own manifests, Own context, Peer messaging
```

- Each teammate is a full independent Copilot CLI session
- Teammates can message each other directly
- Each teammate writes its own manifests
- Team lead coordinates via shared task list
- Higher token cost, better for truly parallel work

## DAG Integration

Team mode integrates with the existing task dependency graph:

1. `build-task-graph.ps1` produces `RLM/progress/task-graph.json`
2. `calculate-ready-tasks.ps1` identifies tasks with all dependencies met
3. Team lead reads ready tasks and assigns them to teammates
4. When a task completes, the DAG is rebuilt to find newly unblocked tasks
5. This cycle continues until all tasks are done

### File Conflict Prevention

The DAG system groups tasks to avoid file conflicts. Tasks that modify the same files should NOT be assigned to different teammates. The team lead checks for overlapping file dependencies before assignment.

## Teammate Lifecycle

```
Spawned → Working → Idle → Working → ... → Shutdown
```

1. **Spawned**: Team lead creates teammate with a specific role and context
2. **Working**: Teammate executes an assigned task (TDD cycle, review, etc.)
3. **Idle**: Teammate finishes a task and waits for the next assignment
4. **Shutdown**: Team lead sends shutdown request when all work is done

## Manifest Verification

In team mode, each teammate writes its own completion manifest (unlike PRIMARY-LED where PRIMARY writes manifests). The team lead verifies:

1. Manifest JSON exists at `RLM/progress/manifests/TASK-XXX-*.json`
2. All `filesCreated` in the manifest exist on disk
3. Tests pass when run
4. Task is properly marked as completed

## Configuration

Team settings in `RLM/progress/rlm-config.json`:

```json
{
  "team": {
    "enabled": false,
    "max_teammates": 5,
    "dag_integration": true,
    "fallback_on_failure": true
  }
}
```

Template available at `RLM/templates/team-config-template.json`.

## Cost Considerations

Agent teams use significantly more tokens than PRIMARY-LED because each teammate maintains its own context window. Estimated multipliers:

| Teammates | Token Multiplier | Best For |
|-----------|-----------------|----------|
| 2 | ~2.5x | Simple parallel (review + test) |
| 3 | ~3.5x | Feature design or implement |
| 5 | ~6x | Large implementation batch |

Use team mode strategically for phases where parallelism provides clear time savings.

## Limitations

- **Experimental**: Requires feature flag, may have stability issues
- **No session resumption**: Cannot resume interrupted team sessions
- **No nested teams**: Teammates cannot create their own teams
- **One team per session**: Only one team can be active at a time
- **File conflicts**: Teammates editing the same file will overwrite each other
- **Windows**: Split-pane mode (tmux) not supported in VS Code terminal

## Troubleshooting

### Team creation fails
- Verify team mode is enabled in `RLM/progress/rlm-config.json`
- Check that no other team is currently active

### Teammate stops unexpectedly
- Check teammate output for errors
- Team lead can spawn a replacement teammate
- Consider falling back to PRIMARY-LED for that task

### Tasks getting stuck
- Check shared task list for blocked dependencies
- Verify the blocking task was actually completed
- Team lead can manually unblock by updating task status

### High token usage
- Reduce max_teammates to 2-3
- Use team mode only for the implementation phase
- Switch to PRIMARY-LED for sequential phases
