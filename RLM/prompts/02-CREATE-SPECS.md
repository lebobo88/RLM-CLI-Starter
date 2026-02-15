# RLM Create Specs Prompt

## Purpose
Generate technical specifications from an existing PRD (Product Requirements Document).

## Instructions for AI

You are the RLM Master Architect. Your job is to transform a PRD into detailed technical specifications that guide implementation.

---

## Phase 1: Load PRD

Look for the PRD in this order:
1. `RLM/specs/PRD.md`
2. Ask user if they want to paste the PRD content
3. Ask for a file path to the PRD

Once you have the PRD, read it completely.

---

## Phase 1.5: Detect Project Type (Auto-Design Detection)

Before creating specs, determine if this project requires design phases.

### Step 1.5.1: Run Project Type Detection

Execute the detection protocol from `RLM/prompts/00-DETECT-PROJECT-TYPE.md`:

1. Scan PRD for UI indicators (+1 each):
   - "user interface", "UI", "frontend"
   - "screen", "page", "view", "route"
   - "button", "form", "input", "modal"
   - React, Vue, Angular, Next.js, Svelte
   - "responsive", "mobile", "tablet"
   - "dashboard", "layout", "navigation"

2. Scan PRD for Non-UI indicators (-1 each):
   - "CLI", "command line", "terminal"
   - "API only", "headless", "backend only"
   - "library", "package", "SDK"

3. Calculate Net Score = UI indicators - Non-UI indicators

### Step 1.5.2: Classify Project

| Net Score | Classification | DESIGN_REQUIRED |
|-----------|---------------|-----------------|
| >= 3 | UI Project | **true** |
| <= -2 | Non-UI Project | **false** |
| -1 to 2 | Ambiguous | Ask user |

### Step 1.5.3: Report Detection

```
┌─────────────────────────────────────────────────────────────────┐
│ Project Type Detection                                          │
├─────────────────────────────────────────────────────────────────┤
│ UI Indicators: [X] | Non-UI Indicators: [Y] | Net Score: [Z]   │
│                                                                 │
│ Classification: [UI PROJECT / NON-UI PROJECT]                   │
│ DESIGN_REQUIRED: [true/false]                                   │
│                                                                 │
│ Design phases will be [included/skipped].                       │
└─────────────────────────────────────────────────────────────────┘
```

### Step 1.5.4: Store Classification

This classification will be stored in:
- `RLM/specs/constitution.md` (Project Classification section)
- `RLM/progress/config.json` (design settings)

---

## Phase 1.6: Integration Documentation Lookup

Before creating specifications, fetch documentation for integrations mentioned in PRD.

### Step 1.6.1: Scan PRD for Integrations

From `RLM/specs/PRD.md`, extract:
- **Authentication providers**: NextAuth, Auth0, Clerk, Supabase Auth
- **Payment processors**: Stripe, PayPal, Square, Lemon Squeezy
- **Database/ORM**: Prisma, Drizzle, TypeORM, direct DB
- **External APIs**: Any third-party services mentioned
- **Cloud services**: AWS, GCP, Azure, Vercel, etc.
- **AI/ML services**: OpenAI, Anthropic, LangChain, etc.

### Step 1.6.2: Check Documentation Cache

```markdown
Read RLM/research/docs/index.json

For each integration:
  If cached AND not expired:
    integrations_cached.append(integration)
  Else:
    integrations_to_fetch.append(integration)
```

### Step 1.6.3: Fetch Missing Documentation

If integrations_to_fetch is not empty:

```markdown
Delegate to Research Sub-Agent:

Task: Integration Documentation Lookup
Integrations: [list]
Context: Create-Specs phase - need API details for specification writing

Topics needed per integration:
- Setup/configuration requirements
- API reference for planned features
- Authentication/authorization patterns
- Error codes and handling
- Rate limits and quotas
- Webhooks (if applicable)

Output:
- Cache to RLM/research/docs/[integration]/
- Return API summaries for spec writing
```

### Step 1.6.4: Anchor Critical Integration Standards

For security-critical integrations (auth, payments), trigger Knowledge Anchoring:

```markdown
Anchor to constitution.md:
- Security requirements from integration docs
- Required error handling patterns
- Compliance requirements (PCI-DSS for payments, etc.)

Anchor to RLM/specs/architecture/integrations/:
- Create [integration].md with setup guide
- API endpoint patterns
- Webhook handling requirements
```

### Step 1.6.5: Report Integration Documentation

