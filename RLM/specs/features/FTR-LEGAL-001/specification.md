# Feature Spec: Legal Automation Suite (FTR-LEGAL-001)

## 1. Description
Automates the extraction of key terms from legal contracts (PDF) and the generation of standardized NDAs from JSON data.

## 2. User Stories
- **As a Legal Counsel**, I want to upload a folder of contracts and receive a risk dashboard so I can prioritize high-risk reviews.
- **As a Sales Manager**, I want to trigger an NDA generation from a Slack command so I can send documents to clients instantly.

## 3. Technical Requirements
- **Input**: PDF, Docx, or CLI args (Party name, address).
- **Processing**: `rlm-legal` agent.
- **Tools**: `pdfgrep`, `ghostscript`, `gemini-pro`.
- **Output**: Risk Summary (PDF), Compiled NDA (Docx).

## 4. Acceptance Criteria
- **AC-1**: Extraction must identify "Indemnification", "Termination", and "Governing Law" with 95% accuracy.
- **AC-2**: NDA generation must use the `RLM/templates/LEGAL-NDA-TEMPLATE.docx`.
- **AC-3**: High-risk clauses must be highlighted in RED in the final summary.

## 5. Risk Assessment
- **Privacy**: High risk of PII leakage. Mitigation: `rlm-governor` pre-processing.
- **Accuracy**: Legal language is nuanced. Mitigation: Include "Human Review Required" disclaimer on every output.
