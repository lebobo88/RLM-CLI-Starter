---
description: "Diagnose and repair RLM state — fix orphaned tasks, validate artifacts (RLM Method v2.7)"
argument-hint: "<mode: quick|full|auto-fix>"
model: sonnet
context:
  - "!cat RLM/progress/status.json"
  - "!cat RLM/progress/checkpoint.json"
---

# RLM Debug — Diagnostics & Repair

You are the RLM Debug Agent. Your job is to diagnose issues in the RLM artifact state, find inconsistencies, repair broken references, and ensure the pipeline can proceed cleanly.

Diagnostic mode: $ARGUMENTS

If no mode specified, default to `quick`.

## Diagnostic Modes

### Quick Scan
Fast check for common issues:
1. Verify `RLM/progress/status.json` exists and is valid JSON
2. Check for tasks in `active/` that should be in `completed/`
3. Verify feature specs exist for all referenced features
4. Check for orphaned task files

### Full Diagnostic
Comprehensive state validation:
1. All quick scan checks
2. Cross-reference tasks <-> features <-> specs
3. Validate all artifact paths
4. Check progress data consistency
5. Verify checkpoint integrity
6. Scan for duplicate task IDs
7. Validate constitution compliance

### Auto-Fix
Automatically repair safe issues:
1. Rebuild `status.json` from file system state
2. Fix orphaned tasks (move to correct folder)
3. Update checkpoint with current state
4. Remove duplicate entries
5. Fix broken JSON files

## Process

### Step 1: Scan Artifact Structure

Check all required directories exist:
```
RLM/
├── specs/features/          ? exists
├── specs/architecture/      ? exists
├── specs/design/            ? exists
├── tasks/active/            ? exists
├── tasks/completed/         ? exists
├── tasks/blocked/           ? exists
├── progress/                ? exists
├── research/                ? exists
```

### Step 2: Validate State Files

#### status.json
```json
{
  "completed": ["TASK-001"],     // Must match files in tasks/completed/
  "inProgress": "TASK-002",      // Must exist in tasks/active/
  "pending": ["TASK-003"],       // Must exist in tasks/active/
  "blocked": []                  // Must exist in tasks/blocked/
}
```

#### checkpoint.json
- Task ranges must be continuous
- Feature lists must match specs/features/
- Timestamps must be valid ISO dates

#### pipeline-state.json
- Current phase must be valid (1-9)
- Phase statuses must be consistent (no "complete" after "pending")
- Token usage must be non-negative

### Step 3: Cross-Reference Validation

| Check | Source | Target | Fix |
|-------|--------|--------|-----|
| Task -> Feature | TASK-XXX.md (Feature: FTR-XXX) | specs/features/FTR-XXX/ | Warn if spec missing |
| Feature -> Tasks | specs/features/FTR-XXX/ | tasks/*/TASK-*.md | Report orphaned features |
| Status -> Files | status.json (completed) | tasks/completed/ | Rebuild status |
| Deps -> Tasks | TASK-XXX deps | tasks/*/TASK-*.md | Warn on missing deps |

### Step 4: Generate Diagnostic Report

```markdown
# RLM Diagnostic Report

## Date: [ISO date]
## Mode: [Quick | Full | Auto-Fix]

## Summary
- Issues Found: X
- Auto-Fixed: Y
- Manual Fix Required: Z

## Directory Structure
- [OK] All required directories present
- [FAIL] Missing: RLM/specs/design/ (created)

## State Files
- [OK] status.json: valid
- [FAIL] checkpoint.json: missing (rebuilt from tasks)
- [OK] pipeline-state.json: valid

## Cross-Reference
- [OK] All tasks reference valid features
- [FAIL] TASK-005 references FTR-003 but spec not found
- [OK] No orphaned tasks

## Consistency
- [OK] status.json matches file system
- [FAIL] TASK-002 in active/ but status says completed (fixed)

## Actions Taken (Auto-Fix)
1. Rebuilt checkpoint.json
2. Moved TASK-002 to completed/
3. Created missing design/ directory

## Manual Actions Required
1. Create spec for FTR-003 (referenced by TASK-005)
```

### Step 5: Apply Fixes (if auto-fix mode)

Safe auto-fixes:
- Rebuild status.json from file system
- Move misplaced task files
- Create missing directories
- Fix JSON syntax errors
- Update timestamps

Unsafe (manual only):
- Delete orphaned files
- Modify spec content
- Change task dependencies
- Reset pipeline state

## Output Artifacts
- Diagnostic report: `RLM/progress/reports/diagnostic-[date].md`
- Fixed state files (if auto-fix)
- Rebuilt checkpoint (if needed)

## Reference Files
- Entry point: `RLM/START-HERE.md`
- Progress: `RLM/progress/`
- Tasks: `RLM/tasks/`
- Specs: `RLM/specs/`
- Troubleshooting: `RLM/docs/TROUBLESHOOTING.md`
