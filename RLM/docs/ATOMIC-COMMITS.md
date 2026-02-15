# Atomic Commit Protocol

## Overview

The RLM Atomic Commit Protocol ensures that each task completion is tied to exactly one git commit with a structured commit message and tracked SHA. This provides clear version history, enables precise rollback capabilities, and maintains strong traceability between tasks and code changes.

## Principles

1. **One Task = One Commit**: Each task completion generates exactly one commit
2. **Structured Messages**: Commit messages follow a standardized format
3. **SHA Tracking**: Every task stores its commit SHA in frontmatter
4. **Atomic Operations**: Task completion is all-or-nothing (manifest → commit → move)
5. **Audit Trail**: Complete traceability from task to specific code changes

## Commit Message Template

### Standard Format

```
<type>(<scope>): <description>

<detailed explanation>

Task: TASK-XXX
Feature: FTR-YYY
Files Changed: N
Manifest: RLM/progress/manifests/TASK-XXX-HHMMSS.json

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Components

#### Type
Indicates the nature of the change:

- `feat`: New feature implementation
- `fix`: Bug fix
- `refactor`: Code restructuring without behavior change
- `test`: Adding or modifying tests
- `docs`: Documentation changes
- `style`: Code style/formatting changes
- `perf`: Performance improvements
- `chore`: Build process, tooling, dependencies

#### Scope
The affected area of the codebase:

- Component name: `auth`, `dashboard`, `api`
- Module name: `user-service`, `payment-gateway`
- Feature ID: `FTR-001`, `FTR-002`

#### Description
Short (50 characters or less) summary of the change in imperative mood:

✅ Good: "Add user authentication endpoint"
✅ Good: "Fix memory leak in data processing"
❌ Bad: "Added authentication" (past tense)
❌ Bad: "Fixed bug" (not specific)

#### Detailed Explanation
Optional multi-line explanation providing:

- Why the change was made
- What problem it solves
- Any important implementation details
- Breaking changes or migration notes

#### Metadata
Required fields automatically populated by `complete-task-atomic.ps1`:

- **Task**: The task ID (TASK-XXX)
- **Feature**: The feature ID (FTR-YYY) from task metadata
- **Files Changed**: Count of modified files
- **Manifest**: Path to the completion manifest
- **Co-Authored-By**: Standard attribution line

## Usage

### Via Script

```powershell
# Complete task with atomic commit
.\RLM\scripts\complete-task-atomic.ps1 `
    -TaskId "TASK-045" `
    -CommitMessage "feat(auth): Implement JWT token validation"

# Dry run (preview without committing)
.\RLM\scripts\complete-task-atomic.ps1 `
    -TaskId "TASK-045" `
    -CommitMessage "feat(auth): Implement JWT token validation" `
    -DryRun
```

### Script Workflow

The `complete-task-atomic.ps1` script follows this atomic workflow:

1. **Verify Task State**
   - Check task file exists in `RLM/tasks/active/`
   - Validate status is `in_progress` or `active`

2. **Create Manifest**
   - Generate completion manifest at `RLM/progress/manifests/TASK-XXX-HHMMSS.json`
   - Include task metadata, timestamp, modified files

3. **Stage Files**
   - Run `git add .` to stage all changes
   - Include manifest file in staged changes

4. **Create Commit**
   - Generate structured commit message from template
   - Create commit with `git commit -m <message>`
   - Capture commit SHA with `git rev-parse HEAD`

5. **Update Task Metadata**
   - Write commit SHA to task frontmatter (`commit_sha` field)
   - Set `completed_at` timestamp
   - Stage updated task file

6. **Amend Commit**
   - Amend commit to include task metadata update
   - Preserve original commit message

7. **Move Task**
   - Move task from `RLM/tasks/active/` to `RLM/tasks/completed/`

### Error Handling

The script uses `$ErrorActionPreference = "Stop"` to fail fast on any error:

