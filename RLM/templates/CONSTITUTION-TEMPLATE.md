# Project Constitution: [Project Name]

**Version:** 1.0
**Last Updated:** [Date]

This document defines the standards, principles, and conventions that govern all development on this project. All code, documentation, and processes must adhere to these guidelines.

---

## Project Identity

### Project Name
[Official project name]

### Project Description
[One paragraph describing what this project does and its purpose]

### Core Values
1. **[Value 1]** - [Brief explanation]
2. **[Value 2]** - [Brief explanation]
3. **[Value 3]** - [Brief explanation]

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| [Framework] | [Version] | [Main UI framework] |
| [State Management] | [Version] | [State management] |
| [CSS Solution] | [Version] | [Styling approach] |
| [Build Tool] | [Version] | [Build/bundle] |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| [Runtime] | [Version] | [Server runtime] |
| [Framework] | [Version] | [API framework] |
| [ORM/Database Client] | [Version] | [Database access] |

### Database
| Technology | Version | Purpose |
|------------|---------|---------|
| [Primary DB] | [Version] | [Main data storage] |
| [Cache] | [Version] | [Caching layer] |
| [Search] | [Version] | [Search functionality] |

### Infrastructure
| Technology | Version | Purpose |
|------------|---------|---------|
| [Cloud Provider] | N/A | [Hosting] |
| [Container Runtime] | [Version] | [Containerization] |
| [CI/CD] | N/A | [Automation] |

---

## Coding Standards

