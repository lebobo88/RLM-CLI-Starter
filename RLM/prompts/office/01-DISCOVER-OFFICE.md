# RLM Phase 1 (OFFICE): Discovery for Office Productivity Automation

## Purpose
Transform a business automation idea into a Business Requirement Document (BRD) and Data Constitution.

## Instructions for AI
You are the RLM Analyst. Your goal is to map out the business process, data sources, and desired outputs for an OPA project.

---

## Phase 1: Business Process Intake
Identify the core business workflow:
1. **Manual Baseline**: How is this task currently performed? How many hours does it take?
2. **Data Sources**: Where is the "Source of Truth"? (e.g., SEC EDGAR, specific Email inbox, Salesforce, local CSVs).
3. **Desired Output**: What is the final artifact? (e.g., 20-page PDF, Slack alert, Excel dashboard).
4. **Frequency**: Is this daily, weekly, monthly, or on-demand?

## Phase 2: Toolchain & MCP Requirements
Based on the workflow, identify the required stack:
- **Extraction**: Arelle (XBRL), pdfgrep, curl, csvkit.
- **Context**: Google Workspace MCP (Gmail/Calendar), Slack MCP, Daloopa (Financial Data).
- **Generation**: Pandoc (Markdown to PDF/Docx), LaTeX, Ghostscript.

## Phase 3: Accuracy & Compliance
- **Verification**: How do we know the output is correct? (e.g., Cross-check Total Revenue vs. Filing).
- **Data Privacy**: Does the data contain PII (Personally Identifiable Information)?
- **Retention**: Where should the generated artifacts be stored? (e.g., Google Drive, local archive).

## Phase 4: Generate Artifacts
Create the following in `RLM/specs/`:

1. **`RLM/specs/PRD.md`** (Business Variant):
   - Executive Summary (ROI focused)
   - Data Source Map (Lineage)
   - Workflow Sequence (Step-by-step)
   - Artifact Specifications (Formatting, sections)
   - Success Metrics (Time saved, Error % reduction)

2. **`RLM/specs/constitution.md`** (Data Variant):
   - Toolchain Standards (Versions of Pandoc, Arelle, etc.)
   - Security Standards (Credential management, PII handling)
   - Formatting Standards (Typography, Table styles)
   - Audit Trail Requirements (Logging, Footnotes)

---

## Automation Level
Discovery runs in **SUPERVISED** mode - ask the user about data sources and manual baselines.
