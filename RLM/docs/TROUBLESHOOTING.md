# RLM Troubleshooting Guide

## Quick Fixes

| Problem | Quick Solution |
|---------|---------------|
| AI doesn't know RLM | "Read RLM/START-HERE.md first" |
| No PRD exists | Run `@rlm-discover` |
| No specs exist | Run `@rlm-specs` |
| No tasks exist | Run `@rlm-tasks` |
| Can't resume | Check `RLM/progress/status.json` or `checkpoint.json` |
| State inconsistent | Run `@rlm-debug` |
| High token usage | Run `@rlm-debug` with context-audit |

---

## Common Issues

### AI Doesn't Understand RLM

**Symptoms:**
- AI asks "What is RLM?"
- AI doesn't follow the workflow
- AI ignores prompt instructions

**Solutions:**

1. Tell the AI to read the entry point:
   ```
   Read RLM/START-HERE.md and understand the RLM method
   ```

2. Be explicit about reading prompts:
   ```
   Read the ENTIRE file RLM/prompts/01-DISCOVER.md, then follow its instructions exactly
   ```

3. For stubborn AIs, copy the prompt content directly into chat

---

### PRD is Missing or Incomplete

**Symptoms:**
- `/create-specs` says PRD not found
- Specs generated are shallow
- AI asks for missing information

**Solutions:**

1. Run discovery:
   ```
   @rlm-discover [your project idea]
   ```
   Or use the orchestrator:
   ```
   @rlm-orchestrator [your project idea]
   ```

2. Check PRD location:
   - Expected: `RLM/specs/PRD.md`
   - If elsewhere, specify path: `/create-specs path/to/prd.md`

3. Validate PRD has required sections (v2.7 enhanced structure):
   - Executive Summary
   - User Personas with needs
   - User Stories with acceptance criteria
   - Functional Requirements
   - Non-Functional Requirements
   - Technology Stack with confidence levels
   - Security & Compliance
   - Success Metrics & KPIs

---

### Tasks Are Too Large

**Symptoms:**
- Tasks take more than 4 hours
- Tasks have multiple unrelated changes
- Hard to track progress

**Solutions:**

1. Request finer granularity:
   ```
   Read RLM/prompts/03-CREATE-TASKS.md and break down features into
   smaller tasks. Each task should take 1-4 hours maximum.
   ```

2. Manually split large tasks:
   - Edit task file in `RLM/tasks/active/`
   - Create additional TASK-XXX files

3. Use the problem-decomposition prompt pattern:
   ```
   Read RLM/prompts/patterns/problem-decomposition.md and apply it to break down this task
   ```

---

### Cannot Resume Session

**Symptoms:**
- `/implement resume` says no session found
- Previous progress lost
- State seems corrupted

**Solutions:**

1. Check status file:
   ```
   Read RLM/progress/status.json and tell me the current state
   ```

2. Check checkpoint file (v2.6+):
   ```
   Read RLM/progress/checkpoint.json and tell me the checkpoint state
   ```

3. Look for session logs:
   ```
   List files in RLM/progress/logs/ and show the most recent
   ```

4. Check context bundles:
   ```
   List files in RLM/progress/bundles/ and restore from latest
   ```

5. Manual recovery:
   - Find last completed task in logs
   - Update status.json manually
   - Continue from next task

6. Start fresh if needed:
   - All tasks still exist in `RLM/tasks/active/`
   - Only progress tracking was lost

---

### Tests Not Written First

**Symptoms:**
- AI writes implementation before tests
- TDD cycle not followed
- Tests added as afterthought

**Solutions:**

1. Emphasize TDD:
   ```
   You MUST follow TDD. Write the test FIRST, verify it fails,
   THEN write implementation. Do not proceed until test exists.
   ```

2. Use MANUAL mode:
   - Pauses at each step
   - You approve test before implementation

3. Check constitution:
   - `RLM/specs/constitution.md` should mandate TDD
   - Update if necessary

---

### AI Scope Creeps

**Symptoms:**
- AI adds unrequested features
- Implementation extends beyond task
- "Improvements" not in spec

**Solutions:**

