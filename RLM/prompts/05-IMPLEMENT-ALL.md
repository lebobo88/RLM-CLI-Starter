# RLM Implement All Tasks Prompt

## Purpose
Implement all active tasks sequentially, with progress tracking and resume capability.

## Instructions for AI

You are the RLM Implementation Agent running in batch mode. Your job is to implement all pending tasks in dependency order.

---

## Phase 1: Load State

Read these files:
1. `RLM/specs/constitution.md` - Project standards
2. `RLM/progress/status.json` - Current progress
3. `RLM/tasks/INDEX.md` - Task order and dependencies
4. All files in `RLM/tasks/active/` - Pending tasks

### Assess Current State

Count tasks:
- Pending: [X]
- In Progress: [X]
- Blocked: [X]
- Completed: [X]

Report to user:
```
## Implementation Session

### Current State:
- Pending tasks: [X]
- In progress: [X] (will resume)
- Blocked: [X]
- Completed: [X]

### Estimated Work:
Based on task estimates, approximately [X] hours of work remaining.

### Starting Point:
[First task or in-progress task to resume]
```

---

## Phase 2: Select Automation Level

Ask the user:

> "Select automation level for this batch:
>
> **AUTO** - Implement all tasks without stopping (except blockers)
> - Best for: Overnight runs, well-defined tasks
> - I'll create a summary report at the end
>
> **SUPERVISED** - Pause after each task for review
> - Best for: Active development, learning
> - You can skip tasks, adjust priorities, or stop
>
> **MANUAL** - Pause at every decision point
> - Best for: Critical features, pair programming
>
> Which level? (auto/supervised/manual)"

---

## Phase 3: Create Session Log

Create `RLM/progress/logs/SESSION-[timestamp].md`:

```markdown
# Implementation Session

## Started: [Timestamp]
## Automation Level: [Level]
## Initial State:
- Pending: [X]
- In Progress: [X]
- Blocked: [X]
- Completed: [X]

---

## Task Log

### TASK-XXX: [Title]
- Started: [Time]
- Status: [In Progress/Completed/Blocked]
- Duration: [Time]
- Notes: [Any notes]

```

Update `RLM/progress/status.json`:
```json
{
  "lastUpdate": "[timestamp]",
  "session": {
    "id": "SESSION-[timestamp]",
    "automationLevel": "[level]",
    "startedAt": "[timestamp]",
    "tasksAtStart": [count]
  }
}
```

---

## Phase 4: Implementation Loop

For each task in order (respecting dependencies):

### 4.1 Check Task Status

Skip if:
- Already completed
- In `RLM/tasks/blocked/` with unresolved blocker
- Dependencies not met

### 4.2 Execute Task

Follow `04-IMPLEMENT-TASK.md` workflow for each task.

**AUTO Mode Behavior:**
- Implement without pausing
- Log progress to session file
- Continue to next task automatically
- Only pause on: Blockers, repeated failures (3+), ambiguous requirements

**SUPERVISED Mode Behavior:**
- After each task completion, report:
  ```
  ## TASK-XXX Complete!

  Duration: [Time]
  Files: [Created/Modified]
  Tests: [Added]

  Progress: [X] of [Y] tasks ([%])

  Next: TASK-YYY - [Title]

  Options:
  1. Continue to next task
  2. Skip next task (mark as blocked)
  3. Stop session (progress saved)
  4. Review completed work
  ```
- Wait for user input before proceeding

**MANUAL Mode Behavior:**
- Follow manual mode for each task
- Pause at every decision point within each task

### 4.3 Handle Blockers

If a task gets blocked:
1. Move to `RLM/tasks/blocked/`
2. Log blocker details
3. Continue with next unblocked task
4. Report blocked tasks in session summary

### 4.4 Track Progress

After each task, update:
- Session log
- `RLM/progress/status.json`
- Task index (if exists)
- Token usage log (see Token/Progress Tracking section)

### 4.5 Real-Time Progress Output

During each task, display progress (if reporting.mode is "realtime" or "both"):

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 TASK-XXX: [Task Title]                    [3/8 tasks]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Progress: [████████░░░░░░░░░░░░] 40% (Step 2/5: Writing tests)

Token Usage This Task:
  Input:  2,450 tokens
  Output: 1,230 tokens
  Total:  3,680 tokens

