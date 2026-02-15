# RLM Resume Implementation Prompt

## Purpose
Resume an interrupted implementation session, restoring previous state and context.

## Instructions for AI

You are the RLM Implementation Agent resuming a previous session. Your job is to restore context and continue where you left off.

---

## Phase 1: Load Previous State

Read these files:
1. `RLM/progress/status.json` - Session state
2. `RLM/progress/logs/SESSION-*.md` - Most recent session log
3. `RLM/specs/constitution.md` - Project standards

### Check for Resumable Session

Look in `status.json` for:
```json
{
  "session": {
    "id": "SESSION-...",
    "result": "paused",
    "automationLevel": "..."
  },
  "currentTask": "TASK-XXX"
}
```

If no paused session found:
> "No paused session found. Would you like to:
> 1. Start fresh with `@rlm-implement` agent
> 2. Implement a specific task with `@rlm-implement` agent for TASK-XXX
> 3. Check current status"

---

## Phase 2: Restore Context

### Load Session Details
From the most recent session log, extract:
- When session started
- Automation level used
- Tasks completed so far
- Current task (if in progress)
- Any blockers or notes

### Load Current Task
If a task was in progress:
1. Read `RLM/tasks/active/TASK-XXX.md`
2. Read `RLM/progress/logs/TASK-XXX.md` for progress
3. Identify what was completed and what remains

### Report State to User

```
## Resuming Session

### Previous Session
- **Started**: [Timestamp]
- **Paused**: [Timestamp]
- **Automation Level**: [Level]

### Progress
- Tasks completed: [X]
- Current task: TASK-XXX - [Title]
- Tasks remaining: [X]

### Current Task State
TASK-XXX: [Title]
- Status: [In progress]
- Phase: [Where we stopped - e.g., "Writing tests", "Implementing", "Quality checks"]
- Files created: [List]
- Files pending: [List]

### Would you like to:
1. Continue with same automation level ([Level])
2. Change automation level
3. Skip current task and continue to next
4. Review completed work first
```

---

## Phase 3: Resume Implementation

Based on user choice:

### Option 1: Continue Same Level
- Restore automation level
- Continue from where stopped
- Follow `04-IMPLEMENT-TASK.md` from the current phase

### Option 2: Change Level
- Ask for new automation level
- Update session log
- Continue with new level

### Option 3: Skip Current Task
- Move task to blocked with reason "Skipped during resume"
- Continue to next unblocked task

### Option 4: Review First
- Show summary of completed work
- List files created/modified
- Show test results
- Then ask what to do next

---

## Phase 4: Continue Session

Once resumed, follow the same workflow as `05-IMPLEMENT-ALL.md`:

1. Complete current task
2. Report progress (based on automation level)
3. Move to next task
4. Continue until done or paused again

### Update Session Log

Append to the existing session log:

```markdown
---

## Resumed: [Timestamp]
### Resume Reason: [User requested / Automatic / etc.]
### State at Resume:
- Current task: TASK-XXX
- Phase: [Where we were]

---

### TASK-XXX: [Title] (Continued)
- Resumed: [Time]
- Status: ...
```

---

## Phase 5: Handle Edge Cases

### Task No Longer Exists
If the in-progress task was deleted:
> "The task TASK-XXX no longer exists. It may have been completed manually or removed.
> Continuing to next task: TASK-YYY"

### Dependencies Changed
If dependencies were added:
> "New dependencies detected for TASK-XXX:
> - TASK-YYY (status: [pending/completed])
>
> Would you like to:
> 1. Implement dependencies first
> 2. Proceed anyway (may cause issues)
> 3. Skip to another task"

### Files Modified Externally
If files related to current task were modified since pause:
> "Files have been modified since session was paused:
> - `path/to/file.ts` - Modified [timestamp]
>
> Would you like to:
> 1. Review changes before continuing
> 2. Continue (incorporating changes)
> 3. Start task fresh"

### Session Too Old
If session was paused more than 7 days ago:
> "This session was paused [X] days ago. The codebase may have changed significantly.
>
> Recommend:
> 1. Review recent changes first
> 2. Validate task requirements still accurate
> 3. Start fresh implementation session"

---

## State Recovery Checklist

Before resuming, verify:
- [ ] Project still builds
- [ ] Tests still pass
- [ ] No merge conflicts in work files
- [ ] Dependencies still available
- [ ] Constitution still applicable

If issues found, report and ask for guidance.

---

## Notes for AI

- Always verify state is consistent before resuming
- Don't assume files are unchanged - check timestamps
- If context seems stale, suggest starting fresh
- Log the resume in session log for audit trail
- Be cautious about partially written files
- When in doubt, ask the user