1. Refer to task scope:
   ```
   Focus ONLY on what's in TASK-XXX.md. Do not add anything
   not in the acceptance criteria.
   ```

2. Use SUPERVISED mode:
   - Review each change before proceeding

3. Keep tasks focused:
   - One responsibility per task
   - Clear acceptance criteria

---

### Dependencies Not Met

**Symptoms:**
- AI starts task but code fails
- Missing types/interfaces from other tasks
- Import errors

**Solutions:**

1. Check task dependencies:
   - Open task file
   - See "Dependencies" field
   - Complete those first

2. View dependency graph in INDEX:
   ```
   Read RLM/tasks/INDEX.md and show the dependency graph
   ```

3. Use debug command to find broken dependencies:
   ```
   @rlm-debug   ```

4. Reorder tasks:
   - Start with tasks showing "Dependencies: None"
   - Work down the dependency tree

---

### Quality Checks Fail

**Symptoms:**
- Linting errors
- Type errors
- Test failures after implementation

**Solutions:**

1. Run checks explicitly:
   ```
   Run linting and type checking. Fix all errors before proceeding.
   ```

2. Check constitution alignment:
   - Code may not match project standards
   - Review `RLM/specs/constitution.md`

3. For persistent test failures:
   ```
   Read RLM/prompts/07-TEST.md and fix the failing tests
   ```

4. Use root-cause-analysis pattern:
   ```
   Read RLM/prompts/patterns/root-cause-analysis.md and apply 5-Whys to this failure
   ```

---

### Wrong Files Created

**Symptoms:**
- Files in wrong directories
- Naming doesn't match convention
- Structure doesn't match project

**Solutions:**

1. Reference constitution:
   ```
   Review RLM/specs/constitution.md for file organization rules
   and ensure all files follow the conventions
   ```

2. Check existing structure:
   ```
   Look at existing files in the project and match their organization
   ```

3. Be explicit:
   ```
   Create the file at exactly: src/features/auth/login.ts
   ```

---

### Session State Corrupted

**Symptoms:**
- status.json has errors
- Inconsistent task states
- Duplicate or missing entries

**Solutions:**

1. Run debug command (v2.6+):
   ```
   @rlm-debug --auto-fix
   ```

2. Validate JSON manually:
   ```json
   {
     "lastUpdate": "2024-01-15T10:30:00Z",
     "tasks": {
       "TASK-001": { "status": "completed" }
     }
   }
   ```

3. Rebuild from files:
   - Count tasks in `active/` → pending
   - Count tasks in `completed/` → completed
   - Count tasks in `blocked/` → blocked

4. Reset if needed:
   ```json
   {
     "lastUpdate": "[now]",
     "currentTask": null,
     "tasks": {}
   }
   ```

---

### AI Forgets Context

**Symptoms:**
- AI asks about things already discussed
- Doesn't remember PRD content
- Loses track of current task

**Solutions:**

1. Refresh context explicitly:
   ```
   Read RLM/specs/constitution.md, then RLM/tasks/active/TASK-XXX.md,
   then continue implementation
   ```

2. Keep context in view:
   - Don't clear chat unnecessarily
   - Reference files frequently

3. Use session logs:
   - Previous decisions are logged
   - Ask AI to read logs for context

4. Use context priming (v2.6+):
   ```
   /prime-task TASK-XXX
   ```

---

### Context Window Overflow

**Symptoms:**
- AI stops mid-task
- "Context limit reached" messages
- Incomplete responses

**Solutions:**

1. Use `/implement resume`:
   - Session is auto-saved at context thresholds
   - Bundle files created in `RLM/progress/bundles/`

2. Check context thresholds in rlm-config.json:
   ```json
   "context_management": {
     "auto_checkpoint": {
       "thresholds": [0.5, 0.75, 0.9]
     }
   }
   ```

3. Delegate to sub-agents:
   - Use `@rlm-implement` to delegate to Coder agent
   - Sub-agents have isolated context windows

4. Break down large tasks:
   - Tasks over 35,000 tokens should be split
   - Use `@rlm-tasks` with finer granularity

---

### High Token Usage

