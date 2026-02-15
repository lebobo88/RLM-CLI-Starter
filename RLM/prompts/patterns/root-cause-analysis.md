# Root Cause Analysis Pattern (RLM v2.7)

> **Part of**: RLM Prompt Pattern Library - See `RLM/START-HERE.md` for workflow overview.

## Purpose
Use this pattern for **bug investigation**, **error diagnosis**, and **failure analysis**. It provides a structured approach to identify the underlying cause of problems rather than just treating symptoms.

## When to Use
- Bug investigation after test failures
- Production error analysis
- Build or deployment failures
- Performance degradation root cause
- Recurring issues that keep resurfacing

## Template

```
## Root Cause Analysis

### Problem Statement
{PROBLEM}

### Immediate Observable Effects
- Effect 1: {EFFECT}
- Effect 2: {EFFECT}
- Effect 3: {EFFECT}

### 5 Whys Analysis

1. **Why does this occur?**
   → {ANSWER_1}

2. **Why is that?**
   → {ANSWER_2}

3. **Why is that?**
   → {ANSWER_3}

4. **Why is that?**
   → {ANSWER_4}

5. **Why is that?**
   → {ANSWER_5}

### Contributing Factors

| Factor | Category | Impact | Controllable? |
|--------|----------|--------|---------------|
| {FACTOR_1} | Code/Process/Environment | High/Medium/Low | Yes/No |
| {FACTOR_2} | Code/Process/Environment | High/Medium/Low | Yes/No |
| {FACTOR_3} | Code/Process/Environment | High/Medium/Low | Yes/No |

### Root Cause(s)
1. **Primary**: {ROOT_CAUSE_1}
2. **Secondary**: {ROOT_CAUSE_2} (if applicable)

### Evidence Supporting Root Cause
- {EVIDENCE_1}
- {EVIDENCE_2}
- {EVIDENCE_3}

### Preventive Measures

| Measure | Type | Effort | Priority |
|---------|------|--------|----------|
| {MEASURE_1} | Fix/Process/Tool | Low/Medium/High | P1/P2/P3 |
| {MEASURE_2} | Fix/Process/Tool | Low/Medium/High | P1/P2/P3 |
| {MEASURE_3} | Fix/Process/Tool | Low/Medium/High | P1/P2/P3 |

### Implementation Strategy
{STRATEGY}

### Verification Plan
How to verify the fix addresses the root cause:
1. {VERIFICATION_STEP_1}
2. {VERIFICATION_STEP_2}
3. {VERIFICATION_STEP_3}
```

## Example Usage

```
## Root Cause Analysis

### Problem Statement
Users report intermittent 500 errors when submitting the contact form.

### Immediate Observable Effects
- HTTP 500 response returned to client
- Error logged: "Connection refused to SMTP server"
- Form submission data lost (not saved to database)

### 5 Whys Analysis

1. **Why does this occur?**
   → The email service connection fails when sending confirmation email.

2. **Why is that?**
   → The SMTP connection pool exhausts available connections.

3. **Why is that?**
   → Connections are not being properly released after sending emails.

4. **Why is that?**
   → The email service wrapper lacks proper connection cleanup in error paths.

5. **Why is that?**
   → The original implementation assumed all sends succeed; no error handling was added.

### Contributing Factors

| Factor | Category | Impact | Controllable? |
|--------|----------|--------|---------------|
| Missing connection cleanup | Code | High | Yes |
| No retry logic | Code | Medium | Yes |
| Low connection pool limit | Environment | Medium | Yes |
| High traffic spikes | Environment | Low | No |

### Root Cause(s)
1. **Primary**: Email service wrapper does not release connections on failure
2. **Secondary**: No transaction rollback when email fails

### Evidence Supporting Root Cause
- Connection pool monitoring shows 100% utilization before errors
- Errors correlate with high email volume periods
- Manual connection reset resolves issue temporarily

### Preventive Measures

| Measure | Type | Effort | Priority |
|---------|------|--------|----------|
| Add finally block to release connections | Fix | Low | P1 |
| Implement retry with exponential backoff | Fix | Medium | P2 |
| Increase connection pool limit | Environment | Low | P2 |
| Add circuit breaker pattern | Fix | High | P3 |

### Implementation Strategy
1. Immediate: Add connection cleanup in finally block
2. Short-term: Implement retry logic with backoff
3. Medium-term: Add circuit breaker and fallback queue

### Verification Plan
1. Unit test: Verify connection released on both success and failure paths
2. Integration test: Simulate SMTP failure, verify no connection leak
3. Load test: Send 1000 emails, verify connection pool stable
```

## Integration with RLM Agents

### Coder Agent (`RLM/prompts/04-IMPLEMENT-TASK.md`)
When investigating bugs, invoke this pattern:
```
Apply the root-cause-analysis pattern from RLM/prompts/patterns/root-cause-analysis.md to investigate:
- Problem: [description]
- Observed behavior: [what's happening]
- Expected behavior: [what should happen]
```

### Tester Agent (`RLM/prompts/07-TEST.md`)
When test failures occur:
```
Use root-cause-analysis to understand:
- Which tests are failing
- Error messages and stack traces
- Recent code changes that might be related
```

## Tips for Effective Analysis

1. **Don't stop at the first answer** - Push through all 5 whys even if you think you found the cause early
2. **Gather evidence** - Each answer should be supported by logs, metrics, or code inspection
3. **Consider multiple branches** - Some problems have multiple root causes
4. **Distinguish correlation from causation** - Just because two things happen together doesn't mean one causes the other
5. **Focus on systemic issues** - Look for process or design flaws, not just individual mistakes
