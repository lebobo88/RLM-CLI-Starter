# Threat Modeling Pattern (RLM v2.7)

> **Part of**: RLM Prompt Pattern Library - See `RLM/START-HERE.md` for workflow overview.

## Purpose
Use this pattern for **security threat identification**, **risk assessment**, and **security test derivation**. It applies the STRIDE framework to systematically identify potential threats before implementation.

## When to Use
- Features handling user input (forms, APIs, file uploads)
- Authentication and authorization systems
- Features processing sensitive data (PII, credentials, payments)
- API endpoints exposed to external systems
- Database operations with user-controlled parameters
- Features integrating with third-party services

## Template

```
## Threat Model: {FEATURE_OR_COMPONENT}

### Assets
What data/systems need protection?

| Asset | Sensitivity | Storage | Transmission |
|-------|-------------|---------|--------------|
| {ASSET_1} | High/Medium/Low | {WHERE} | {HOW} |
| {ASSET_2} | High/Medium/Low | {WHERE} | {HOW} |

### Trust Boundaries
Where does data cross trust zones?

1. {BOUNDARY_1}: {DATA_THAT_CROSSES}
2. {BOUNDARY_2}: {DATA_THAT_CROSSES}

### STRIDE Analysis

#### S - Spoofing (Identity)
Can an attacker impersonate a user or system?

| Threat | Attack Vector | Impact | ASVS Control | Mitigation |
|--------|--------------|--------|--------------|------------|
| {THREAT} | {HOW} | High/Med/Low | V2.x | {FIX} |

#### T - Tampering (Data Integrity)
Can an attacker modify data in transit or at rest?

| Threat | Attack Vector | Impact | ASVS Control | Mitigation |
|--------|--------------|--------|--------------|------------|
| {THREAT} | {HOW} | High/Med/Low | V5.x | {FIX} |

#### R - Repudiation (Non-repudiation)
Can a user deny performing an action?

| Threat | Attack Vector | Impact | ASVS Control | Mitigation |
|--------|--------------|--------|--------------|------------|
| {THREAT} | {HOW} | High/Med/Low | V7.x | {FIX} |

#### I - Information Disclosure (Confidentiality)
Can sensitive data be exposed?

| Threat | Attack Vector | Impact | ASVS Control | Mitigation |
|--------|--------------|--------|--------------|------------|
| {THREAT} | {HOW} | High/Med/Low | V8.x | {FIX} |

#### D - Denial of Service (Availability)
Can an attacker disrupt availability?

| Threat | Attack Vector | Impact | ASVS Control | Mitigation |
|--------|--------------|--------|--------------|------------|
| {THREAT} | {HOW} | High/Med/Low | V13.x | {FIX} |

#### E - Elevation of Privilege (Authorization)
Can an attacker gain unauthorized access?

| Threat | Attack Vector | Impact | ASVS Control | Mitigation |
|--------|--------------|--------|--------------|------------|
| {THREAT} | {HOW} | High/Med/Low | V4.x | {FIX} |

### Security Tests Derived

Based on identified threats, implement these tests:

| Test | ASVS Ref | Type | Priority |
|------|----------|------|----------|
| {TEST_1} | V{X.X.X} | Unit/Integration | P1/P2 |
| {TEST_2} | V{X.X.X} | Unit/Integration | P1/P2 |
```

## Example Usage

