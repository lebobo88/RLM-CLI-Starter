# RLM Create Tasks Prompt

## Purpose
Break feature specifications into fine-grained, implementable tasks.

## Instructions for AI

You are the RLM Task Planner. Your job is to decompose features into small, focused tasks that can be implemented independently.

---

## Phase 0: Load Checkpoint (Incremental Detection)

Before creating tasks, check for existing work to avoid overwriting.

### Step 0.1: Read Checkpoint

Read `RLM/progress/checkpoint.json`:

```json
{
  "version": "1.0",
  "project_id": null,
  "checkpoints": [
    {
      "timestamp": "2024-12-09T10:00:00Z",
      "generation": 1,
      "features_added": ["FTR-001", "FTR-002"],
      "tasks_created": ["TASK-001", "TASK-002", "TASK-003"],
      "task_range": { "start": 1, "end": 3 }
    }
  ],
  "current_generation": 1,
  "all_features": ["FTR-001", "FTR-002"],
  "all_tasks": ["TASK-001", "TASK-002", "TASK-003"],
  "last_updated": "2024-12-09T10:00:00Z"
}
```

### Step 0.2: Scan Existing Tasks

Scan `RLM/tasks/active/` and `RLM/tasks/completed/` for existing task files:

```
Existing Tasks Found:
- RLM/tasks/active/TASK-001.md → FTR-001
- RLM/tasks/active/TASK-002.md → FTR-001
- RLM/tasks/completed/TASK-003.md → FTR-001
```

### Step 0.3: Compare Features

Compare features in `RLM/specs/features/*/spec.md` with `all_features` in checkpoint:

| Feature | In Checkpoint | In Specs | Action |
|---------|---------------|----------|--------|
| FTR-001 | ✓ | ✓ | Skip (already has tasks) |
| FTR-002 | ✓ | ✓ | Skip (already has tasks) |
| FTR-003 | ✗ | ✓ | **CREATE NEW TASKS** |
| FTR-004 | ✗ | ✓ | **CREATE NEW TASKS** |

### Step 0.4: Report Detection Results

```
## Incremental Task Detection

### Existing Work Found:
- Generation: 1
- Features with tasks: FTR-001, FTR-002
- Existing tasks: TASK-001 through TASK-003

### New Features Detected:
- FTR-003: [Feature Name] (needs tasks)
- FTR-004: [Feature Name] (needs tasks)

### Action Plan:
- Will create tasks for: FTR-003, FTR-004
- Will NOT overwrite: FTR-001, FTR-002 tasks
- Next task ID: TASK-004
- New generation: 2
```

### Step 0.5: Determine Next IDs

Calculate the next available task ID:
- If checkpoint exists: `max(all_tasks) + 1`
- If no checkpoint: Start at TASK-001

```
Next available ID: TASK-004
Generation for new tasks: 2
```

### Step 0.6: User Confirmation

Ask the user:
> "I found existing tasks (generation 1) for FTR-001, FTR-002.
>
> I will create NEW tasks for: FTR-003, FTR-004
> Starting at: TASK-004
>
> Options:
> 1. **Proceed** - Create tasks for new features only (recommended)
> 2. **Regenerate all** - Delete all tasks and start fresh (WARNING: destructive)
> 3. **Cancel** - Exit without changes
>
> Choose an option (1/2/3):"

If user chooses "Regenerate all":
- Warn: "This will delete all existing tasks. Are you sure? (yes/no)"
- If confirmed, reset checkpoint and delete task files
- Start task numbering from TASK-001

---

## Phase 0.7: Library Documentation for Implementation

Before creating tasks, ensure documentation is cached for all libraries needed during implementation.

### Step 0.7.1: Scan Feature Specs for Libraries

For each feature spec in `RLM/specs/features/*/spec.md`, extract:
- **Technical Design** section → Libraries/packages mentioned
- **API Endpoints** section → Integration patterns needed
- **Data Model** section → ORM/database libraries
- **UI Components** section → UI framework/component libraries

### Step 0.7.2: Check Documentation Cache

```markdown
Read RLM/research/docs/index.json

For each library detected:
  If cached AND not expired:
    libraries_ready.append(library)
  Else:
    libraries_to_fetch.append(library)
```

### Step 0.7.3: Fetch Missing Documentation

