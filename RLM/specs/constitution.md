# Enterprise Data Constitution - OPA Hub

## Purpose
This constitution extends the baseline project standards to cover multi-departmental data handling, security, and document engineering for the OPA Hub.

## 1. Multi-Agent Delegation Rules
- The **rlm-orchestrator** is the only agent authorized to spawn sub-agents.
- Sub-agents must cite the `PIPELINE-ID` in every file creation.
- The **rlm-governor** has "Kill Switch" authority over any Integration task that violates the Principle of Least Privilege.

## 2. Departmental Data Schemas
Every departmental model must inherit from the `BaseOPA` schema:
- `timestamp`: ISO 8601.
- `source_lineage`: Detailed URL or local path.
- `confidentiality_level`: [Public | Internal | Confidential | PII].

## 3. Toolchain Standards
- **Pandoc**: Version 2.18+ (required for URL ingestion).
- **Arelle**: Version 2.x (required for SEC XBRL integrity).
- **XeLaTeX**: Primary engine for professional PDF generation.
- **MCP Servers**: Must use the `@modelcontextprotocol` standard.

## 4. Global Security Policy
- **Secrets**: Strictly NO hardcoded keys. Must use `$(aws secretsmanager...)` or environment variables injected via encrypted shell hooks.
- **Audit**: All CLI output must be redirected to `RLM/progress/logs/hub-audit.log`.
- **Anonymization**: PII must be scrubbed before sending data to non-Confidential LLM contexts (unless using Enterprise VPC).

## 5. Formatting & Brand
- **Finance**: Helvetica, serif headers, `booktabs` tables.
- **Legal**: Times New Roman, 12pt, justified text, numbered clauses.
- **Marketing**: Inter or Sans-serif, bold color accents, responsive Markdown.