Session Total: 35,420 / 100,000 tokens (35.4%)

⏱️  Task: 3m 24s | Session: 18m 45s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

After each task completion:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ TASK-XXX COMPLETE                          [3/8 tasks]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Duration: 8m 32s
Files Created: 2 | Modified: 1
Tests Added: 4 (12 assertions)

Token Usage:
  This Task:  8,450 tokens
  Session:   43,870 tokens (43.9%)

Next: TASK-YYY - [Title]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Phase 4.6: Context Window Management

Monitor and manage context usage throughout the session.

### Checkpoint Protocol

At configured thresholds, automatically checkpoint context:

| Threshold | Action |
|-----------|--------|
| **50%** | Save checkpoint, log warning, continue |
| **75%** | Save checkpoint, alert user, suggest completing current batch |
| **90%** | Save checkpoint, complete current task ONLY, force pause |

**Checkpoint Structure** (saved to `RLM/progress/bundles/CHK-[threshold]-[timestamp].json`):

```json
{
  "checkpoint_id": "CHK-75-2024-12-09-001",
  "threshold": 0.75,
  "timestamp": "2024-12-09T14:30:00Z",
  "context_snapshot": {
    "current_phase": "implementation",
    "current_task": "TASK-005",
    "task_step": 3,
    "completed_tasks": ["TASK-001", "TASK-002", "TASK-003", "TASK-004"],
    "pending_tasks": ["TASK-005", "TASK-006", "TASK-007"],
    "blocked_tasks": [],
    "files_modified": ["src/auth.ts", "src/api/users.ts"],
    "key_decisions": [
      {"topic": "Auth strategy", "decision": "JWT with refresh tokens"}
    ]
  },
  "resume_instructions": "Continue from TASK-005, step 3 (implementing code)"
}
```

### Smart Truncation Protocol

When context exceeds 75%, apply tiered truncation:

```
TIER 1 (Never truncate):
├─► Current task specification
├─► Constitution (coding standards)
├─► Active feature spec
├─► Recent errors/decisions
└─► Key decisions log

TIER 2 (Summarize if needed):
├─► Completed task summaries → "5 tasks completed, all passing"
├─► Previous session context → 1-2 sentence summary
└─► Design tokens → Keep references, truncate details

TIER 3 (Truncate first):
├─► Historical logs → Remove, reference file path
├─► Verbose tool outputs → Keep summary only
└─► Exploration context → Remove entirely
```

**Truncation Algorithm:**
```
1. Calculate current context size
2. If > 75%:
   - Summarize TIER 3 content
   - Store full content in RLM/progress/context-archive/
3. If still > 85%:
   - Summarize TIER 2 content
   - Keep only references to design tokens
4. If still > 95%:
   - Force checkpoint save
   - Reset context with TIER 1 only
   - Prompt for resume
```

### Phase Transition Protocol

Between major phases (Specs → Tasks → Implement):

```
Context at 65%. Phase transition detected.

Options:
1. Continue with current context
2. Reset context for next phase (recommended)
3. Save checkpoint and pause

[Select option]
```

**If reset chosen:**
1. Save full context to bundle
2. Write phase summary to file
3. Start fresh with:
   - Constitution
   - Current phase prompt
   - Phase-specific inputs (from files)
4. Reference previous outputs via file reads

### Context Warning Display

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CONTEXT THRESHOLD REACHED: 75%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Checkpoint saved: RLM/progress/bundles/CHK-75-2024-12-09-001.json

Current Progress:
- Tasks completed: 4
- Current task: TASK-005 (40% complete)
- Tasks remaining: 3

Recommendation: Complete TASK-005 and pause for resume.

Options:
1. Continue (will checkpoint at 90%)
2. Finish current task and pause
3. Pause immediately

[Select option]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Phase 5: Session Summary

When all tasks complete (or user stops):

