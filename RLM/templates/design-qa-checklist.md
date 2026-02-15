# Design QA Checklist: [Feature/Component Name]

**Version:** 1.0
**QA Date:** [Date]
**Reviewer:** [Name/Agent]
**Target:** [Feature ID or Component Name]

---

## Summary

| Category | Score | Max | Status |
|----------|-------|-----|--------|
| Visual Quality | /20 | 20 | |
| Accessibility | /25 | 25 | |
| Responsive Design | /18 | 18 | |
| Interaction Design | /18 | 18 | |
| Performance | /12 | 12 | |
| Cross-Browser | /12 | 12 | |
| Design System Compliance | /12 | 12 | |
| Aesthetic Quality (UI projects) | /10 | 10 | |
| **TOTAL** | **/127** | 127 | |

### Pass Criteria
- **PASS**: ≥90% overall (114+), no category below 80%
- **PARTIAL**: ≥75% overall (95+), accessibility ≥90% (22+)
- **FAIL**: <75% overall OR accessibility <90%

**Note:** Aesthetic Quality (10 points) applies to all UI projects. For non-UI projects, use the original 117-point scale.

### Result: **[PASS / PARTIAL / FAIL]**

---

## 1. Visual Quality (20 points)

### Brand Alignment (5 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| Colors match design system | 1 | ☐ | |
| Typography follows type scale | 1 | ☐ | |
| Spacing uses design tokens | 1 | ☐ | |
| Icons consistent in style | 1 | ☐ | |
| Overall aesthetic matches brand personality | 1 | ☐ | |

**Subtotal:** /5

### Component Consistency (5 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| Buttons consistent across views | 1 | ☐ | |
| Form elements uniform styling | 1 | ☐ | |
| Cards follow same pattern | 1 | ☐ | |
| Navigation consistent | 1 | ☐ | |
| Modals/dialogs consistent | 1 | ☐ | |

**Subtotal:** /5

### Layout Quality (5 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| Proper alignment (grid adherence) | 1 | ☐ | |
| Consistent whitespace | 1 | ☐ | |
| Visual hierarchy clear | 1 | ☐ | |
| Balance and composition | 1 | ☐ | |
| No orphaned elements | 1 | ☐ | |

**Subtotal:** /5

### Visual Polish (5 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| No pixel-level alignment issues | 1 | ☐ | |
| Shadows/elevation appropriate | 1 | ☐ | |
| Border radius consistent | 1 | ☐ | |
| No visual artifacts | 1 | ☐ | |
| Images properly sized/cropped | 1 | ☐ | |

**Subtotal:** /5

**VISUAL QUALITY TOTAL:** /20

---

## 2. Accessibility (25 points)

### Color Contrast (6 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| Normal text ≥ 4.5:1 contrast | 2 | ☐ | |
| Large text ≥ 3:1 contrast | 1 | ☐ | |
| UI components ≥ 3:1 contrast | 1 | ☐ | |
| Focus indicators visible | 1 | ☐ | |
| Information not conveyed by color alone | 1 | ☐ | |

**Subtotal:** /6

### Keyboard Navigation (6 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| All interactive elements focusable | 2 | ☐ | |
| Logical tab order | 1 | ☐ | |
| No keyboard traps | 1 | ☐ | |
| Skip links present (if needed) | 1 | ☐ | |
| Focus visible at all times | 1 | ☐ | |

**Subtotal:** /6

### Screen Reader Support (6 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| Semantic HTML structure | 1 | ☐ | |
| ARIA labels where needed | 1 | ☐ | |
| Images have alt text | 1 | ☐ | |
| Form labels associated | 1 | ☐ | |
| Error messages announced | 1 | ☐ | |
| Dynamic content uses aria-live | 1 | ☐ | |

**Subtotal:** /6

### Interaction Accessibility (4 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| Touch targets ≥ 44×44px | 1 | ☐ | |
| Sufficient spacing between targets | 1 | ☐ | |
| No time limits (or extendable) | 1 | ☐ | |
| Error recovery possible | 1 | ☐ | |

**Subtotal:** /4

### Motion/Animation (3 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| prefers-reduced-motion respected | 1 | ☐ | |
| No seizure-inducing flashing | 1 | ☐ | |
| Animations can be paused | 1 | ☐ | |

