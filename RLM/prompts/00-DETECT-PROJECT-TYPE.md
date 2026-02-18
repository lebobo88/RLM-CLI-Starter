# RLM Project Type Detection

## Purpose

Automatically detect whether a project is a Standard Software Project (TYPE_CODE), an Office Productivity Automation (TYPE_OFFICE), or a Hybrid (TYPE_HYBRID).

## Instructions for AI

You are the RLM Project Classifier. Your job is to analyze the PRD and determine if the project requires design system integration or if it follows the Office Productivity Automation (OPA) workflow.

---

## Phase 1: Scan PRD for Indicators

Read `RLM/specs/PRD.md` and analyze for the following indicators:

### UI Indicators (score +1 each)

| Indicator | Pattern to Match |
|-----------|-----------------|
| UI mentioned | "user interface", "UI", "frontend" |
| Screen/page references | "screen", "page", "view", "route" |
| Interactive elements | "button", "form", "input", "modal", "dropdown" |
| Visual structure | "dashboard", "layout", "navigation", "sidebar", "header" |
| Frontend framework | React, Vue, Angular, Next.js, Svelte, SvelteKit |
| Responsive mentions | "responsive", "mobile", "tablet", "desktop" |
| Design references | "design", "styling", "theme", "colors", "typography" |
| User flows | "user flow", "wireframe", "mockup", "prototype" |
| Component mentions | "component", "widget", "card", "table", "list" |
| Accessibility | "WCAG", "accessibility", "a11y", "screen reader" |

### OPA Indicators (Office Productivity Automation) (score +1 each)

| Indicator | Pattern to Match |
|-----------|-----------------|
| Financial Analysis | "10-K", "SEC", "financial", "ratio", "XBRL", "audit" |
| Document Automation | "PDF", "Docx", "report", "template", "Pandoc", "LaTeX" |
| Data Management | "CSV", "Excel", "spreadsheet", "ETL", "clean data" |
| Admin Coordination | "email", "calendar", "Gmail", "Slack", "triage", "summary" |
| Process Automation | "workflow", "automation", "sequence", "recurring", "pipeline" |
| MCP Integration | "MCP", "Model Context Protocol", "Gmail API", "Calendar API" |

### Non-UI Indicators (score -1 each)

| Indicator | Pattern to Match |
|-----------|-----------------|
| CLI explicit | "CLI", "command line", "terminal" |
| API-only | "API only", "headless", "backend only", "REST API" |
| Library/package | "library", "package", "SDK", "npm package" |
| Server-side only | "backend", "server-side only", "microservice" |
| No frontend | "no frontend", "no UI" |
| Data processing | "data pipeline", "ETL", "batch processing" |
| Infrastructure | "infrastructure", "DevOps", "CI/CD tool" |

---

## Phase 2: Calculate Score

```
UI Score: [Count of UI indicators found]
OPA Score: [Count of OPA indicators found]
Non-UI Score: [Count of Non-UI indicators found]
Net Score: UI Score + OPA Score - Non-UI Score
```

### Classification Rules

| Score Condition | Classification | Action |
|-----------------|----------------|--------|
| UI Score >= 3 | **TYPE_CODE (UI)** | DESIGN_REQUIRED = true, use rlm-design |
| OPA Score >= 3 | **TYPE_OFFICE** | Route to Office Workflow (rlm-analyst, rlm-scribe) |
| Both >= 3 | **TYPE_HYBRID** | Hybrid workflow (Full Design + Office Automation) |
| Non-UI Score >= 2 | **TYPE_CODE (NON-UI)** | Skip design, skip OPA, focus on code/API |
| -1 to 2 | **AMBIGUOUS** | Ask user |

---

## Phase 3: Report Detection Results

### If Clear Classification:

```
┌─────────────────────────────────────────────────────────────────┐
│ Project Type Detection                                          │
├─────────────────────────────────────────────────────────────────┤
│ UI Indicators Found: 7                                          │
│ Non-UI Indicators Found: 0                                      │
│ Net Score: +7                                                   │
│                                                                 │
│ Classification: UI PROJECT                                      │
│ DESIGN_REQUIRED: true                                           │
│                                                                 │
│ Design phases will be included in the workflow:                 │
│ ✓ Design System Generation                                      │
│ ✓ Feature Design Specifications                                 │
│ ✓ Design QA Checklist                                          │
│ ✓ Component State Requirements (8 states)                       │
│ ✓ Accessibility Compliance (WCAG 2.1 AA)                       │
└─────────────────────────────────────────────────────────────────┘
```

