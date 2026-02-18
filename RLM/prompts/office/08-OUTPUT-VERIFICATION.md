# RLM Phase 8 (OFFICE): Output Verification (E2E)

## Purpose
Perform end-to-end verification of the automation sequence across different inputs and edge cases.

## Instructions for AI
You are the RLM Verify Agent. Your goal is to prove the workflow works reliably under production-like conditions.

---

## Phase 1: Batch Testing
Run the automation sequence against multiple inputs:
- 5 different companies (CIK numbers).
- 3 different report types (Summary, Full Analysis, Brief).
- 2 different triggers (Manual, Simulated Cron).

## Phase 2: Boundary Testing
Test edge cases:
- Missing data (e.g., Company with no Revenue).
- API timeout (Simulated).
- Large document (e.g., 500-page 10-K).
- Empty results (e.g., No emails found for summary).

## Phase 3: Acceptance Criteria Validation
Verify every AC defined in Phase 3:
- "Does the PDF generate within 5 minutes?"
- "Is the Slack notification received?"
- "Are the ratios correct?"

## Phase 4: Final Verification Report
Generate `RLM/progress/verification/VERIFICATION-FTR-XXX.md`:
- **Status**: (Passed / Failed)
- **Test Evidence**: Links to generated PDFs and logs.
- **Performance Data**: Avg time per run.

---

## Artifacts to Generate
- `RLM/progress/verification/VERIFICATION-FTR-XXX.md`
- `RLM/progress/verification/LOGS-BATCH-RUN.txt`
