# Validation Checklist for {TASK-ID}

**Task**: {Task Description}
**Feature**: {FTR-XXX}
**Implementation Task**: {TASK-XXX}
**Validator**: {reviewer}
**Date**: {YYYY-MM-DD}

---

## 1. Compilation/Type Safety

### TypeScript/JavaScript (if applicable)
- [ ] TypeScript type checking passes (`npx tsc --noEmit`)
- [ ] No ESLint errors
- [ ] No unused variables or imports
- [ ] Proper type annotations on function parameters and return values

### Python (if applicable)
- [ ] Ruff linting passes
- [ ] Mypy type checking passes
- [ ] No syntax errors

### General
- [ ] No runtime errors in test execution
- [ ] All dependencies properly imported
- [ ] No circular dependencies

**Notes**:

---

## 2. Architectural Alignment

### Specification Compliance
- [ ] Matches feature spec requirements (RLM/specs/features/{FTR-XXX}.md)
- [ ] Follows architecture patterns (RLM/specs/architecture/)
- [ ] Implements all acceptance criteria from task
- [ ] No scope creep (only implements what was requested)

### Code Quality
- [ ] Follows project conventions (RLM/specs/constitution.md)
- [ ] SOLID principles applied
- [ ] Functions < 50 lines (as per project standards)
- [ ] Clear, descriptive variable and function names
- [ ] No code duplication (DRY principle)

### Error Handling
- [ ] Proper error handling implemented
- [ ] Errors provide meaningful messages
- [ ] Edge cases handled appropriately
- [ ] Graceful degradation where applicable

**Notes**:

---

## 3. Test Coverage

### Unit Tests
- [ ] Unit tests exist for all new functions
- [ ] Unit tests cover happy path
- [ ] Unit tests cover error conditions
- [ ] Unit tests cover edge cases

### Integration Tests
- [ ] Integration tests exist for API endpoints (if applicable)
- [ ] Database operations tested (if applicable)
- [ ] External service integrations tested or mocked

### Coverage Metrics
- [ ] Overall coverage >= 80%
- [ ] No critical code paths untested
- [ ] Tests are deterministic (no flaky tests)

### Test Quality
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] Tests have descriptive names
- [ ] Tests are isolated (no shared state)
- [ ] Mock/stub external dependencies appropriately

**Coverage Report**:
```
Lines: XX%
Functions: XX%
Branches: XX%
```

**Notes**:

---

## 4. Security

### Input Validation
- [ ] All user inputs validated
- [ ] Input sanitization applied where needed
- [ ] Type checking on inputs

### Vulnerability Checks
- [ ] No SQL injection vulnerabilities
- [ ] No XSS (Cross-Site Scripting) vulnerabilities
- [ ] No command injection vulnerabilities
- [ ] No path traversal vulnerabilities

### Authentication & Authorization
- [ ] Authentication checks present (if applicable)
- [ ] Authorization checks present (if applicable)
- [ ] Proper role-based access control (if applicable)

### Data Protection
- [ ] Secrets not hardcoded
- [ ] Sensitive data encrypted/hashed appropriately
- [ ] No sensitive data in logs
- [ ] Environment variables used for configuration

### Dependencies
- [ ] No known vulnerable dependencies
- [ ] Dependencies up to date
- [ ] Minimal dependency footprint

**Security Scan Results**:

**Notes**:

---

## 5. Design Compliance (UI Components Only)

### Design Tokens
- [ ] Design tokens used for colors (no hardcoded hex values)
- [ ] Design tokens used for spacing
- [ ] Design tokens used for typography
- [ ] Design tokens used for shadows/effects

### Component States (All 8 Required)
- [ ] **Default** - Resting appearance implemented
- [ ] **Hover** - Mouse over state (desktop)
- [ ] **Focus** - Keyboard focus with visible focus ring
- [ ] **Active** - Being clicked/pressed state
- [ ] **Disabled** - Non-interactive state
- [ ] **Loading** - Async operation in progress
- [ ] **Error** - Validation/operation failure
- [ ] **Empty** - No content/data state

