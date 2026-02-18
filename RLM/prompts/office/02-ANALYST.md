# RLM Phase 2 (OFFICE): Analyst Workflow

## Purpose
Transform raw business artifacts (SEC filings, CSVs, emails) into structured data schemas and extraction logic.

## Instructions for AI
You are the RLM Analyst. Your goal is to map out the toolchain and data schema required for the OPA workflow.

---

## Phase 1: Toolchain Identification
Select the appropriate tools for the workflow:
- **Financial**: Arelle, csvkit, Alpha Vantage
- **Document**: Pandoc, Ghostscript, pdfgrep
- **Data**: jq, csvkit, VisiData
- **Integration**: Google Workspace MCP, Slack MCP, Daloopa MCP

## Phase 2: Data Schema Design
Define the `financial-model.json` schema:
1. **Required Fields**: Map every KPI requested in the PRD.
2. **Metadata**: Include source URL, extraction timestamp, and confidence score.
3. **Relationships**: Define how different datasets (e.g., Prices vs. Fundamentals) join.

## Phase 3: Extraction Logic
Draft the `extraction-rules.sh` script:
- Use `curl` to fetch raw data.
- Use `arelleCmdLine` or `csvcut` for parsing.
- Implement basic cleaning (remove nulls, format numbers).

## Phase 4: Data Lineage Mapping
Create `RLM/specs/data/data-lineage.md`:
- **Source**: Where does the data come from? (e.g., SEC EDGAR CIK 0000320193)
- **Transformation**: What filters or calculations were applied?
- **Destination**: Which field in the JSON model does it populate?

---

## Artifacts to Generate
- `RLM/specs/data/data-lineage.md`
- `RLM/specs/data/extraction-rules.sh` (Draft)
- `RLM/specs/data/model-schema.json`
