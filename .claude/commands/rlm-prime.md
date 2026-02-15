---
description: "Pre-load feature or task context into the conversation (RLM Method v2.7)"
argument-hint: "<FTR-XXX or TASK-XXX>"
---

# RLM Prime — Context Priming

Pre-load context for a specific feature or task into the conversation so you're ready to work on it.

Target to prime: $ARGUMENTS

Detect the type from the ID prefix:
- `FTR-XXX` → Load feature context (see Feature Priming below)
- `TASK-XXX` → Load task context (see Task Priming below)

---

## Feature Priming

### Instructions

1. Read `RLM/START-HERE.md` for workflow overview
2. Read the feature spec at `RLM/specs/features/FTR-XXX/`
3. Read related architecture decisions
4. Read design spec at `RLM/specs/design/` (UI features)
5. List all tasks for this feature
6. Check `RLM/progress/status.json` for current state
7. Summarize current implementation status

### Context to Load

#### Required Files
- `RLM/specs/features/FTR-XXX/specification.md`
- `RLM/specs/constitution.md`
- `RLM/specs/PRD.md` (for broader context)

#### Related Files
- Architecture docs: `RLM/specs/architecture/`
- Related tasks: `RLM/tasks/active/TASK-*.md` (filter by feature)
- Existing implementation files (from task file references)

### Output Format

```markdown
## Feature Context: FTR-XXX

### Feature Overview
[Summary from spec]

### Status
- **Spec Status:** [Draft | Ready | In Progress | Complete]
- **Tasks Total:** X
- **Tasks Completed:** Y
- **Tasks In Progress:** Z
- **Tasks Pending:** W

### Related Tasks
| Task ID | Title | Status | Dependencies |
|---------|-------|--------|--------------|
| TASK-001 | ... | pending | None |
| TASK-002 | ... | pending | TASK-001 |

### Key Technical Decisions
[From architecture docs]

### Files to Modify
[List from task files]

### Dependencies
- External: [APIs, services]
- Internal: [Other features]

### Testing Requirements
[From spec]

### Ready to Work On
- [ ] Spec is complete
- [ ] Dependencies available
- [ ] Technical approach clear
- [ ] Test strategy defined
```

### After Loading Context
You're ready to:
1. Implement specific tasks with `/rlm-implement TASK-XXX`
2. Review implementation with `/rlm-quality`
3. Verify the feature with `/rlm-verify FTR-XXX`

---

## Task Priming

### Instructions

1. Read `RLM/START-HERE.md` for workflow overview
2. Read the task file at `RLM/tasks/active/TASK-XXX.md`
3. Read the parent feature spec
4. Check task dependencies and their status
5. Check `RLM/progress/status.json` for current state
6. List files to be modified

### Context to Load

#### Required Files
- `RLM/tasks/active/TASK-XXX.md`
- `RLM/specs/constitution.md`

#### From Task File
- Parent feature spec: `RLM/specs/features/FTR-XXX/specification.md`
- Dependency tasks (check their status)
- Files to modify/create

### Output Format

```markdown
## Task Context: TASK-XXX

### Task Overview
**Title:** [Task title]
**Feature:** FTR-XXX
**Type:** [implementation | testing | etc.]
**Priority:** [High | Medium | Low]
**Estimated Effort:** X hours

### Description
[From task file]

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Dependencies
| Task | Title | Status | Blocking? |
|------|-------|--------|-----------|
| TASK-YYY | ... | complete | No |

### Files to Work On
| File | Action | Purpose |
|------|--------|---------|
| `src/file1.ts` | Create | [What it does] |
| `src/file2.ts` | Modify | [What to change] |
| `tests/file.test.ts` | Create | [What to test] |

### Technical Details
- **Framework:** [From task]
- **Patterns:** [From task]
- **Libraries:** [From task]

### Test Requirements
- [ ] Unit tests: [What to test]
- [ ] Integration tests: [What to test]

### Definition of Done
[From task file]

### Ready to Implement?
- [ ] All dependencies complete
- [ ] Spec is clear
- [ ] Files identified
- [ ] Test approach defined
```

### After Loading Context
You're ready to:
1. Start TDD with `/rlm-implement TASK-XXX`
2. Write failing test first
3. Implement minimal code
4. Refactor
5. Verify all tests pass
