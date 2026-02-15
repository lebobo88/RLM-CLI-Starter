---
description: "Generate feature specifications and architecture decisions from an existing PRD"
---

Read `RLM/prompts/02-CREATE-SPECS.md` and follow the complete specification workflow.

Prerequisites:
- `RLM/specs/PRD.md` must exist
- `RLM/specs/constitution.md` must exist

Break the PRD into feature specifications:
- Create `RLM/specs/features/FTR-XXX/specification.md` for each feature
- Generate architecture overview at `RLM/specs/architecture/overview.md`
- Create ADRs for key technology decisions at `RLM/specs/architecture/decisions/`

Use template from `RLM/templates/spec-template.md`.
