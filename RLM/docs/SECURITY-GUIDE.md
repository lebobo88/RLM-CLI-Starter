# RLM Security Guide

> Quick reference for secure development in RLM projects.

## OWASP ASVS Quick Reference

This project targets OWASP ASVS v5.0 Level 2. Key controls for TDD:

### V2: Authentication
| ID | Requirement | Test Pattern |
|----|-------------|--------------|
| V2.1.1 | Password >= 12 chars | `expect(validatePassword('short')).toBe(false)` |
| V2.1.7 | Account lockout after failures | `expect(loginAfterFiveFailures).rejects.toThrow(/locked/)` |
| V2.2.1 | Anti-automation (rate limiting) | `expect(loginAttempt101).toHaveStatus(429)` |
| V2.10.1 | No hardcoded credentials | Grep for `password =`, `api_key =` |

### V3: Session Management
| ID | Requirement | Test Pattern |
|----|-------------|--------------|
| V3.2.1 | Session invalidated on logout | `expect(accessAfterLogout).rejects.toThrow(/unauthorized/)` |
| V3.3.1 | Session regenerated on auth | `expect(newSession.id).not.toBe(oldSession.id)` |
| V3.4.1-3 | Secure cookie flags | `expect(cookie).toMatch(/Secure.*HttpOnly.*SameSite/)` |

### V4: Access Control
| ID | Requirement | Test Pattern |
|----|-------------|--------------|
| V4.1.1 | Deny by default | `expect(accessWithoutAuth).rejects.toThrow(/unauthorized/)` |
| V4.2.1 | No IDOR | `expect(user1AccessUser2Data).rejects.toThrow(/forbidden/)` |
| V4.2.2 | Path traversal blocked | `expect(loadFile('../etc/passwd')).rejects.toThrow()` |

### V5: Input Validation
| ID | Requirement | Test Pattern |
|----|-------------|--------------|
| V5.1.3 | Positive validation | `expect(() => process(null)).toThrow()` |
| V5.3.1 | SQL injection prevented | `expect(() => query("'; DROP--")).toThrow()` |
| V5.3.3 | XSS prevented | `expect(render('<script>')).not.toContain('<script>')` |
| V5.3.4 | Command injection prevented | `expect(() => exec('; rm -rf')).toThrow()` |

### V6: Cryptography
| ID | Requirement | Test Pattern |
|----|-------------|--------------|
| V6.2.2 | Approved algorithms | `expect(hash).toMatch(/^\$2[aby]\$/)` (bcrypt) |
| V6.2.5 | No deprecated hashing | Grep for `md5(`, `sha1(` |

### V7: Error Handling
| ID | Requirement | Test Pattern |
|----|-------------|--------------|
| V7.1.1 | Generic error messages | `expect(error.message).not.toMatch(/sql\|stack\|trace/)` |
| V7.4.1 | No sensitive data logged | `expect(logs).not.toContain(password)` |

### V8: Data Protection
| ID | Requirement | Test Pattern |
|----|-------------|--------------|
| V8.2.1 | TLS for transmission | Config check for HTTPS enforcement |
| V8.3.1 | No sensitive data in URLs | `expect(url).not.toContain(token)` |

### V13: API Security
| ID | Requirement | Test Pattern |
|----|-------------|--------------|
| V13.2.5 | Rate limiting | `expect(request101).toHaveStatus(429)` |

---

## Secure Coding Patterns

### Input Validation

```typescript
// ALWAYS validate at entry point
function processUserInput(input: unknown): ProcessedData {
  // Step 1: Type check
  if (typeof input !== 'object' || input === null) {
    throw new ValidationError('Invalid input type');
  }

  // Step 2: Schema validation (use zod, yup, joi)
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError('Schema validation failed');
  }

  // Step 3: Business validation
  return processValidated(parsed.data);
}
```

### Parameterized Queries

```typescript
// NEVER concatenate SQL
// BAD
const result = db.query(`SELECT * FROM users WHERE email = '${email}'`);

// GOOD
const result = db.query('SELECT * FROM users WHERE email = $1', [email]);
```

### Output Encoding

```typescript
// HTML context
function renderUserContent(content: string): string {
  return escapeHtml(content);  // Convert < > & " ' to entities
}

// URL context
function buildUrl(userParam: string): string {
  return `${base}?q=${encodeURIComponent(userParam)}`;
}

// JSON context
function jsonResponse(data: object): string {
  return JSON.stringify(data);  // Handles encoding automatically
}
```

