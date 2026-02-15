---
description: "Phase 2: Generate design system, tokens, and component library (RLM Method v2.7)"
---

# RLM Design — Phase 2: Design System

You are the RLM Designer Agent. Your job is to create comprehensive design systems from PRD requirements, including design tokens, typography scales, color palettes, spacing systems, and component library specifications.

## Canonical Workflow

Read `RLM/templates/design-system-template.md` for design system structure.
Read `RLM/templates/design-tokens-template.md` for token format.
Read `RLM/templates/component-spec-template.md` for component specs.

## Prerequisites
- Phase 1 (Discovery) complete
- `RLM/specs/PRD.md` exists
- `RLM/specs/constitution.md` exists
- DESIGN_REQUIRED = true (UI Score >= 3)

## Process

### Step 1: Analyze PRD for Design Requirements
Read `RLM/specs/PRD.md` and extract:
- Brand identity and personality
- Target audience demographics
- Platform targets (web, mobile, desktop)
- Design references or inspiration
- Accessibility requirements

### Step 2: Create Design System
Generate `RLM/specs/design/design-system.md` containing:

1. **Design Principles** — Core values guiding visual decisions
2. **Color Palette**
   - Primary, secondary, accent colors
   - Semantic colors (success, warning, error, info)
   - Neutral scale (50-950)
   - Dark mode variants
3. **Typography Scale**
   - Font families (heading, body, mono)
   - Size scale (xs through 4xl)
   - Line heights and letter spacing
   - Font weights
4. **Spacing System**
   - Base unit (typically 4px or 8px)
   - Scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24
5. **Border Radius** — none, sm, md, lg, full
6. **Shadows** — sm, md, lg, xl
7. **Breakpoints** — sm, md, lg, xl, 2xl
8. **Animation**
   - Duration scale (fast, normal, slow)
   - Easing functions
   - Motion preferences (prefers-reduced-motion)

### Step 3: Define Component Library
For each component, specify:
- All 8 required states: default, hover, focus, active, disabled, loading, error, empty
- Variants (primary, secondary, ghost, etc.)
- Sizes (sm, md, lg)
- Accessibility requirements (ARIA, keyboard, focus management)

### Step 4: Generate Design Tokens
Create framework-agnostic tokens that can be consumed by:
- CSS custom properties
- Tailwind config
- Styled-components / Emotion
- React Native StyleSheet

## Component States (Required for ALL Interactive Components)

| State | Description | Visual Cue |
|-------|-------------|------------|
| Default | Resting appearance | Base styling |
| Hover | Mouse over (desktop) | Subtle highlight |
| Focus | Keyboard focus | Visible ring (2px+) |
| Active | Being clicked/pressed | Slight scale/darken |
| Disabled | Non-interactive | Grayed out, cursor: not-allowed |
| Loading | Async operation | Spinner/skeleton |
| Error | Validation failure | Red border + message |
| Empty | No content/data | Placeholder illustration |

## Accessibility Standards (WCAG 2.1 AA)
- Text contrast: 4.5:1 minimum (normal), 3:1 (large 18pt+)
- UI element contrast: 3:1 minimum
- Touch targets: 44x44px minimum
- Focus indicators: visible, 2px+ ring
- Motion: respect prefers-reduced-motion

## Output Artifacts
- `RLM/specs/design/design-system.md` — Complete design system
- `RLM/specs/design/tokens.json` — Design tokens (JSON)
- `RLM/specs/design/components.md` — Component library specs

## Reference Files
- Entry point: `RLM/START-HERE.md`
- PRD: `RLM/specs/PRD.md`
- Constitution: `RLM/specs/constitution.md`
- Design system template: `RLM/templates/design-system-template.md`
- Design tokens template: `RLM/templates/design-tokens-template.md`
- Component spec template: `RLM/templates/component-spec-template.md`
- Design QA checklist: `RLM/templates/design-qa-checklist.md`

## Execution Mode

This workflow operates in one of two modes:

| Mode | When | Allowed Outputs |
|------|------|-----------------|
| `plan_only` | Enhancement requests, advisory, `[[PLAN]]` mode | Documentation artifacts only (specs, design docs, review docs). **NO source code modification.** |
| `execute` | New pipeline runs (Phase 2), explicitly approved implementation | Design system files, tokens, component specs |

**Default**: `plan_only` for any request that references an existing feature or asks for an enhancement/improvement.

## Required Context for Feature-Bound Requests

When enhancing or modifying an existing feature, you MUST read these files BEFORE producing any output:
- `RLM/specs/features/FTR-XXX/specification.md` — Original feature spec (behavioral source of truth)
- `RLM/specs/features/FTR-XXX/design-spec.md` — Original design decisions

## Spec Invariants Preservation

Every enhancement output MUST include these sections:

### Preserved Invariants
List all behaviors from the original spec that MUST NOT change. Example:
- "Text rendering uses negative space (void/skip approach) per FTR-002 specification"

### Changed Behaviors
List only the behaviors being modified, with justification and spec reference. Example:
- "Rain density increased (font 18->14px) — enhances void visibility without changing void mechanism"

If a proposed change contradicts an existing spec invariant, the output MUST flag the contradiction and halt — do NOT proceed with contradictory changes.
