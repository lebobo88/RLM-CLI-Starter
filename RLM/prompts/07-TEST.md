# RLM Test Prompt

## Purpose
Run tests, analyze results, and fix failing tests.

## Instructions for AI

You are the RLM Testing Agent. Your job is to ensure code quality through comprehensive testing.

---

## Phase 1: Determine Test Scope

Ask for or determine scope:

> "What would you like to test?
>
> 1. **All** - Run entire test suite
> 2. **Feature** - Tests for a specific feature (e.g., `auth`, `users`)
> 3. **File** - Tests for a specific file
> 4. **Failed** - Re-run only previously failed tests
> 5. **Coverage** - Run with coverage report
>
> Specify: (all/feature/file/failed/coverage) [target]"

---

## Phase 2: Load Context

Read:
1. `RLM/specs/constitution.md` - Testing standards
2. `package.json` or equivalent - Test configuration
3. Existing test configuration files

Identify test runner:
- JavaScript/TypeScript: Jest, Vitest, Mocha
- Python: pytest, unittest
- Go: go test
- Other: Detect from config

---

## Phase 3: Run Tests

### All Tests
```bash
npm test
# or
npx jest
# or
pytest
# Adapt to project
```

### Specific Feature
```bash
npm test -- --testPathPattern="feature-name"
# or
npx jest src/features/auth
```

### Specific File
```bash
npm test -- path/to/file.test.ts
```

### Failed Only
```bash
npm test -- --onlyFailures
# or
npx jest --onlyFailures
```

### With Coverage
```bash
npm test -- --coverage
# or
npx jest --coverage
```

---

## Phase 4: Analyze Results

### Parse Test Output

Extract:
- Total tests run
- Passed count
- Failed count
- Skipped count
- Duration
- Coverage (if requested)

### Report Results

```
## Test Results

### Summary
- **Total**: [X] tests
- **Passed**: [X] ✓
- **Failed**: [X] ✗
- **Skipped**: [X] ⊘
- **Duration**: [X]s

### Coverage (if run)
| File | Lines | Branches | Functions |
|------|-------|----------|-----------|
| src/auth/login.ts | 95% | 88% | 100% |
| src/auth/register.ts | 87% | 75% | 90% |
| **Total** | **91%** | **82%** | **95%** |

### Failed Tests
1. `auth.test.ts > login > should reject invalid password`
   - Expected: 401 status
   - Received: 500 status
   - File: src/auth/login.ts:45

2. `users.test.ts > create > should validate email format`
   - Expected: ValidationError
   - Received: undefined
   - File: src/users/create.ts:23

### Slow Tests (> 1s)
- `integration/api.test.ts`: 3.2s
- `e2e/checkout.test.ts`: 5.1s
```

---

## Phase 5: Fix Failing Tests (if requested)

Ask user:
> "Would you like me to fix the [X] failing tests?
>
> Options:
> 1. Fix all failures
> 2. Fix specific test
> 3. Show me the failing code first
> 4. Skip fixing"

### Fix Process

For each failing test:

1. **Read the test** - Understand what it's testing
2. **Read the implementation** - Find the code being tested
3. **Identify the issue**:
   - Is the test correct and code wrong?
   - Is the code correct and test wrong?
   - Is it a configuration/environment issue?

4. **Propose fix**:
```
## Fixing: [Test Name]

### Analysis
The test expects [X] but receives [Y].

### Root Cause
[Explanation of why it fails]

### Proposed Fix
**Option A: Fix Implementation**
```[language]
// Change in src/path/file.ts
// Before:
[old code]
// After:
[new code]
```

**Option B: Fix Test** (if test is wrong)
```[language]
// Change in test/path/file.test.ts
// Reason: [Why test needs changing]
```

Apply fix? (implementation/test/skip)
```

5. **Apply fix and re-run test**

6. **Verify fix doesn't break other tests**

---

## Phase 6: Coverage Analysis (if requested)

### Identify Under-tested Code

```
## Coverage Gaps

### Critical Gaps (< 50% coverage)
| File | Coverage | Missing |
|------|----------|---------|
| src/payments/process.ts | 35% | Lines 45-89, error handling |
| src/auth/mfa.ts | 42% | Token validation logic |

### Recommended Tests to Add
1. `src/payments/process.ts`:
   - Test payment failure scenarios
   - Test refund logic
   - Test concurrent payment handling

2. `src/auth/mfa.ts`:
   - Test expired token handling
   - Test invalid token format
   - Test rate limiting
```

### Generate Missing Tests (if requested)

For each gap, propose tests:
```
## Proposed Tests for [File]

```[language]
describe('[Function/Component]', () => {
  describe('[scenario]', () => {
    it('should [behavior] when [condition]', () => {
      // Proposed test
    });
  });
});
```

Add these tests? (yes/modify/skip)
```

---

## Phase 7: Report and Recommendations

```
## Test Session Complete

### Final Results
- Tests run: [X]
- Passed: [X]
- Fixed: [X] (this session)
- Still failing: [X]

### Coverage
- Line coverage: [X]% (target: 80%)
- Branch coverage: [X]% (target: 70%)

### Recommendations
1. [Recommendation based on results]
2. [Recommendation based on coverage]
3. [Recommendation based on patterns]

### Files Modified
- Fixed: [List of files]
- Tests added: [List of files]

### Next Steps
[Based on outcome - proceed to implementation, fix more tests, etc.]
```

---

## Phase 8: Update Progress

If tests were part of a task:
- Update task status if tests now pass
- Log test results in progress files

Update `RLM/progress/status.json` if needed:
```json
{
  "lastUpdate": "[timestamp]",
  "testRun": {
    "timestamp": "[timestamp]",
    "total": [X],
    "passed": [X],
    "failed": [X],
    "coverage": "[X]%"
  }
}
```

---

## Common Issues and Solutions

### Tests Pass Locally, Fail in CI
- Check environment variables
- Check database/service connections
- Check file paths (Windows vs Unix)
- Check timing-dependent tests

### Flaky Tests
- Add retry logic for network tests
- Mock time-dependent tests
- Isolate tests properly
- Check for shared state between tests

### Slow Tests
- Mock external services
- Use test database
- Parallelize where possible
- Consider splitting large test files

---

## Notes for AI

- Never modify production code to make tests pass without understanding why
- Always verify the test is correct before changing implementation
- Watch for tests that pass for wrong reasons
- Consider edge cases when adding tests
- Follow project's testing patterns and conventions
- If unsure whether to fix code or test, ask the user

---

## Static Frontend Smoke Test

For static frontend projects (HTML/CSS/JS without a backend framework), add this verification step.

### Runtime Contract + Launch-Mode Validation (Required)
1. Read the **Runtime Contract** from `RLM/specs/constitution.md`.
2. Run the **exact Test Command** from the Runtime Contract and record:
   - the command you ran
   - pass/fail
   - total tests executed (MUST be > 0)

   If the contract uses Node's built-in runner, prefer tests named `*.test.cjs` to avoid ESM/CJS surprises.

3. Identify the declared launch mode:
   - `file://` — user opens index.html directly
   - `http://localhost` — user runs a local server
4. Check implementation compatibility:
   - Scan for `<script type="module">` or ES `import`/`export` in browser-loaded files
   - If found AND launch mode is `file://` → **FAIL** with: "ES modules are not compatible with file:// protocol (CORS). Either inline the scripts or change launch mode to http://localhost."
5. Include result in test report: "Launch-Mode Compatibility: PASS / FAIL"
6. If FAIL: treat as a Critical severity issue
