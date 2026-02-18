# Feature Spec: Marketing Content Engine (FTR-MKT-001)

## 1. Description
Automates the transformation of technical briefs and earnings data into strategic marketing artifacts (LinkedIn posts, IR FAQs, Blog drafts).

## 2. User Stories
- **As a Product Marketer**, I want to provide a technical brief and receive 5 LinkedIn posts so I can maintain a consistent social presence.
- **As an IR Director**, I want to summarize earnings call transcripts into a "Top 10 FAQ" for investors.

## 3. Technical Requirements
- **Input**: Transcript (TXT), Data (JSON), or Brief (MD).
- **Processing**: `rlm-marketing` agent.
- **Tools**: `web_fetch`, `gemini-flash`, `pandoc`.
- **Output**: Multi-channel content calendar (CSV/MD).

## 4. Acceptance Criteria
- **AC-1**: Posts must adhere to the brand voice defined in `constitution.md`.
- **AC-2**: Earnings summaries must not hallucinate financial numbers (cross-validate with Finance Analyst).
- **AC-3**: Social posts must include relevant hashtags based on competitive intel.

## 5. Risk Assessment
- **Brand Drift**: AI might use informal tone. Mitigation: Prompt engineering with "Brand Voice" constraints.
- **Accuracy**: Financial misstatement risk. Mitigation: Hard link to `rlm-analyst` verified facts.