**Subtotal:** /3

**ACCESSIBILITY TOTAL:** /25

---

## 3. Responsive Design (18 points)

### Mobile (320-639px) (6 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| Content readable without zoom | 1 | ☐ | |
| No horizontal scroll | 1 | ☐ | |
| Touch targets appropriately sized | 1 | ☐ | |
| Navigation accessible | 1 | ☐ | |
| Forms usable on mobile | 1 | ☐ | |
| Images scale properly | 1 | ☐ | |

**Subtotal:** /6

### Tablet (640-1023px) (6 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| Layout adapts appropriately | 1 | ☐ | |
| Grid transitions smoothly | 1 | ☐ | |
| Navigation appropriate for size | 1 | ☐ | |
| Spacing adjusts properly | 1 | ☐ | |
| Typography scales correctly | 1 | ☐ | |
| Both orientations work | 1 | ☐ | |

**Subtotal:** /6

### Desktop (1024px+) (6 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| Full layout displays correctly | 1 | ☐ | |
| Proper max-width constraints | 1 | ☐ | |
| Multi-column layouts work | 1 | ☐ | |
| Hover states implemented | 1 | ☐ | |
| Large screen optimization | 1 | ☐ | |
| No awkward empty space | 1 | ☐ | |

**Subtotal:** /6

**RESPONSIVE DESIGN TOTAL:** /18

---

## 4. Interaction Design (18 points)

### Feedback & Affordance (6 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| Buttons indicate clickability | 1 | ☐ | |
| Links distinguishable from text | 1 | ☐ | |
| Loading states present | 1 | ☐ | |
| Success/error feedback clear | 1 | ☐ | |
| Progress indicators for long operations | 1 | ☐ | |
| Cursor changes appropriately | 1 | ☐ | |

**Subtotal:** /6

### State Management (6 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| Default state styled | 1 | ☐ | |
| Hover state implemented | 1 | ☐ | |
| Focus state visible | 1 | ☐ | |
| Active/pressed state | 1 | ☐ | |
| Disabled state clear | 1 | ☐ | |
| Error state implemented | 1 | ☐ | |

**Subtotal:** /6

### Micro-interactions (6 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| Transitions smooth (no jank) | 1 | ☐ | |
| Animation duration appropriate | 1 | ☐ | |
| Easing feels natural | 1 | ☐ | |
| Animations purposeful | 1 | ☐ | |
| No excessive animation | 1 | ☐ | |
| Skeleton loaders (if needed) | 1 | ☐ | |

**Subtotal:** /6

**INTERACTION DESIGN TOTAL:** /18

---

## 5. Performance (12 points)

### Asset Optimization (4 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| Images optimized (WebP, proper size) | 1 | ☐ | |
| No unnecessary large assets | 1 | ☐ | |
| Icons use SVG or icon font | 1 | ☐ | |
| CSS/JS bundled efficiently | 1 | ☐ | |

**Subtotal:** /4

### Perceived Performance (4 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| Above-fold content loads first | 1 | ☐ | |
| Skeleton loaders prevent CLS | 1 | ☐ | |
| Lazy loading for below-fold | 1 | ☐ | |
| Optimistic UI updates | 1 | ☐ | |

**Subtotal:** /4

### Animation Performance (4 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| Animations run at 60fps | 1 | ☐ | |
| GPU-accelerated transforms used | 1 | ☐ | |
| No layout thrashing | 1 | ☐ | |
| will-change used appropriately | 1 | ☐ | |

**Subtotal:** /4

**PERFORMANCE TOTAL:** /12

---

## 6. Cross-Browser/Platform (12 points)

### Browser Support (8 points)

| Browser | Status | Issues |
|---------|--------|--------|
| Chrome (latest 2) | ☐ 2pt | |
| Firefox (latest 2) | ☐ 2pt | |
| Safari (latest 2) | ☐ 2pt | |
| Edge (latest 2) | ☐ 2pt | |

**Subtotal:** /8

### Platform Considerations (4 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| iOS Safari tested | 1 | ☐ | |
| Android Chrome tested | 1 | ☐ | |
| System font fallbacks work | 1 | ☐ | |
| Touch vs mouse interactions | 1 | ☐ | |

