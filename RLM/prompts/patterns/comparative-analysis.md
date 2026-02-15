# Comparative Analysis Pattern (RLM v2.7)

> **Part of**: RLM Prompt Pattern Library - See `RLM/START-HERE.md` for workflow overview.

## Purpose
Use this pattern for **comparing two or more approaches**, **evaluating alternatives**, and **making informed trade-off decisions**. It provides a structured framework for objective comparison with evidence-based reasoning.

## When to Use
- Comparing architectural approaches
- Evaluating implementation strategies
- Assessing different solutions to the same problem
- Feature comparison between competing products/services
- Trade-off analysis between quality attributes

## Template

```
## Comparative Analysis

### Comparison Subject
**Comparing**: {OPTION_A} vs {OPTION_B} [vs {OPTION_C}]

**Context**: {WHY_THIS_COMPARISON_MATTERS}

**Decision Deadline**: {WHEN_DECISION_NEEDED}

### Executive Summary

| Aspect | Option A | Option B | Verdict |
|--------|----------|----------|---------|
| Best for | {USE_CASE} | {USE_CASE} | - |
| Avoid when | {ANTI_PATTERN} | {ANTI_PATTERN} | - |
| Overall | {EMOJI_RATING} | {EMOJI_RATING} | {WINNER} |

### Detailed Comparison

#### Dimension 1: {DIMENSION_NAME}

| Aspect | Option A | Option B | Evidence |
|--------|----------|----------|----------|
| {ASPECT_1} | {A_VALUE} | {B_VALUE} | {SOURCE} |
| {ASPECT_2} | {A_VALUE} | {B_VALUE} | {SOURCE} |
| {ASPECT_3} | {A_VALUE} | {B_VALUE} | {SOURCE} |
| **Dimension Winner** | {SCORE}/5 | {SCORE}/5 | **{WINNER}** |

#### Dimension 2: {DIMENSION_NAME}

| Aspect | Option A | Option B | Evidence |
|--------|----------|----------|----------|
| {ASPECT_1} | {A_VALUE} | {B_VALUE} | {SOURCE} |
| {ASPECT_2} | {A_VALUE} | {B_VALUE} | {SOURCE} |
| **Dimension Winner** | {SCORE}/5 | {SCORE}/5 | **{WINNER}** |

#### Dimension 3: {DIMENSION_NAME}

| Aspect | Option A | Option B | Evidence |
|--------|----------|----------|----------|
| {ASPECT_1} | {A_VALUE} | {B_VALUE} | {SOURCE} |
| {ASPECT_2} | {A_VALUE} | {B_VALUE} | {SOURCE} |
| **Dimension Winner** | {SCORE}/5 | {SCORE}/5 | **{WINNER}** |

### Strengths & Weaknesses

#### Option A: {NAME}
**Strengths**:
- {STRENGTH_1}
- {STRENGTH_2}
- {STRENGTH_3}

**Weaknesses**:
- {WEAKNESS_1}
- {WEAKNESS_2}
- {WEAKNESS_3}

#### Option B: {NAME}
**Strengths**:
- {STRENGTH_1}
- {STRENGTH_2}
- {STRENGTH_3}

**Weaknesses**:
- {WEAKNESS_1}
- {WEAKNESS_2}
- {WEAKNESS_3}

### Cost Analysis

| Cost Type | Option A | Option B | Notes |
|-----------|----------|----------|-------|
| Initial Setup | {COST} | {COST} | {NOTES} |
| Ongoing/Month | {COST} | {COST} | {NOTES} |
| Hidden Costs | {COST} | {COST} | {NOTES} |
| **Total (1 Year)** | **{TOTAL}** | **{TOTAL}** | |

### Risk Comparison

| Risk | Option A | Option B |
|------|----------|----------|
| Technical Risk | {LOW/MED/HIGH} | {LOW/MED/HIGH} |
| Vendor Lock-in | {LOW/MED/HIGH} | {LOW/MED/HIGH} |
| Scalability Risk | {LOW/MED/HIGH} | {LOW/MED/HIGH} |
| Security Risk | {LOW/MED/HIGH} | {LOW/MED/HIGH} |

### Recommendation

**Recommended Option**: {OPTION}

**Confidence**: {HIGH/MEDIUM/LOW} ({PERCENTAGE}%)

**Key Deciding Factors**:
1. {FACTOR_1}
2. {FACTOR_2}
3. {FACTOR_3}

**When to Reconsider**: {CONDITIONS_THAT_WOULD_CHANGE_DECISION}
```

## Example Usage

