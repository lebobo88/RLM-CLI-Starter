# Design Tokens: [Project Name]

**Version:** 1.0
**Last Updated:** [Date]
**Source File:** `RLM/specs/design/tokens/tokens.json`

---

## Overview

Design tokens are the atomic values of the design system. They represent design decisions as data, enabling consistent styling across platforms and frameworks.

### Token Categories
- **Colors**: Brand, semantic, and neutral palettes
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Margin and padding scale
- **Sizing**: Width, height constraints
- **Border Radius**: Corner rounding scale
- **Shadows**: Elevation levels
- **Animation**: Duration and easing

---

## Source Tokens (tokens.json)

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "colors": {
    "primary": {
      "50": { "$value": "#eff6ff", "$type": "color" },
      "100": { "$value": "#dbeafe", "$type": "color" },
      "200": { "$value": "#bfdbfe", "$type": "color" },
      "300": { "$value": "#93c5fd", "$type": "color" },
      "400": { "$value": "#60a5fa", "$type": "color" },
      "500": { "$value": "#3b82f6", "$type": "color" },
      "600": { "$value": "#2563eb", "$type": "color" },
      "700": { "$value": "#1d4ed8", "$type": "color" },
      "800": { "$value": "#1e40af", "$type": "color" },
      "900": { "$value": "#1e3a8a", "$type": "color" }
    },
    "semantic": {
      "success": { "$value": "#10b981", "$type": "color" },
      "successLight": { "$value": "#d1fae5", "$type": "color" },
      "warning": { "$value": "#f59e0b", "$type": "color" },
      "warningLight": { "$value": "#fef3c7", "$type": "color" },
      "error": { "$value": "#ef4444", "$type": "color" },
      "errorLight": { "$value": "#fee2e2", "$type": "color" },
      "info": { "$value": "#3b82f6", "$type": "color" },
      "infoLight": { "$value": "#dbeafe", "$type": "color" }
    },
    "neutral": {
      "white": { "$value": "#ffffff", "$type": "color" },
      "50": { "$value": "#f9fafb", "$type": "color" },
      "100": { "$value": "#f3f4f6", "$type": "color" },
      "200": { "$value": "#e5e7eb", "$type": "color" },
      "300": { "$value": "#d1d5db", "$type": "color" },
      "400": { "$value": "#9ca3af", "$type": "color" },
      "500": { "$value": "#6b7280", "$type": "color" },
      "600": { "$value": "#4b5563", "$type": "color" },
      "700": { "$value": "#374151", "$type": "color" },
      "800": { "$value": "#1f2937", "$type": "color" },
      "900": { "$value": "#111827", "$type": "color" },
      "black": { "$value": "#000000", "$type": "color" }
    }
  },
  "typography": {
    "fontFamily": {
      "sans": { "$value": "Inter, system-ui, -apple-system, sans-serif", "$type": "fontFamily" },
      "mono": { "$value": "JetBrains Mono, ui-monospace, monospace", "$type": "fontFamily" }
    },
    "fontSize": {
      "xs": { "$value": "0.75rem", "$type": "dimension" },
      "sm": { "$value": "0.875rem", "$type": "dimension" },
      "base": { "$value": "1rem", "$type": "dimension" },
      "lg": { "$value": "1.125rem", "$type": "dimension" },
      "xl": { "$value": "1.25rem", "$type": "dimension" },
      "2xl": { "$value": "1.5rem", "$type": "dimension" },
      "3xl": { "$value": "2rem", "$type": "dimension" },
      "4xl": { "$value": "2.5rem", "$type": "dimension" },
      "5xl": { "$value": "3rem", "$type": "dimension" }
    },
    "fontWeight": {
      "normal": { "$value": "400", "$type": "fontWeight" },
      "medium": { "$value": "500", "$type": "fontWeight" },
      "semibold": { "$value": "600", "$type": "fontWeight" },
      "bold": { "$value": "700", "$type": "fontWeight" }
    },
    "lineHeight": {
      "tight": { "$value": "1.25", "$type": "number" },
      "normal": { "$value": "1.5", "$type": "number" },
      "relaxed": { "$value": "1.75", "$type": "number" }
    }
  },
  "spacing": {
    "0": { "$value": "0", "$type": "dimension" },
    "0.5": { "$value": "0.125rem", "$type": "dimension" },
    "1": { "$value": "0.25rem", "$type": "dimension" },
    "2": { "$value": "0.5rem", "$type": "dimension" },
    "3": { "$value": "0.75rem", "$type": "dimension" },
    "4": { "$value": "1rem", "$type": "dimension" },
    "5": { "$value": "1.25rem", "$type": "dimension" },
    "6": { "$value": "1.5rem", "$type": "dimension" },
    "8": { "$value": "2rem", "$type": "dimension" },
    "10": { "$value": "2.5rem", "$type": "dimension" },
    "12": { "$value": "3rem", "$type": "dimension" },
    "16": { "$value": "4rem", "$type": "dimension" },
    "20": { "$value": "5rem", "$type": "dimension" },
    "24": { "$value": "6rem", "$type": "dimension" }
  },
  "borderRadius": {
    "none": { "$value": "0", "$type": "dimension" },
    "sm": { "$value": "0.25rem", "$type": "dimension" },
    "md": { "$value": "0.5rem", "$type": "dimension" },
    "lg": { "$value": "0.75rem", "$type": "dimension" },
    "xl": { "$value": "1rem", "$type": "dimension" },
    "2xl": { "$value": "1.5rem", "$type": "dimension" },
    "full": { "$value": "9999px", "$type": "dimension" }
  },
  "shadows": {
    "none": { "$value": "none", "$type": "shadow" },
    "sm": { "$value": "0 1px 2px 0 rgb(0 0 0 / 0.05)", "$type": "shadow" },
    "md": { "$value": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)", "$type": "shadow" },
    "lg": { "$value": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)", "$type": "shadow" },
    "xl": { "$value": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)", "$type": "shadow" }
  },
  "animation": {
    "duration": {
      "fast": { "$value": "150ms", "$type": "duration" },
      "normal": { "$value": "200ms", "$type": "duration" },
      "slow": { "$value": "300ms", "$type": "duration" },
      "slower": { "$value": "500ms", "$type": "duration" }
    },
    "easing": {
      "linear": { "$value": "linear", "$type": "cubicBezier" },
      "easeIn": { "$value": "cubic-bezier(0.4, 0, 1, 1)", "$type": "cubicBezier" },
      "easeOut": { "$value": "cubic-bezier(0, 0, 0.2, 1)", "$type": "cubicBezier" },
      "easeInOut": { "$value": "cubic-bezier(0.4, 0, 0.2, 1)", "$type": "cubicBezier" }
    }
  }
}
```

---

## Framework Exports

### Tailwind CSS (tailwind.config.partial.js)

```javascript
// Add to tailwind.config.js theme.extend
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: '#10b981',
        'success-light': '#d1fae5',
        warning: '#f59e0b',
        'warning-light': '#fef3c7',
        error: '#ef4444',
        'error-light': '#fee2e2',
        info: '#3b82f6',
        'info-light': '#dbeafe',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 200ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
}
```

### Material UI (mui-theme.ts)

```typescript
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      light: '#60a5fa',
      main: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      light: '#93c5fd',
      main: '#3b82f6',
      dark: '#1e40af',
    },
    success: {
      light: '#d1fae5',
      main: '#10b981',
      dark: '#047857',
    },
    warning: {
      light: '#fef3c7',
      main: '#f59e0b',
      dark: '#b45309',
    },
    error: {
      light: '#fee2e2',
      main: '#ef4444',
      dark: '#b91c1c',
    },
    info: {
      light: '#dbeafe',
      main: '#3b82f6',
      dark: '#1d4ed8',
    },
    grey: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.25 },
    h3: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', lineHeight: 1.4 },
  },
  spacing: 8, // Base unit: 8px
  shape: {
    borderRadius: 8, // Default: md (0.5rem)
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgb(0 0 0 / 0.05)', // sm
    '0 4px 6px -1px rgb(0 0 0 / 0.1)', // md
    // ... extend as needed
  ],
});
```

### Chakra UI (chakra-theme.ts)

```typescript
import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    success: {
      50: '#d1fae5',
      500: '#10b981',
    },
    warning: {
      50: '#fef3c7',
      500: '#f59e0b',
    },
    error: {
      50: '#fee2e2',
      500: '#ef4444',
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    '4xl': '2.5rem',
  },
  radii: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
  transition: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
});
```

### Bootstrap (\_variables.scss)

```scss
// Colors
$primary: #3b82f6;
$secondary: #6b7280;
$success: #10b981;
$warning: #f59e0b;
$danger: #ef4444;
$info: #3b82f6;
$light: #f9fafb;
$dark: #111827;

