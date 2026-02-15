# Verification Bug Task Template

This template is used by the Verifier Agent to create bug tasks when feature verification fails.

## Task File Format

**File**: `RLM/tasks/active/TASK-XXX-BUG-NNN.md`

---

```markdown
# Task: {{BUG_TYPE}} - {{BRIEF_DESCRIPTION}}

## Task ID: {{TASK_ID}}-BUG-{{BUG_NUMBER}}
## Feature: {{FEATURE_ID}}
## Type: bug
## Status: pending
## Priority: {{PRIORITY}}
## Assigned Agent: implementation-agent
## Created By: Verifier Agent
## Created At: {{TIMESTAMP}}

---

## Bug Category

Select one:
- [ ] Functional failure - Test assertion did not pass
- [ ] Accessibility violation - WCAG 2.1 AA compliance issue
- [ ] Visual regression - Screenshot diff exceeded threshold

---

## Test Details

| Field | Value |
|-------|-------|
| Test File | `rlm-app/tests/e2e/features/{{FEATURE_ID}}/{{TEST_FILE}}` |
| Test Suite | {{TEST_SUITE}} |
| Test Name | {{TEST_NAME}} |
| Browser | {{BROWSER}} |
| Viewport | {{VIEWPORT}} |

---

## Error Information

### Error Message
```
{{ERROR_MESSAGE}}
```

### Stack Trace
```
{{STACK_TRACE}}
```

---

## Expected vs Actual

| | Description |
|---|-------------|
| **Expected** | {{EXPECTED_BEHAVIOR}} |
| **Actual** | {{ACTUAL_BEHAVIOR}} |

---

## Evidence

### Screenshots
- Before: `test-results/{{FEATURE_ID}}/{{TEST_NAME}}-before.png`
- After: `test-results/{{FEATURE_ID}}/{{TEST_NAME}}-after.png`
- Diff: `test-results/{{FEATURE_ID}}/{{TEST_NAME}}-diff.png`

### Trace File
`test-results/{{FEATURE_ID}}/trace.zip`

### Video (if captured)
`test-results/{{FEATURE_ID}}/{{TEST_NAME}}.webm`

---

## Acceptance Criterion Violated

From `RLM/specs/features/{{FEATURE_ID}}/spec.md`:

> **{{USER_STORY_ID}}: {{USER_STORY_TITLE}}**
>
> - [ ] {{ACCEPTANCE_CRITERION}}

---

## Reproduction Steps

1. Navigate to `{{ROUTE}}`
2. {{STEP_2}}
3. {{STEP_3}}
4. Observe: {{FAILURE_OBSERVATION}}

---

## Root Cause Analysis

### Likely Causes
- [ ] Missing implementation
- [ ] Incorrect implementation
- [ ] CSS/styling issue
- [ ] Missing ARIA attributes
- [ ] Color contrast issue
- [ ] Missing keyboard handling
- [ ] Responsive layout issue
- [ ] Race condition
- [ ] API integration issue

### Investigation Notes
{{INVESTIGATION_NOTES}}

---

## Fix Approach

### Suggested Fix
{{SUGGESTED_FIX}}

### Files to Modify
- `{{FILE_PATH_1}}`
- `{{FILE_PATH_2}}`

---

## Acceptance Criteria for Fix

- [ ] Original acceptance criterion now passes
- [ ] Related unit tests pass
- [ ] Related integration tests pass
- [ ] No regression in other tests
- [ ] Feature verification suite passes for {{FEATURE_ID}}
- [ ] Code review approved

---

## Dependencies

- Depends on: None
- Blocks: {{FEATURE_ID}} verification

---

## Notes

- This bug was automatically created by the Verifier Agent
- After fixing, ask @rlm-verify to re-verify {{FEATURE_ID}}
- All bug tasks for this feature must be resolved before verification can pass
```

---

## Bug Type Patterns

### Functional Failure

```markdown
## Bug Category
- [x] Functional failure - Test assertion did not pass

## Error Information
### Error Message
```
expect(received).toContainText(expected)
Expected: "Welcome, John"
Received: ""
```

## Expected vs Actual
| | Description |
|---|-------------|
| **Expected** | User name should display in welcome message after login |
| **Actual** | Welcome message is empty or missing user name |
```

### Accessibility Violation

```markdown
## Bug Category
- [x] Accessibility violation - WCAG 2.1 AA compliance issue

## Error Information
### Error Message
```
WCAG Violation: color-contrast (serious)
Element: <p class="error-text">Invalid credentials</p>
Foreground: #999999
Background: #ffffff
Contrast ratio: 2.85:1 (required: 4.5:1)
```

## Expected vs Actual
| | Description |
|---|-------------|
| **Expected** | Text should have contrast ratio of at least 4.5:1 for WCAG AA |
| **Actual** | Error text has contrast ratio of 2.85:1 |

## Suggested Fix
Change `.error-text` color from `#999999` to `#595959` or darker to meet 4.5:1 ratio.
```

### Visual Regression

```markdown
## Bug Category
- [x] Visual regression - Screenshot diff exceeded threshold