```
┌─────────────────────────────────────────────────────────────────┐
│ Integration Documentation Ready                                  │
├─────────────────────────────────────────────────────────────────┤
│ PRD integrations detected and documented:                        │
│                                                                 │
│ ✓ Stripe - Fetched & Anchored (checkout, webhooks, PCI-DSS)     │
│ ✓ NextAuth - Cached (providers, callbacks, session)             │
│ ✓ Prisma - Cached (schema, queries)                             │
│                                                                 │
│ Standards anchored to:                                          │
│ - constitution.md (3 security standards)                        │
│ - RLM/specs/architecture/integrations/stripe.md (created)       │
│                                                                 │
│ This documentation will inform API specifications.               │
└─────────────────────────────────────────────────────────────────┘
```

### Step 1.6.6: Use in Specification Writing

When writing feature specifications (Phase 4):
- Reference correct API endpoint patterns from docs
- Use documented error codes in error handling specs
- Follow security requirements anchored to constitution
- Include webhook specifications from integration docs

---

## Phase 2: Validate PRD Completeness

Check that the PRD contains:
- [ ] Executive Summary
- [ ] Problem Statement
- [ ] User Personas
- [ ] User Stories with Acceptance Criteria
- [ ] Functional Requirements
- [ ] Non-Functional Requirements
- [ ] Technical Constraints

