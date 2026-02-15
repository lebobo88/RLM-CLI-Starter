# Run Tests (v2.7)

Execute and validate all tests for the project.

## Before You Start

Read `RLM/prompts/07-TEST.md` for the full workflow.

## Instructions

1. Run the full test suite
2. Analyze any failures
3. Check test coverage against targets (80%+ unit, 60%+ integration)
4. Report gaps in coverage
5. Suggest additional tests if needed

## Commands

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/file.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="pattern"
```

## Coverage Targets

| Type | Minimum | Target |
|------|---------|--------|
| Unit | 80% | 90% |
| Integration | 60% | 80% |
| Branches | 75% | 85% |
| Functions | 80% | 90% |

## Output Format

### Test Results Summary
```
Tests:       X passed, Y failed, Z total
Suites:      A passed, B failed, C total
Time:        N.NNs
```

### Coverage Report
```
File           | % Stmts | % Branch | % Funcs | % Lines |
---------------|---------|----------|---------|---------|
All files      |   XX.XX |    XX.XX |   XX.XX |   XX.XX |
 src/          |   XX.XX |    XX.XX |   XX.XX |   XX.XX |
  file1.ts     |   XX.XX |    XX.XX |   XX.XX |   XX.XX |
```

### For Failures

For each failing test:
- **Test Name**: Full test description
- **Location**: File and line number
- **Expected**: What was expected
- **Received**: What was received
- **Analysis**: Why it might be failing
- **Suggestion**: How to fix

## Coverage Gap Analysis

If coverage is below target:
1. Identify uncovered lines
2. Categorize: business logic vs boilerplate
3. Prioritize business logic coverage
4. Suggest specific tests to add
