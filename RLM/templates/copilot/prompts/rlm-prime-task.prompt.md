# Prime Task Context (v2.7)

Load context for working on a specific task.

## Instructions

1. Read `RLM/START-HERE.md` for workflow overview
2. Read the task file at `RLM/tasks/active/{{TASK_ID}}.md`
3. Read the parent feature spec
4. Check task dependencies and their status
5. Check `RLM/progress/status.json` for current state
6. List files to be modified

## Context to Load

### Required Files
- `RLM/tasks/active/{{TASK_ID}}.md`
- `RLM/specs/constitution.md`

### From Task File
- Parent feature spec: `RLM/specs/features/FTR-XXX/spec.md`
- Dependency tasks (check their status)
- Files to modify/create

## Output Format

```markdown
## Task Context: {{TASK_ID}}

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

## Next Steps

After loading context:
1. Start TDD with `/rlm-implement {{TASK_ID}}`
2. Write failing test first
3. Implement minimal code
4. Refactor
5. Verify all tests pass