**Symptoms:**
- Tasks consuming excessive tokens
- Efficiency rating "Poor" (> 35,000 tokens/task)
- Slow progress through task list

**Solutions:**

1. Run context audit:
   ```
   @rlm-debug context-audit
   ```

2. Check token efficiency ratings:
   | Rating | Tokens/Task | Action |
   |--------|-------------|--------|
   | Excellent | < 10,000 | Normal |
   | Good | 10-20,000 | Normal |
   | Fair | 20-35,000 | Consider splitting |
   | Poor | > 35,000 | Split task |

3. Enable smart truncation:
   ```bash
   Update `RLM/progress/rlm-config.json` to enable smart truncation
   ```

4. Use selective file reading:
   - Read only necessary files
   - Avoid loading entire directories

---

### Debug Command Issues

**Issue Types Detected by `@rlm-debug`:**

| Issue Type | Description | Auto-Fix? |
|------------|-------------|-----------|
| `orphan-tasks` | Tasks with no parent feature | Yes |
| `missing-tasks` | Features with incomplete coverage | No |
| `status-mismatch` | File status vs status.json | Yes |
| `checkpoint-drift` | Checkpoint out of sync | Yes |
| `broken-deps` | Non-existent dependencies | No |
| `duplicate-ids` | Same ID used twice | No |
| `missing-specs` | Tasks referencing missing specs | No |
| `stale-progress` | Progress files > 24h old | Yes |
| `blocked-loop` | Circular blocking dependencies | No |
| `incomplete-metadata` | Missing required fields | Partial |

**Running Debug:**
```bash
@rlm-debug              # Full scan with interactive fixes
@rlm-debug quick        # Fast scan, common issues only
@rlm-debug --auto-fix   # Automatically fix safe issues
```

---

### Design System Issues

**Symptoms:**
- Design tokens not generated
- Component states missing
- Design QA failing

**Solutions:**

1. Regenerate design system:
   ```
   @rlm-design
   ```

2. Check design detection:
   ```
   Read RLM/progress/rlm-config.json and check design.auto_detect
   ```

3. Force design for UI project:
   ```bash
   Update RLM/progress/rlm-config.json to set design.force_enabled: true
   ```

4. Check for required 8 states:
   - Default, Hover, Focus, Active
   - Disabled, Loading, Error, Empty

---

### Verification Failures

**Symptoms:**
- E2E tests failing
- Accessibility issues
- Feature marked verification-failed

**Solutions:**

1. Check verification report:
   ```
   Read RLM/progress/verification/FTR-XXX-[timestamp].md
   ```

2. Bug tasks are auto-created:
   - Check `RLM/tasks/active/TASK-XXX-BUG-NNN.md`
   - Fix bugs, then re-verify

3. Re-run verification:
   ```
   @rlm-verify FTR-XXX --retry
   ```

4. Check accessibility issues:
   - axe-core violations listed in report
   - Fix WCAG 2.1 AA compliance issues

---

## Prevention Tips

### Before Starting
- [ ] PRD is complete with all sections
- [ ] Constitution defines tech stack and standards
- [ ] Tasks are small (1-4 hours)
- [ ] Dependencies are mapped
- [ ] Research placed in `RLM/research/project/`

### During Implementation
- [ ] Use SUPERVISED mode until familiar
- [ ] Run tests after each change
- [ ] Review generated code
- [ ] Check progress regularly
- [ ] Run `@rlm-debug` periodically

### When Stopping
- [ ] Note current task and state
- [ ] Verify status.json is updated
- [ ] Don't stop mid-task if possible
- [ ] Check for auto-saved bundles

---

## Getting More Help

1. **Re-read the prompts**: `RLM/prompts/*.md` contain detailed instructions
2. **Check templates**: `RLM/templates/` show expected formats
3. **Review START-HERE**: `RLM/START-HERE.md` has the workflow overview
4. **Quick reference**: `RLM/docs/QUICK-REFERENCE.md` for command overview
5. **Run debug**: `@rlm-debug` for automated state analysis
6. **Ask the AI**: "Read RLM/docs/USER-GUIDE.md and help me with [issue]"
