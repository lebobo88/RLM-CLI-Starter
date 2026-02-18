# Feature Spec: Corporate Secretary (FTR-CORP-001)

## 1. Description
Automates the triage of high-volume executive inboxes and the generation of daily meeting briefings.

## 2. User Stories
- **As an Executive**, I want a "Morning Brief" Slack message summarizing my top 3 meetings and 5 urgent emails so I can skip manual triage.
- **As a Team Lead**, I want the agent to automatically extract action items from my "Meeting Transcript" folder and post them to our Slack channel.

## 3. Technical Requirements
- **Input**: Google Calendar events, Gmail messages, tl;dv transcripts.
- **Processing**: `rlm-secretary` agent.
- **Tools**: `mcp-google-workspace`, `gemini-pro`.
- **Output**: Daily Brief (Slack/Email), Action Item Tracker (Notion/Slack).

## 4. Acceptance Criteria
- **AC-1**: Morning briefs must be delivered by 8:00 AM local time.
- **AC-2**: Action items must be assigned to specific team members based on transcript context.
- **AC-3**: Sensitivity check: Private calendar events (e.g., "Doctor Appointment") must be excluded from public briefs.

## 5. Risk Assessment
- **Privacy**: High risk of sharing sensitive board-level data. Mitigation: Scoped MCP tokens and "Internal Only" distribution rules.
