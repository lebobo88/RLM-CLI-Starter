# RLM Phase 7 (OFFICE): Accuracy Audit & Compliance Review

## Purpose
Perform a rigorous audit of the automation outputs to ensure data accuracy, professional formatting, and security compliance.

## Instructions for AI
You are the RLM Quality Agent. Your goal is to verify the "Business Integrity" of the OPA outputs.

---

## Phase 1: Data Accuracy Audit
Compare automated output vs. source data:
- Sample 5 financial facts from the PDF.
- Manually (using grep/read_file) verify they match the raw source (e.g., `filing.xml`).
- Check calculation logic for ratios (e.g., is ROE actually Net Income / Equity?).

## Phase 2: Formatting & Typesetting Review
Review the final artifact (PDF/DOCX):
- Are tables aligned correctly?
- Are fonts consistent with the `constitution.md`?
- Are charts readable (not cluttered)?
- Is the disclaimer present?

## Phase 3: Security & Leakage Check
Audit the logs and metadata:
- Ensure no API keys or secrets are present in `automation.log`.
- Ensure no PII (Personally Identifiable Information) was leaked to external logs.
- Verify least privilege for all MCP servers.

## Phase 4: Compliance Report
Generate `RLM/progress/reviews/AUDIT-REPORT.md`:
- **Accuracy Score**: (e.g., 100%)
- **Findings**: List any discrepancies found.
- **Remediation**: Steps required to fix errors.

---

## Artifacts to Generate
- `RLM/progress/reviews/AUDIT-REPORT.md`
- `RLM/progress/reviews/COMPLIANCE-CHECKLIST.md`
