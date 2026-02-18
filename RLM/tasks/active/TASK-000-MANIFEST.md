# Task Manifest - SEC-Agent Pilot (OPA)

## 1. Environment & Config
- [ ] **TASK-001-ENV-SETUP**: Install `Arelle`, `csvkit`, `Pandoc`, and `XeLaTeX`.
- [ ] **TASK-002-MCP-CONFIG**: Configure `mcp_servers.json` for Slack/Gmail (read-only).
- [ ] **TASK-003-AWS-SECRETS**: Store Slack bot token in AWS Secrets Manager.

## 2. Integration & Extraction
- [ ] **TASK-004-EDGAR-DOWNLOAD**: Implement `curl` logic for CIK-to-Filing download.
- [ ] **TASK-005-XBRL-PARSING**: Implement `arelleCmdLine` to CSV/JSON conversion.
- [ ] **TASK-006-DATA-CLEANING**: Implement `csvkit` filtering as per `data-lineage.md`.

## 3. AI & Generation
- [ ] **TASK-007-AI-PROMPT**: Create Gemini CLI (Deep Think) prompt for financial synthesis.
- [ ] **TASK-008-PANDOC-COMMAND**: Implement the `pandoc` command for XeLaTeX PDF generation.
- [ ] **TASK-009-SLACK-MCP**: Implement the `gemini --mcp slack` post-analysis notification.

## 4. Automation & Scheduling
- [ ] **TASK-010-CORE-SEQUENCE**: Combine all tasks into `sec-agent.sh` or `analyze.ts`.
- [ ] **TASK-011-AUDIT-LOGGING**: Enable command-level history and execution logging.
- [ ] **TASK-012-SCHEDULING**: (Optional) Add `crontab` entry for daily batch processing.

## Status Summary
- **Total Tasks**: 12
- **Completed**: 0
- **Blocked**: 0
- **Next Task**: TASK-001-ENV-SETUP