```
## Session Complete!

### Summary
- **Duration**: [Total time]
- **Tasks Completed**: [X] of [Y]
- **Tasks Blocked**: [X]
- **Tasks Remaining**: [X]

### Completed Tasks
| Task | Title | Duration | Tests |
|------|-------|----------|-------|
| TASK-001 | [Title] | 25m | 5 |
| TASK-002 | [Title] | 40m | 8 |

### Blocked Tasks
| Task | Title | Blocker |
|------|-------|---------|
| TASK-005 | [Title] | Waiting for API key |

### Remaining Tasks
| Task | Title | Dependencies |
|------|-------|--------------|
| TASK-008 | [Title] | TASK-005 (blocked) |

### Files Changed This Session
- Created: [X] files
- Modified: [X] files
- Tests added: [X]

### Code Quality
- All tests: [Passing/X failures]
- Linting: [Clean/X issues]
- Type check: [Passing/X errors]

### Token Usage
- Total:      87,450 tokens (87.5%)
- Per Task:   17,490 avg
- Efficiency: [Good/Fair/Poor] (target: <20k/task)

### Next Steps
[Recommendations based on state]
```

---

## Phase 6: Save State for Resume

Update `RLM/progress/status.json` with final state:

```json
{
  "lastUpdate": "[timestamp]",
  "session": {
    "id": "SESSION-[timestamp]",
    "completedAt": "[timestamp]",
    "result": "completed" | "paused" | "blocked"
  },
  "summary": {
    "total": [X],
    "pending": [X],
    "inProgress": 0,
    "completed": [X],
    "blocked": [X]
  },
  "tasks": {
    "TASK-001": { "status": "completed", "completedAt": "..." },
    "TASK-002": { "status": "pending" },
    "TASK-005": { "status": "blocked", "blocker": "..." }
  }
}
```

---

## Interrupt Handling

If the user wants to stop mid-session:

1. Complete current task if close to done
2. Or save current state for resume
3. Update session log with pause reason
4. Update status.json with partial progress

```
## Session Paused

Progress has been saved. To resume:
- Use `@rlm-resume` agent or read RLM/prompts/06-RESUME.md

Current state:
- [X] tasks completed this session
- TASK-XXX in progress (state saved)
- [X] tasks remaining
```

---

## Parallel Execution Note

While this prompt processes tasks sequentially, tasks without mutual dependencies could theoretically run in parallel. The sequential approach is chosen for:
- Simpler state management
- Easier debugging
- Better progress visibility
- Resume capability

For parallel execution in specific scenarios, coordinate multiple AI sessions with separate task assignments.

---

## Token/Progress Tracking

### Configuration

Progress reporting is configured in `RLM/progress/config.json`:

```json
{
  "reporting": {
    "mode": "both",
    "realtime": {
      "show_token_count": true,
      "show_progress_bar": true,
      "update_frequency": "per_step"
    },
    "logging": {
      "enabled": true,
      "granularity": "detailed"
    }
  }
}
```

### Silent Logging (Always Active)

After each task step, append to `RLM/progress/token-usage/session-YYYY-MM-DD.json`:

```json
{
  "session_id": "SESSION-2024-12-09-001",
  "started_at": "2024-12-09T10:00:00Z",
  "mode": "implement-all",
  "entries": [
    {
      "timestamp": "2024-12-09T10:05:00Z",
      "task": "TASK-001",
      "step": "writing_tests",
      "step_number": 2,
      "percentage": 40,
      "tokens": { "input": 1200, "output": 450 },
      "cumulative": { "input": 5000, "output": 2100 },
      "elapsed_ms": 45000,
      "notes": "4 tests written"
    }
  ],
  "summary": {
    "total_tokens": 87450,
    "tasks_completed": 5,
    "avg_tokens_per_task": 17490,
    "efficiency_rating": "good"
  }
}
```

### Efficiency Ratings

| Rating | Tokens/Task | Description |
|--------|-------------|-------------|
| Excellent | < 10,000 | Well-defined tasks, minimal iteration |
| Good | 10,000-20,000 | Normal implementation complexity |
| Fair | 20,000-35,000 | Complex tasks or some rework needed |
| Poor | > 35,000 | Consider breaking task into smaller pieces |

### Token Budget Thresholds

| Threshold | Action |
|-----------|--------|
| 50% | Warning displayed, continue normally |
| 75% | "Consider completing current batch and resuming later" |
| 90% | Complete current task only, save context bundle, pause |

---

## Notes for AI

- Always check dependencies before starting a task
- Don't skip tests even in AUTO mode
- Log enough detail to enable resume
- If multiple blockers accumulate, pause even in AUTO mode
- Quality over speed - don't rush to hit numbers
- Constitution compliance is non-negotiable
- If estimated time exceeds context limits, pause and suggest resume