## Error Information
### Error Message
```
Screenshot comparison failed
Expected: FTR-001-mobile.png
Actual: FTR-001-mobile-actual.png
Diff: 245 pixels (threshold: 100 pixels)
```

## Expected vs Actual
| | Description |
|---|-------------|
| **Expected** | Mobile layout should match approved baseline screenshot |
| **Actual** | Layout has significant differences (button position shifted, spacing changed) |

## Suggested Fix
Review mobile responsive styles. Check media query breakpoints for proper element positioning.
```

---

## Priority Assignment

| Severity | Priority | Criteria |
|----------|----------|----------|
| Critical | Critical | Security issue, data loss, app crash |
| Major | High | Core functionality broken, a11y violations |
| Minor | Medium | Visual issues, edge cases |
| Trivial | Low | Minor visual polish, non-blocking |

---

## Automatic Field Population

The Verifier Agent populates these fields automatically:

| Field | Source |
|-------|--------|
| `{{TASK_ID}}` | Last task ID in feature + 1 |
| `{{BUG_NUMBER}}` | Sequential bug number for this feature |
| `{{FEATURE_ID}}` | From verification context |
| `{{TIMESTAMP}}` | Current ISO-8601 timestamp |
| `{{TEST_FILE}}` | From Playwright test result |
| `{{TEST_SUITE}}` | describe() block name |
| `{{TEST_NAME}}` | test() name |
| `{{ERROR_MESSAGE}}` | From test failure output |
| `{{STACK_TRACE}}` | From test failure output |
| `{{BROWSER}}` | From Playwright project |
| `{{VIEWPORT}}` | From test configuration |
| `{{USER_STORY_ID}}` | Mapped from test to spec |
| `{{ACCEPTANCE_CRITERION}}` | The specific criterion being tested |

---

## Example Generated Bug Task

```markdown
# Task: Accessibility Violation - Error Text Insufficient Contrast

## Task ID: TASK-010-BUG-001
## Feature: FTR-001
## Type: bug
## Status: pending
## Priority: High
## Assigned Agent: implementation-agent
## Created By: Verifier Agent
## Created At: 2024-01-15T14:30:00Z

---

## Bug Category

- [x] Accessibility violation - WCAG 2.1 AA compliance issue

---

## Test Details

| Field | Value |
|-------|-------|
| Test File | `rlm-app/tests/e2e/features/FTR-001/FTR-001.a11y.test.ts` |
| Test Suite | FTR-001: User Authentication - Accessibility |
| Test Name | color contrast meets WCAG AA requirements |
| Browser | chromium |
| Viewport | 1280x720 |

---

## Error Information

### Error Message
```
expect(received).toEqual(expected)

Expected: []
Received: [{"id": "color-contrast", "impact": "serious", "nodes": [...]}]
```

---

## Expected vs Actual

| | Description |
|---|-------------|
| **Expected** | All text should meet WCAG 2.1 AA color contrast requirements (4.5:1 for normal text) |
| **Actual** | Error message text has contrast ratio of 2.85:1 |

---

## Evidence

### Screenshots
- Diff: `test-results/FTR-001/color-contrast-violation.png`

### Trace File
`test-results/FTR-001/trace.zip`

---

## Acceptance Criterion Violated

From `RLM/specs/features/FTR-001/spec.md`:

> **US-001: User Login**
>
> - [ ] Invalid credentials show appropriate error message

(Related accessibility requirement: Error must be perceivable by all users)

---

## Reproduction Steps

1. Navigate to `/login`
2. Enter invalid credentials
3. Submit the form
4. Observe: Error message color is too light (#999999 on white background)

---

## Fix Approach

### Suggested Fix
Update the error text color to meet 4.5:1 contrast ratio.

Change in CSS:
```css
.error-text {
  color: #d32f2f; /* Red with 5.3:1 contrast */
}
```

### Files to Modify
- `rlm-app/app/login/page.tsx`
- `rlm-app/components/ui/error-message.tsx`

---

## Acceptance Criteria for Fix

- [ ] Error text meets 4.5:1 contrast ratio
- [ ] axe-core accessibility scan passes
- [ ] No visual regression in other components
- [ ] Feature verification suite passes for FTR-001

---

## Notes

- This bug was automatically created by the Verifier Agent
- After fixing, ask @rlm-verify to re-verify FTR-001
```