- **Task Not Found**: Exit code 1, no changes made
- **Git Stage Failed**: Exit code 1, no commit created
- **Git Commit Failed**: Exit code 1, rollback staging
- **SHA Retrieval Failed**: Exit code 1, commit remains but task not moved

All operations before commit are idempotent and can be safely retried.

## Task Metadata Integration

### YAML Frontmatter

Tasks track their commit SHA in YAML frontmatter:

```yaml
---
task_id: TASK-045
feature: FTR-003
status: completed
assignee: coder
commit_sha: abc123def456  # Populated by complete-task-atomic.ps1
completed_at: 2024-01-15T14:30:00Z
version: 2
---
```

### Querying Commits by Task

```powershell
# Get commit SHA for a task
$taskFile = "RLM/tasks/completed/TASK-045.md"
$content = Get-Content $taskFile -Raw
if ($content -match 'commit_sha:\s*(\w+)') {
    $sha = $matches[1]
    git show $sha
}
```

### Rollback by Task

```powershell
# Revert changes from a specific task
$taskFile = "RLM/tasks/completed/TASK-045.md"
$content = Get-Content $taskFile -Raw
if ($content -match 'commit_sha:\s*(\w+)') {
    $sha = $matches[1]
    git revert $sha
}
```

## Examples

### Feature Implementation

```
feat(dashboard): Add real-time activity feed component

Implements WebSocket-based live updates for user activities.
Includes automatic reconnection logic and offline queue.

Task: TASK-045
Feature: FTR-003
Files Changed: 8
Manifest: RLM/progress/manifests/TASK-045-143022.json

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Bug Fix

```
fix(api): Resolve race condition in session cleanup

Adds mutex lock to prevent concurrent cleanup operations
from corrupting session state.

Fixes issue where rapid logout/login sequences caused
session ID conflicts.

Task: TASK-047
Feature: FTR-001
Files Changed: 3
Manifest: RLM/progress/manifests/TASK-047-151130.json

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Refactoring

```
refactor(auth): Extract token validation to separate module

Improves testability and reusability of JWT validation logic.
No functional changes to API behavior.

Task: TASK-050
Feature: FTR-001
Files Changed: 5
Manifest: RLM/progress/manifests/TASK-050-162245.json

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Testing

```
test(payment): Add integration tests for Stripe webhooks

Covers success cases, failure scenarios, and idempotency
validation for webhook event processing.

Achieves 95% coverage for payment gateway module.

Task: TASK-052
Feature: FTR-005
Files Changed: 2
Manifest: RLM/progress/manifests/TASK-052-174812.json

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

## Integration with Workflow

### Manual Workflow

1. Agent completes task implementation
2. Agent writes completion manifest manually
3. Agent calls `complete-task-atomic.ps1` with appropriate commit message
4. Task automatically moved to completed, commit created

### Automated Workflow (Coder Agent)

The Coder agent can automatically trigger atomic commits:

```yaml
# In .github/agents/rlm-implement.agent.md
completion_protocol:
  atomic_commit: true
  commit_message_format: "<type>(<scope>): <description>"
  post_completion_script: "RLM/scripts/complete-task-atomic.ps1"
```

When `atomic_commit: true`, the agent:
1. Completes implementation
2. Runs tests
3. Writes manifest
4. Generates commit message from task metadata
5. Calls `complete-task-atomic.ps1`

## Benefits

### Clear Version History

Each commit maps to exactly one task, making git log readable:

```
abc123d feat(dashboard): Add activity feed component [TASK-045]
def456a fix(api): Resolve session cleanup race [TASK-047]
789ghi0 refactor(auth): Extract token validation [TASK-050]
```

### Precise Rollback

Revert specific tasks without affecting unrelated changes:

```powershell
# Rollback TASK-045 only
git revert abc123d
```

### Audit Trail

Track exactly which code changes implement each feature:

```powershell
# Find all commits for FTR-003
git log --grep="Feature: FTR-003"
```

### Task-Commit Bidirectionality

Navigate from task to code or code to task:

