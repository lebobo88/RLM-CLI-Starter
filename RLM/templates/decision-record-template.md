# Architecture Decision Record: [ADR-XXX] [Title]

**Date**: YYYY-MM-DD
**Status**: PROPOSED | ACCEPTED | DEPRECATED | SUPERSEDED
**Deciders**: [Names/Roles]
**Supersedes**: [ADR-XXX if applicable]

---

## Context

### Problem Statement
[What problem are we trying to solve? What is the current situation?]

### Drivers
Why is this decision needed now?
- [Driver 1: e.g., New feature requirement]
- [Driver 2: e.g., Performance issues at scale]
- [Driver 3: e.g., Technical debt]

### Constraints
What limitations must we work within?
- **Technical**: [e.g., Must integrate with existing system X]
- **Business**: [e.g., Budget of $Y, timeline of Z months]
- **Team**: [e.g., Team expertise in technology A, not B]
- **Compliance**: [e.g., Must meet GDPR requirements]

---

## Decision

### Selected Option
**We will**: [Clear statement of the decision]

### Rationale
[2-3 sentences explaining why this option was chosen over alternatives]

### Confidence Level
- [ ] **HIGH (>90%)**: Clear best choice, proven patterns
- [ ] **MEDIUM (60-90%)**: Trade-offs exist, context-dependent
- [ ] **LOW (<60%)**: Novel requirements, needs validation

---

## Options Considered

### Option A: [Name] - SELECTED
**Description**: [What this option involves]

**Pros**:
- [Advantage 1]
- [Advantage 2]
- [Advantage 3]

**Cons**:
- [Disadvantage 1]
- [Disadvantage 2]

**Effort**: LOW | MEDIUM | HIGH
**Risk**: LOW | MEDIUM | HIGH

---

### Option B: [Name] - REJECTED
**Description**: [What this option involves]

**Pros**:
- [Advantage 1]
- [Advantage 2]

**Cons**:
- [Disadvantage 1]
- [Disadvantage 2]

**Rejection Reason**: [Why this wasn't chosen]

---

### Option C: [Name] - REJECTED
**Description**: [What this option involves]

**Pros**:
- [Advantage 1]
- [Advantage 2]

**Cons**:
- [Disadvantage 1]
- [Disadvantage 2]

**Rejection Reason**: [Why this wasn't chosen]

---

## Comparison Matrix

| Criterion | Weight | Option A | Option B | Option C |
|-----------|--------|----------|----------|----------|
| Performance | 25% | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Maintainability | 20% | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Team Expertise | 20% | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Cost | 15% | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Time to Implement | 20% | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Weighted Score** | | **4.1** | **3.2** | **3.3** |

---

## Consequences

### Positive
- [Positive outcome 1]
- [Positive outcome 2]
- [Positive outcome 3]

### Negative
- [Trade-off or negative outcome 1]
- [Trade-off or negative outcome 2]

### Neutral
- [Change that isn't clearly positive or negative]

---

## Risks and Mitigation

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| [Risk 1] | LOW/MED/HIGH | LOW/MED/HIGH | [How to address] |
| [Risk 2] | LOW/MED/HIGH | LOW/MED/HIGH | [How to address] |
| [Risk 3] | LOW/MED/HIGH | LOW/MED/HIGH | [How to address] |

---

## Implementation Notes

### Prerequisites
- [ ] [Prerequisite 1]
- [ ] [Prerequisite 2]

### Migration Path (if applicable)
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Rollback Plan
[How to revert this decision if it doesn't work out]

---

## Validation Criteria

How will we know this decision was correct?
- [ ] [Measurable success criterion 1]
- [ ] [Measurable success criterion 2]
- [ ] [Measurable success criterion 3]

**Review Date**: [When to evaluate this decision]

---

## Related Documents

- [Link to related ADR]
- [Link to related spec]
- [Link to PRD section]

---

## Revision History

| Date | Author | Description |
|------|--------|-------------|
| YYYY-MM-DD | [Name] | Initial proposal |
| YYYY-MM-DD | [Name] | Status changed to ACCEPTED |

---

## Quick Reference

```
ADR-XXX: [Short Title]
Status: [PROPOSED|ACCEPTED|DEPRECATED|SUPERSEDED]
Decision: [One-line summary]
Confidence: [HIGH|MEDIUM|LOW]
```
