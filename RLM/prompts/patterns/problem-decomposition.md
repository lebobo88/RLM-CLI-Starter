# Problem Decomposition Pattern (RLM v2.7)

> **Part of**: RLM Prompt Pattern Library - See `RLM/START-HERE.md` for workflow overview.

## Purpose
Use this pattern for **breaking down complex tasks**, **systematic problem-solving**, and **structured analysis**. It provides a methodical approach to understanding and solving multi-faceted problems.

## When to Use
- Complex feature implementation
- Multi-step bug fixes
- System design challenges
- Refactoring large codebases
- Any task that feels "too big" to start

## Template

```
## Problem Decomposition

### Problem Statement
{CLEAR_DESCRIPTION_OF_THE_PROBLEM}

### Success Criteria
What does "solved" look like?
- [ ] {CRITERION_1}
- [ ] {CRITERION_2}
- [ ] {CRITERION_3}

---

### Step 1: Clarify the Core Issue

**Primary Problem**: {WHAT_IS_THE_MAIN_THING_TO_SOLVE}

**Constraints**:
- {CONSTRAINT_1}
- {CONSTRAINT_2}
- {CONSTRAINT_3}

**Desired Outcomes**:
- {OUTCOME_1}
- {OUTCOME_2}
- {OUTCOME_3}

---

### Step 2: Identify Relevant Factors

**Key Variables**:
| Variable | Current State | Target State | Impact |
|----------|--------------|--------------|--------|
| {VAR_1} | {CURRENT} | {TARGET} | High/Med/Low |
| {VAR_2} | {CURRENT} | {TARGET} | High/Med/Low |
| {VAR_3} | {CURRENT} | {TARGET} | High/Med/Low |

**Assumptions**:
- {ASSUMPTION_1} - Confidence: {HIGH/MED/LOW}
- {ASSUMPTION_2} - Confidence: {HIGH/MED/LOW}
- {ASSUMPTION_3} - Confidence: {HIGH/MED/LOW}

**Unknowns** (need investigation):
- [ ] {UNKNOWN_1}
- [ ] {UNKNOWN_2}
- [ ] {UNKNOWN_3}

---

### Step 3: Decompose Into Sub-Problems

```
Main Problem
├── Sub-Problem 1: {NAME}
│   ├── Task 1.1: {TASK}
│   ├── Task 1.2: {TASK}
│   └── Task 1.3: {TASK}
│
├── Sub-Problem 2: {NAME}
│   ├── Task 2.1: {TASK}
│   └── Task 2.2: {TASK}
│
├── Sub-Problem 3: {NAME}
│   ├── Task 3.1: {TASK}
│   ├── Task 3.2: {TASK}
│   └── Task 3.3: {TASK}
│
└── Integration/Testing
    ├── Task 4.1: {TASK}
    └── Task 4.2: {TASK}
```

---

### Step 4: Analyze Dependencies

**Dependency Graph**:
```
[Task 1.1] ──► [Task 1.2] ──► [Task 2.1]
                   │              │
                   ▼              ▼
              [Task 1.3]    [Task 3.1]
                   │              │
                   └──────┬───────┘
                          ▼
                    [Task 4.1]
                          │
                          ▼
                    [Task 4.2]
