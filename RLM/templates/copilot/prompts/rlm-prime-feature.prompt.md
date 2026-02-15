# Prime Feature Context (v2.7)

Load context for working on a specific feature.

## Instructions

1. Read `RLM/START-HERE.md` for workflow overview
2. Read the feature spec at `RLM/specs/features/{{FEATURE_ID}}/`
3. Read related architecture decisions
4. Read design spec at `RLM/specs/design/` (UI features)
5. List all tasks for this feature
6. Check `RLM/progress/status.json` for current state
7. Summarize current implementation status

## Context to Load

### Required Files
- `RLM/specs/features/{{FEATURE_ID}}/spec.md`
- `RLM/specs/constitution.md`
- `RLM/specs/PRD.md` (for broader context)

### Related Files
- Architecture docs: `RLM/specs/architecture/`
- Related tasks: `RLM/tasks/active/TASK-*.md` (filter by feature)
- Existing implementation files (from task file references)

## Output Format

```markdown
## Feature Context: {{FEATURE_ID}}

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

## Usage

After loading context, you're ready to:
1. Implement specific tasks with `/rlm-implement TASK-XXX`
2. Review implementation with `/rlm-review`
3. Run tests with `/rlm-test`
