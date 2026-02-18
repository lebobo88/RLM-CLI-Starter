---
name: spec-writing
description: "Feature specification, PRD, and ADR writing guide with template references."
user-invocable: true
model: sonnet
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
hooks:
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "powershell -ExecutionPolicy Bypass -File .claude/skills/spec-writing/validate-spec-format.ps1"
          timeout: 10
        - type: prompt
          prompt: "Verify the written spec follows FTR-XXX naming conventions and has all required sections (Description, Acceptance Criteria, Technical Approach). Return {decision: 'allow'} if valid."
          model: haiku
          timeout: 10
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

## Validation Rules
- Feature spec paths must match `RLM/specs/features/FTR-XXX/` pattern
- ADR paths must match `RLM/specs/architecture/decisions/ADR-XXX.md` pattern
- All specs must include required sections (Description, Acceptance Criteria)
- Task IDs must be monotonically increasing within a generation