### Error Handling

```typescript
// Log details internally, return generic message to user
try {
  await sensitiveOperation();
} catch (error) {
  logger.error('Operation failed', {
    errorId: generateId(),
    operation: 'sensitiveOperation',
    details: error.message  // Internal only
  });
  throw new AppError('Unable to complete request');  // Generic to user
}
```

### Secrets Management

```typescript
// NEVER hardcode
// BAD
const apiKey = 'sk-123456789';

// GOOD
const apiKey = process.env.API_KEY;
if (!apiKey) throw new Error('API_KEY not configured');
```

---

## Security Test Naming Convention

Include ASVS reference in test name or comment for traceability:

```typescript
// Option 1: In test name
it('should block SQL injection (ASVS 5.3.1)', () => {});

// Option 2: In describe block
describe('ASVS V5.3: Injection Prevention', () => {
  it('should use parameterized queries', () => {});
});

// Option 3: In comment
/** @asvs V5.3.1 */
it('should block SQL injection', () => {});
```

---

## Common Vulnerability Prevention

### SQL Injection (ASVS V5.3.1)
- Use parameterized queries/prepared statements
- Use ORM with query builders (Prisma, Drizzle)
- Never concatenate user input into SQL

### XSS (ASVS V5.3.3)
- Use framework auto-escaping (React JSX, Vue templates)
- Avoid `innerHTML`, `dangerouslySetInnerHTML`
- Set Content-Security-Policy header

### IDOR (ASVS V4.2.1)
- Check resource ownership on every request
- Use indirect references (UUIDs vs sequential IDs)
- Filter queries by current user context

### Path Traversal (ASVS V4.2.2)
- Validate file paths against allowlist
- Use `path.basename()` to extract filename
- Never pass user input to file operations directly

---

## SOC 2 Type II Quick Reference

Key Trust Service Criteria mapped to TDD patterns:

### Security (Common Criteria)

| ID | Requirement | Test Pattern |
|----|-------------|--------------|
| CC6.1 | Logical access controls | `expect(accessWithoutAuth).rejects.toThrow(/unauthorized/)` |
| CC6.2 | Credentials not transmitted in clear text | Config check for TLS enforcement on all endpoints |
| CC6.3 | Encryption for data at rest | `expect(dbColumn).toBeEncrypted()` or config check for disk encryption |
| CC6.6 | System boundary protection | `expect(internalEndpoint).not.toBePubliclyAccessible()` |
| CC6.7 | Access restricted to authorized users | `expect(roleCheck('viewer', 'admin-action')).toBe(false)` |
| CC6.8 | Unauthorized software prevented | Dependency allowlist check, `npm audit` in CI |
| CC7.2 | Security event monitoring | `expect(auditLog).toContainEntry({ event: 'login_failed' })` |
| CC7.3 | Security incidents evaluated | Alert configuration check for threshold breaches |
| CC8.1 | Change management controls | Git branch protection rules, PR review requirements |

### Availability

| ID | Requirement | Test Pattern |
|----|-------------|--------------|
| A1.2 | Recovery objectives met | `expect(backupRestoreTime).toBeLessThan(rto)` |

### Confidentiality

| ID | Requirement | Test Pattern |
|----|-------------|--------------|
| C1.1 | Confidential data identified | Data classification check in schema annotations |
| C1.2 | Confidential data disposed securely | `expect(deletedUser.data).toBeNull()` (hard delete or crypto-shred) |

---

## NIST SSDF v1.1 Quick Reference

Key Secure Software Development Framework practices mapped to TDD:

### Prepare the Organization (PO)

| ID | Practice | Test Pattern |
|----|----------|--------------|
| PO.1 | Define security requirements | Feature specs include security acceptance criteria |
| PO.3 | Implement supporting toolchains | CI pipeline includes SAST/SCA scanning gates |
| PO.5 | Implement secure environments | `expect(devEnv.secrets).not.toBeHardcoded()` |

### Protect the Software (PS)

| ID | Practice | Test Pattern |
|----|----------|--------------|
| PS.1 | Protect code from unauthorized access | Branch protection, signed commits in CI check |
| PS.2 | Verify software integrity | `expect(checksumVerify(artifact)).toBe(true)` |

### Produce Well-Secured Software (PW)