If libraries_to_fetch is not empty:

```markdown
Delegate to Research Sub-Agent:

Task: Library Documentation for Implementation
Libraries: [list]
Context: Task creation phase - need API details for task specifications

Topics needed:
- Core API methods that will be used
- Common patterns and best practices
- Error handling approaches
- Testing patterns

Output:
- Cache to RLM/research/docs/[library]/
- Return API summaries
```

### Step 0.7.4: Include Doc References in Tasks

When creating task files, include documentation references:

```markdown
## Documentation References

For implementation guidance, see:
- Prisma Queries: RLM/research/docs/prisma/queries.md
- React Hooks: RLM/research/docs/react/hooks.md
- Stripe Webhooks: RLM/research/docs/stripe/webhooks.md
```

This helps the implementation phase immediately locate relevant documentation.

### Step 0.7.5: Report Documentation Status

```
┌─────────────────────────────────────────────────────────────────┐
│ Implementation Documentation Ready                               │
├─────────────────────────────────────────────────────────────────┤
│ Libraries detected from feature specs:                           │
│                                                                 │
│ ✓ Prisma 5.x - Cached (schema, queries, transactions)           │
│ ✓ React 19.x - Cached (hooks, server-components)                │
│ ✓ Stripe - Fetched (checkout, webhooks)                         │
│ ○ Zod - Skipped (validation library, low priority)              │
│                                                                 │
│ Documentation references will be included in task files.         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Load Specifications

Read these files:
1. `RLM/specs/constitution.md` - Project standards
2. `RLM/specs/epics/breakdown.md` - Implementation order
3. `RLM/specs/features/*/spec.md` - All feature specifications

If files are missing, inform the user:
> "Missing specification files. Please run:
> - Use `@rlm-discover` agent to generate PRD (if no PRD exists)
> - Use `@rlm-specs` agent to generate specifications (if PRD exists but specs don't)"

---

## Phase 2: Task Breakdown Principles

### Granularity Guidelines
Each task should:
- Take **1-2 hours** to complete (prefer smaller tasks)
- Have a **single responsibility**
- Be **independently testable**
- Have **clear acceptance criteria**
- Produce a **working increment** (even if small)

### Runtime Contract Enforcement (Required)
Tasks MUST respect the Runtime Contract in `RLM/specs/constitution.md`.

Persona lenses are **style-only**: tasks MUST NOT change functional acceptance criteria or Runtime Contract invariants.

If the Runtime Contract test command uses Node's built-in runner (`node --test`):
- Prefer invariant/smoke tests named `*.test.cjs` (immune to `package.json` `type: module`).
- Create an early task to scaffold invariant tests (e.g., `src/__tests__/invariants.test.cjs`) that enforce the non-negotiable invariants and launch-mode constraints.

### Minimum Task Counts by Complexity
Ensure sufficient task granularity:

| Project Complexity | Minimum Tasks |
|-------------------|---------------|
| Simple (CLI tool, utility) | 2+ tasks |
| Medium (library, package) | 3+ tasks |
| Complex (API + database, monorepo) | 4+ tasks |
| Complex + UI (dashboard, full-stack) | 4+ tasks |

For API projects, split CRUD endpoints into separate tasks. For monorepos, create at least one task per package. If the feature has multiple endpoints, models, or services, each should be its own task.

### Bad Task Examples (Too Large)
- "Implement user authentication" (contains multiple concerns)
- "Build the dashboard" (too vague, too big)
- "Add API endpoints" (which ones? all at once?)

### Good Task Examples (Right Size)
- "Create User data model and database migration"
- "Implement password hashing utility function"
- "Create POST /api/v1/users/register endpoint"
- "Add input validation for user registration"
- "Write unit tests for password hashing utility"

---

## Phase 3: Create Tasks for Each Feature

For each feature in `RLM/specs/features/*/spec.md`, create tasks following this pattern:

### Task Breakdown Pattern

**For a typical API feature, break down into:**

1. **Data Model Tasks**
   - Create data model/interface
   - Create database migration
   - Create seed data (if needed)

2. **Utility/Service Tasks**
   - Implement business logic functions
   - Implement validation functions
   - Implement helper utilities

3. **API Endpoint Tasks** (one per endpoint)
   - Create POST endpoint
   - Create GET (list) endpoint
   - Create GET (single) endpoint
   - Create PUT/PATCH endpoint
   - Create DELETE endpoint

4. **Integration Tasks**
   - Add authentication middleware
   - Add authorization checks
   - Add rate limiting
   - Add caching

5. **Testing Tasks**
   - Write unit tests for utilities
   - Write unit tests for services
   - Write integration tests for endpoints
   - Write E2E tests for user flows

6. **Documentation Tasks** (if needed)
   - Update API documentation
   - Add inline code documentation

### Example: User Authentication Feature

```
TASK-001: Create User data model and TypeScript interface
TASK-002: Create database migration for users table
TASK-003: Implement password hashing utility (bcrypt)
TASK-004: Write unit tests for password hashing utility
TASK-005: Create POST /api/v1/auth/register endpoint
TASK-006: Add input validation for registration endpoint
TASK-007: Write integration tests for registration endpoint
TASK-008: Create POST /api/v1/auth/login endpoint
TASK-009: Implement JWT token generation utility
TASK-010: Write unit tests for JWT utility
TASK-011: Add input validation for login endpoint
TASK-012: Write integration tests for login endpoint
TASK-013: Create POST /api/v1/auth/logout endpoint
TASK-014: Implement token blacklist/invalidation
TASK-015: Create POST /api/v1/auth/refresh endpoint
TASK-016: Create POST /api/v1/auth/forgot-password endpoint
TASK-017: Implement password reset token generation
TASK-018: Create POST /api/v1/auth/reset-password endpoint
TASK-019: Add rate limiting to auth endpoints
TASK-020: Create authentication middleware
TASK-021: Write E2E tests for complete auth flow
```

---

## Phase 3.5: Generate Integration Wiring Tasks

After creating implementation tasks, analyze cross-module dependencies and generate wiring tasks.

### Step 3.5.1: Build Dependency Graph

Scan all created tasks and extract Module Integration Contracts:

```markdown
For each TASK-XXX in newly created tasks:
  Read "Module Integration Contract" section
  Extract:
    - Exports: What this task produces
    - Imports: What this task consumes
  Build graph:
    TASK-052 exports → { spawnBackgroundAgent }
    TASK-049 imports → { spawnBackgroundAgent } from TASK-052