```
## Comparative Analysis

### Comparison Subject
**Comparing**: Server-Side Rendering (SSR) vs Static Site Generation (SSG)

**Context**: Choosing rendering strategy for our e-commerce product catalog

**Decision Deadline**: Before sprint 3 begins

### Executive Summary

| Aspect | SSR | SSG | Verdict |
|--------|-----|-----|---------|
| Best for | Dynamic content, personalization | Mostly static content, SEO priority | - |
| Avoid when | Simple marketing sites | Highly dynamic data | - |
| Overall | 4/5 | 3.5/5 | **SSR** |

### Detailed Comparison

#### Dimension 1: Performance

| Aspect | SSR | SSG | Evidence |
|--------|-----|-----|----------|
| TTFB | 200-500ms | 50-100ms | Lighthouse testing |
| LCP | 1.5-2.5s | 0.8-1.2s | Core Web Vitals data |
| Cacheability | Limited | Excellent | CDN edge caching |
| **Dimension Winner** | 3/5 | 5/5 | **SSG** |

#### Dimension 2: Developer Experience

| Aspect | SSR | SSG | Evidence |
|--------|-----|-----|----------|
| Local dev speed | Fast | Fast | Both use hot reload |
| Build time | N/A (runtime) | 2-10 min | Next.js benchmarks |
| Data fetching | Simple | Complex (ISR needed) | Team feedback |
| **Dimension Winner** | 4/5 | 3/5 | **SSR** |

#### Dimension 3: Scalability

| Aspect | SSR | SSG | Evidence |
|--------|-----|-----|----------|
| Server costs | Higher | Lower | Vercel pricing |
| Traffic spikes | Requires scaling | CDN handles | Architecture docs |
| 10K products | Easy | Build time concern | Next.js docs |
| **Dimension Winner** | 4/5 | 3/5 | **SSR** |

### Strengths & Weaknesses

#### Option A: SSR
**Strengths**:
- Always fresh data without rebuild
- Easy personalization (user-specific content)
- No build time scaling issues

**Weaknesses**:
- Higher server costs under load
- Slower TTFB than static
- Requires server infrastructure

#### Option B: SSG
**Strengths**:
- Blazing fast TTFB
- Minimal server costs (CDN only)
- Excellent SEO out of the box

**Weaknesses**:
- Build time grows with content
- Stale data between builds
- Complex ISR configuration for freshness

### Cost Analysis

| Cost Type | SSR | SSG | Notes |
|-----------|-----|-----|-------|
| Initial Setup | $0 | $0 | Both supported by Next.js |
| Ongoing/Month | $200-500 | $50-100 | Based on 100K visitors |
| Hidden Costs | Scaling during sales | Rebuild infrastructure | |
| **Total (1 Year)** | **$3,600** | **$900** | |

### Risk Comparison

| Risk | SSR | SSG |
|------|-----|-----|
| Technical Risk | LOW | MEDIUM |
| Vendor Lock-in | LOW | LOW |
| Scalability Risk | MEDIUM | LOW |
| Security Risk | MEDIUM | LOW |

### Recommendation

**Recommended Option**: SSR with selective SSG

**Confidence**: HIGH (85%)

**Key Deciding Factors**:
1. Product catalog updates frequently (daily inventory changes)
2. Personalized pricing based on user location
3. 10K+ products makes full SSG rebuild impractical

**When to Reconsider**: If product count drops below 1K or pricing becomes static
```

## Integration with RLM Agents

### Architect Agent (`RLM/prompts/02-CREATE-SPECS.md`)
When evaluating architectural options:
```
Apply the comparative-analysis pattern from RLM/prompts/patterns/comparative-analysis.md to compare:
- Option A: [first approach]
- Option B: [second approach]
- Key dimensions: [performance, cost, maintainability, etc.]
```

### Research Agent (`RLM/prompts/01-DISCOVER.md`)
When researching alternatives:
```
Use comparative-analysis to structure findings on:
- Competing products/services
- Alternative technologies
- Different implementation approaches
```

## Common Dimensions by Category

### Infrastructure Decisions
- Performance (latency, throughput)
- Cost (setup, ongoing, scaling)
- Reliability (uptime, failover)
- Security (compliance, vulnerabilities)
- Operational complexity

### Code Architecture
- Maintainability
- Testability
- Performance
- Flexibility/extensibility
- Team familiarity

### Product Features
- User value delivered
- Implementation complexity
- Revenue impact
- Strategic alignment
- Technical debt introduced

## Tips for Effective Comparison

1. **Define dimensions before researching** - Prevents cherry-picking favorable criteria
2. **Use the same scale for all options** - Ensures fair comparison
3. **Include sources/evidence** - Makes analysis verifiable
4. **Consider time horizon** - Short-term vs long-term trade-offs
5. **Identify deal-breakers early** - Some issues may disqualify options regardless of other scores
6. **Get input from stakeholders** - Different perspectives on what matters most