| ID | Practice | Test Pattern |
|----|----------|--------------|
| PW.1 | Design to meet security requirements | Architecture specs include threat model reference |
| PW.4 | Review and audit code for vulnerabilities | Reviewer agent security checklist execution |
| PW.5 | Reuse secure software components | `expect(dependencies).toPassAudit()` (`npm audit --audit-level=high`) |
| PW.6 | Configure build processes securely | CI config check: no secrets in build logs |
| PW.7 | Review and test for security | `describe('NIST PW.7', () => { /* security test suite */ })` |
| PW.8 | Verify third-party components | `expect(allDeps).toHaveKnownLicenses()` and no known vulnerabilities |
| PW.9 | Test executables for vulnerabilities | Integration test suite with security scenarios |

### Respond to Vulnerabilities (RV)

| ID | Practice | Test Pattern |
|----|----------|--------------|
| RV.1 | Identify and confirm vulnerabilities | `npm audit` + Dependabot alerts monitored |
| RV.2 | Assess and prioritize vulnerabilities | SLA check: Critical < 24h, High < 7d, Medium < 30d |
| RV.3 | Remediate vulnerabilities | `expect(previouslyVulnerableEndpoint).toBePatched()` |

---

## Compliance-to-TDD Cross-Reference Matrix

Maps security controls across OWASP ASVS, SOC 2, and NIST SSDF to unified TDD patterns:

| Control Area | OWASP ASVS | SOC 2 | NIST SSDF | TDD Pattern |
|-------------|-----------|-------|-----------|-------------|
| Authentication | V2.1.1, V2.1.7, V2.2.1 | CC6.1, CC6.7 | PW.1 | `expect(validatePassword('short')).toBe(false)` |
| Session Mgmt | V3.2.1, V3.3.1, V3.4.1 | CC6.2 | PW.7 | `expect(accessAfterLogout).rejects.toThrow(/unauthorized/)` |
| Access Control | V4.1.1, V4.2.1, V4.2.2 | CC6.1, CC6.7 | PW.1 | `expect(user1AccessUser2Data).rejects.toThrow(/forbidden/)` |
| Input Validation | V5.1.3, V5.3.1, V5.3.3 | — | PW.7, PW.9 | `expect(() => query("'; DROP--")).toThrow()` |
| Cryptography | V6.2.2, V6.2.5 | CC6.2, CC6.3 | PS.2 | `expect(hash).toMatch(/^\$2[aby]\$/)` |
| Error Handling | V7.1.1, V7.4.1 | CC7.2 | PW.7 | `expect(error.message).not.toMatch(/sql\|stack/)` |
| Data Protection | V8.2.1, V8.3.1 | C1.1, C1.2 | PO.5 | `expect(url).not.toContain(token)` |
| API Security | V13.2.5 | CC6.6 | PW.9 | `expect(request101).toHaveStatus(429)` |
| Audit Logging | — | CC7.2, CC7.3 | RV.1 | `expect(auditLog).toContainEntry({ event: 'login_failed' })` |
| Dependency Mgmt | — | CC6.8 | PW.5, PW.8 | `expect(dependencies).toPassAudit()` |
| Change Control | — | CC8.1 | PS.1 | Git branch protection rules + PR review checks |

**Usage**: When implementing a security-sensitive feature, find the control area in this matrix, then write tests covering all three framework references. Tag tests with the framework IDs:

```typescript
describe('Authentication (ASVS V2 / SOC2 CC6.1 / NIST PW.1)', () => {
  it('should reject weak passwords (ASVS V2.1.1)', () => {});
  it('should lock account after 5 failures (ASVS V2.1.7 / SOC2 CC6.1)', () => {});
  it('should rate limit login attempts (ASVS V2.2.1 / SOC2 CC6.7)', () => {});
});
```

---

## Quick Checklist

Before submitting code that handles user input:

- [ ] Input validated at entry point (ASVS V5.1.3)
- [ ] Parameterized queries used (ASVS V5.3.1)
- [ ] Output encoded for context (ASVS V5.3.3)
- [ ] Authorization checked (ASVS V4.1.1)
- [ ] Errors don't leak details (ASVS V7.1.1)
- [ ] No hardcoded secrets (ASVS V2.10.1)
- [ ] Security tests written with ASVS references

## Related Documents

- `RLM/docs/DEFENSE-IN-DEPTH.md` -- Layered defense model (Swiss Cheese)
- `.github/agents/rlm-implement.agent.md` -- R.A.I.L.G.U.A.R.D. security blueprints for code generation
- `.github/agents/rlm-quality.agent.md` -- R.A.I.L.G.U.A.R.D. review checklist
- `RLM/prompts/patterns/threat-modeling.md` -- STRIDE threat modeling pattern