- **Task → Code**: Read `commit_sha` from task frontmatter
- **Code → Task**: Parse `Task: TASK-XXX` from commit message

### Automated Metrics

Generate project metrics from git history:

```powershell
# Count tasks completed by feature
git log --format="%s" | Select-String "Feature: FTR-003" | Measure-Object

# Average files changed per task
git log --format="%b" | Select-String "Files Changed: (\d+)" |
    ForEach-Object { $matches[1] } | Measure-Object -Average
```

## Best Practices

### 1. Use Imperative Mood

✅ "Add feature" not "Added feature"
✅ "Fix bug" not "Fixes bug"

### 2. Be Specific

✅ "Fix memory leak in user session cleanup"
❌ "Fix bug"

### 3. Include Context

For complex changes, explain WHY in the detailed section:

```
refactor(auth): Replace bcrypt with Argon2

Argon2 provides better protection against GPU-based
brute force attacks and is OWASP recommended.

Migration script included to rehash existing passwords
on next login.
```

### 4. Reference Issues

If task relates to external issues:

```
fix(api): Resolve database connection pool exhaustion

Related to GitHub issue #127

Task: TASK-049
Feature: FTR-002
```

### 5. Breaking Changes

Highlight breaking changes prominently:

```
feat(api): Migrate to v2 authentication endpoints

BREAKING CHANGE: v1 /auth/login endpoint removed.
Clients must migrate to /v2/auth/login.

Migration guide: docs/migration-v1-to-v2.md

Task: TASK-055
Feature: FTR-001
```

## Troubleshooting

### Commit Failed: Merge Conflict

If commit fails due to conflicts:

1. Resolve conflicts manually
2. Stage resolved files: `git add .`
3. Re-run `complete-task-atomic.ps1` with same task ID

### Task Already Completed

If task was moved to completed/ without commit:

1. Move task back to active/: `Move-Item RLM/tasks/completed/TASK-XXX.md RLM/tasks/active/`
2. Set status to `in_progress` in frontmatter
3. Re-run `complete-task-atomic.ps1`

### Missing Commit SHA

If task completed but SHA not recorded:

1. Find commit by message: `git log --grep="Task: TASK-XXX"`
2. Manually update task frontmatter with SHA
3. Move task to completed/

## Configuration

### Workspace Root

By default, script assumes workspace root is current directory. Override:

```powershell
complete-task-atomic.ps1 `
    -TaskId "TASK-045" `
    -CommitMessage "feat(auth): Add JWT validation" `
    -WorkspaceRoot "C:\Projects\MyApp"
```

### Commit Message Customization

For project-specific conventions, modify the template in:

`RLM/scripts/complete-task-atomic.ps1` (lines 155-165)

### Hook Integration

Add post-completion hooks to `.github/hooks/`:

```json
{
  "postTaskCompletion": {
    "script": "RLM/scripts/post-completion-notify.ps1",
    "description": "Send completion notification"
  }
}
```

## Version History

- **v1.0.0** (2024-01-15): Initial atomic commit protocol
  - Core script implementation
  - YAML frontmatter integration
  - Commit message template

## Related Documents

- [VALIDATION-HOOKS.md](VALIDATION-HOOKS.md) - Hook-based validation protocols
- [TASK-ORCHESTRATION.md](TASK-ORCHESTRATION.md) - DAG-based task dependencies

## Future Enhancements

### Planned Features

1. **Commit Hooks**: Pre-commit validation of tests, linting
2. **Squash Support**: Option to squash multiple sub-task commits
3. **GPG Signing**: Automatic commit signing for verified commits
4. **Changelog Generation**: Auto-generate CHANGELOG.md from commits
5. **Semantic Versioning**: Auto-bump version based on commit types

### Research Integration

This protocol implements patterns from "Advanced Engineering Frameworks for Autonomous Development":

- ✅ Atomic task-commit binding (Section 3.2)
- ✅ Structured metadata storage (Section 2.1)
- ✅ Version control integration (Section 4.3)
- ✅ Audit trail preservation (Section 5.1)
