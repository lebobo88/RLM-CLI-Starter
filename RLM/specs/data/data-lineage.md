# Global Data Lineage - Enterprise Automation Hub

## Purpose
This document maps the primary enterprise source systems to the OPA Hub domains and defines the transformation responsibility.

## 1. Source-to-Domain Mapping
| Source System | Extraction Agent | OPA Domain | Transformation Type |
| :--- | :--- | :--- | :--- |
| **SEC EDGAR** | rlm-analyst | FINANCE | XBRL Fact Extraction |
| **Gmail / Outlook** | rlm-secretary | CORPORATE | NLP Triage & Summary |
| **PDF Contracts** | rlm-legal | LEGAL | Regex & LLM Clause Parsing |
| **HRIS (Workday/SAP)** | rlm-hr | HR | CSV Normalization |
| **ERP (NetSuite/Oracle)** | rlm-ops | OPS | Supply Chain Trend Analysis |
| **AWS / Azure Logs** | rlm-it | IT | Infrastructure Troubleshooting |

## 2. Transformation Pipeline
1. **Ingest**: Domain-specific collector (e.g., `curl`, `aws-cli`, `mcp-gmail`) fetches raw data.
2. **Normalize**: `rlm-analyst` logic converts raw data into the `payload` object of `enterprise-schema.json`.
3. **Audit**: `rlm-governor` verifies the `confidentiality` level and scrubs PII if necessary.
4. **Synthesis**: Gemini CLI generates the narrative or logic result.
5. **Generate**: `rlm-scribe` typesets the final executive artifact.

## 3. Data Integrity Standards
- **Versioning**: Every change to a schema must be recorded as an ADR (Architecture Decision Record).
- **Validation**: All payloads must pass JSON Schema validation before being passed to the Scribe.
- **Lineage Retention**: The `metadata.source_system` must remain immutable throughout the pipeline.
