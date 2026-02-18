# Feature Spec: Ops Logistics Tracker (FTR-OPS-001)

## 1. Description
Monitors supply chain data and vendor performance to provide real-time alerts and strategic logistics reports.

## 2. User Stories
- **As an Ops Manager**, I want to compare 3 vendors based on their lead time and defect rates so I can optimize my supply chain.
- **As a Logistics Coordinator**, I want to be alerted via Slack if a shipment from a Tier 1 vendor is delayed by >48 hours.

## 3. Technical Requirements
- **Input**: ERP CSV export, Logistics XML feed.
- **Processing**: `rlm-ops` agent.
- **Tools**: `curl`, `csvkit`, `gemini-pro`.
- **Output**: Vendor Performance Scorecard (PDF), Delay Triage Dashboard.

## 4. Acceptance Criteria
- **AC-1**: Reports must include a "Risk Score" for each Tier 1 vendor.
- **AC-2**: Data must be refreshed every 24 hours via scheduled cron.
- **AC-3**: Slack alerts must include the PO number and estimated impact.

## 5. Risk Assessment
- **Data Silos**: ERP data might be stale. Mitigation: Automate extraction directly from ERP API via custom MCP server.