```

**Critical Path**: {SEQUENCE_OF_TASKS_THAT_DETERMINES_MINIMUM_TIME}

**Parallelizable Tasks**: {TASKS_THAT_CAN_RUN_CONCURRENTLY}

---

### Step 5: Prioritize & Sequence

| Priority | Task | Dependencies | Effort | Risk |
|----------|------|--------------|--------|------|
| 1 | {TASK} | None | {S/M/L} | {LOW/MED/HIGH} |
| 2 | {TASK} | Task 1 | {S/M/L} | {LOW/MED/HIGH} |
| 3 | {TASK} | Task 1, 2 | {S/M/L} | {LOW/MED/HIGH} |
| ... | ... | ... | ... | ... |

---

### Step 6: Identify Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| {RISK_1} | Low/Med/High | Low/Med/High | {MITIGATION} |
| {RISK_2} | Low/Med/High | Low/Med/High | {MITIGATION} |
| {RISK_3} | Low/Med/High | Low/Med/High | {MITIGATION} |

---

### Step 7: Define Checkpoints

**Checkpoint 1**: After {TASK_OR_MILESTONE}
- Verify: {WHAT_TO_CHECK}
- Success criteria: {HOW_TO_KNOW_IT_WORKED}

**Checkpoint 2**: After {TASK_OR_MILESTONE}
- Verify: {WHAT_TO_CHECK}
- Success criteria: {HOW_TO_KNOW_IT_WORKED}

**Final Checkpoint**: Complete
- All success criteria met
- Tests passing
- Documentation updated

---

### Execution Plan

**Phase 1: {NAME}** (Tasks 1.1-1.3)
- Goal: {PHASE_GOAL}
- Deliverable: {WHAT_IS_PRODUCED}

**Phase 2: {NAME}** (Tasks 2.1-2.2)
- Goal: {PHASE_GOAL}
- Deliverable: {WHAT_IS_PRODUCED}

**Phase 3: {NAME}** (Tasks 3.1-3.3)
- Goal: {PHASE_GOAL}
- Deliverable: {WHAT_IS_PRODUCED}

**Phase 4: Integration** (Tasks 4.1-4.2)
- Goal: {PHASE_GOAL}
- Deliverable: {WHAT_IS_PRODUCED}
```

## Example Usage

```
## Problem Decomposition

### Problem Statement
Implement user authentication with email/password login, OAuth (Google, GitHub), and password reset functionality.

### Success Criteria
- [ ] Users can register with email/password
- [ ] Users can login with email/password
- [ ] Users can login with Google OAuth
- [ ] Users can login with GitHub OAuth
- [ ] Users can reset forgotten passwords
- [ ] Sessions persist across page refreshes
- [ ] All auth flows have proper error handling

---

### Step 1: Clarify the Core Issue

**Primary Problem**: Build a complete authentication system supporting multiple login methods

**Constraints**:
- Must use Next.js App Router
- Must store sessions securely (HttpOnly cookies)
- Must support mobile responsive login forms
- Budget: No paid auth services (no Auth0, Clerk)

**Desired Outcomes**:
- Secure, production-ready authentication
- Good UX with clear error messages
- Easy to extend with more OAuth providers later

---

### Step 2: Identify Relevant Factors

**Key Variables**:
| Variable | Current State | Target State | Impact |
|----------|--------------|--------------|--------|
| Auth library | None | NextAuth.js | High |
| User table | None | Prisma schema | High |
| Session storage | None | JWT + cookies | High |
| OAuth credentials | None | Configured | Medium |

**Assumptions**:
- NextAuth.js is the right library choice - Confidence: HIGH
- PostgreSQL is available for user storage - Confidence: HIGH
- Email service (Resend) available for password reset - Confidence: MEDIUM

**Unknowns**:
- [x] Does NextAuth support App Router? → Yes, via next-auth@5
- [ ] Rate limiting strategy for login attempts
- [ ] Session duration requirements

---

### Step 3: Decompose Into Sub-Problems

```
Authentication System
├── Sub-Problem 1: Database & Schema
│   ├── Task 1.1: Create User model in Prisma
│   ├── Task 1.2: Create Account model (OAuth)
│   └── Task 1.3: Create Session model
│
├── Sub-Problem 2: Email/Password Auth
│   ├── Task 2.1: Implement registration endpoint
│   ├── Task 2.2: Implement login endpoint
│   └── Task 2.3: Create login/register UI forms
│
├── Sub-Problem 3: OAuth Integration
│   ├── Task 3.1: Configure Google OAuth provider
│   ├── Task 3.2: Configure GitHub OAuth provider
│   └── Task 3.3: Create OAuth callback handling
│
├── Sub-Problem 4: Password Reset
│   ├── Task 4.1: Create password reset request endpoint
│   ├── Task 4.2: Create password reset email template
│   └── Task 4.3: Create password reset form and endpoint
│
└── Sub-Problem 5: Integration & Testing
    ├── Task 5.1: Session persistence and middleware
    ├── Task 5.2: Protected route wrapper
    └── Task 5.3: E2E tests for all flows