If critical sections are missing, inform the user:
> "The PRD is missing [sections]. Would you like to:
> 1. Add the missing information now
> 2. Proceed with assumptions (I'll document them)
> 3. Use `@rlm-discover` agent to generate a complete PRD"

---

## Phase 3: Create Constitution (if not exists)

Check if `RLM/specs/constitution.md` exists.

If not, create it using:
- Technology stack from PRD's Technical Constraints
- Non-functional requirements for quality standards
- Use `RLM/templates/CONSTITUTION-TEMPLATE.md` as the template

**Output**: `RLM/specs/constitution.md`

---

## Phase 4: Create Feature Specifications

For each major feature/epic in the PRD, create a detailed specification.

**Output Location**: `RLM/specs/features/FTR-XXX/spec.md`

Use this format for each feature:

```markdown
# Feature Specification: [Feature Name]

## Feature ID: FTR-XXX
## Status: Draft
## Priority: [From PRD]
## Epic: [Parent Epic]

## Overview
[Feature description from PRD]

## User Stories
[Copy relevant user stories from PRD]

### US-XXX: [Story Title]
As a [persona], I want [action], so that [benefit].

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

## Technical Design

### API Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/v1/[resource] | Create [resource] | Yes |
| GET | /api/v1/[resource] | List [resources] | Yes |

### Data Model
```typescript
interface [Resource] {
  id: string;
  // ... fields based on requirements
  createdAt: Date;
  updatedAt: Date;
}
```

### Business Logic
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Error Handling
| Scenario | Error Code | User Message |
|----------|------------|--------------|
| [Scenario] | [CODE] | [Message] |

## Security Considerations
- [ ] Authentication: [Details]
- [ ] Authorization: [Details]
- [ ] Input Validation: [Details]

## Performance Requirements
- Response time: [Target]
- Throughput: [Target]

## Testing Requirements
- Unit tests: [What to test]
- Integration tests: [What to test]
- E2E tests: [Critical paths]

## Dependencies
- [Dependency 1]
- [Dependency 2]

## Implementation Notes
[Any special considerations for implementation]

## Design Requirements (if DESIGN_REQUIRED)
{{IF DESIGN_REQUIRED == true}}

### UI Components
| Component | States Required | Accessibility |
|-----------|-----------------|---------------|
| [Component] | 8 states | ARIA labels, keyboard nav |

### User Flow
[Describe the step-by-step user interaction]

### Screen Layouts
[Reference to design spec or description of layouts]

### Design Tokens to Use
- Colors: `--color-primary`, `--color-secondary`
- Spacing: `--space-md`, `--space-lg`
- Typography: `--font-heading`, `--font-body`

### Animation Requirements
- Animation Tier: [MINIMAL/MODERATE/RICH]
- Transitions: [List key transitions]

### Accessibility Requirements
- WCAG 2.1 Level: AA (minimum)
- Focus management: [Details]
- Screen reader: [Details]
{{ENDIF}}
```

Create specs for ALL features in the PRD.

---

## Phase 5: Create Architecture Overview

**Output**: `RLM/specs/architecture/overview.md`

Include:

```markdown
# Architecture Overview

## System Context
[High-level description of how the system fits into the larger ecosystem]

## Technology Stack
| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| Frontend | [Tech] | [Ver] | [Why] |
| Backend | [Tech] | [Ver] | [Why] |
| Database | [Tech] | [Ver] | [Why] |
| Cache | [Tech] | [Ver] | [Why] |
| Infrastructure | [Tech] | N/A | [Why] |

## System Components
[Diagram using ASCII or description]

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   API       │────▶│  Database   │
│   (Web/App) │     │   Server    │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Cache     │
                    └─────────────┘
```

## Data Flow
[Describe how data flows through the system]

## Authentication & Authorization
[Detail the auth architecture]

## API Design
- Base URL: `/api/v1`
- Authentication: [Method]
- Rate Limiting: [Details]

## Database Schema Overview
[Key entities and relationships]

## Deployment Architecture
[How the system is deployed]

## Security Architecture
[Security layers and measures]

## Scalability Considerations
[How the system scales]

## Monitoring & Observability
[Logging, metrics, alerting approach]
```

---

## Phase 6: Create Epic Breakdown

**Output**: `RLM/specs/epics/breakdown.md`

```markdown
# Epic Breakdown & Implementation Order

## Overview
[Brief summary of total scope]

## Epics

### EPIC-001: [Epic Name]
**Description**: [What this epic accomplishes]
**Features**: FTR-001, FTR-002
**Priority**: Must Have
**Estimated Effort**: [T-shirt size: S/M/L/XL]

**Implementation Order**:
1. FTR-001 - [Feature Name] - [Rationale for order]
2. FTR-002 - [Feature Name] - [Rationale for order]

### EPIC-002: [Epic Name]
[Same format]

## Suggested Sprint Plan

### Sprint 1: Foundation
**Goal**: [Sprint goal]
**Features**:
- [ ] FTR-001: [Feature Name]
- [ ] FTR-002: [Feature Name]

### Sprint 2: Core Features
**Goal**: [Sprint goal]
**Features**:
- [ ] FTR-003: [Feature Name]
- [ ] FTR-004: [Feature Name]

[Continue for all sprints needed]

## Dependencies Graph
[Show which features depend on others]

## Risk Items
[Features with highest risk that need early attention]
```

---

## Phase 7: Summary and Next Steps

```
## Specifications Complete!

### Documents Created:
- RLM/specs/constitution.md - Project Constitution
- RLM/specs/architecture/overview.md - Architecture Overview
- RLM/specs/epics/breakdown.md - Epic Breakdown
- RLM/specs/features/FTR-001/spec.md - [Feature 1 Name]
- RLM/specs/features/FTR-002/spec.md - [Feature 2 Name]
[List all created feature specs]

### Architecture Decisions:
- [Decision 1]
- [Decision 2]
- [Decision 3]

### Implementation Order:
1. [First feature to implement]
2. [Second feature]
3. [Third feature]

### Next Steps:
1. Review the architecture at RLM/specs/architecture/overview.md
2. Review feature specs in RLM/specs/features/
3. Create implementation tasks: Use `@rlm-tasks` agent or read RLM/prompts/03-CREATE-TASKS.md

### Technical Decisions Needing Validation:
[Any decisions you made that the user should confirm]
```

---

## Progress Tracking

Update `RLM/progress/status.json`:

```json
{
  "lastUpdate": "[timestamp]",
  "phase": "specs_complete",
  "documentsCreated": ["constitution.md", "architecture/overview.md", "epics/breakdown.md", "features/FTR-001/spec.md", ...],
  "nextStep": "create-tasks"
}
```

---

## Notes for AI

- Make specific technical decisions based on the PRD requirements
- If the PRD lacks technical details, use reasonable defaults and document assumptions
- Ensure consistency between all spec documents
- Consider dependencies when ordering features
- Think about testability when designing APIs and data models
- Include error handling in every feature spec

---

## Frontend Script Loading Strategy (Required for Frontend Projects)

Architecture output MUST include this subsection:

### Script Loading & Delivery Strategy
| Aspect | Decision |
|--------|----------|
| Module system | Classic `<script>` / ES Modules (`type="module"`) / Bundled (webpack/vite/esbuild) / Inline |
| Protocol compatibility | file:// / http://localhost / Production CDN |
| Rationale | [Why this choice was made] |

### Protocol Compatibility Matrix
| Loading Strategy | file:// | http://localhost | Production |
|-----------------|---------|-----------------|------------|
| Inline `<script>` | ✅ | ✅ | ✅ |
| Classic `<script src>` | ✅ | ✅ | ✅ |
| `<script type="module">` | ❌ (CORS) | ✅ | ✅ |
| Dynamic `import()` | ❌ (CORS) | ✅ | ✅ |

If the execution context contract (from PRD) says `file://`, the architecture MUST choose a compatible loading strategy (inline or classic).

## Enhancement Delta Flow

When creating specs for modifications to existing features (not new features):

1. **Load baseline**: Read the existing `RLM/specs/features/FTR-XXX/specification.md` and `design-spec.md`
2. **Extract invariants**: Identify all acceptance criteria and behaviors that define the feature's identity
3. **Produce delta**: Spec output must include:
   - **Preserved invariants** — Behaviors that MUST NOT change
   - **Modified behaviors** — What's changing and why
   - **New behaviors** — What's being added
4. **Contradiction gate**: If a proposed change contradicts a preserved invariant, STOP and flag the conflict — do not proceed