// Primary color shades
$blue-100: #dbeafe;
$blue-200: #bfdbfe;
$blue-300: #93c5fd;
$blue-400: #60a5fa;
$blue-500: #3b82f6;
$blue-600: #2563eb;
$blue-700: #1d4ed8;
$blue-800: #1e40af;
$blue-900: #1e3a8a;

// Typography
$font-family-sans-serif: 'Inter', system-ui, -apple-system, sans-serif;
$font-family-monospace: 'JetBrains Mono', ui-monospace, monospace;

$font-size-base: 1rem;
$h1-font-size: 2.5rem;
$h2-font-size: 2rem;
$h3-font-size: 1.5rem;
$h4-font-size: 1.25rem;
$h5-font-size: 1rem;

$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;

// Spacing
$spacer: 1rem;
$spacers: (
  0: 0,
  1: 0.25rem,
  2: 0.5rem,
  3: 0.75rem,
  4: 1rem,
  5: 1.25rem,
  6: 1.5rem,
  8: 2rem,
  10: 2.5rem,
  12: 3rem,
);

// Border radius
$border-radius-sm: 0.25rem;
$border-radius: 0.5rem;
$border-radius-lg: 0.75rem;
$border-radius-xl: 1rem;
$border-radius-pill: 9999px;

// Shadows
$box-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
$box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
$box-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

