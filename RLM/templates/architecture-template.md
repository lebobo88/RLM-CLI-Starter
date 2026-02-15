# Architecture Document: [Component/Feature Name]

## Feature: [FTR-XXX]
## Date: [YYYY-MM-DD]
## Author: Master Architect Agent
## Status: [Draft|Proposed|Approved|Implemented]

## Overview
High-level description of the architecture.

## Goals and Non-Goals

### Goals
- Goal 1
- Goal 2
- Goal 3

### Non-Goals
- Non-goal 1
- Non-goal 2

## System Context

### External Dependencies
- Service/Library 1 - [Purpose]
- Service/Library 2 - [Purpose]

### Integration Points
- System A - [Integration method]
- System B - [Integration method]

## Architecture Design

### Components
```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Component  │─────▶│  Component  │─────▶│  Component  │
│      A      │      │      B      │      │      C      │
└─────────────┘      └─────────────┘      └─────────────┘
```

#### Component A: [Name]
- **Responsibility:** What it does
- **Technology:** What it's built with
- **Interfaces:** How it communicates

#### Component B: [Name]
- **Responsibility:** What it does
- **Technology:** What it's built with
- **Interfaces:** How it communicates

### Data Flow
1. Request enters at [entry point]
2. Data is processed by [component]
3. Result is stored in [storage]
4. Response is returned to [caller]

## Data Model

### Entities

#### Entity 1
```typescript
interface Entity1 {
  id: string;
  field1: string;
  field2: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Entity 2
```typescript
interface Entity2 {
  id: string;
  field1: string;
  relatedEntity1Id: string;
  createdAt: Date;
}
```

### Relationships
- Entity1 ──(1:N)──▶ Entity2

## API Design

### Endpoints

#### Create Resource
- **Method:** POST
- **Path:** `/api/resources`
- **Auth:** Required
- **Request:**
```json
{
  "name": "string",
  "type": "string"
}
```
- **Response:** 201 Created
```json
{
  "id": "uuid",
  "name": "string",
  "type": "string"
}
```

#### Get Resource
- **Method:** GET
- **Path:** `/api/resources/:id`
- **Auth:** Required
- **Response:** 200 OK

## Technology Decisions

### Choice 1: [Technology/Framework]
- **Decision:** Use [Technology X]
- **Rationale:** [Why this choice]
- **Alternatives Considered:**
  - Technology Y - [Why not chosen]
  - Technology Z - [Why not chosen]

### Choice 2: [Pattern/Approach]
- **Decision:** Use [Pattern X]
- **Rationale:** [Why this choice]

## Security Considerations
- [ ] Authentication mechanism
- [ ] Authorization rules
- [ ] Data encryption
- [ ] Input validation
- [ ] Rate limiting
- [ ] Audit logging

## Performance Considerations
- **Expected Load:** [Requests/second]
- **Response Time Target:** [Xms]
- **Scaling Strategy:** [Horizontal/Vertical]
- **Caching Strategy:** [Approach]
- **Database Optimization:** [Indexes, queries]

## Monitoring and Observability
- **Metrics to Track:**
  - Metric 1
  - Metric 2
- **Logging Strategy:** [Approach]
- **Alerting Rules:** [What triggers alerts]

## Deployment Strategy
- **Environment:** [Docker/Kubernetes/etc]
- **CI/CD Pipeline:** [Description]
- **Rollback Plan:** [How to rollback]
- **Blue/Green or Canary:** [Strategy]

## Testing Strategy
- **Unit Tests:** [Coverage target]
- **Integration Tests:** [Key scenarios]
- **E2E Tests:** [User journeys]
- **Performance Tests:** [Load testing approach]

## Migration Plan
(If modifying existing system)
- **Phase 1:** [What happens]
- **Phase 2:** [What happens]
- **Rollback:** [How to undo]

## Open Questions
1. Question 1?
2. Question 2?

## Decision Log
| Date | Decision | Rationale |
|------|----------|-----------|
| YYYY-MM-DD | [Decision] | [Why] |

## References
- [Link to related docs]
- [External resources]

---

## Script Loading & Delivery Strategy

### Module System
| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Loading strategy | [Inline / Classic script / ES modules / Bundled] | [Why] |
| Entry point | [e.g., index.html with inline JS, main.js as module] | [Why] |
| Dependencies | [None / CDN / npm + bundler] | [Why] |

### Protocol Compatibility Matrix
| Loading Strategy | file:// | http://localhost | Production |
|-----------------|---------|-----------------|------------|
| Inline `<script>` | ✅ | ✅ | ✅ |
| Classic `<script src>` | ✅ | ✅ | ✅ |
| `<script type="module">` | ❌ (CORS) | ✅ | ✅ |
| Dynamic `import()` | ❌ (CORS) | ✅ | ✅ |

### Declared Execution Context
- **Local launch mode**: [file:// / http://localhost]
- **Chosen strategy**: [Must be compatible with launch mode per matrix above]
- **Validation**: Quality and Verification phases must test in the declared context

