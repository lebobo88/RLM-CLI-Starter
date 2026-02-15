---
# Task Metadata (YAML Frontmatter - Optional but recommended for v3.0+)
# This frontmatter enables advanced features: versioning, session hydration, atomic commits

# Version Control
version: 1  # Auto-incremented on updates (optimistic locking)
updated_at: null  # Auto-updated timestamp (ISO 8601)

# Reverse Dependencies (auto-calculated by DAG system)
blocks: []  # List of task IDs that this task blocks

# Context Storage (learning from failures/successes)
context_storage:
  attempted_approaches: []  # Failed approaches to avoid
  external_resources: []    # Documentation links used
  decisions: []             # Key decisions made during implementation

# Atomic Commit Tracking
commit_sha: null  # Populated on task completion by complete-task-atomic.ps1
completed_at: null  # Timestamp when task was completed (ISO 8601)
---

# Task: [Task Title]

## Task ID: TASK-XXX
## Feature: [FTR-XXX]
## Type: [architecture|implementation|testing|deployment|documentation]
## Status: [pending|active|blocked|completed]
## Assigned Agent: [agent-id]
## Priority: [Low|Medium|High|Critical]
## Estimated Effort: [X hours]

## Description
Clear description of what needs to be done.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Details
- **Framework:** [Framework name]
- **Language:** [Programming language]
- **Libraries:** [List of libraries]
- **Patterns:** [Design patterns to use]

## UI/UX Requirements (if applicable)
- **Has UI Component:** [yes|no]
- **Design Spec:** [Link to RLM/specs/design/components/[name].md or RLM/specs/features/FTR-XXX/design-spec.md]
- **Component States Required:**
  - [ ] Default
  - [ ] Hover
  - [ ] Focus (keyboard visible)
  - [ ] Active
  - [ ] Disabled
  - [ ] Loading
  - [ ] Error
  - [ ] Empty (if data-driven)
- **Design Tokens to Use:** [List tokens from RLM/specs/design/tokens/]
- **Accessibility Requirements:**
  - [ ] ARIA role: [role]
  - [ ] Keyboard navigation: [Tab, Enter, Escape, Arrow keys]
  - [ ] Screen reader: [aria-label, aria-describedby]
  - [ ] Focus management: [trap, restore]
- **Responsive Breakpoints:** [mobile, tablet, desktop, large]
- **Animation Tier:** [MINIMAL|MODERATE|RICH] (see project constitution)

## Dependencies
- [ ] TASK-XXX (Description) - [Status]
- [ ] External dependency - [Status]

## Module Integration Contract

### Exports (What This Task Produces)
**Public API**: Functions, classes, types exported via barrel file

```typescript
// Expected barrel file: src/path/to/module/index.ts
export { functionName } from './implementation';
export type { TypeName } from './types';
```

**Integration Points**:
- **Provider Role**: [Service this module provides]
- **API Surface**: [Function signatures for consumers]
- **Data Contracts**: [Interfaces crossing module boundaries]

### Imports (What This Task Consumes)
**Dependencies**: Modules this task imports

```typescript
import { externalFunction } from '@/lib/external-module';
import type { ExternalType } from '@/lib/external-module';
```

**Contracts Required**:
- Module: `@/lib/external-module`
- Exports needed: `externalFunction`, `ExternalType`
- Provider task: TASK-XXX (must be complete)

### Integration Validation
- [ ] All imports exist (barrel files present)
- [ ] All types exported by dependencies
- [ ] No circular dependencies
- [ ] Consumer tasks identified

## Test Requirements
- [ ] Unit tests for [component]
- [ ] Integration tests for [feature]
- [ ] Test [specific scenario]
- [ ] Verify [behavior]

## Files to Modify/Create
- `src/path/to/file1.ts` - [What to do]
- `src/path/to/file2.ts` - [What to do]
- `tests/file.test.ts` - [What to test]

## Implementation Notes
- Note 1
- Note 2
- Note 3

## Definition of Done
- [ ] Code implemented according to spec
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] No linter errors
- [ ] Performance validated
- [ ] Security checked
- [ ] **Design compliance (if UI task):**
  - [ ] All 8 component states implemented
  - [ ] Design tokens used (no hardcoded values)
  - [ ] Accessibility requirements met (keyboard, screen reader)
  - [ ] Responsive at all breakpoints
  - [ ] Animation follows project tier
  - [ ] Design QA checklist passed (≥90%)

---

## Runtime & Invariant Validation

### Additional Acceptance Criteria (Auto-Included)
- [ ] **Invariants compliance**: Implementation preserves all declared behavioral invariants from the parent feature spec
- [ ] **Runtime launch validation**: Feature works correctly in the declared execution context (file:// or http://localhost as specified in constitution/PRD)
- [ ] **Spec alignment**: Implementation matches the acceptance criteria of the parent feature spec — no contradictions introduced