### General Principles
- **Readability over cleverness** - Code should be easy to understand
- **DRY (Don't Repeat Yourself)** - Extract common patterns into reusable functions
- **KISS (Keep It Simple)** - Choose the simplest solution that works
- **YAGNI (You Aren't Gonna Need It)** - Don't add features until they're needed

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Variables | camelCase | `userName`, `isActive` |
| Functions | camelCase | `getUserById`, `calculateTotal` |
| Classes | PascalCase | `UserService`, `OrderProcessor` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| Files (components) | PascalCase | `UserProfile.tsx`, `OrderList.vue` |
| Files (utilities) | kebab-case | `date-utils.ts`, `api-client.ts` |
| Database tables | snake_case | `user_accounts`, `order_items` |
| API endpoints | kebab-case | `/api/user-profiles`, `/api/order-items` |

### Code Organization

```
src/
â”œâ”€â”€ components/          # UI components
â”‚   â”œâ”€â”€ common/          # Shared/reusable components
â”‚   â””â”€â”€ features/        # Feature-specific components
â”œâ”€â”€ services/            # Business logic and API calls
â”œâ”€â”€ utils/               # Utility functions
â”œâ”€â”€ hooks/               # Custom hooks (React) or composables (Vue)
â”œâ”€â”€ types/               # TypeScript type definitions
â”œâ”€â”€ constants/           # Application constants
â”œâ”€â”€ config/              # Configuration files
â””â”€â”€ tests/               # Test files (mirror src structure)
```

### File Structure Template

```typescript
// 1. Imports (external first, then internal, alphabetized)
import { external } from 'external-library';

import { internal } from '@/utils/internal';
import { Component } from '@/components/Component';

// 2. Types/Interfaces
interface Props {
  // ...
}

// 3. Constants
const DEFAULT_VALUE = 'default';

// 4. Component/Function
export function ComponentName({ prop }: Props) {
  // Implementation
}

// 5. Helper functions (if needed, otherwise extract to utils)
function helperFunction() {
  // ...
}
```

### 3.9 Module Integration Standards

#### Barrel File Conventions

**Purpose**: Barrel files (`index.ts`) define public API surface and enforce encapsulation.

**When to Use**:
- âœ… Every feature module: `src/features/[name]/index.ts`
- âœ… Every library module: `src/lib/[name]/index.ts`
- âœ… Every component directory: `src/components/[category]/index.ts`
- âŒ NOT individual files (use direct imports)
- âŒ NOT test directories (tests import directly)

**What to Export**:

```typescript
// âœ… GOOD: Explicit exports
export { publicFunction } from './implementation';
export { PublicClass } from './class';
export type { PublicInterface } from './types';

// âŒ BAD: Re-export everything (breaks encapsulation)
export * from './implementation';

// âŒ BAD: Export internals (prefix with _)
export { _internalHelper } from './helpers';
```

**Template**:

```typescript
/**
 * [Module Name]
 * @feature FTR-XXX
 * @module @/lib/[module-name]
 */

// Public functions
export { publicFn1, publicFn2 } from './implementation';

// Public classes
export { PublicClass } from './class';

// Public types (separate for clarity)
export type {
  PublicInterface,
  ConfigOptions,
} from './types';

// Constants
export { MODULE_CONSTANT } from './constants';
```

**Feature Tagging**:

```typescript
/**
 * Spawns background agent
 * @feature FTR-052
 * @param config - Agent configuration
 * @returns Promise<AgentHandle>
 */
export async function spawnBackgroundAgent(
  config: AgentConfig
): Promise<AgentHandle> {
  // ...
}
```

#### Module Integration Patterns

**Provider-Consumer Pattern**:

```typescript
// Provider: src/lib/auth/index.ts
export { login, logout } from './auth-service';
export type { User, SessionToken } from './types';

// Consumer: src/components/dashboard/Dashboard.tsx
import { login } from '@/lib/auth';
import type { User } from '@/lib/auth';
```

**Shared Types Pattern** (for circular dependencies):

```typescript
// src/lib/shared-types/index.ts
export type { User, Project, Task } from './domain';

// Consumers import from shared location
import type { User } from '@/lib/shared-types';
```

**Dependency Injection** (for circular deps):

```typescript
// Instead of:
import { database } from '@/lib/database'; // circular!

// Use DI:
export function createAuthService(db: Database) {
  return {
    login: async (creds) => db.query(...)
  };
}
```

#### Public API Documentation

**Stability annotations**:

```typescript
/** @stable - Backwards compatible */
export function stableFunction() {}

/** @experimental - May change */
export function experimentalFeature() {}

/** @deprecated - Use newFn() instead */
export function oldFunction() {}
```

**Documentation requirements**:
- JSDoc for all exports
- `@feature` tag linking to spec
- `@param` with types and descriptions
- `@returns` for return values
- `@throws` for exceptions
- `@example` for non-trivial usage

**Contract guarantees**:
- Input types can WIDEN (accept more), not narrow
- Output types can NARROW (more specific), not widen
- Breaking changes need deprecation (1 release minimum)

---

## Testing Standards

### Test Coverage Requirements
| Type | Minimum Coverage | Target Coverage |
|------|------------------|-----------------|
| Unit Tests | 80% | 90% |
| Integration Tests | 60% | 80% |
| E2E Tests | Critical paths | Happy paths + edge cases |

### Test File Naming
- Unit tests: `[filename].test.ts`
- Integration tests: `[filename].integration.test.ts`
- E2E tests: `[feature].e2e.test.ts`

### Test Structure (AAA Pattern)
```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange
      const input = createTestInput();

      // Act
      const result = methodName(input);

      // Assert
      expect(result).toEqual(expectedOutput);
    });
  });
});
```

### What to Test
- **Always test:** Business logic, API endpoints, data transformations, edge cases
- **Selectively test:** UI components (focus on behavior, not implementation)
- **Don't test:** External libraries, generated code, trivial getters/setters

---

## API Standards

### REST Conventions

| Operation | HTTP Method | URL Pattern | Success Code |
|-----------|-------------|-------------|--------------|
| List | GET | `/resources` | 200 |
| Get One | GET | `/resources/:id` | 200 |
| Create | POST | `/resources` | 201 |
| Update (full) | PUT | `/resources/:id` | 200 |
| Update (partial) | PATCH | `/resources/:id` | 200 |
| Delete | DELETE | `/resources/:id` | 204 |

### Request/Response Format
```typescript
// Success Response
{
  "data": { /* resource or array of resources */ },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}

// Error Response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### API Versioning
- Use URL versioning: `/api/v1/resources`
- Support previous version for minimum 6 months after deprecation

---

## Security Standards

### Authentication & Authorization
- [Specify auth method: JWT, OAuth2, Session-based]
- Token expiration: [Duration]
- Refresh token strategy: [Approach]

### Data Protection
- Encrypt sensitive data at rest using [Algorithm]
- All API communication over HTTPS (TLS 1.3)
- Never log: passwords, tokens, PII, credit card numbers

### Input Validation
- Validate all user input on both client and server
- Use parameterized queries for database operations
- Sanitize output to prevent XSS

### Security Checklist
- [ ] No secrets in source code (use environment variables)
- [ ] Dependencies regularly updated
- [ ] Rate limiting on all public endpoints
- [ ] CORS properly configured
- [ ] Security headers set (CSP, HSTS, X-Frame-Options)

### OWASP ASVS Reference

This project targets **OWASP ASVS v5.0 Level 2** for security controls:

| Category | ASVS Chapter | Key Requirements |
|----------|--------------|------------------|
| Authentication | V2 | Password policy, account lockout, no credentials in code |
| Session Management | V3 | Secure cookies (HttpOnly, Secure, SameSite), regeneration on auth |
| Access Control | V4 | Deny by default, IDOR prevention, path traversal blocking |
| Input Validation | V5 | Positive validation, parameterized queries, output encoding |
| Cryptography | V6 | Approved algorithms (bcrypt, AES-256), no MD5/SHA1 |
| Error Handling | V7 | Generic user messages, no stack traces exposed |
| Data Protection | V8 | TLS for transmission, encryption at rest for sensitive data |
| API Security | V13 | Rate limiting, input validation on all endpoints |

See `RLM/docs/SECURITY-GUIDE.md` for implementation patterns and test examples.

### Security Test Naming Convention

Include ASVS references in security-related test names for traceability:

```typescript
// Option 1: In test name
it('should block SQL injection (ASVS 5.3.1)', () => {});

// Option 2: In describe block
describe('ASVS V5.3: Injection Prevention', () => {
  it('should use parameterized queries', () => {});
});
```

---

## Git Workflow

### Branch Naming
| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/[ticket-id]-brief-description` | `feature/TASK-123-user-auth` |
| Bug Fix | `fix/[ticket-id]-brief-description` | `fix/TASK-456-login-error` |
| Hotfix | `hotfix/[ticket-id]-brief-description` | `hotfix/TASK-789-critical-fix` |
| Release | `release/v[version]` | `release/v1.2.0` |

### Commit Messages
Follow Conventional Commits:
```
type(scope): brief description

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**
```
feat(auth): add password reset functionality
fix(api): handle null response from external service
docs(readme): update installation instructions
```

### Pull Request Requirements
- [ ] Descriptive title following commit convention
- [ ] Description of changes and motivation
- [ ] Link to related issue/task
- [ ] All tests passing
- [ ] Code review approved
- [ ] No merge conflicts

---

## Documentation Standards

### Code Documentation
- Document all public functions and classes
- Use JSDoc/TSDoc format for TypeScript
- Include examples for complex functions

```typescript
/**
 * Calculates the total price including tax.
 *
 * @param items - Array of items with price and quantity
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns Total price including tax
 *
 * @example
 * calculateTotal([{ price: 10, quantity: 2 }], 0.08)
 * // Returns: 21.60
 */
function calculateTotal(items: Item[], taxRate: number): number {
  // Implementation
}
```

### README Requirements
Every project/module should have a README with:
- Purpose/description
- Installation instructions
- Usage examples
- Configuration options
- Contributing guidelines

---

## Error Handling

### Error Categories
| Category | HTTP Code | When to Use |
|----------|-----------|-------------|
| Validation Error | 400 | Invalid input data |
| Authentication Error | 401 | Not authenticated |
| Authorization Error | 403 | Not permitted |
| Not Found | 404 | Resource doesn't exist |
| Conflict | 409 | Resource conflict (duplicate) |
| Rate Limited | 429 | Too many requests |
| Server Error | 500 | Unexpected server error |

### Error Handling Pattern
```typescript
try {
  // Operation that might fail
} catch (error) {
  // Log error with context
  logger.error('Operation failed', {
    error,
    context: { userId, operation }
  });

  // Throw appropriate error type
  throw new AppError('User-friendly message', 'ERROR_CODE', 400);
}
```

---

## Performance Standards

### Response Time Targets
| Endpoint Type | Target (p95) | Maximum |
|---------------|--------------|---------|
| Simple read | < 100ms | 200ms |
| Complex read | < 200ms | 500ms |
| Write operation | < 300ms | 1000ms |
| File upload | < 2s | 10s |

### Database Query Guidelines
- Index all columns used in WHERE clauses
- Limit result sets (pagination required for lists)
- Use connection pooling
- Avoid N+1 queries (use eager loading)

### Caching Strategy
- Cache static assets: 1 year
- Cache API responses: Based on data volatility
- Use ETags for conditional requests
- Document cache invalidation strategy

---

## Logging Standards

### Log Levels
| Level | Use For |
|-------|---------|
| ERROR | Errors that need immediate attention |
| WARN | Unexpected situations that don't stop operation |
| INFO | Important business events |
| DEBUG | Detailed information for debugging |

### Log Format
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "message": "User logged in",
  "context": {
    "userId": "123",
    "requestId": "abc-def",
    "duration": 45
  }
}
```

### What to Log
- **Always:** Authentication events, API errors, business transactions
- **Never:** Passwords, tokens, PII, credit card numbers

---

## Deployment & Environments

### Environment Configuration
| Environment | Purpose | Data |
|-------------|---------|------|
| Development | Local development | Mock/seed data |
| Staging | Pre-production testing | Anonymized production data |
| Production | Live environment | Real data |

### Environment Variables
- Use `.env.example` to document required variables
- Never commit actual `.env` files
- Use secrets management for production

### Deployment Checklist
- [ ] All tests passing
- [ ] Database migrations run
- [ ] Environment variables configured
- [ ] Health checks passing
- [ ] Monitoring alerts configured
- [ ] Rollback plan documented

---

## Design Standards

### Design Philosophy
**Selected**: CREATIVE | CONSISTENT

| Philosophy | Characteristics |
|------------|-----------------|
| CREATIVE | Bold colors, unique layouts, custom animations, brand-differentiating |
| CONSISTENT | Familiar patterns, accessibility-first, enterprise-ready, usability-focused |

### Design System Location
- Design System: `RLM/specs/design/design-system.md`
- Design Tokens: `RLM/specs/design/tokens/`
- Component Specs: `RLM/specs/design/components/`

### UI Component Library
| Technology | Purpose | Documentation |
|------------|---------|---------------|
| [Tailwind CSS / Material UI / Chakra UI / etc.] | CSS Framework | [Link] |
| [shadcn/ui / Radix UI / etc.] | Component Primitives | [Link] |

### Color Standards
| Usage | Token Reference | Contrast Requirement |
|-------|-----------------|---------------------|
| Primary Actions | `color-primary-500` | 4.5:1 on white |
| Text on Background | `color-gray-800` on `white` | 4.5:1 minimum |
| Error States | `color-error-500` | 4.5:1 minimum |
| Focus Indicators | `color-primary-500` | 3:1 minimum |

### Typography Standards
- **Font Family**: [Primary font], [Fallback fonts]
- **Base Size**: 16px (1rem)
- **Scale Ratio**: [1.25 Major Third / 1.333 Perfect Fourth]
- **Line Height**: 1.5 for body, 1.2-1.3 for headings

### Spacing Standards
- **Base Unit**: 8px (0.5rem)
- **Scale**: 0, 4, 8, 12, 16, 24, 32, 48, 64 pixels
- **Component Padding**: Use spacing tokens, never arbitrary values

### Animation Standards
**Animation Tier**: MINIMAL | MODERATE | RICH

| Tier | Allowed Animations | Duration Range |
|------|-------------------|----------------|
| MINIMAL | Hover, focus, loading spinners | 100-200ms |
| MODERATE | + Page transitions, micro-interactions | 150-400ms |
| RICH | + Scroll animations, complex sequences | 200-1000ms |

**Required**: Always support `prefers-reduced-motion`

### Accessibility Standards
| Requirement | Standard | Verification |
|-------------|----------|--------------|
| WCAG Level | AA (minimum) / AAA (if specified) | Automated + manual testing |
| Color Contrast | 4.5:1 text, 3:1 large text/UI | Contrast checker tools |
| Keyboard Navigation | All interactive elements | Tab through entire UI |
| Screen Reader | All content accessible | Test with NVDA/VoiceOver |
| Touch Targets | 44Ã—44px minimum | Visual inspection |
| Focus Indicators | Visible 2px ring | Visual inspection |

### Component State Requirements
All interactive components MUST implement these states:

| State | Description | Required |
|-------|-------------|----------|
| Default | Resting appearance | Yes |
| Hover | Mouse over (desktop) | Yes |
| Focus | Keyboard focus | Yes (visible) |
| Active | Being clicked/pressed | Yes |
| Disabled | Not interactive | Yes |
| Loading | Async operation | If applicable |
| Error | Validation failure | If applicable |
| Empty | No content | If applicable |

### Responsive Design Standards
| Breakpoint | Name | Target |
|------------|------|--------|
| 0-639px | Mobile | Phones |
| 640-767px | Tablet Small | Large phones, small tablets |
| 768-1023px | Tablet | Tablets |
| 1024-1279px | Desktop | Laptops |
| 1280px+ | Large | Desktops |

**Approach**: Mobile-first (base styles for mobile, enhance for larger)

### Design Review Checklist
Before merging UI changes:
- [ ] Follows design system tokens
- [ ] All component states implemented
- [ ] Responsive at all breakpoints
- [ ] Keyboard accessible
- [ ] Screen reader tested
- [ ] Color contrast verified
- [ ] Animations respect reduced-motion
- [ ] Design QA score â‰¥90%

---

## Review & Updates

This constitution should be reviewed and updated:
- When adopting new technologies
- When significant architectural decisions are made
- At minimum, quarterly

### Amendment Process
1. Propose change via pull request to this document
2. Discuss in team meeting
3. Approve with majority consensus
4. Update version number and date

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [Date] | [Name] | Initial constitution |

---

## Runtime Contract (Source of Truth)

This section defines the exact runtime and verification constraints for the project. All later phases MUST follow it.

### Local Launch Mode
<!-- Choose ONE -->
- [ ] **`file://` direct-open** — user opens `index.html` directly in browser
- [ ] **`http://localhost` server** — user runs a local dev server

### Launch Command (if server required)
```bash
# e.g., npm run dev
# e.g., npx serve
# e.g., python -m http.server 8080
```

### Test Command (Required)
This must be the exact command Phase 7/8 runs. It MUST run >0 tests and must fail the pipeline if any test fails.

```bash
# Examples:
# node --test .\src\__tests__\*.test.cjs
# npm test
```

### Dependency Policy
- Allowed: [No external deps / npm deps ok / pinned versions required]
- Forbidden: [e.g., no runtime CDN deps, no committed node_modules, etc.]

### Invariants (Non-Negotiable)
- [ ] [Invariant 1]
- [ ] [Invariant 2]

### Persona / Style Boundaries (if applicable)
Personas may influence style only (palette, typography, motion), not functional invariants.

---

## Script Loading & Protocol Compatibility

### Policy
The declared local launch mode determines the allowed script loading strategy:

| Launch Mode | Allowed Script Strategy | Prohibited |
|-------------|------------------------|------------|
| `file://` direct-open | Inline `<script>`, Classic `<script src="...">` | `<script type="module">`, dynamic `import()` |
| `http://localhost` server | All strategies including ES modules | None |

### Enforcement
- If the project claims "open index.html directly" or "no server required", ALL JavaScript MUST be loadable without CORS headers
- If ES modules are needed, the project MUST document a local server command and MUST NOT claim file:// compatibility
- This constraint applies to ALL implementation tasks and MUST be verified during Quality (Phase 7) and Verification (Phase 8)

