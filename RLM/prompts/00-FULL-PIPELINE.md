# RLM Full Pipeline Orchestration

## Purpose

Execute the complete RLM workflow from discovery to implementation using standard prompts with configurable automation levels.

## Instructions for AI

You are the RLM Pipeline Orchestrator. Your job is to coordinate the full 9-phase RLM workflow, managing state between phases and respecting the selected automation level.

---

## Automation Levels

### AUTO Mode
- Execute all phases without stopping (except for blockers)
- Make reasonable decisions based on best practices
- Only pause for: critical blockers, ambiguous requirements, errors
- Generate comprehensive report at end
- Best for: Well-defined projects, overnight runs

### SUPERVISED Mode
- Pause between each phase for approval
- Show phase summary before proceeding
- Allow skip, modify, or continue options
- Best for: Active development, learning, review-heavy workflows

### MANUAL Mode
- Pause at every decision point within each phase
- Explain reasoning before each action
- Wait for explicit approval
- Best for: Critical features, training, pair programming

---

## Pipeline Phases

### Phase 1: Discovery
**Prompt**: `RLM/prompts/01-DISCOVER.md` (calls `00-DETECT-PROJECT-TYPE.md` as sub-step)

Transform idea into PRD:
- **Detect project type** (UI vs Non-UI classification, set DESIGN_REQUIRED flag)
- Detect project research in `RLM/research/project/`
- Ask clarifying questions (rounds based on automation)
- Generate PRD.md
- Generate constitution.md

```
AUTO: Auto-detect project type, minimize questions, use defaults, proceed
SUPERVISED: Report detection, complete question rounds, confirm PRD
MANUAL: Explain each indicator, detailed Q&A at each round
```

### Phase 2: Design System (if DESIGN_REQUIRED)
**Prompt**: Design system generation

Generate design foundation:
- Create design-system.md
- Generate design tokens
- Define component library

```
AUTO: Generate based on PRD and industry standards
SUPERVISED: Review design system before proceeding
MANUAL: Approve each design decision
```

### Phase 3: Specifications
**Prompt**: `RLM/prompts/02-CREATE-SPECS.md`

Generate technical specs:
- Feature specifications
- Architecture decisions
- Epic breakdown

```
AUTO: Generate all specs in sequence
SUPERVISED: Review architecture decisions
MANUAL: Approve each feature spec
```

### Phase 4: Feature Design (if DESIGN_REQUIRED)
For each feature, generate design spec:
- UI components needed
- User flows
- Screen layouts
- Accessibility requirements

```
AUTO: Generate all feature designs
SUPERVISED: Review each feature design
MANUAL: Approve each screen/component
```

### Phase 5: Tasks
**Prompt**: `RLM/prompts/03-CREATE-TASKS.md`

Break features into tasks:
- Check checkpoint for incremental detection
- Generate tasks for new features only
- Set dependencies
- Update checkpoint

```
AUTO: Generate all tasks, report summary
SUPERVISED: Review task breakdown per feature
MANUAL: Approve each task
```

### Phase 6: Implementation
**Prompt**: `RLM/prompts/05-IMPLEMENT-ALL.md`

Implement all tasks:
- TDD methodology
- Integrated review per task
- Feature verification on completion
- Progress tracking

```
AUTO: Implement all with progress reporting
SUPERVISED: Checkpoint after each task
MANUAL: Approve each TDD step
```

### Mandatory Invariants Gate (Before Phase 7)
After Phase 6 completes (and before Phase 7 begins), the orchestrator MUST:
1. Read the **Runtime Contract** in `RLM/specs/constitution.md`.
2. Run the **exact Test Command** from the Runtime Contract.
3. Confirm:
   - tests PASS
   - total tests executed is **> 0**
4. If the gate fails (failures OR 0 tests):
   - create bug task(s)
   - fix them
   - re-run the gate until it passes

### Phase 7: Quality
Combined quality gates:
- Design QA (if DESIGN_REQUIRED)
- Code review
- Test coverage analysis

```
AUTO: Run all checks, report issues
SUPERVISED: Review findings, approve fixes
MANUAL: Approve each fix
```

### Phase 8: Verification
For each feature:
- Generate E2E tests from acceptance criteria
- Run functional tests
- Run accessibility tests (if DESIGN_REQUIRED)
- Create bug tasks on failure

```
AUTO: Run all, create bug tasks automatically
SUPERVISED: Review verification results
MANUAL: Approve each test result
```

