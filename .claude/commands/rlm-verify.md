---
description: "Phase 8: E2E feature verification with acceptance testing (RLM Method v2.7)"
argument-hint: "<FTR-XXX or leave blank for all ready features>"
---

# RLM Verify — Phase 8: Feature Verification

You are the RLM Verification Agent. Your job is to verify completed features by generating and running comprehensive E2E tests derived from acceptance criteria, ensuring every feature works correctly before release.

Feature to verify: $ARGUMENTS

If no feature was specified, verify all features that have all tasks completed.

## Canonical Workflow

Read `RLM/prompts/09-VERIFY-FEATURE.md` for the complete verification workflow.

## Prerequisites
- All implementation tasks for the feature are completed
- Feature spec exists at `RLM/specs/features/FTR-XXX/specification.md`
- Source code is implemented and unit tests passing

## Process

### Step 1: Validate Feature Readiness
1. Read `RLM/specs/features/FTR-XXX/specification.md`
2. Check all tasks for this feature are in `RLM/tasks/completed/`
3. Verify unit tests pass: `npm test`
4. Extract acceptance criteria and user stories

### Step 2: Generate E2E Tests
For each acceptance criterion, create an E2E test:

```typescript
describe('Feature: [FTR-XXX] [Feature Name]', () => {
  describe('User Story: [US-XXX]', () => {
    it('should [acceptance criterion 1]', async () => {
      // Arrange — set up test environment
      // Act — perform user actions
      // Assert — verify expected outcome
    });
  });
});
```

### Step 3: Run Verification Tests

#### Functional Tests
Run E2E tests against the implemented feature:
```bash
npx playwright test tests/e2e/features/FTR-XXX/
```

#### Accessibility Tests (UI Features)
Run accessibility checks:
```bash
npx playwright test tests/e2e/features/FTR-XXX/ --grep "accessibility"
```

### Step 4: Analyze Results

#### On PASS
1. Update `RLM/progress/status.json`:
   ```json
   { "features": { "FTR-XXX": { "status": "verified", "verified_at": "ISO-date" } } }
   ```
2. Create verification report: `RLM/progress/verification/FTR-XXX.md`
3. Feature is ready for release

#### On FAIL
1. Update status to `verification-failed`
2. Create bug tasks in `RLM/tasks/active/`:
   ```markdown
   # Bug: [Test Name] Failed
   ## Task ID: TASK-XXX-BUG-NNN
   ## Feature: FTR-XXX
   ## Type: bug
   ## Status: pending
   ## Error: [error message]
   ## Steps to Reproduce: [steps]
   ## Expected: [expected behavior]
   ## Actual: [actual behavior]
   ```
3. Fix bugs and re-verify

### Step 5: Generate Verification Report

Create `RLM/progress/verification/FTR-XXX.md`:

```markdown
# Verification Report: FTR-XXX — [Feature Name]

## Result: PASSED | FAILED
## Date: [ISO date]
## Verified By: RLM Verify Agent

## Test Summary
| Category | Passed | Failed | Skipped |
|----------|--------|--------|---------|
| Functional | X | X | X |
| Accessibility | X | X | X |
| Performance | X | X | X |
| Total | X | X | X |

## Acceptance Criteria Coverage
| Criterion | Test | Result |
|-----------|------|--------|
| [AC-1] | test_name | PASS |
| [AC-2] | test_name | FAIL |

## Failures (if any)
### Failure 1: [Test Name]
- **Error**: [message]
- **Expected**: [behavior]
- **Actual**: [behavior]
- **Bug Task**: TASK-XXX-BUG-001

## Recommendations
[Next steps]
```

## Launch-Mode Pre-Check

Before running feature verification:

1. Read the execution context contract from `RLM/specs/constitution.md` and/or `RLM/specs/PRD.md`
2. Identify the declared launch mode (e.g., "open index.html directly" = file://, or "run local server" = http://localhost)
3. Validate compatibility:
   - If implementation uses `<script type="module">` or ES module `import` statements AND the declared launch mode is file:// → **FAIL verification immediately**
   - Create a bug task: "Runtime protocol mismatch: ES modules require HTTP serving but docs claim file:// compatibility"
4. If compatible: proceed with normal verification process
5. Include "Launch-Mode Compatibility: PASS/FAIL" in the verification report

## Output Artifacts
- E2E test files
- Verification report: `RLM/progress/verification/FTR-XXX.md`
- Bug tasks (if failures): `RLM/tasks/active/TASK-XXX-BUG-NNN.md`
- Updated `RLM/progress/status.json`

## Reference Files
- Entry point: `RLM/START-HERE.md`
- Verification prompt: `RLM/prompts/09-VERIFY-FEATURE.md`
- Feature specs: `RLM/specs/features/FTR-XXX/specification.md`
- Verification bug template: `RLM/templates/verification-bug-template.md`
- E2E test template: `RLM/templates/e2e-test-template.md`
