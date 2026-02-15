---
name: spec-writing
description: Guide for writing feature specifications, PRDs, and architecture decisions. Use this when creating or updating project specifications.
---

# Specification Writing Guide

## Feature Specification Format

Location: `RLM/specs/features/FTR-XXX/specification.md`

```markdown
# Feature: [Title]
## Feature ID: FTR-XXX
## Priority: [High | Medium | Low]
## Status: Draft

## Description
[Detailed description of the feature]

## User Stories
- As a [user type], I want [action], so that [benefit]

## Acceptance Criteria
- [ ] Criterion 1 (testable, specific)
- [ ] Criterion 2

## Technical Approach
[How this feature will be implemented]

## Dependencies
- FTR-YYY (if applicable)

## API Contract (if applicable)
[Endpoints, request/response shapes]

## Data Model (if applicable)
[Database schema changes]
```

## PRD Format

Location: `RLM/specs/PRD.md`
Template: `RLM/templates/PRD-TEMPLATE.md`

Must include:
- Executive Summary
- Problem Statement
- Target Users (personas)
- Core Features (prioritized MVP list)
- User Stories
- Success Metrics (KPIs)
- Technical Constraints
- Timeline & Phases

## Architecture Decision Records

Location: `RLM/specs/architecture/decisions/ADR-XXX.md`
Template: `RLM/templates/decision-record-template.md`

Format:
- Title, Status, Context
- Decision with rationale
- Consequences (positive and negative)
- Alternatives considered

## Naming Conventions
- Features: `FTR-001`, `FTR-002`, etc.
- Tasks: `TASK-001`, `TASK-002`, etc.
- ADRs: `ADR-001`, `ADR-002`, etc.
