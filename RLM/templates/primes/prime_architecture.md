# Context Prime: Architecture Design

## Purpose
Design system architecture, select technologies, define data models and APIs for a feature specification.

## Essential Context Only
- Project constitution (coding standards, performance targets)
- Feature specification
- Existing architecture decisions
- Technical constraints

## Run Step
1. **Analyze** feature requirements against technical constraints
2. **Design** system components and their interactions
3. **Select** appropriate technologies with justification
4. **Define** data models and API contracts
5. **Document** architecture decisions and trade-offs

## Read Step
**Input Files:**
- `RLM/specs/constitution.md` (coding standards, constraints)
- `RLM/specs/features/[FTR-XXX]/spec.md` (feature requirements)
- `RLM/specs/architecture/tech-stack.md` (existing tech decisions)

**Focus Areas:**
- Performance requirements
- Security constraints
- Scalability needs
- Integration points

## Report Step
**Output Files:**
- `RLM/specs/architecture/[FTR-XXX]/design.md` - Architecture design
- `RLM/specs/architecture/[FTR-XXX]/api-spec.json` - API contracts
- `RLM/specs/architecture/[FTR-XXX]/data-model.md` - Data structures
- `RLM/specs/architecture/[FTR-XXX]/decisions.md` - ADRs

**Report Format:**
```markdown
# Architecture: [Feature Name]

## Design Overview
[High-level architecture diagram and explanation]

## Technology Choices
[Decisions with justification and alternatives considered]

## Data Model
[Entity definitions and relationships]

## API Contracts
[Endpoints, request/response formats]

## Trade-offs
[What was sacrificed and why]
```

## Context Isolation
This prime loads only architecture-relevant context. Implementation details are delegated to the Implementation Agent.

## Token Budget
**Target:** 20,000-50,000 tokens
**Includes:** Constitution essentials + spec + existing architecture
**Excludes:** Implementation code, test files, full history

---
*Use this prime: `./RLM/commands/utils/context-manager.sh prime architecture`*

