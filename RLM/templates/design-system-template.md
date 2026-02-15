# Design System: [Project Name]

**Version:** 1.0
**Last Updated:** [Date]
**Design Philosophy:** CREATIVE | CONSISTENT

---

## 1. Brand Foundation

### Brand Identity
| Attribute | Value |
|-----------|-------|
| **Brand Name** | [Name] |
| **Tagline** | [Tagline] |
| **Mission** | [Mission statement] |

### Brand Personality
[Select 3-5 adjectives that describe the brand's personality]

| Trait | Description | Design Implication |
|-------|-------------|-------------------|
| [Trait 1] | [What it means] | [How it affects design] |
| [Trait 2] | [What it means] | [How it affects design] |
| [Trait 3] | [What it means] | [How it affects design] |

### Voice & Tone
| Context | Tone | Example |
|---------|------|---------|
| Success Messages | [e.g., Encouraging] | "Great job! Your changes are saved." |
| Error Messages | [e.g., Helpful] | "We couldn't save. Check your connection and try again." |
| Empty States | [e.g., Friendly] | "Nothing here yet. Let's create your first project!" |
| Loading States | [e.g., Patient] | "Loading your dashboard..." |

---

## 2. Color System

### Color Philosophy
[Describe the color strategy: 60-30-10 rule application, emotional associations, brand alignment]

### Brand Colors

| Name | Hex | RGB | Usage | Contrast on White |
|------|-----|-----|-------|-------------------|
| **Primary** | `#[hex]` | rgb([r], [g], [b]) | CTAs, links, focus states | [X]:1 |
| **Primary Light** | `#[hex]` | rgb([r], [g], [b]) | Hover states, backgrounds | [X]:1 |
| **Primary Dark** | `#[hex]` | rgb([r], [g], [b]) | Active states, text | [X]:1 |

### Primary Color Scale

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#[hex]` | Backgrounds, subtle highlights |
| 100 | `#[hex]` | Hover backgrounds |
| 200 | `#[hex]` | Borders, dividers |
| 300 | `#[hex]` | Disabled states |
| 400 | `#[hex]` | Icons, secondary text |
| 500 | `#[hex]` | **Primary brand color** |
| 600 | `#[hex]` | Hover states |
| 700 | `#[hex]` | Active states |
| 800 | `#[hex]` | Text on light backgrounds |
| 900 | `#[hex]` | Headings, high emphasis |

### Semantic Colors

| Name | Hex | Usage | Contrast on White |
|------|-----|-------|-------------------|
| **Success** | `#10b981` | Positive actions, confirmations | 3.4:1 (use with text) |
| **Success Light** | `#d1fae5` | Success backgrounds | - |
| **Warning** | `#f59e0b` | Caution, alerts | 2.7:1 (use with text) |
| **Warning Light** | `#fef3c7` | Warning backgrounds | - |
| **Error** | `#ef4444` | Errors, destructive actions | 4.0:1 |
| **Error Light** | `#fee2e2` | Error backgrounds | - |
| **Info** | `#3b82f6` | Information, tips | 4.5:1 |
| **Info Light** | `#dbeafe` | Info backgrounds | - |

### Neutral Palette

| Name | Hex | Usage |
|------|-----|-------|
| White | `#ffffff` | Backgrounds, cards |
| Gray 50 | `#f9fafb` | Page backgrounds |
| Gray 100 | `#f3f4f6` | Subtle backgrounds |
| Gray 200 | `#e5e7eb` | Borders, dividers |
| Gray 300 | `#d1d5db` | Disabled backgrounds |
| Gray 400 | `#9ca3af` | Placeholder text |
| Gray 500 | `#6b7280` | Secondary text |
| Gray 600 | `#4b5563` | Body text |
| Gray 700 | `#374151` | Headings |
| Gray 800 | `#1f2937` | High emphasis text |
| Gray 900 | `#111827` | Maximum contrast |
| Black | `#000000` | Rarely used |

### Dark Mode Colors (Optional)

| Light Mode | Dark Mode | Usage |
|------------|-----------|-------|
| White (`#ffffff`) | Gray 900 (`#111827`) | Backgrounds |
| Gray 50 (`#f9fafb`) | Gray 800 (`#1f2937`) | Card backgrounds |
| Gray 800 (`#1f2937`) | Gray 100 (`#f3f4f6`) | Body text |
| Primary 500 | Primary 400 | Links, CTAs |

---

## 3. Favicon & App Icon

### Concept & Rationale
- Brand reference: [initials, symbol, motif]
- Meaning: [how it reflects mission/personality]

### Geometry & Composition
- Base shape: [circle, rounded square, hexagon]
- Grid: [e.g., 24x24 grid], stroke weight, corner radius
- Simplification: [how it remains legible at 16x16]

### Color Application
- Primary: [design token name]
- Accent: [design token name]
- Background: [design token name or transparent]
- Contrast: [notes on light/dark background use]

### Exports (do not overwrite without confirmation)
- `public/favicon.svg` (primary)
- `public/favicon.ico` (fallback)
- `public/favicon-16x16.png`
- `public/favicon-32x32.png`
- `public/apple-touch-icon.png` (180x180)
- `public/android-chrome-192x192.png`
- `public/android-chrome-512x512.png`
- `public/site.webmanifest` (optional)

---

## 4. Typography System

### Font Stack

| Type | Family | Fallbacks | Usage |
|------|--------|-----------|-------|
| **Sans-Serif** | [Distinctive choice - see Section 12] | system-ui, -apple-system, sans-serif | Body, UI |
| **Mono** | [e.g., JetBrains Mono, Fira Code] | ui-monospace, monospace | Code |
| **Display** (optional) | [e.g., Playfair Display, Clash Display] | Georgia, serif | Headlines |

> **Font Selection Note**: NEVER use generic fonts (Inter, Roboto, Arial, Open Sans, Lato). Choose distinctive fonts that match the project's personality. See Section 12 for typography direction.

### Type Scale

Using modular scale ratio: **[1.25 (Major Third) | 1.333 (Perfect Fourth) | 1.5 (Perfect Fifth)]**

| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| **Display** | 4rem (64px) | 1.1 | 700 | Hero headlines |
| **H1** | 2.5rem (40px) | 1.2 | 700 | Page titles |
| **H2** | 2rem (32px) | 1.25 | 600 | Section headers |
| **H3** | 1.5rem (24px) | 1.3 | 600 | Subsections |
| **H4** | 1.25rem (20px) | 1.4 | 600 | Card titles |
| **H5** | 1rem (16px) | 1.4 | 600 | Small headings |
| **Body Large** | 1.125rem (18px) | 1.6 | 400 | Lead paragraphs |
| **Body** | 1rem (16px) | 1.5 | 400 | Default text |
| **Body Small** | 0.875rem (14px) | 1.5 | 400 | Secondary text |
| **Caption** | 0.75rem (12px) | 1.4 | 400 | Labels, hints |
| **Overline** | 0.75rem (12px) | 1.4 | 500 | Category labels |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text |
| Medium | 500 | Emphasis, buttons |
| Semibold | 600 | Headings, labels |
| Bold | 700 | Strong emphasis |

### Typographic Guidelines

- **Maximum line length**: 65-75 characters for body text
- **Paragraph spacing**: Use `margin-bottom: 1.5em` between paragraphs
- **Heading spacing**: `margin-top: 2em`, `margin-bottom: 0.5em`
- **Letter spacing**: -0.02em for headings, normal for body

---

## 5. Spacing System

### Base Unit
**8px** (0.5rem) - All spacing values are multiples of 8px

### Spacing Scale

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `spacing-0` | 0 | 0px | Reset |
| `spacing-0.5` | 0.125rem | 2px | Micro spacing |
| `spacing-1` | 0.25rem | 4px | Inline spacing |
| `spacing-2` | 0.5rem | 8px | Tight spacing |
| `spacing-3` | 0.75rem | 12px | Compact elements |
| `spacing-4` | 1rem | 16px | Default spacing |
| `spacing-5` | 1.25rem | 20px | Comfortable spacing |
| `spacing-6` | 1.5rem | 24px | Section padding |
| `spacing-8` | 2rem | 32px | Large gaps |
| `spacing-10` | 2.5rem | 40px | Section margins |
| `spacing-12` | 3rem | 48px | Hero sections |
| `spacing-16` | 4rem | 64px | Major sections |
| `spacing-20` | 5rem | 80px | Page padding |
| `spacing-24` | 6rem | 96px | Large gaps |

### Layout Grid

| Breakpoint | Columns | Gutter | Margin |
|------------|---------|--------|--------|
| Mobile (< 640px) | 4 | 16px | 16px |
| Tablet (640-1023px) | 8 | 24px | 32px |
| Desktop (1024-1279px) | 12 | 24px | 48px |
| Large (1280px+) | 12 | 32px | auto (max-width: 1280px) |

### Container Widths

| Name | Max Width | Usage |
|------|-----------|-------|
| `container-sm` | 640px | Narrow content (articles) |
| `container-md` | 768px | Medium content |
| `container-lg` | 1024px | Standard content |
| `container-xl` | 1280px | Wide content |
| `container-2xl` | 1536px | Full-width layouts |

---

## 6. Effects System

### Shadows/Elevation

| Name | Value | Usage |
|------|-------|-------|
| `shadow-none` | none | Reset |
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle depth |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Cards, dropdowns |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Modals, popovers |
| `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | Floating elements |
| `shadow-2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | Hero images |
| `shadow-inner` | `inset 0 2px 4px 0 rgb(0 0 0 / 0.05)` | Pressed states |

### Border Radius

| Name | Value | Usage |
|------|-------|-------|
| `radius-none` | 0 | Sharp corners |
| `radius-sm` | 0.25rem (4px) | Subtle rounding |
| `radius-md` | 0.5rem (8px) | Default rounding |
| `radius-lg` | 0.75rem (12px) | Cards, modals |
| `radius-xl` | 1rem (16px) | Large elements |
| `radius-2xl` | 1.5rem (24px) | Pills, feature cards |
| `radius-full` | 9999px | Circles, pills |

### Animation/Motion

**Animation Tier**: [MINIMAL | MODERATE | RICH]

#### Duration Scale

| Name | Value | Usage |
|------|-------|-------|
| `duration-75` | 75ms | Micro-interactions |
| `duration-100` | 100ms | Quick feedback |
| `duration-150` | 150ms | Hovers, focus |
| `duration-200` | 200ms | Transitions |
| `duration-300` | 300ms | Page transitions |
| `duration-500` | 500ms | Complex animations |
| `duration-700` | 700ms | Entrance animations |
| `duration-1000` | 1000ms | Elaborate sequences |

#### Easing Functions

| Name | Value | Usage |
|------|-------|-------|
| `ease-linear` | linear | Progress bars |
| `ease-in` | cubic-bezier(0.4, 0, 1, 1) | Exit animations |
| `ease-out` | cubic-bezier(0, 0, 0.2, 1) | Entrance animations |
| `ease-in-out` | cubic-bezier(0.4, 0, 0.2, 1) | State changes |
| `ease-bounce` | cubic-bezier(0.34, 1.56, 0.64, 1) | Playful feedback |

#### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 7. Component Library

### Core Components Matrix

| Component | States Required | Priority |
|-----------|-----------------|----------|
| Button | All 8 | Must Have |
| Input | All 8 | Must Have |
| Select | All 8 | Must Have |
| Checkbox | 6 (no loading) | Must Have |
| Radio | 6 (no loading) | Must Have |
| Toggle/Switch | 6 (no loading) | Must Have |
| Card | 3 (default, hover, focus) | Must Have |
| Modal/Dialog | 2 (open, closed) | Must Have |
| Toast/Notification | 4 (success, warning, error, info) | Should Have |
| Dropdown Menu | All 8 | Should Have |
| Tabs | 4 (default, hover, active, disabled) | Should Have |
| Accordion | 4 (collapsed, expanded, hover, disabled) | Nice to Have |
| Avatar | 3 (image, initials, placeholder) | Nice to Have |
| Badge | 4 (default + variants) | Nice to Have |
| Tooltip | 2 (hidden, visible) | Nice to Have |

### Component State Matrix

All interactive components must define these states:

| State | Description | Visual Treatment |
|-------|-------------|------------------|
| **Default** | Resting state | Base styles |
| **Hover** | Mouse over (desktop) | Subtle highlight, cursor change |
| **Focus** | Keyboard focus | Visible focus ring |
| **Active** | Being clicked/pressed | Darker shade, slight scale |
| **Disabled** | Not interactive | Reduced opacity (50%), no pointer events |
| **Loading** | Async operation | Spinner, disabled interaction |
| **Error** | Validation failure | Red border, error message |
| **Empty** | No content | Placeholder styling |

---

## 8. Accessibility Standards

### WCAG Target Level
**[AA | AAA]** - [Rationale for choice]

### Compliance Requirements

| Criterion | Level | Requirement | Implementation |
|-----------|-------|-------------|----------------|
| 1.4.3 Contrast (Minimum) | AA | 4.5:1 for text, 3:1 for large text | Verified all color combinations |
| 1.4.6 Contrast (Enhanced) | AAA | 7:1 for text, 4.5:1 for large text | [If targeting AAA] |
| 1.4.11 Non-text Contrast | AA | 3:1 for UI components | Focus rings, borders |
| 2.1.1 Keyboard | A | All functionality via keyboard | Tab order, focus management |
| 2.4.7 Focus Visible | AA | Visible focus indicator | 2px solid outline + offset |
| 2.5.5 Target Size | AAA | 44×44px minimum | Touch targets |

### Focus Indicator Style

```css
/* Standard focus indicator */
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Remove focus ring for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Screen Reader Considerations

| Element | Requirement |
|---------|-------------|
| Images | Alt text or aria-hidden |
| Icons | aria-hidden + visible text OR aria-label |
| Loading states | aria-busy="true", aria-live regions |
| Errors | aria-invalid, aria-describedby |
| Dynamic content | aria-live="polite" |

---

## 9. Responsive Design

### Breakpoints

| Name | Min Width | Max Width | Target Devices |
|------|-----------|-----------|----------------|
| `xs` | 0 | 319px | Legacy small phones |
| `sm` | 320px | 639px | Phones |
| `md` | 640px | 767px | Large phones, small tablets |
| `lg` | 768px | 1023px | Tablets |
| `xl` | 1024px | 1279px | Small laptops |
| `2xl` | 1280px | ∞ | Desktops |

### Responsive Patterns

| Pattern | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Navigation | Hamburger menu | Collapsed sidebar | Full navbar |
| Card Grid | 1 column | 2 columns | 3-4 columns |
| Data Table | Stacked cards | Horizontal scroll | Full table |
| Forms | Single column | Single column | Two columns |
| Hero | Stacked, smaller text | Side-by-side | Full layout |

### Typography Scaling

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Display | 2.5rem | 3rem | 4rem |
| H1 | 2rem | 2.25rem | 2.5rem |
| H2 | 1.5rem | 1.75rem | 2rem |
| Body | 1rem | 1rem | 1rem |

---

## 10. Design Tokens Export

### JSON Source (tokens.json)

```json
{
  "$schema": "https://design-tokens.github.io/schema/v1",
  "colors": {
    "primary": {
      "50": { "value": "#[hex]" },
      "500": { "value": "#[hex]" },
      "900": { "value": "#[hex]" }
    },
    "semantic": {
      "success": { "value": "#10b981" },
      "warning": { "value": "#f59e0b" },
      "error": { "value": "#ef4444" },
      "info": { "value": "#3b82f6" }
    },
    "neutral": {
      "50": { "value": "#f9fafb" },
      "500": { "value": "#6b7280" },
      "900": { "value": "#111827" }
    }
  },
  "typography": {
    "fontFamily": {
      "sans": { "value": "[DISTINCTIVE_FONT], system-ui, sans-serif" },
      "mono": { "value": "JetBrains Mono, ui-monospace, monospace" },
      "_note": "Replace [DISTINCTIVE_FONT] with project-specific choice. NEVER use: Inter, Roboto, Arial, Open Sans, Lato"
    },
    "fontSize": {
      "xs": { "value": "0.75rem" },
      "sm": { "value": "0.875rem" },
      "base": { "value": "1rem" },
      "lg": { "value": "1.125rem" },
      "xl": { "value": "1.25rem" },
      "2xl": { "value": "1.5rem" }
    }
  },
  "spacing": {
    "0": { "value": "0" },
    "1": { "value": "0.25rem" },
    "2": { "value": "0.5rem" },
    "4": { "value": "1rem" },
    "8": { "value": "2rem" }
  },
  "borderRadius": {
    "sm": { "value": "0.25rem" },
    "md": { "value": "0.5rem" },
    "lg": { "value": "0.75rem" },
    "full": { "value": "9999px" }
  }
}
```

### Framework Exports

Export files generated in `RLM/specs/design/tokens/`:

| Framework | File | Format |
|-----------|------|--------|
| Tailwind CSS | `tailwind.config.partial.js` | theme.extend object |
| Material UI | `mui-theme.ts` | createTheme() input |
| Chakra UI | `chakra-theme.ts` | extendTheme() input |
| Bootstrap | `_variables.scss` | SCSS variables |
| Ant Design | `antd-tokens.ts` | ConfigProvider token object |
| CSS Variables | `variables.css` | :root custom properties |

---

## 11. Implementation Guidelines

### CSS Class Naming

Follow [BEM | Tailwind | CSS Modules] convention:

```css
/* BEM Example */
.card { }
.card__header { }
.card__body { }
.card--featured { }

/* Tailwind Example */
className="rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
```

### Component File Structure

```
components/
├── ui/               # Primitive components
│   ├── button.tsx
│   ├── input.tsx
│   └── card.tsx
├── patterns/         # Composite patterns
│   ├── form-field.tsx
│   └── data-table.tsx
└── layouts/          # Page layouts
    ├── app-shell.tsx
    └── auth-layout.tsx
```

### Design-Dev Handoff Checklist

- [ ] Design tokens exported to target framework
- [ ] All component states documented
- [ ] Responsive behavior specified
- [ ] Accessibility requirements noted
- [ ] Animation tier and effects defined
- [ ] Code snippets for common patterns provided

---

## 12. Aesthetic Direction

All UI projects receive distinctive aesthetics guidance to avoid the generic "AI slop" aesthetic.

### Philosophy

| Project Type | Aesthetic Approach | Key Focus |
|--------------|-------------------|-----------|
| B2B SaaS | Distinctive (Professional) | Trust + polish, avoid generic |
| Consumer App | Distinctive (Delightful) | Brand differentiation, engagement |
| Marketing Site | Distinctive (Bold) | Attention capture, memorability |
| Internal Tool | Distinctive (Efficient) | Clean but not generic |
| Dashboard | Distinctive (Data-focused) | Clarity + visual appeal |
| Mobile App | Distinctive (Touch-first) | Tactile feedback, motion |

**All projects avoid generic AI aesthetics through intentional typography, color, motion, and background choices.**

### Typography Direction

All UI projects use distinctive typography:

| Context | Recommended Fonts | Never Use |
|---------|------------------|-----------|
| Code/Tech | JetBrains Mono, Fira Code, Space Grotesk | Inter |
| Editorial | Playfair Display, Crimson Pro, Fraunces | Roboto |
| Startup/Modern | Clash Display, Satoshi, Cabinet Grotesk | Arial |
| Technical/Pro | IBM Plex Sans, Source Sans 3 | Open Sans |
| Distinctive | Bricolage Grotesque, Obviously, Newsreader | Lato |

**Font Pairing Principles:**
- High contrast creates interest: serif + geometric sans, display + monospace
- Use extreme weight variations: 100/200 vs 800/900 (not subtle 400 vs 600)
- Size jumps of 3x+ create visual hierarchy

**Selected Typography for This Project:**
- Primary: [Distinctive font name] - [Rationale based on project personality]
- Secondary: [Contrasting pair] - [How it creates visual interest]
- Weight contrast: [e.g., "200 for body text, 800 for headings"]

### Color Theme Inspiration

Document the visual inspiration for the color system:

| Attribute | Value |
|-----------|-------|
| **Inspiration Source** | [e.g., "Monokai IDE theme", "California sunset palette", "Brutalist architecture"] |
| **Dominant Color** | [Primary color with usage percentage, e.g., "Deep purple (#6366f1) at 60%"] |
| **Accent Strategy** | [How accents create visual hierarchy, e.g., "Sharp cyan accents for CTAs"] |
| **Atmosphere** | [Light/dark, warm/cool, minimal/rich] |

**Color Principles:**
- Commit to a cohesive aesthetic (not timid, evenly-distributed palettes)
- Dominant colors with sharp accents over safe neutrals
- Draw from IDE themes (Monokai, Dracula) or cultural aesthetics (Solarpunk, cyberpunk)

### Animation Strategy

Based on animation tier, define the motion approach:

| Animation | Description | Implementation |
|-----------|-------------|----------------|
| **Entry Animation** | [Page load orchestration] | [e.g., "Staggered fade-in with 100ms delay between elements"] |
| **Micro-interactions** | [Hover, click feedback] | [e.g., "Scale 1.02 on hover, press effect on click"] |
| **Transitions** | [Navigation, state changes] | [e.g., "Crossfade between views, 200ms ease-out"] |
| **Signature Moment** | [One memorable animation] | [e.g., "Hero section gradient shifts on scroll"] |

**Motion Principles:**
- One well-orchestrated page load beats scattered micro-interactions
- Use `animation-delay` for staggered reveals
- High-impact moments over constant motion
- Always include `prefers-reduced-motion` fallback

### Background Atmosphere

Define the background treatment:

| Surface | Technique | Description |
|---------|-----------|-------------|
| **Page Background** | [Gradient/Pattern/Solid] | [e.g., "Layered radial gradient: deep purple to black"] |
| **Card Background** | [Treatment] | [e.g., "Glass effect with blur backdrop"] |
| **Hero Section** | [Treatment] | [e.g., "Geometric grid pattern with subtle animation"] |
| **Modal Overlay** | [Treatment] | [e.g., "Dark overlay with blur"] |

**Background Principles:**
- Create atmosphere and depth (avoid flat solid colors)
- Layer CSS gradients for visual interest
- Use geometric patterns matching the aesthetic
- Contextual effects that enhance, not distract

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [Date] | [Name] | Initial design system |