**Subtotal:** /4

**CROSS-BROWSER TOTAL:** /12

---

## 7. Design System Compliance (12 points)

### Token Usage (4 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| Colors from design tokens | 1 | ☐ | |
| Spacing from design tokens | 1 | ☐ | |
| Typography from design tokens | 1 | ☐ | |
| Shadows/effects from tokens | 1 | ☐ | |

**Subtotal:** /4

### Component Usage (4 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| Uses existing components | 1 | ☐ | |
| No unnecessary custom components | 1 | ☐ | |
| Components used as intended | 1 | ☐ | |
| Consistent component variants | 1 | ☐ | |

**Subtotal:** /4

### Documentation (4 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| New patterns documented | 1 | ☐ | |
| Deviations justified | 1 | ☐ | |
| Code comments where needed | 1 | ☐ | |
| Storybook/examples updated | 1 | ☐ | |

**Subtotal:** /4

**DESIGN SYSTEM COMPLIANCE TOTAL:** /12

---

## 8. Aesthetic Quality (10 points) - All UI Projects

This category ensures UIs avoid the generic "AI slop" aesthetic through intentional design choices.

### Typography Distinctiveness (3 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| Uses non-generic fonts (not Inter/Roboto/Arial/Lato) | 1 | ☐ | |
| Font pairing creates visual interest | 1 | ☐ | |
| Weight/size contrast is bold (not subtle 400 vs 600) | 1 | ☐ | |

**Subtotal:** /3

**Typography Guidance:**
- Recommended: JetBrains Mono, Space Grotesk, Playfair Display, Clash Display, Cabinet Grotesk, IBM Plex
- Avoid: Inter, Roboto, Arial, Open Sans, Lato, system-ui defaults
- Use extreme weight contrast (100/200 vs 800/900)

### Color & Theme Cohesion (3 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| Clear aesthetic direction (not generic) | 1 | ☐ | |
| Dominant color with sharp accents | 1 | ☐ | |
| Consistent atmosphere across screens | 1 | ☐ | |

**Subtotal:** /3

**Color Guidance:**
- Commit to a cohesive aesthetic (avoid timid, evenly-distributed palettes)
- Draw from IDE themes (Monokai, Dracula) or cultural aesthetics (Solarpunk, cyberpunk)
- Dominant colors with sharp accents over safe neutrals

### Motion Impact (2 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| Page load has orchestrated animation | 1 | ☐ | |
| Animations create delight (not distraction) | 1 | ☐ | |

**Subtotal:** /2

**Motion Guidance:**
- One well-orchestrated page load with staggered reveals (`animation-delay`)
- High-impact moments over scattered micro-interactions
- Must still respect `prefers-reduced-motion`

### Background Atmosphere (2 points)

| Check | Points | Status | Notes |
|-------|--------|--------|-------|
| Background creates depth (not flat solid) | 1 | ☐ | |
| Visual effects match aesthetic direction | 1 | ☐ | |

**Subtotal:** /2

**Background Guidance:**
- Layer CSS gradients for visual interest
- Use geometric patterns matching the aesthetic
- Avoid plain solid colors on primary surfaces

**AESTHETIC QUALITY TOTAL:** /10

**Aesthetic Quality Pass Criteria:** ≥8/10

---

## Issues Found

### Critical (Must fix before release)

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 1 | | | | |
| 2 | | | | |

### Major (Should fix before release)

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 1 | | | | |
| 2 | | | | |

### Minor (Fix when possible)

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 1 | | | | |
| 2 | | | | |

---

## Recommendations

### Immediate Actions
1. [Action 1]
2. [Action 2]

### Future Improvements
1. [Improvement 1]
2. [Improvement 2]

---

## Sign-off

| Role | Name | Date | Approval |
|------|------|------|----------|
| Design QA | | | ☐ |
| Developer | | | ☐ |
| Product Owner | | | ☐ |

---

## Revision History

| Version | Date | Reviewer | Result | Notes |
|---------|------|----------|--------|-------|
| 1.0 | [Date] | [Name] | [PASS/PARTIAL/FAIL] | Initial QA |
