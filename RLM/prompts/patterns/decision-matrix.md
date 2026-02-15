# Decision Matrix Pattern (RLM v2.7)

> **Part of**: RLM Prompt Pattern Library - See `RLM/START-HERE.md` for workflow overview.

## Purpose
Use this pattern for **technology selection**, **architectural decisions**, and **feature prioritization**. It provides a weighted, objective framework for comparing multiple options against defined criteria.

## When to Use
- Technology stack selection
- Framework or library comparison
- Vendor/tool evaluation
- Architecture pattern decisions
- Feature prioritization for MVP
- Trade-off analysis

## Template

```
## Decision Matrix

### Decision Required
{DECISION_QUESTION}

### Options Under Consideration
1. **Option A**: {OPTION_A_NAME} - {BRIEF_DESCRIPTION}
2. **Option B**: {OPTION_B_NAME} - {BRIEF_DESCRIPTION}
3. **Option C**: {OPTION_C_NAME} - {BRIEF_DESCRIPTION}

### Evaluation Criteria & Weights

| Criterion | Weight | Rationale |
|-----------|--------|-----------|
| {CRITERION_1} | {WEIGHT}% | {WHY_IMPORTANT} |
| {CRITERION_2} | {WEIGHT}% | {WHY_IMPORTANT} |
| {CRITERION_3} | {WEIGHT}% | {WHY_IMPORTANT} |
| {CRITERION_4} | {WEIGHT}% | {WHY_IMPORTANT} |
| {CRITERION_5} | {WEIGHT}% | {WHY_IMPORTANT} |
| **Total** | **100%** | |

### Scoring Matrix

**Scale: 1-5** (1 = Poor, 2 = Below Average, 3 = Average, 4 = Good, 5 = Excellent)

| Criterion (Weight) | Option A | Option B | Option C | Notes |
|--------------------|----------|----------|----------|-------|
| {CRIT_1} ({W1}%) | {SCORE} | {SCORE} | {SCORE} | {EVIDENCE} |
| {CRIT_2} ({W2}%) | {SCORE} | {SCORE} | {SCORE} | {EVIDENCE} |
| {CRIT_3} ({W3}%) | {SCORE} | {SCORE} | {SCORE} | {EVIDENCE} |
| {CRIT_4} ({W4}%) | {SCORE} | {SCORE} | {SCORE} | {EVIDENCE} |
| {CRIT_5} ({W5}%) | {SCORE} | {SCORE} | {SCORE} | {EVIDENCE} |

### Weighted Scores

| Option | Raw Score | Weighted Score | Rank |
|--------|-----------|----------------|------|
| Option A | {SUM_A}/25 | {WEIGHTED_A}/5.0 | {RANK} |
| Option B | {SUM_B}/25 | {WEIGHTED_B}/5.0 | {RANK} |
| Option C | {SUM_C}/25 | {WEIGHTED_C}/5.0 | {RANK} |

### Risk Assessment

| Option | Key Risks | Mitigation | Risk Level |
|--------|-----------|------------|------------|
| Option A | {RISKS} | {MITIGATION} | Low/Medium/High |
| Option B | {RISKS} | {MITIGATION} | Low/Medium/High |
| Option C | {RISKS} | {MITIGATION} | Low/Medium/High |

### Recommendation

**Selected Option**: {OPTION}

**Confidence Level**: {HIGH/MEDIUM/LOW}

**Rationale**:
{DETAILED_REASONING}

### Implementation Notes
{ANY_CAVEATS_OR_NEXT_STEPS}
```

## Example Usage

