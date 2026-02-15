# Assumption Log: [Project Name]

**Last Updated**: YYYY-MM-DD
**Owner**: [Name/Role]

---

## Purpose

This document tracks all assumptions made during project planning and development. Assumptions are beliefs we hold to be true without definitive evidence. Tracking them helps us:
- Identify risks if assumptions prove incorrect
- Prioritize validation efforts
- Communicate uncertainty to stakeholders
- Make informed decisions about when to gather more data

---

## Assumption Categories

| Category | Description |
|----------|-------------|
| **BUSINESS** | Market, customers, revenue, competition |
| **TECHNICAL** | Architecture, performance, integrations |
| **USER** | User behavior, preferences, adoption |
| **RESOURCE** | Team, budget, timeline |
| **REGULATORY** | Compliance, legal, security |

---

## Assumption Registry

### Critical Assumptions (Must Validate Before Building)

| ID | Category | Assumption | Confidence | If Wrong, Impact | Validation Method | Status | Validated Date |
|----|----------|------------|------------|------------------|-------------------|--------|----------------|
| A-001 | | | HIGH/MED/LOW | | | OPEN/VALIDATING/VALIDATED/INVALID | |
| A-002 | | | HIGH/MED/LOW | | | OPEN/VALIDATING/VALIDATED/INVALID | |
| A-003 | | | HIGH/MED/LOW | | | OPEN/VALIDATING/VALIDATED/INVALID | |

### High Priority Assumptions

| ID | Category | Assumption | Confidence | If Wrong, Impact | Validation Method | Status | Validated Date |
|----|----------|------------|------------|------------------|-------------------|--------|----------------|
| A-010 | | | HIGH/MED/LOW | | | OPEN/VALIDATING/VALIDATED/INVALID | |
| A-011 | | | HIGH/MED/LOW | | | OPEN/VALIDATING/VALIDATED/INVALID | |

### Medium Priority Assumptions

| ID | Category | Assumption | Confidence | If Wrong, Impact | Validation Method | Status | Validated Date |
|----|----------|------------|------------|------------------|-------------------|--------|----------------|
| A-020 | | | HIGH/MED/LOW | | | OPEN/VALIDATING/VALIDATED/INVALID | |
| A-021 | | | HIGH/MED/LOW | | | OPEN/VALIDATING/VALIDATED/INVALID | |

### Low Priority Assumptions (Document but proceed)

| ID | Category | Assumption | Confidence | If Wrong, Impact | Validation Method | Status | Validated Date |
|----|----------|------------|------------|------------------|-------------------|--------|----------------|
| A-030 | | | HIGH/MED/LOW | | | OPEN/VALIDATING/VALIDATED/INVALID | |

---

## Detailed Assumption Records

### A-001: [Assumption Title]

**Statement**: [Clear statement of what we assume to be true]

**Category**: BUSINESS | TECHNICAL | USER | RESOURCE | REGULATORY

**Confidence Level**:
- [ ] HIGH (>80%): Strong evidence, industry standard, proven pattern
- [ ] MEDIUM (50-80%): Some evidence, reasonable inference
- [ ] LOW (<50%): Educated guess, needs validation

**Supporting Evidence**:
- [Evidence 1: source, data point]
- [Evidence 2: source, data point]

**If This Assumption Is Wrong**:
- **Impact on Product**: [What changes]
- **Impact on Timeline**: [Delay, rework needed]
- **Impact on Architecture**: [Technical changes required]
- **Severity**: CRITICAL | HIGH | MEDIUM | LOW

**Validation Plan**:
| Method | Owner | Due Date | Result |
|--------|-------|----------|--------|
| [Method 1] | [Name] | [Date] | PENDING/CONFIRMED/REFUTED |
| [Method 2] | [Name] | [Date] | PENDING/CONFIRMED/REFUTED |

**Status**: OPEN | VALIDATING | VALIDATED | INVALID

**Resolution Notes**: [What we learned, how we adapted]

---

### A-002: [Assumption Title]

[Repeat structure for each detailed assumption]

---

## Validation Methods Reference

| Method | Best For | Effort | Confidence Gained |
|--------|----------|--------|-------------------|
| Customer Interviews | User behavior, pain points | MEDIUM | HIGH |
| Surveys | Quantitative validation | LOW | MEDIUM |
| A/B Testing | Feature preferences | HIGH | HIGH |
| Prototype Testing | UX assumptions | MEDIUM | HIGH |
| Market Research | Competition, market size | LOW | MEDIUM |
| Technical POC | Architecture, performance | HIGH | HIGH |
| Analytics Review | Existing behavior | LOW | MEDIUM |
| Expert Consultation | Domain-specific | LOW | MEDIUM |

---

## Assumption Impact Matrix

Use this to prioritize which assumptions to validate first:

```
                    HIGH IMPACT
                         │
         ┌───────────────┼───────────────┐
         │   VALIDATE    │   VALIDATE    │
         │    FIRST      │    SOON       │
         │               │               │
LOW ─────┼───────────────┼───────────────┼───── HIGH
CONFIDENCE               │               │    CONFIDENCE
         │   MONITOR     │   DOCUMENT    │
         │   CLOSELY     │    ONLY       │
         │               │               │
         └───────────────┼───────────────┘
                         │
                    LOW IMPACT
```

| Priority | Criteria | Action |
|----------|----------|--------|
| 1. VALIDATE FIRST | Low confidence + High impact | Block progress until validated |
| 2. VALIDATE SOON | High confidence + High impact | Validate before major investment |
| 3. MONITOR CLOSELY | Low confidence + Low impact | Watch for signals, validate if convenient |
| 4. DOCUMENT ONLY | High confidence + Low impact | Note for posterity, proceed |

---

## Assumption Status Summary

| Status | Count | Notes |
|--------|-------|-------|
| OPEN | [X] | Not yet validated |
| VALIDATING | [X] | Currently being tested |
| VALIDATED | [X] | Confirmed correct |
| INVALID | [X] | Proven wrong, adapted |
| **TOTAL** | [X] | |

### Invalid Assumptions - Lessons Learned

| ID | Original Assumption | What We Learned | Adaptation Made |
|----|---------------------|-----------------|-----------------|
| A-XXX | [What we assumed] | [Reality] | [How we changed] |

---

## Review Schedule

| Review Type | Frequency | Next Review | Owner |
|-------------|-----------|-------------|-------|
| Full Review | Monthly | YYYY-MM-DD | [Name] |
| Critical Check | Weekly | YYYY-MM-DD | [Name] |
| Sprint Review | Per Sprint | [Sprint X] | [Name] |

---

## Quick Reference: Assumption Entry Template

Copy this template for new assumptions:

```markdown
### A-XXX: [Title]

**Statement**: [Clear assumption statement]
**Category**: BUSINESS | TECHNICAL | USER | RESOURCE | REGULATORY
**Confidence**: HIGH | MEDIUM | LOW
**If Wrong**: [Impact description]
**Validation Method**: [How to test]
**Owner**: [Name]
**Due Date**: [Date]
**Status**: OPEN
```
