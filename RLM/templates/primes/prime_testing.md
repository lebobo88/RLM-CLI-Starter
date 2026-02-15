# Context Prime: Testing & QA

## Purpose
Write comprehensive tests, analyze failures, fix issues, and ensure quality standards are met.

## Essential Context Only
- Testing requirements from constitution
- Source code to test
- Existing test files (if any)
- Acceptance criteria

## Run Step
1. **Analyze** source code and identify test needs
2. **Write** comprehensive test suite
   - Unit tests for all functions
   - Integration tests for APIs
   - E2E tests for user flows
3. **Execute** tests and collect results
4. **Analyze** failures and determine root causes
5. **Fix** issues (code or tests)
6. **Verify** coverage meets threshold
7. **Report** results and recommendations

## Read Step
**Input Files:**
- `RLM/specs/constitution.md` (testing standards section only)
- Source files to test: `src/**/*.ts`
- Existing tests: `tests/**/*.test.ts`
- Feature spec: `RLM/specs/features/[FTR-XXX]/spec.md` (acceptance criteria)

**Focus Areas:**
- Test coverage gaps
- Edge cases
- Error conditions
- Performance validation

## Report Step
**Output Files:**
- Test files: `tests/**/*.test.ts`
- Coverage report: `coverage/`
- Test report: `RLM/progress/reports/test-report-[date].md`

**Report Format:**
```markdown
# Test Report: [Feature Name]

## Summary
- Total Tests: X
- Passing: X
- Failing: X
- Coverage: X%

## Coverage Breakdown
- Statements: X%
- Branches: X%
- Functions: X%
- Lines: X%

## Failed Tests
[Details of any failures]

## Recommendations
[Suggestions for improvement]

## Token Usage
- Total: X tokens
- Cost: $X.XX
```

## Context Isolation
This prime excludes:
- Implementation details beyond what's needed for testing
- Architecture discussions
- Other features
- Full project history

Focuses on:
- Code quality
- Test coverage
- Failure analysis
- Bug fixing

## Token Budget
**Target:** 30,000-50,000 tokens
**Includes:** Source code + test standards + acceptance criteria
**Excludes:** Full constitution, architecture docs, implementation history

## Testing Workflow
```
Read Source → Identify Gaps → Write Tests →
Execute Tests → Analyze Failures → Fix Issues →
Verify Coverage → Report Results
```

---
*Use this prime: `./RLM/commands/utils/context-manager.sh prime testing`*