```

### Step 3.5.2: Identify Integration Gaps

Find producer-consumer pairs WITHOUT explicit wiring:

```
TASK-052 (provider) → exports spawnBackgroundAgent
TASK-049 (consumer) → imports spawnBackgroundAgent
GAP: No task explicitly validates contract and wires them
```

### Step 3.5.3: Generate Wiring Tasks

Create `TASK-XXX-WIRE-[FROM]-to-[TO].md` for each producer-consumer pair:

```markdown
# TASK-XXX-WIRE-052-to-049: Wire SpawnAgent to Terminal

## Metadata
- **Feature**: FTR-049 (consumer's feature)
- **Type**: integration
- **Priority**: high
- **Dependencies**: TASK-052, TASK-049
- **Estimated Effort**: 1 hour
- **Generation**: [Number] (same as related tasks)

## Description
Wire SpawnAgent API (TASK-052) to Terminal Manager (TASK-049):
1. Verify TASK-052 exports in barrel file
2. Verify TASK-049 imports from correct path
3. Validate type contracts match
4. Add integration contract test

## Acceptance Criteria
- [ ] Barrel file exports validated
- [ ] Import paths correct
- [ ] Type contracts match
- [ ] Contract test passes
- [ ] Integration test passes (no mocks)

## Module Integration Contract

### Provider (TASK-052)
```typescript
export async function spawnBackgroundAgent(
  config: AgentConfig
): Promise<AgentHandle>;
```

### Consumer (TASK-049)
```typescript
import { spawnBackgroundAgent } from '@/lib/agents';
```

### Contract Validation
- Input: AgentConfig shape matches
- Output: AgentHandle shape matches
- Status: COMPATIBLE

## Technical Details

### Files to Create/Modify
- `src/lib/agents/index.ts` - Verify export present
- `src/lib/agents/__tests__/spawn-agent.contract.test.ts` - Contract test
- `src/__tests__/integration/agent-terminal.test.ts` - Integration test

### Implementation Notes
1. Verify barrel file exports match expected contract
2. Create contract schema (using zod or similar)
3. Write provider contract test
4. Write integration test without mocks
5. Run circular dependency check

### Testing Requirements
- [ ] Contract test validates input/output schemas
- [ ] Integration test calls real implementation (no mocks)
- [ ] TypeScript compiles without errors
- [ ] No circular dependencies

## Definition of Done
- [ ] Barrel file exports validated
- [ ] Contract test written and passing
- [ ] Integration test written and passing
- [ ] No circular dependencies (`madge --circular src`)
- [ ] TypeScript compiles
- [ ] Code follows project constitution
```

### Step 3.5.4: Insert into Task Sequence

Place wiring tasks in the correct position:
- AFTER both provider and consumer implementation
- BEFORE consumer's E2E tests

**Example sequence**:
```
TASK-052: Implement SpawnAgent
TASK-052-TEST: Unit test SpawnAgent
TASK-049: Implement Terminal Manager
TASK-049-TEST: Unit test Terminal Manager
TASK-XXX-WIRE-052-to-049: Wire together ← NEW
TASK-049-E2E: E2E test Terminal Manager
```

### Step 3.5.5: Report Wiring Tasks

```markdown
┌───────────────────────────────────────────────┐
│ Integration Wiring Tasks Generated             │
├───────────────────────────────────────────────┤
│ Total: 8 wiring tasks created                  │
│                                               │
│ • TASK-XXX-WIRE-052-to-049: Agent→Terminal    │
│ • TASK-YYY-WIRE-015-to-022: Auth→Settings     │
│ • TASK-ZZZ-WIRE-031-to-045: DB→API            │
│ • TASK-AAA-WIRE-033-to-051: Router→Metrics    │
│                                               │
│ These run after implementation, before E2E.   │
└───────────────────────────────────────────────┘
```

---

## Phase 4: Task Template

**Output Location**: `RLM/tasks/active/TASK-XXX.md`

Use this format for each task:

```markdown
# TASK-XXX: [Task Title]

## Metadata
- **Feature**: FTR-XXX ([Feature Name])
- **Type**: implementation | testing | documentation | infrastructure
- **Priority**: critical | high | medium | low
- **Estimated Effort**: 1-2 hours | 2-4 hours | 4+ hours
- **Dependencies**: TASK-YYY, TASK-ZZZ (or "None")
- **Generation**: [Number] (from checkpoint, tracks incremental additions)

## Description
[Clear, concise description of what needs to be done]

## Acceptance Criteria
- [ ] [Specific, measurable criterion 1]
- [ ] [Specific, measurable criterion 2]
- [ ] [Specific, measurable criterion 3]

## Technical Details

### Files to Create/Modify
- `src/path/to/file.ts` - [What to do]
- `src/path/to/another.ts` - [What to do]

### Implementation Notes
[Any specific guidance for implementation]

### Testing Requirements
- [ ] Unit test: [What to test]
- [ ] Integration test: [What to test] (if applicable)

## Definition of Done
- [ ] Code implemented
- [ ] Tests written and passing
- [ ] Code follows project constitution
- [ ] No linting errors
- [ ] Self-reviewed
```

---

## Phase 5: Create All Tasks

Create task files for ALL features in the order specified in `RLM/specs/epics/breakdown.md`.

Number tasks sequentially: TASK-001, TASK-002, etc.

Group related tasks together by feature.

---

## Phase 6: Create Task Index

**Output**: `RLM/tasks/INDEX.md`

```markdown
# Task Index

## Overview
- **Total Tasks**: [Count]
- **By Priority**: Critical: [X], High: [Y], Medium: [Z], Low: [W]
- **By Feature**: [Summary]

## Tasks by Feature

### FTR-001: [Feature Name]
| Task | Title | Priority | Effort | Dependencies |
|------|-------|----------|--------|--------------|
| TASK-001 | [Title] | High | 2h | None |
| TASK-002 | [Title] | High | 1h | TASK-001 |

### FTR-002: [Feature Name]
[Same format]

## Implementation Order

Based on dependencies, implement in this order:

### Phase 1: Foundation
1. TASK-001 - [Title]
2. TASK-002 - [Title]

### Phase 2: Core
3. TASK-003 - [Title]
4. TASK-004 - [Title]

[Continue for all tasks]

## Dependency Graph

```
TASK-001 (User Model)
    │
    ├──▶ TASK-003 (Registration Endpoint)
    │        │
    │        └──▶ TASK-007 (Registration Tests)
    │
    └──▶ TASK-005 (Login Endpoint)
             │
             └──▶ TASK-012 (Login Tests)
```
```

---

## Phase 7: Summary and Next Steps

```
## Tasks Created!

### Summary:
- Total Tasks: [X]
- Critical Priority: [X]
- High Priority: [X]
- Medium Priority: [X]
- Low Priority: [X]

### Tasks by Feature:
- FTR-001 ([Name]): [X] tasks
- FTR-002 ([Name]): [X] tasks
[Continue...]

### Recommended Starting Point:
TASK-001: [Title]
- Reason: [Why this task first]
- No dependencies, foundational for other tasks

### Next Steps:
1. Review tasks at RLM/tasks/active/
2. Review task index at RLM/tasks/INDEX.md
3. Start implementation: Use `@rlm-implement` agent or read RLM/prompts/04-IMPLEMENT-TASK.md

### Notes:
- Tasks are ordered by dependency
- Complete tasks with no dependencies first
- Testing tasks should follow their implementation tasks
```

---

## Progress Tracking

Update `RLM/progress/status.json`:

```json
{
  "lastUpdate": "[timestamp]",
  "phase": "tasks_created",
  "totalTasks": [count],
  "tasks": {
    "TASK-001": { "status": "pending" },
    "TASK-002": { "status": "pending" }
  },
  "nextStep": "implement"
}
```

---

## Phase 8: Update Checkpoint

After all tasks are created, update `RLM/progress/checkpoint.json`:

### Step 8.1: Create Checkpoint Entry

Add a new checkpoint entry for this generation:

```json
{
  "timestamp": "[ISO-8601 timestamp]",
  "generation": [new_generation_number],
  "features_added": ["FTR-003", "FTR-004"],
  "tasks_created": ["TASK-004", "TASK-005", "TASK-006", "TASK-007"],
  "task_range": { "start": 4, "end": 7 }
}
```

### Step 8.2: Update Checkpoint File

Update the full `RLM/progress/checkpoint.json`:

```json
{
  "version": "1.0",
  "project_id": "[project_name]",
  "description": "Tracks feature and task creation checkpoints",
  "checkpoints": [
    { /* previous checkpoint entries */ },
    {
      "timestamp": "2024-12-09T14:00:00Z",
      "generation": 2,
      "features_added": ["FTR-003", "FTR-004"],
      "tasks_created": ["TASK-004", "TASK-005", "TASK-006", "TASK-007"],
      "task_range": { "start": 4, "end": 7 }
    }
  ],
  "current_generation": 2,
  "all_features": ["FTR-001", "FTR-002", "FTR-003", "FTR-004"],
  "all_tasks": ["TASK-001", "TASK-002", "TASK-003", "TASK-004", "TASK-005", "TASK-006", "TASK-007"],
  "last_updated": "2024-12-09T14:00:00Z"
}
```

### Step 8.3: Log Checkpoint Update

Report checkpoint creation:

```
## Checkpoint Updated

### Generation 2 Created:
- Features added: FTR-003, FTR-004
- Tasks created: TASK-004 through TASK-007 (4 tasks)
- Total tasks in project: 7
- Total features: 4

### Checkpoint History:
| Gen | Date | Features | Tasks |
|-----|------|----------|-------|
| 1 | 2024-12-09 | FTR-001, FTR-002 | TASK-001 - TASK-003 |
| 2 | 2024-12-09 | FTR-003, FTR-004 | TASK-004 - TASK-007 |

Next incremental run will start at: TASK-008
```

---

## Notes for AI

- Every task must have clear acceptance criteria
- Test tasks should directly follow their implementation tasks
- Consider parallelization - tasks without dependencies can run in parallel
- Be specific about files to create/modify
- Include estimated effort to help with planning
- Mark critical path tasks clearly
- Group related tasks logically
- **Always check checkpoint before creating tasks** (Phase 0)
- **Never overwrite existing tasks** unless user explicitly confirms regeneration
- **Update checkpoint after task creation** (Phase 8) to track generations
- Include generation number in each task's metadata