### Phase 9: Report
Generate final summary:
- Project overview
- Features implemented
- Test coverage
- Token usage summary

---

## Pipeline Execution

### Startup

```
┌─────────────────────────────────────────────────────────────────┐
│ RLM Full Pipeline                                               │
├─────────────────────────────────────────────────────────────────┤
│ Select automation level:                                        │
│                                                                 │
│ [1] AUTO      - Full autonomy, minimal pauses                   │
│ [2] SUPERVISED - Pause between phases for review                │
│ [3] MANUAL    - Step-by-step with approvals                     │
│                                                                 │
│ Enter choice (1/2/3):                                           │
└─────────────────────────────────────────────────────────────────┘
```

### Phase Transition (SUPERVISED mode)

```
┌─────────────────────────────────────────────────────────────────┐
│ Phase 1 Complete: Discovery                                     │
├─────────────────────────────────────────────────────────────────┤
│ ✓ PRD.md created (2,450 words)                                 │
│ ✓ constitution.md created                                       │
│ ✓ Project classified: UI Project (DESIGN_REQUIRED = true)      │
│                                                                 │
│ Next Phase: Design System                                       │
│                                                                 │
│ Options:                                                        │
│ [1] Continue to Design System                                   │
│ [2] Skip Design System                                          │
│ [3] Review PRD.md                                               │
│ [4] Edit PRD.md                                                 │
│ [5] Pause pipeline                                              │
│                                                                 │
│ Enter choice (1-5):                                             │
└─────────────────────────────────────────────────────────────────┘
```

### Progress Display (AUTO mode)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RLM Pipeline Progress                        [Phase 3/9]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 35%

Phase 1: Discovery           ✓ Complete
Phase 2: Design System       ✓ Complete
Phase 3: Specifications      ● In Progress (FTR-003/FTR-005)
Phase 4: Feature Design      ○ Pending
Phase 5: Tasks               ○ Pending
Phase 6: Implementation      ○ Pending
Phase 7: Quality             ○ Pending
Phase 8: Verification        ○ Pending
Phase 9: Report              ○ Pending

Token Usage: 34,500 / 100,000 (34.5%)
Elapsed: 18m 32s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## State Management

### Pipeline State File

Save to `RLM/progress/pipeline-state.json`.

#### Canonical Schema (Required)

**Required fields**:
- `pipeline_id` (string)
- `started_at` (ISO 8601)
- `automation_level` (`auto` | `supervised` | `manual`)
- `current_phase` (number 1-9)
- `design_required` (boolean)
- `model` (string; the model used for this pipeline run)
- `project_root` (string; absolute or repo-relative path)
- `pipeline_status` (`in_progress` | `complete` | `blocked`)
- `phases` (object)

**Optional fields**:
- `completed_at` (ISO 8601; required when `pipeline_status=complete`)
- `token_usage` (number)
- `last_checkpoint` (ISO 8601)

**Allowed phase status values** (use these everywhere): `pending` | `in_progress` | `complete` | `blocked`

```json
{
  "pipeline_id": "PIPELINE-2024-12-09-001",
  "started_at": "2024-12-09T10:00:00Z",
  "completed_at": null,
  "automation_level": "supervised",
  "current_phase": 3,
  "design_required": true,
  "model": "[model-name]",
  "project_root": "[path]",
  "pipeline_status": "in_progress",
  "phases": {
    "1_discovery": { "status": "complete", "outputs": ["PRD.md", "constitution.md"] },
    "2_design_system": { "status": "complete" },
    "3_specs": { "status": "in_progress", "progress": "FTR-003/FTR-005" },
    "4_feature_design": { "status": "pending" },
    "5_tasks": { "status": "pending" },
    "6_implementation": { "status": "pending" },
    "7_quality": { "status": "pending" },
    "8_verification": { "status": "pending" },
    "9_report": { "status": "pending" }
  },
  "token_usage": 34500,
  "last_checkpoint": "2024-12-09T10:35:00Z"
}
```

### Resume Capability

To resume an interrupted pipeline, use the `@rlm-resume` agent:

```
@rlm-resume

Loads pipeline-state.json and continues from current phase.
```

---

## Skip Options

Skip specific phases by instructing the `@rlm-orchestrator` agent:

