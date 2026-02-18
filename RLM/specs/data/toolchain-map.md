# Enterprise Toolchain Mapping - OPA Hub

## 1. Domain Extraction Stack
| Domain | Primary Tools | Role |
| :--- | :--- | :--- |
| **Finance** | Arelle, csvkit | XBRL integrity & financial ratios. |
| **Legal** | pdfgrep, ghostscript | Regex extraction from contracts; PDF slicing. |
| **Marketing** | tl;dv, web_search | Transcript synthesis & competitive intel. |
| **HR** | csvkit, jq | Staff data normalization from HRIS exports. |
| **Ops** | curl, arelle (if XBRL) | ERP data ingestion & vendor performance. |
| **IT** | aws-cli, grep, tail | Infrastructure logs & asset audit. |

## 2. Global Integration Stack (MCP)
- **@modelcontextprotocol/server-google-workspace**: Drive, Gmail, Calendar access.
- **@modelcontextprotocol/server-slack**: Real-time triage & notifications.
- **@modelcontextprotocol/server-notion**: Centralized documentation sync.
- **Internal ERP Bridge**: Custom Python bridge for internal databases.

## 3. Transformation & Synthesis
- **Gemini CLI (pro-2.5)**: Default for high-token synthesis (10-Ks, Contracts).
- **Gemini CLI (flash-2.0)**: Default for fast triage (Email, Slack, Log alerts).

## 4. Output Generation
- **Pandoc + XeLaTeX**: Executive PDFs.
- **Pandoc + Docx**: Legal templates.
- **Slack Block Kit**: Real-time dashboards.
