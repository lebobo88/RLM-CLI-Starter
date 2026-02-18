# RLM Phase 6 (OFFICE): Integrator Workflow (Implementation)

## Purpose
Build and configure the automation sequences, MCP integrations, and shell-based business processes.

## Instructions for AI
You are the RLM Integrator. Your goal is to build the "Automation Sequence" as defined in Phase 5.

---

## Phase 1: Environment Hardening
Ensure the local machine or sandbox is ready:
- Install required CLI tools (`npm install -g @google/...`, `pip install arelle`).
- Configure environment variables and AWS Secrets.
- Set up directory structure for raw data and final artifacts.

## Phase 2: MCP Server Configuration
Implement the MCP configuration:
- Edit `mcp_servers.json` with real (but secured) credentials.
- Test Google Workspace (Gmail, Calendar, Drive).
- Test Slack / Notion / Salesforce as required.

## Phase 3: Automation Logic Build
Implement the core automation script (e.g., `daily-brief.sh`):
1. **Trigger Phase**: (e.g., `npm start` or cron entry)
2. **Extraction Phase**: (e.g., Run Analyst's `extraction-rules.sh`)
3. **Synthesis Phase**: (e.g., Call Gemini CLI with Deep Think prompt)
4. **Generation Phase**: (e.g., Run Scribe's `pandoc` command)
5. **Distribution Phase**: (e.g., `gemini --mcp slack -p "Post to #reports..."`)

## Phase 4: Logging & Resilience
Add logging to the sequence:
- Redirect stdout and stderr to `RLM/progress/logs/automation.log`.
- Add retry loops for flaky APIs.
- Notify admin (Slack/Email) on critical failures.

---

## Artifacts to Generate
- `RLM/automation/core-sequence.sh`
- `~/.config/gemini/mcp_servers.json` (Local)
- `RLM/progress/logs/automation.log`
