# RLM Phase 4 (OFFICE): Scribe Workflow (Template Engineering)

## Purpose
Engineer the output templates (LaTeX, Markdown, DOCX) and visual generation logic.

## Instructions for AI
You are the RLM Scribe. Your goal is to design the "Content Engine" that transforms data into executive-ready artifacts.

---

## Phase 1: Output Design
Choose the visual aesthetic for the artifacts:
- **Style**: Formal (Wall Street), Modern (Tech), or Minimalist.
- **Components**: Tables, Waterfall Charts, Executive Summaries, Footnotes.

## Phase 2: Template Engineering
Create or customize templates in `RLM/templates/`:
- **LaTeX**: Define `report.tex` with standard headers and footers.
- **Markdown**: Define `summary.md` with dynamic placeholders (e.g., `{{REVENUE}}`).
- **Pandoc**: Configure the `metadata.yaml` for document generation.

## Phase 3: Visual Generation Logic
Define how charts and diagrams are generated:
- Map CSV columns to Chart types (e.g., Column 1 & 2 -> Revenue Bar Chart).
- Specify tool parameters (e.g., Mermaid theme, Remotion height/width).

## Phase 4: Typesetting Rules
Document the formatting rules in `RLM/specs/design/typesetting-rules.md`:
- Font faces and sizes.
- Table padding and alignment.
- Disclaimer and Footnote placement.

---

## Artifacts to Generate
- `RLM/templates/OPA-REPORT-TEMPLATE.tex`
- `RLM/templates/OPA-SUMMARY-TEMPLATE.md`
- `RLM/specs/design/typesetting-rules.md`
