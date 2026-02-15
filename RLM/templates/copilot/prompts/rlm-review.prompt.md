# Code Review (v2.7)

Review code changes for quality and standards compliance.

## Reference

Read `RLM/specs/constitution.md` for project standards.

## Review Focus

1. **Correctness**: Does it meet requirements?
2. **Quality**: Clean code, no duplication?
3. **Testing**: Adequate test coverage (80%+ target)?
4. **Security**: Any vulnerabilities?
5. **Standards**: Follows constitution.md?
6. **Design**: Follows design system (UI projects)?

## Review Checklist

### Code Quality
- [ ] Functions < 50 lines
- [ ] No code duplication (DRY)
- [ ] Proper error handling
- [ ] Clear naming conventions
- [ ] Single Responsibility Principle
- [ ] No magic numbers/strings

### Security
- [ ] No secrets in code
- [ ] Input validation present
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Proper authentication/authorization

### Testing
- [ ] Tests exist for new code
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] 80%+ coverage maintained

### Performance
- [ ] No N+1 queries
- [ ] Appropriate caching
- [ ] No memory leaks
- [ ] Async operations handled properly

### Standards
- [ ] Follows constitution.md
- [ ] Matches feature spec
- [ ] Task acceptance criteria met
- [ ] Conventional commit format

## Output Format

For each issue found:

```markdown
### [Severity]: [Brief Title]

**Location:** `path/to/file.ts:42`

**Issue:**
[Description of the problem]

**Code:**
```typescript
// Problematic code
```

**Recommendation:**
[How to fix it]

**Fixed Code:**
```typescript
// Suggested fix
```
```

## Severity Levels

| Severity | Description | Action Required |
|----------|-------------|-----------------|
| Critical | Security issues, crashes, data loss | Must fix before merge |
| Major | Bugs, missing functionality | Should fix before merge |
| Minor | Style, minor improvements | Consider fixing |
| Suggestion | Nice-to-have improvements | Optional |

## Standards Reference
- `RLM/specs/constitution.md`