```

---

### Step 4: Analyze Dependencies

```
[1.1 User Model] ──► [1.2 Account Model] ──► [2.1 Registration]
       │                                           │
       ▼                                           ▼
[1.3 Session Model]                          [2.2 Login]
       │                                           │
       └─────────────────┬─────────────────────────┘
                         ▼
                   [2.3 UI Forms]
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   [3.1 Google]    [3.2 GitHub]    [4.1 Reset Request]
        │                │                │
        └────────┬───────┘                ▼
                 ▼                  [4.2 Email Template]
           [3.3 Callbacks]                │
                 │                        ▼
                 └────────┬───────[4.3 Reset Form]
                          ▼
                    [5.1 Sessions]
                          │
                          ▼
                    [5.2 Protected Routes]
                          │
                          ▼
                    [5.3 E2E Tests]
```

**Critical Path**: 1.1 → 1.2 → 2.1 → 2.2 → 2.3 → 5.1 → 5.2 → 5.3

**Parallelizable**:
- Tasks 3.1, 3.2, 4.1 can run in parallel after 2.3

---

### Step 5: Prioritize & Sequence

| Priority | Task | Dependencies | Effort | Risk |
|----------|------|--------------|--------|------|
| 1 | 1.1 User Model | None | S | LOW |
| 2 | 1.2 Account Model | 1.1 | S | LOW |
| 3 | 1.3 Session Model | 1.1 | S | LOW |
| 4 | 2.1 Registration | 1.1, 1.2 | M | MED |
| 5 | 2.2 Login | 2.1 | M | MED |
| 6 | 2.3 UI Forms | 2.2 | M | LOW |
| 7 | 3.1 Google OAuth | 2.3 | S | MED |
| 8 | 3.2 GitHub OAuth | 2.3 | S | MED |
| 9 | 4.1-4.3 Password Reset | 2.3 | M | MED |
| 10 | 5.1-5.3 Integration | All above | L | HIGH |

---

### Execution Plan

**Phase 1: Foundation** (Tasks 1.1-1.3)
- Goal: Database schema ready for auth
- Deliverable: Prisma migrations applied

**Phase 2: Core Auth** (Tasks 2.1-2.3)
- Goal: Working email/password authentication
- Deliverable: Users can register and login

**Phase 3: OAuth** (Tasks 3.1-3.3)
- Goal: Social login working
- Deliverable: Google and GitHub login functional

**Phase 4: Password Reset** (Tasks 4.1-4.3)
- Goal: Self-service password recovery
- Deliverable: Complete password reset flow

**Phase 5: Polish** (Tasks 5.1-5.3)
- Goal: Production-ready auth system
- Deliverable: All tests passing, middleware configured
```

## Integration with RLM Agents

### Coder Agent (`RLM/prompts/04-IMPLEMENT-TASK.md`)
When tackling complex implementation tasks:
```
Apply the problem-decomposition pattern from RLM/prompts/patterns/problem-decomposition.md to break down:
- Feature: [feature name]
- Complexity: [why it's complex]
- Constraints: [time, tech, etc.]
```

### Architect Agent (`RLM/prompts/02-CREATE-SPECS.md`)
When designing systems:
```
Use problem-decomposition to structure:
- System design challenges
- Migration planning
- Integration architecture
```

## Decomposition Strategies

### By Layer
- Data layer (models, database)
- Business logic (services, validation)
- API layer (endpoints, middleware)
- UI layer (components, pages)

### By Feature
- Core functionality first
- Secondary features
- Nice-to-have features

### By Risk
- High-risk/unknown items first
- Validate assumptions early
- Defer low-risk work

### By User Flow
- Primary user journey
- Edge cases
- Error paths

## Tips for Effective Decomposition

1. **Start with the end** - Define success criteria before decomposing
2. **No task should take more than 4 hours** - If longer, decompose further
3. **Identify dependencies early** - They determine sequencing
4. **Include integration tasks** - Parts need to work together
5. **Add buffer for unknowns** - Investigation tasks may reveal more work
6. **Checkpoint frequently** - Catch issues early before they compound
