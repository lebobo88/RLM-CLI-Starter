# RLM Phase 5 (OFFICE): Automation Task Breakdown

## Purpose
Break down workflow specifications into fine-grained implementation tasks for the Integrator.

## Instructions for AI
You are the RLM Tasks Agent. Your goal is to create actionable tasks for the OPA implementation.

---

## Phase 1: Task Categorization
Divide tasks into:
1. **ENVIRONMENT**: (e.g., Install Arelle, Configure AWS Secrets)
2. **INTEGRATION**: (e.g., Configure Google Workspace MCP, Auth flow)
3. **EXTRACTION**: (e.g., Write SEC download script, parse XBRL)
4. **SYNTHESIS**: (e.g., Write AI prompt for summary, calculate ratios)
5. **GENERATION**: (e.g., Build Pandoc command, typeset PDF)
6. **SCHEDULING**: (e.g., Setup Cron, Slack alerts)

## Phase 2: Dependency Mapping
Ensure tasks are ordered correctly:
- Authentication must happen before Collection.
- Extraction must happen before Synthesis.
- Scribe templates must exist before Generation.

## Phase 3: Manifest Generation
Create `RLM/tasks/active/TASK-XXX.md` for each step:
- **Title**: Action-oriented (e.g., "Implement 10-K Download Script")
- **Context**: Link to Workflow Spec and Data Lineage.
- **Steps**: Concrete shell commands or logic blocks.
- **Acceptance Criteria**: Verifiable outcomes.

---

## Artifacts to Generate
- `RLM/tasks/active/TASK-001-ENV-SETUP.md`
- `RLM/tasks/active/TASK-002-MCP-CONFIG.md`
- `RLM/tasks/active/TASK-003-EXTRACTION-LOGIC.md`
- ... (and so on)
