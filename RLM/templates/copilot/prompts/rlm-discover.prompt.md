# RLM Discovery (v2.7)

Transform a product idea into a comprehensive Product Requirements Document (PRD).

## Before You Start

Read `RLM/START-HERE.md` for the complete workflow overview.

## Instructions

1. Read `RLM/prompts/01-DISCOVER.md` for the full workflow
2. Check `RLM/research/project/` for existing research
3. Research the idea - analyze competitors, best practices
4. Ask clarifying questions in 3-4 rounds
5. Generate PRD at `RLM/specs/PRD.md`
6. Generate constitution at `RLM/specs/constitution.md`

## Output Files
- `RLM/specs/PRD.md` - Product Requirements Document
- `RLM/specs/constitution.md` - Project standards and conventions

## Discovery Questions (3-4 Rounds)

### Round 1: Business Goals
- Who is the target user?
- What problem does this solve?
- What are the core features for MVP?
- What are the key success metrics?

### Round 2: Technical
- What scale is expected?
- What integrations are needed?
- What technology constraints exist?

### Round 3: Requirements
- What authentication is needed?
- What platforms (web, mobile, desktop)?
- What compliance requirements?

### Round 4: Design (UI Projects)
- Design philosophy: CREATIVE or CONSISTENT?
- Animation tier: MINIMAL, MODERATE, or RICH?
- Framework preferences?

## PRD Structure

1. **Executive Summary** - One paragraph overview
2. **Problem Statement** - What pain point we're solving
3. **Target Users** - User personas and demographics
4. **Core Features** - MVP feature list with priorities
5. **User Stories** - As a [user], I want [feature], so that [benefit]
6. **Success Metrics** - KPIs and measurement criteria
7. **Technical Constraints** - Platform, performance, security requirements
8. **Timeline & Phases** - Rough implementation phases

## Constitution Structure

1. **Project Identity** - Name, description, core values
2. **Technology Stack** - Frontend, backend, database, infrastructure
3. **Coding Standards** - Naming, organization, quality rules
4. **Testing Standards** - Coverage targets, test patterns
5. **Git Workflow** - Branching, commits, PR process