```
## Threat Model: User Login (FTR-001)

### Assets

| Asset | Sensitivity | Storage | Transmission |
|-------|-------------|---------|--------------|
| User credentials | Critical | Hashed in PostgreSQL | HTTPS only |
| Session tokens | High | Redis | HTTPS + HttpOnly cookie |
| Login history | Medium | PostgreSQL | Internal only |

### Trust Boundaries

1. Browser → API: User credentials, session tokens
2. API → Database: Hashed credentials, user queries

### STRIDE Analysis

#### S - Spoofing (Identity)

| Threat | Attack Vector | Impact | ASVS Control | Mitigation |
|--------|--------------|--------|--------------|------------|
| Credential stuffing | Automated login with leaked passwords | High | V2.2.1 | Rate limiting, CAPTCHA |
| Session hijacking | Stealing session cookie | High | V3.4.1-3 | Secure cookie flags |
| Brute force | Password guessing | Medium | V2.1.7 | Account lockout |

#### T - Tampering (Data Integrity)

| Threat | Attack Vector | Impact | ASVS Control | Mitigation |
|--------|--------------|--------|--------------|------------|
| SQL injection | Malicious input in email field | Critical | V5.3.1 | Parameterized queries |
| Parameter tampering | Modify request body | Medium | V5.1.3 | Input validation |

#### R - Repudiation (Non-repudiation)

| Threat | Attack Vector | Impact | ASVS Control | Mitigation |
|--------|--------------|--------|--------------|------------|
| Deny login attempt | User claims they didn't log in | Low | V7.1.1 | Audit logging |

#### I - Information Disclosure (Confidentiality)

| Threat | Attack Vector | Impact | ASVS Control | Mitigation |
|--------|--------------|--------|--------------|------------|
| Username enumeration | Different errors for valid/invalid email | Medium | V2.1.5 | Generic error messages |
| Error leakage | Stack trace in response | Medium | V7.1.1 | Generic error handling |

#### D - Denial of Service (Availability)

| Threat | Attack Vector | Impact | ASVS Control | Mitigation |
|--------|--------------|--------|--------------|------------|
| Login flood | Automated login attempts | Medium | V13.2.5 | Rate limiting |

#### E - Elevation of Privilege (Authorization)

| Threat | Attack Vector | Impact | ASVS Control | Mitigation |
|--------|--------------|--------|--------------|------------|
| Session fixation | Inject known session ID | High | V3.3.1 | Regenerate on auth |

### Security Tests Derived

| Test | ASVS Ref | Type | Priority |
|------|----------|------|----------|
| should lock account after 5 failed attempts | V2.1.7 | Integration | P1 |
| should rate limit login attempts | V2.2.1 | Integration | P1 |
| should block SQL injection in email | V5.3.1 | Unit | P1 |
| should not reveal if email exists | V2.1.5 | Integration | P1 |
| should regenerate session on login | V3.3.1 | Unit | P1 |
| should set Secure, HttpOnly, SameSite on cookie | V3.4.1-3 | Unit | P2 |
```

## Integration with RLM Agents

### Coder Agent (`RLM/prompts/04-IMPLEMENT-TASK.md`)
Before implementing security-sensitive features:
```
Apply the threat-modeling pattern from RLM/prompts/patterns/threat-modeling.md:
- Feature: [description]
- Data handled: [what sensitive data]
- Derive security tests from STRIDE analysis
```

### Reviewer Agent
During security review:
```
Verify threat model exists and security tests cover identified threats.
```

### Tester Agent
When writing security tests:
```
Reference the threat model for test coverage - each identified threat
should have corresponding test(s).
```

## STRIDE Quick Reference

| Category | Question | Example Threats | Common ASVS Controls |
|----------|----------|-----------------|---------------------|
| **S**poofing | Can identity be forged? | Credential theft, session hijacking | V2, V3 |
| **T**ampering | Can data be modified? | SQL injection, parameter tampering | V5 |
| **R**epudiation | Can actions be denied? | Missing audit logs | V7 |
| **I**nfo Disclosure | Can data leak? | Error messages, logs | V7, V8 |
| **D**oS | Can availability be impacted? | Resource exhaustion, floods | V13 |
| **E**levation | Can access be escalated? | IDOR, privilege bypass | V4 |

## Tips for Effective Threat Modeling

1. **Focus on data flows** - Follow data from entry to storage to output
2. **Question every trust boundary** - Where does validated become unvalidated?
3. **Derive tests immediately** - Each threat should map to at least one security test
4. **Prioritize by impact** - Not all threats are equal; focus on high-impact first
5. **Update as features evolve** - Threat models should be living documents