// Transitions
$transition-base: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
$transition-fade: opacity 150ms linear;
```

### CSS Custom Properties (variables.css)

```css
:root {
  /* Colors - Primary */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;

  /* Colors - Semantic */
  --color-success: #10b981;
  --color-success-light: #d1fae5;
  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;
  --color-error: #ef4444;
  --color-error-light: #fee2e2;
  --color-info: #3b82f6;
  --color-info-light: #dbeafe;

  /* Colors - Neutral */
  --color-white: #ffffff;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  --color-black: #000000;

  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 2rem;
  --text-4xl: 2.5rem;

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* Spacing */
  --space-0: 0;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;

  /* Border Radius */
  --radius-none: 0;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* Animation */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;

  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--color-gray-900);
    --color-surface: var(--color-gray-800);
    --color-text-primary: var(--color-gray-100);
    --color-text-secondary: var(--color-gray-400);
  }
}
```

### Ant Design (antd-tokens.ts)

```typescript
import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#3b82f6',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#3b82f6',

    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f9fafb',

    colorText: '#1f2937',
    colorTextSecondary: '#6b7280',
    colorTextTertiary: '#9ca3af',

    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 40,
    fontSizeHeading2: 32,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,

    borderRadius: 8,
    borderRadiusSM: 4,
    borderRadiusLG: 12,

    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    boxShadowSecondary: '0 1px 2px 0 rgb(0 0 0 / 0.05)',

    motionDurationFast: '150ms',
    motionDurationMid: '200ms',
    motionDurationSlow: '300ms',
  },
};
```

---

## Token Usage Guidelines

### Referencing Tokens in Code

**Tailwind CSS:**
```html
<button class="bg-primary-500 hover:bg-primary-600 text-white rounded-md px-4 py-2">
  Button
</button>
```

**CSS Variables:**
```css
.button {
  background-color: var(--color-primary-500);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
}
```

**CSS-in-JS:**
```typescript
const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.primary[500]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
`;
```

### Token Naming Conventions

| Category | Pattern | Example |
|----------|---------|---------|
| Colors | `color-{name}-{shade}` | `color-primary-500` |
| Spacing | `space-{size}` | `space-4` |
| Typography | `text-{size}` or `font-{property}` | `text-lg`, `font-bold` |
| Radius | `radius-{size}` | `radius-md` |
| Shadow | `shadow-{size}` | `shadow-lg` |
| Duration | `duration-{speed}` | `duration-normal` |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [Date] | [Name] | Initial tokens |