### Accessibility (WCAG 2.1 AA)
- [ ] Color contrast >= 4.5:1 for text
- [ ] Color contrast >= 3:1 for UI elements
- [ ] Touch targets >= 44x44px
- [ ] Keyboard navigation supported for all interactive elements
- [ ] Semantic HTML used
- [ ] ARIA labels present where needed
- [ ] Screen reader tested (or documentation provided)

### Responsive Design
- [ ] Mobile layout implemented (if applicable)
- [ ] Tablet layout implemented (if applicable)
- [ ] Desktop layout implemented
- [ ] Breakpoints follow design system

**Notes**:

---

## 6. Documentation

### Code Documentation
- [ ] Public APIs have JSDoc/docstrings
- [ ] Complex logic has inline comments
- [ ] Component props documented (TypeScript interfaces or PropTypes)
- [ ] Function parameters and return values documented

### Project Documentation
- [ ] README updated (if needed)
- [ ] CHANGELOG updated (if needed)
- [ ] API documentation generated/updated (if applicable)

### Examples
- [ ] Usage examples provided for new APIs
- [ ] Example code is tested and works

**Notes**:

---

## 7. Performance

### Code Efficiency
- [ ] No obvious performance bottlenecks
- [ ] Appropriate data structures used
- [ ] Database queries optimized (if applicable)
- [ ] No N+1 query problems

### UI Performance (if applicable)
- [ ] No unnecessary re-renders
- [ ] Memoization used where appropriate
- [ ] Lazy loading implemented for heavy components
- [ ] Images optimized

**Notes**:

---

## 8. Manifest & Completion Protocol

### Manifest File
- [ ] Manifest exists: `RLM/progress/manifests/{TASK-ID}-HHMMSS.json`
- [ ] Manifest contains all required fields
- [ ] Files changed match manifest
- [ ] Tests added match manifest

### Git Hygiene
- [ ] Commit message follows convention
- [ ] No unrelated changes in commit
- [ ] No merge conflicts
- [ ] Branch is up to date with main (if applicable)

**Manifest Path**:

**Notes**:

---

## Verdict

**Overall Status**: ⬜ PASS | ⬜ CONDITIONAL PASS | ⬜ FAIL

### Critical Issues (Blockers)
*List any issues that MUST be fixed before approval*

1.
2.
3.

### High-Severity Issues (Should Fix)
*List any issues that should be addressed but don't block approval*

1.
2.
3.

### Medium/Low Issues (Optional)
*List any minor improvements or suggestions*

1.
2.
3.

---

## Validator Sign-Off

**Validator Agent**: {reviewer}
**Validation Date**: {YYYY-MM-DD HH:MM:SS}
**Time Spent**: {X minutes}

**Recommendation**:
- [ ] **APPROVE** - All checks passed, ready for production
- [ ] **CONDITIONAL APPROVE** - Minor issues, can be addressed in follow-up
- [ ] **REJECT** - Critical issues found, requires rework

**Additional Comments**:

---

## Next Steps

### If APPROVED
1. Mark validation task ({TASK-ID}) as completed
2. Update task status in RLM/tasks/active/{TASK-XXX}.md
3. Move implementation task to RLM/tasks/completed/
4. Celebrate! 🎉

### If CONDITIONAL PASS
1. Create follow-up tasks for high-severity issues
2. Document issues in task notes
3. Mark validation task as completed with notes

### If REJECTED
1. Create bug fix task with detailed issue description
2. Block validation task on bug fix task
3. Return implementation task to in_progress status
4. Notify builder agent of issues

---

## Plan-Mode Compliance

- [ ] If session was in `[[PLAN]]` mode, NO source code files were modified
- [ ] If session was in `[[PLAN]]` mode, only planning/spec/review artifacts were created or updated
- [ ] Transition from plan to execute mode was explicitly approved by user

## Cross-Spec Validation

- [ ] Enhancement output does not contradict any existing feature spec acceptance criteria
- [ ] Enhancement output includes "Preserved Invariants" and "Changed Behaviors" sections
- [ ] All behavioral changes are justified with spec references
- [ ] No feature spec invariant was violated without explicit approved spec revision
- [ ] Runtime launch instructions are compatible with the implementation's script loading strategy

---

*This checklist follows the RLM Builder-Validator paradigm. For more information, see RLM/START-HERE.md*
