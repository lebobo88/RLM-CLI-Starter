# Feature Specification: [Feature Name]

## Feature ID: FTR-XXX
## Status: [Draft|Active|In Progress|Completed]
## Priority: [Low|Medium|High|Critical]
## Epic: [EPIC-XXX]

## Overview
Brief description of the feature and its purpose.

## User Stories

### US-XXX: [User Story Title]
As a [type of user], I want to [perform some action] so that [achieve some goal].

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### US-XXX: [Additional User Story]
...

## Technical Specifications

### API Endpoints
- **Method:** POST
- **Endpoint:** /api/resource
- **Request Body:**
```json
{
  "field1": "value",
  "field2": "value"
}
```
- **Response:**
```json
{
  "id": "uuid",
  "status": "success"
}
```
- **Status Codes:** 200 (success), 400 (bad request), 401 (unauthorized), 500 (server error)

### Data Model
```typescript
interface Resource {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Business Logic
1. Validate input
2. Process data
3. Store in database
4. Return response

## UI/UX Requirements

### Component Requirements
| Component | Variant | State Requirements | Notes |
|-----------|---------|-------------------|-------|
| [Component 1] | [variant] | All 8 states | [Usage context] |
| [Component 2] | [variant] | All 8 states | [Usage context] |

### User Flow
```
[Entry] → [Step 1] → [Step 2] → [Success State]
              ↓
         [Error Path] → [Recovery]
```

### Layout Description
```
┌─────────────────────────────────────────┐
│  Header                                  │
├──────────────┬──────────────────────────┤
│              │                           │
│  Sidebar     │      Main Content         │
│  (optional)  │                           │
│              │                           │
├──────────────┴──────────────────────────┤
│  Actions / Footer                        │
└─────────────────────────────────────────┘
```

### Interaction Requirements
| Action | User Trigger | System Response | Feedback |
|--------|--------------|-----------------|----------|
| [Action 1] | [Click/Submit/etc.] | [What happens] | [Visual feedback] |
| [Action 2] | [Click/Submit/etc.] | [What happens] | [Visual feedback] |

### Accessibility Requirements
- [ ] All content keyboard accessible
- [ ] Focus order logical
- [ ] ARIA labels on interactive elements
- [ ] Error messages announced to screen readers
- [ ] Color contrast meets WCAG AA (4.5:1)

### Responsive Behavior
| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (< 640px) | [Stack elements, hide secondary content] |
| Tablet (640-1023px) | [Adjust grid, collapsible sidebar] |
| Desktop (1024px+) | [Full layout with all features] |

### States to Implement
- [ ] **Loading**: [Skeleton/spinner description]
- [ ] **Empty**: [Empty state message and CTA]
- [ ] **Error**: [Error display and recovery]
- [ ] **Success**: [Confirmation feedback]

### Design Tokens Reference
- Colors: [List primary tokens used]
- Spacing: [List spacing tokens used]
- Typography: [List type tokens used]

### Design Spec Reference
See: `RLM/specs/features/FTR-XXX/design-spec.md`

---

## Security Requirements (ASVS-Aligned)

| Requirement | ASVS | Implementation Notes |
|-------------|------|---------------------|
| Input validation | V5.1.3 | Validate all user inputs at entry point |
| Authentication required | V2.1 | Specify auth method (JWT, session, OAuth) |
| Authorization checks | V4.1.1, V4.2.1 | Deny by default, prevent IDOR |
| Rate limiting | V13.2.5 | Specify limits (e.g., 100 req/min) |
| SQL injection prevention | V5.3.1 | Use parameterized queries |
| XSS protection | V5.3.3 | Output encoding for HTML context |
| Error handling | V7.1.1 | Generic messages, no stack traces |
| Secrets management | V2.10.1 | No hardcoded credentials |

**Threat Model Required**: For security-sensitive features, apply `RLM/prompts/patterns/threat-modeling.md`

## Performance Requirements
- Response time: < 200ms (p95)
- Concurrent requests: Support 1000/second
- Database queries: < 50ms
- Cache strategy: [describe caching]

## Testing Requirements

### Unit Tests
- [ ] Validation logic
- [ ] Business logic
- [ ] Error handling
- [ ] Edge cases

### Integration Tests
- [ ] API endpoints
- [ ] Database operations
- [ ] External services

### E2E Tests
- [ ] Complete user flows
- [ ] Error scenarios
- [ ] Edge cases

## Dependencies
- [ ] Dependency 1 - [Status]
- [ ] Dependency 2 - [Status]

## Open Questions
1. Question 1?
2. Question 2?

## Notes
Additional context, decisions, or considerations.

---

## Behavioral Invariants (Must Preserve)

> This section is REQUIRED when modifying an existing feature. List all behaviors that define the feature's identity and MUST NOT be changed during enhancement.

| Invariant | Description | Source |
|-----------|-------------|--------|
| [INV-001] | [Behavior that must be preserved] | [FTR-XXX spec, section Y] |
| [INV-002] | [Another invariant] | [Design spec, section Z] |

### Contradiction Gate
If any proposed change in this spec contradicts an invariant listed above, the spec MUST flag the contradiction and HALT — do not proceed to implementation until the contradiction is resolved (either by updating the invariant with explicit approval or by modifying the proposal).

