# RLM Core Instructions for Copilot CLI Agents (v2.7)

This document provides shared instructions for Copilot CLI agents implementing the RLM methodology.

## Overview

RLM (Research-Lead-Manage) is a spec-driven development methodology that transforms ideas into production code through a structured 9-phase pipeline.

## Core Workflow

### 9-Phase Pipeline

1. **Discovery** → PRD.md, constitution.md
2. **Design System** → Design tokens, components (if UI project)
3. **Specifications** → Feature specs, architecture
4. **Feature Design** → UI/UX specs (if UI project)
5. **Tasks** → Fine-grained implementation tasks
6. **Implementation** → TDD with integrated review
7. **Quality** → Design QA, code review, test coverage
8. **Verification** → E2E tests per feature
9. **Report** → Project summary

### Key File Locations

```
Project Root/
├── AGENTS.md                 # Copilot CLI agent registration
├── .github/
│   ├── agents/               # Copilot custom agent definitions
│   ├── hooks/                # Git hooks and scripts
│   │   └── scripts/          # Helper scripts
│   ├── prompts/              # Copilot prompt files
│   ├── instructions/         # Path-specific rules
│   └── skills/               # Copilot skills
└── RLM/
    ├── specs/
    │   ├── PRD.md            # Product Requirements
    │   ├── constitution.md   # Project standards
    │   ├── features/FTR-XXX/ # Feature specifications
    │   └── design/           # Design system (if UI)
    ├── tasks/
    │   ├── active/           # Tasks to implement
    │   ├── completed/        # Finished tasks
    │   └── blocked/          # Blocked tasks
    ├── progress/
    │   ├── status.json       # Current state
    │   └── checkpoint.json   # Incremental tracking
    └── prompts/              # Workflow prompts
```

## Implementation Standards

### TDD Methodology

ALWAYS follow Test-Driven Development:
1. **Red**: Write failing test first
2. **Green**: Write minimum code to pass
3. **Refactor**: Improve while tests pass

### Constitution Compliance

Before implementing, read `RLM/specs/constitution.md` for:
- Naming conventions
- File structure
- Error handling patterns
- Documentation requirements

### Task-Based Development

Each task in `RLM/tasks/active/` contains:
- Acceptance criteria
- Technical notes
- Files to modify
- Test requirements

## Quality Requirements

### Code Quality
- Functions < 50 lines
- No unused imports
- Comments explain "why", not "what"
- Error handling present

### Test Quality
- Cover happy path
- Cover edge cases
- Cover error scenarios
- Test names describe behavior

### Security
- No hardcoded secrets
- Input validation
- SQL injection prevention
- Proper error messages (no stack traces)

## Design Integration (UI Projects)

If `constitution.md` indicates `DESIGN_REQUIRED = true`:

### Design Tokens
Use design tokens from `RLM/specs/design/design-system.md`:
```css
/* Example */
color: var(--color-primary);
spacing: var(--space-md);
font: var(--font-body);
```

### Component States
All interactive components MUST implement 8 states:
1. Default
2. Hover
3. Focus
4. Active
5. Disabled
6. Loading
7. Error
8. Empty

### Accessibility
- WCAG 2.1 AA minimum
- ARIA labels
- Keyboard navigation
- Focus management

## Review Checklist

Before completing a task:

- [ ] All tests pass
- [ ] Linting clean
- [ ] Type checking passes
- [ ] No security issues
- [ ] Constitution compliance
- [ ] Design tokens used (if UI)
- [ ] All component states (if UI)
- [ ] Accessibility requirements met (if UI)

## Feature Verification

When all tasks for a feature complete:
1. Generate E2E tests from acceptance criteria
2. Run functional tests
3. Run accessibility tests (if UI)
4. Create bug tasks if failures
5. Mark feature as verified when passing

## Token/Progress Tracking

Track token usage throughout implementation:
- Log to `RLM/progress/token-usage/`
- Warning at 50%, critical at 75%, pause at 90%
- Use checkpoints for resume capability

## Incremental Development

Always check `RLM/progress/checkpoint.json` before creating tasks:
- Don't overwrite existing work
- Use generation numbers to track batches
- Only create tasks for NEW features

## Copilot CLI Agents Reference

| Agent | Purpose |
|-------|---------|
| `@rlm-orchestrator` | Complete 9-phase automation |
| `@rlm-discover` | Transform idea into PRD |
| `@rlm-design` | Generate design system |
| `@rlm-specs` | Generate feature specs from PRD |
| `@rlm-feature-design` | Per-feature UI/UX design |
| `@rlm-tasks` | Break features into tasks |
| `@rlm-implement` | TDD implementation of tasks |
| `@rlm-quality` | Code review, testing, design QA |
| `@rlm-verify` | E2E feature verification |
| `@rlm-report` | Progress reports and metrics |
| `@rlm-resume` | Resume interrupted sessions |
| `@rlm-debug` | Debug and reconcile state |

## Configuration Files

| File/Directory | Purpose |
|----------------|---------|
| `AGENTS.md` | Copilot CLI agent registration |
| `.github/agents/` | Custom agent definitions |
| `.github/prompts/` | Copilot prompt files |
| `.github/instructions/` | Path-specific rules |
| `.github/hooks/` | Git hooks and scripts |
| `.github/skills/` | Copilot skills |

## Anti-Patterns to Avoid

- ❌ Skipping tests
- ❌ Hardcoding values (use design tokens)
- ❌ Ignoring constitution standards
- ❌ Implementing without reading specs
- ❌ Skipping accessibility
- ❌ Overwriting existing tasks

## Best Practices

- ✓ Read specs before implementing
- ✓ Write tests first (TDD)
- ✓ Use design tokens
- ✓ Follow constitution patterns
- ✓ Check dependencies before tasks
- ✓ Verify features on completion
- ✓ Track progress and tokens
