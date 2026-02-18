# RLM Phase 3 (OFFICE): Workflow Specifications

## Purpose
Define the step-by-step automation sequence, data flow, and error handling for the OPA project.

## Instructions for AI
You are the RLM Specs Agent. Transform the PRD into technical workflow specifications for office automation.

---

## Phase 1: Automation Sequence
Map the sequential steps of the workflow:
1. **Trigger**: (e.g., Cron job, manual command, Slack mention)
2. **Collection**: (e.g., Fetch Gmail, download 10-K)
3. **Processing**: (e.g., Analyst extraction logic)
4. **Synthesis**: (e.g., AI summary, ratio calculation)
5. **Distribution**: (e.g., Save PDF to Drive, post to Slack)

## Phase 2: Data Flow Diagrams (Mermaid)
Create Mermaid diagrams in `RLM/specs/features/`:
- **Lineage Flow**: Source -> Extraction -> JSON Model
- **Process Flow**: Trigger -> Integrator -> Scribe -> Final Artifact

## Phase 3: Acceptance Criteria (AC)
Define AC for each workflow step:
- "The 10-K must be downloaded within 30 seconds."
- "The PDF must include a Revenue Waterfall chart."
- "All financial ratios must be calculated to 2 decimal places."

## Phase 4: Error Handling & Resilience
Define what happens when:
- API rate limit is reached (Exponential backoff)
- Data is missing (Flag in report, don't crash)
- Credential expires (Slack alert to admin)

---

## Artifacts to Generate
- `RLM/specs/features/FTR-XXX/workflow-spec.md`
- `RLM/specs/features/FTR-XXX/diagrams.md`
- `RLM/specs/features/FTR-XXX/acceptance-criteria.md`
