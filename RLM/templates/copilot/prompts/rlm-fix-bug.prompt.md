# Fix Bug (v2.7)

Debug and fix the reported issue.

## Reference

See `RLM/prompts/patterns/root-cause-analysis.md` for structured debugging.

## Investigation Steps

1. **Reproduce**: Create minimal reproduction case
2. **Hypothesize**: Form theories about root cause (5-Whys technique)
3. **Eliminate**: Test and rule out theories
4. **Fix**: Implement solution with test coverage
5. **Verify**: Ensure fix doesn't break other tests

## Bug Investigation Framework

### 1. Gather Information
- Error message
- Stack trace
- Steps to reproduce
- Expected vs actual behavior
- Environment details

### 2. Form Hypotheses
List potential causes:
- [ ] Hypothesis 1: [Description]
- [ ] Hypothesis 2: [Description]
- [ ] Hypothesis 3: [Description]

### 3. Test Hypotheses
For each hypothesis:
- Add logging/debugging
- Check related code
- Review recent changes
- Test in isolation

### 4. Identify Root Cause
```markdown
**Root Cause:** [Clear explanation]

**Why It Happened:**
[Technical explanation]

**Contributing Factors:**
- Factor 1
- Factor 2
```

## Fix Implementation

### 1. Write Failing Test First
```typescript
describe('Bug #XXX', () => {
  it('should not [buggy behavior]', () => {
    // Reproduce the bug scenario
    // Assert correct behavior
  });
});
```

### 2. Implement Fix
- Minimal change to fix the issue
- Don't refactor unrelated code
- Consider edge cases

### 3. Add Regression Test
```typescript
describe('Regression: Bug #XXX', () => {
  it('should [correct behavior] in edge case', () => {
    // Test the specific scenario that caused the bug
  });
});
```

## Output Format

```markdown
## Bug Fix Report

### Issue
[Description of the bug]

### Root Cause
[What caused the bug]

### Solution
[How it was fixed]

### Files Changed
- `path/to/file.ts` - [What changed]

### Tests Added
- `path/to/test.ts` - [What it tests]

### Verification
- [ ] Bug no longer reproduces
- [ ] New tests pass
- [ ] Existing tests pass
- [ ] No new regressions
```