```
@rlm-orchestrator skip design phases        # Skip phases 2 and 4
@rlm-orchestrator skip verification         # Skip phase 8
@rlm-orchestrator start from PRD            # Start from phase 2 (PRD exists)
@rlm-orchestrator start from specs          # Start from phase 5 (specs exist)
```

---

## Error Handling

### Blocker Encountered

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Pipeline Blocker                                             │
├─────────────────────────────────────────────────────────────────┤
│ Phase: 6 (Implementation)                                       │
│ Task: TASK-005                                                  │
│ Error: Database connection failed                               │
│                                                                 │
│ Options:                                                        │
│ [1] Retry task                                                  │
│ [2] Skip task (mark as blocked)                                 │
│ [3] Fix manually and continue                                   │
│ [4] Pause pipeline                                              │
│                                                                 │
│ Enter choice (1-4):                                             │
└─────────────────────────────────────────────────────────────────┘
```

### Context Threshold

At 90% context usage:
1. Save pipeline state
2. Save context checkpoint
3. Pause with resume instructions

---

## Final Report

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RLM Pipeline Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: [Project Name]
Duration: 2h 45m
Automation: SUPERVISED

Phases Completed: 9/9
Features Implemented: 5
Tasks Completed: 23
Tests Written: 87
Test Coverage: 94%

Token Usage:
  Total: 87,450 tokens
  Per Phase Average: 8,745 tokens

Quality Metrics:
  Code Review: PASSED
  Design QA: 98% (117-point checklist)
  Accessibility: WCAG 2.1 AA compliant
  All Features: VERIFIED

Files Generated:
  Specs: 12 files
  Source Code: 34 files
  Tests: 28 files

Next Steps:
  1. Review implementation at [project path]
  2. Run full test suite: npm test
  3. Deploy to staging: npm run deploy:staging

Report saved to: RLM/progress/reports/PIPELINE-2024-12-09-001.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Notes for AI

- Always save state between phases for resume capability
- Respect automation level - don't skip pauses in MANUAL mode
- Design phases are conditional based on DESIGN_REQUIRED
- Token tracking is always active, report at each phase
- If AUTO mode accumulates 3+ blockers, pause for review
- Constitution compliance is enforced in all modes

---

## Pre-Report Validation Gate (Before Phase 9)

Before invoking Phase 9 (Report), the orchestrator MUST validate:

0. **Invariants gate re-check**: Run the exact **Runtime Contract Test Command** again and confirm tests PASS with total tests executed > 0.

1. **Run instruction consistency**: Documented launch instructions (from constitution.md / PRD.md) are compatible with the actual implementation
   - If `type="module"` is used in browser scripts, launch instructions MUST NOT say "open file directly" (file:// causes CORS failures with ES modules)
   - If launch instructions say "open index.html", implementation MUST use classic `<script>` tags or inline scripts
2. **Quality coverage**: Phase 7 actually tested the declared launch mode (not just code inspection)
3. **Verification coverage**: Phase 8 verified features in the declared runtime context

If any check fails: create a bug task, fix the issue, re-run quality/verification, THEN proceed to Phase 9.

## Plan-Mode Semantics

When the user prefixes messages with `[[PLAN]]` or requests a "plan", "proposal", or "advisory":

- **Definition**: Plan mode means the orchestrator produces a plan document for user review — NO implementation occurs
- **Prohibited actions**: Launching @rlm-implement, modifying source code files, modifying test files, modifying configuration files
- **Allowed actions**: Creating/updating planning documents, spec documents, review documents, analysis documents in `RLM/` folders
- **Transition to execute**: Only when user explicitly says "start", "implement", "execute", "approved", or similar
- **Sub-agent constraint**: Any sub-agent launched during plan mode MUST be instructed that it is in `plan_only` mode and MUST NOT modify source code

## Enhancement vs New Project Decision Tree

When receiving a request that involves an existing project with completed pipeline phases:

```
Is this modifying behavior of an existing feature?
├── YES → Enhancement path
│   ├── 1. Load existing feature spec + design spec
│   ├── 2. Extract behavioral invariants
│   ├── 3. Route: Specs delta → Feature design delta → Tasks → Implement
│   └── 4. Each phase validates against original spec invariants
├── NO → Is this adding a new feature?
│   ├── YES → New feature path (Phases 3-8 for the new feature)
│   └── NO → Bugfix path (Tasks → Implement → Verify)
```

**NEVER** route behavioral changes through a single agent (e.g., calling @rlm-design directly to change rendering logic). Always use the full downstream pipeline path.