```
## Decision Matrix

### Decision Required
Which state management solution should we use for the React application?

### Options Under Consideration
1. **Option A**: Redux Toolkit - Industry standard, robust ecosystem
2. **Option B**: Zustand - Lightweight, minimal boilerplate
3. **Option C**: Jotai - Atomic state model, React-first

### Evaluation Criteria & Weights

| Criterion | Weight | Rationale |
|-----------|--------|-----------|
| Learning Curve | 20% | Team has limited React experience |
| Bundle Size | 15% | Mobile-first app, performance critical |
| DevTools Support | 15% | Debug efficiency important for timeline |
| Ecosystem/Community | 25% | Need reliable long-term support |
| Scalability | 25% | App will grow significantly |
| **Total** | **100%** | |

### Scoring Matrix

| Criterion (Weight) | Redux TK | Zustand | Jotai | Notes |
|--------------------|----------|---------|-------|-------|
| Learning Curve (20%) | 3 | 5 | 4 | Redux has more concepts to learn |
| Bundle Size (15%) | 3 | 5 | 5 | Redux ~12KB, others ~2-3KB |
| DevTools Support (15%) | 5 | 4 | 3 | Redux DevTools most mature |
| Ecosystem (25%) | 5 | 3 | 3 | Redux has largest ecosystem |
| Scalability (25%) | 5 | 4 | 4 | Redux proven at scale |

### Weighted Scores

| Option | Raw Score | Weighted Score | Rank |
|--------|-----------|----------------|------|
| Redux Toolkit | 21/25 | 4.30/5.0 | 1 |
| Zustand | 21/25 | 4.05/5.0 | 2 |
| Jotai | 19/25 | 3.75/5.0 | 3 |

### Risk Assessment

| Option | Key Risks | Mitigation | Risk Level |
|--------|-----------|------------|------------|
| Redux TK | Steeper learning curve, more boilerplate | Team training, use RTK Query | Medium |
| Zustand | Smaller ecosystem, less enterprise adoption | Document patterns, create conventions | Medium |
| Jotai | Newest option, fewer examples | Start with simple patterns | High |

### Recommendation

**Selected Option**: Redux Toolkit

**Confidence Level**: HIGH

**Rationale**:
Despite the steeper learning curve, Redux Toolkit scores highest due to its proven scalability and mature ecosystem. Given the project will grow significantly (25% weight on scalability) and needs long-term support (25% weight on ecosystem), Redux Toolkit's advantages in these high-priority areas outweigh its disadvantages in learning curve and bundle size. The excellent DevTools support will help offset the learning curve during development.

### Implementation Notes
- Use RTK Query for API state management
- Create shared slice patterns documentation
- Consider Zustand for isolated feature modules if Redux overhead becomes apparent
```

## Integration with RLM Agents

### Architect Agent (`RLM/prompts/02-CREATE-SPECS.md`)
When making technology decisions:
```
Apply the decision-matrix pattern from RLM/prompts/patterns/decision-matrix.md to evaluate:
- Decision: [what needs to be decided]
- Options: [list of options to consider]
- Key constraints: [budget, timeline, team skills, etc.]
```

### Coder Agent (`RLM/prompts/04-IMPLEMENT-TASK.md`)
When choosing implementation approaches:
```
Use decision-matrix to compare:
- Different algorithms or data structures
- Library options for specific functionality
- Design patterns for the feature
```

## Common Criteria by Decision Type

### Technology Stack Selection
- Learning Curve (team capability)
- Community/Ecosystem Size
- Performance Characteristics
- Security Track Record
- Long-term Maintenance/Support
- Integration with Existing Stack
- Cost (licensing, hosting)

### Framework Comparison
- Bundle Size
- Documentation Quality
- TypeScript Support
- Testing Utilities
- Migration Path
- Corporate Backing

### Feature Prioritization
- User Impact
- Business Value
- Implementation Effort
- Technical Risk
- Dependency on Other Features
- Revenue Potential

## Tips for Effective Decisions

1. **Weight criteria BEFORE scoring** - Prevents bias toward preferred option
2. **Use evidence, not opinions** - Back scores with benchmarks, docs, or research
3. **Include disqualifying criteria** - Some options may be non-starters regardless of score
4. **Document assumptions** - Future reviewers need context
5. **Revisit decisions** - Schedule review if key assumptions change
