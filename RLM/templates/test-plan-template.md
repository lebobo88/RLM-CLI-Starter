# Test Plan: [Feature Name]

## Feature: [FTR-XXX]
## Date: [YYYY-MM-DD]
## Author: Testing Agent
## Status: [Draft|Active|Completed]

## Test Objectives
- Objective 1
- Objective 2
- Objective 3

## Scope

### In Scope
- Feature/Component 1
- Feature/Component 2

### Out of Scope
- Feature/Component 3
- Feature/Component 4

## Test Strategy

### Unit Testing
- **Framework:** [Jest/PyTest/etc]
- **Coverage Target:** 80%
- **Focus Areas:**
  - Business logic
  - Validation
  - Error handling

### Integration Testing
- **Framework:** [Framework name]
- **Focus Areas:**
  - API endpoints
  - Database operations
  - External service integration

### E2E Testing
- **Framework:** [Playwright/Cypress/etc]
- **Focus Areas:**
  - Critical user journeys
  - Error scenarios

### Performance Testing
- **Tool:** [JMeter/k6/etc]
- **Load Target:** [X requests/second]
- **Response Time Target:** [Xms]

## Test Cases

### TC-001: [Test Case Name]
- **Type:** Unit
- **Priority:** High
- **Preconditions:** [Setup needed]
- **Steps:**
  1. Step 1
  2. Step 2
  3. Step 3
- **Expected Result:** [What should happen]
- **Status:** [Pass|Fail|Not Run]

### TC-002: [Test Case Name]
- **Type:** Integration
- **Priority:** High
- **Preconditions:** [Setup needed]
- **Steps:**
  1. Step 1
  2. Step 2
- **Expected Result:** [What should happen]
- **Status:** [Pass|Fail|Not Run]

## Test Data
- Dataset 1: [Description]
- Dataset 2: [Description]

## Test Environment
- **Environment:** Development/Staging
- **Database:** [Database type and version]
- **Dependencies:** [Services needed]

## Entry Criteria
- [ ] Code implementation complete
- [ ] Test environment ready
- [ ] Test data prepared

## Exit Criteria
- [ ] All test cases executed
- [ ] 80%+ test coverage achieved
- [ ] No critical bugs
- [ ] Performance targets met

## Risks and Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk 1] | [High/Medium/Low] | [How to mitigate] |
| [Risk 2] | [High/Medium/Low] | [How to mitigate] |

## Schedule
- Test Planning: [Date]
- Test Execution: [Date]
- Test Completion: [Date]

## Results Summary
(To be filled after execution)

### Coverage
- Statements: X%
- Branches: X%
- Functions: X%
- Lines: X%

### Test Results
- Total: X
- Passed: X
- Failed: X
- Skipped: X

### Issues Found
| ID | Description | Severity | Status |
|----|-------------|----------|--------|
| ISS-001 | [Description] | High | Open |

---

## Environment / Protocol Matrix

### Launch-Mode Test Coverage
| Protocol | Expected Behavior | Test Method | Result |
|----------|-------------------|-------------|--------|
| `file://` (if declared) | App loads without CORS errors, all scripts execute | Open index.html directly in browser | PASS / FAIL / N/A |
| `http://localhost` (if declared) | App loads correctly via local server | Run `[server command]` and navigate to localhost | PASS / FAIL / N/A |
| Production (if applicable) | App loads from CDN/host | Deploy to staging and verify | PASS / FAIL / N/A |

### Compatibility Rule
- If the execution context contract declares `file://`, ALL tests under the `file://` row MUST pass
- If `<script type="module">` is detected AND file:// is declared → auto-FAIL before running tests