OR

```
┌─────────────────────────────────────────────────────────────────┐
│ Project Type Detection                                          │
├─────────────────────────────────────────────────────────────────┤
│ UI Indicators Found: 0                                          │
│ Non-UI Indicators Found: 4                                      │
│ Net Score: -4                                                   │
│                                                                 │
│ Classification: NON-UI PROJECT (CLI/API/Library)                │
│ DESIGN_REQUIRED: false                                          │
│                                                                 │
│ Design phases will be skipped:                                  │
│ ✗ Design System Generation (skipped)                            │
│ ✗ Feature Design Specifications (skipped)                       │
│ ✗ Design QA Checklist (skipped)                                │
│ ✗ Component State Requirements (skipped)                        │
│ ✓ Code quality and testing (always included)                   │
└─────────────────────────────────────────────────────────────────┘
```

### If Ambiguous (ask user):

```
┌─────────────────────────────────────────────────────────────────┐
│ Project Type Detection - Clarification Needed                   │
├─────────────────────────────────────────────────────────────────┤
│ UI Indicators Found: 2                                          │
│ Non-UI Indicators Found: 1                                      │
│ Net Score: +1 (ambiguous)                                       │
│                                                                 │
│ I found some UI-related terms but the project type is unclear.  │
│                                                                 │
│ Does this project have a user-facing interface?                 │
│                                                                 │
│ [1] Yes, include design phases (web app, mobile app, dashboard) │
│ [2] No, skip design phases (CLI tool, API, library)             │
│                                                                 │
│ Your choice:                                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 4: Update Constitution

After classification, update `RLM/specs/constitution.md` with the project classification:

```markdown
## Project Classification

### UI Classification
- **HAS_UI**: [true/false]
- **UI_TYPE**: [web|mobile|desktop|cli|api|library]
- **DESIGN_REQUIRED**: [true/false]
- **Detection Method**: [auto|user-specified]
- **Detection Score**: [UI indicators] - [Non-UI indicators] = [Net]

### Indicators Found
**UI Indicators:**
- [List each indicator found with quote from PRD]

**Non-UI Indicators:**
- [List each indicator found with quote from PRD]
```

---

## Phase 5: Set Configuration

Update `RLM/progress/config.json`:

```json
{
  "design": {
    "auto_detect": true,
    "design_required": [true/false],
    "detection_score": [number],
    "detection_method": "[auto/user]",
    "ui_type": "[web/mobile/desktop/cli/api/library]"
  }
}
```

---

## UI Type Classification

If DESIGN_REQUIRED is true, also classify the UI type:

| UI Type | Indicators | Design Implications |
|---------|------------|---------------------|
| **web** | Browser, responsive, React/Vue/Angular | Full design system, responsive breakpoints |
| **mobile** | React Native, Flutter, iOS, Android | Touch targets, native patterns |
| **desktop** | Electron, Tauri, native desktop | Desktop-specific patterns |
| **hybrid** | Multiple platforms | Design tokens for all platforms |

---

## Override Configuration

Users can override auto-detection by editing `RLM/progress/config.json`:

```json
{
  "design": {
    "force_enabled": true,
    "force_disabled": false,
    "auto_detect": true
  }
}
```

---

## Integration with Workflow

### When DESIGN_REQUIRED = true

The following phases are activated:
1. **Phase 2**: Design System (use `@rlm-design` agent)
2. **Phase 4**: Feature Design (use `@rlm-feature-design` agent)
3. **Phase 7**: Design QA (use `@rlm-quality` agent)

Implementation tasks include:
- Use design tokens (no hardcoded colors/spacing)
- Implement all 8 component states
- Meet WCAG 2.1 AA accessibility
- Respect animation tier settings

### When DESIGN_REQUIRED = false

Design phases are skipped:
- No design system generation
- No feature design specs
- No design QA checklist
- No component state requirements (beyond functional)

Focus is on:
- Code quality and testing
- API design and documentation
- Performance and security

---

## Notes for AI

- Run this detection automatically after PRD is created
- Store result in both constitution.md and config.json
- Design detection should happen ONCE per project, not repeatedly
- If user explicitly states "no UI" or "CLI only", respect that
- When in doubt, ask the user - don't assume
