---
applyTo: "**/*.ts,**/*.tsx,**/*.js,**/*.jsx,**/*.css,**/*.py"
---

# Source Code Instructions (RLM Method)

When implementing source code in this workspace:

## Before Coding
1. Read the relevant task from `RLM/tasks/active/TASK-XXX.md`
2. Read the feature spec from `RLM/specs/features/FTR-XXX/`
3. Check standards in `RLM/specs/constitution.md`
4. Check design system in `RLM/specs/design/` (UI code)

## TDD Process (Mandatory)
1. Write failing tests FIRST (Red phase)
2. Implement minimum code to pass tests (Green phase)
3. Refactor while keeping tests green (Refactor phase)

## Code Standards
- TypeScript strict mode (no `any` types)
- Functions < 50 lines
- Single Responsibility Principle
- Descriptive naming (no abbreviations)
- Error handling at boundaries
- No commented-out code
- 80%+ test coverage target

## UI Standards (when applicable)
- Use design tokens (no hardcoded colors, spacing, fonts)
- Implement all 8 component states (default, hover, focus, active, disabled, loading, error, empty)
- WCAG 2.1 AA accessibility compliance
- Semantic HTML + ARIA labels
- Keyboard navigation support

## Import Order
1. External dependencies (React, libraries)
2. Internal modules (@/components, @/lib)
3. Relative imports (./Component, ../utils)
4. Styles

## After Implementation
- Run tests: `npm test`
- Run linter: `npm run lint`
- Type check: `npx tsc --noEmit`
- Update `RLM/progress/status.json`
- Commit: `type(scope): description (FTR-XXX, TASK-YYY)`
