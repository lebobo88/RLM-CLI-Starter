# Accessibility Guide

Comprehensive guide for implementing WCAG 2.1 AA (and AAA) compliant interfaces.

---

## Quick Reference

### WCAG 2.1 Success Criteria Summary

| Level | Requirement | Key Checks |
|-------|-------------|------------|
| **A** | Minimum | Text alternatives, keyboard access, no seizures |
| **AA** | Standard | Color contrast 4.5:1, resize text, multiple ways |
| **AAA** | Enhanced | Contrast 7:1, sign language, extended audio |

**RLM Standard**: WCAG 2.1 AA minimum, AAA optional.

---

## 1. Color & Contrast

### Contrast Ratios

| Element | AA Minimum | AAA Enhanced |
|---------|------------|--------------|
| Normal text (<18px) | 4.5:1 | 7:1 |
| Large text (≥18px bold or ≥24px) | 3:1 | 4.5:1 |
| UI components & graphics | 3:1 | 3:1 |
| Focus indicators | 3:1 | 3:1 |

### Tools for Checking

- **Browser DevTools**: Chrome/Firefox accessibility inspector
- **WebAIM Contrast Checker**: webaim.org/resources/contrastchecker
- **Stark** (Figma plugin): Color contrast checking
- **axe DevTools**: Automated accessibility testing

### Color Examples

```css
/* Good contrast examples */
.text-primary {
  color: #1f2937;           /* gray-800 on white: 12.6:1 ✓ */
  background: #ffffff;
}

.text-secondary {
  color: #4b5563;           /* gray-600 on white: 7.0:1 ✓ */
  background: #ffffff;
}

.button-primary {
  color: #ffffff;           /* white on primary-600: 4.9:1 ✓ */
  background: #2563eb;
}

/* Danger zone - check carefully */
.text-muted {
  color: #9ca3af;           /* gray-400 on white: 2.9:1 ✗ (fails AA) */
  /* Use gray-500 (#6b7280) instead: 4.5:1 ✓ */
}
```

### Don't Rely on Color Alone

```jsx
// ❌ BAD: Color is the only indicator
<span className="text-red-500">Error occurred</span>

// ✓ GOOD: Color + icon + text
<span className="text-red-500">
  <AlertIcon aria-hidden="true" />
  Error: Email is invalid
</span>

// ❌ BAD: Form error with color only
<input className="border-red-500" />

// ✓ GOOD: Color + icon + message
<input
  className="border-red-500"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<p id="email-error" className="text-red-500">
  <AlertIcon aria-hidden="true" /> Email is invalid
</p>
```

---

## 2. Keyboard Navigation

### Focus Order

Focus must follow logical reading order (typically left-to-right, top-to-bottom).

```jsx
// ✓ Natural tab order follows visual layout
<header>
  <nav>
    <a href="/">Home</a>          {/* Tab 1 */}
    <a href="/products">Products</a>  {/* Tab 2 */}
    <a href="/about">About</a>     {/* Tab 3 */}
  </nav>
</header>
<main>
  <input type="search" />         {/* Tab 4 */}
  <button>Search</button>         {/* Tab 5 */}
</main>

// ❌ Avoid positive tabindex (disrupts natural order)
<input tabIndex={2} />  // Don't do this

// ✓ Use tabIndex="0" for custom focusable elements
<div role="button" tabIndex={0} onClick={handleClick}>
  Custom Button
</div>

// ✓ Use tabIndex="-1" for programmatic focus only
<div id="dialog" tabIndex={-1}>
  {/* Focus here programmatically when dialog opens */}
</div>
```

### Focus Indicators

**REQUIRED**: All focusable elements must have visible focus indicators.

```css
/* Base focus style - REQUIRED */
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Remove default outline only if replacing with visible alternative */
:focus {
  outline: none;
}
:focus-visible {
  box-shadow: 0 0 0 2px var(--color-background),
              0 0 0 4px var(--color-primary-500);
}

/* For buttons with backgrounds */
.button:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* For input fields */
.input:focus-visible {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  :focus-visible {
    outline-color: var(--color-primary-400);
  }
}
```

### Keyboard Patterns by Component

| Component | Key | Action |
|-----------|-----|--------|
| **Buttons** | Enter, Space | Activate |
| **Links** | Enter | Navigate |
| **Checkboxes** | Space | Toggle |
| **Radio buttons** | Arrow keys | Move selection |
| **Tabs** | Arrow keys | Change tab, Enter/Space to activate (if manual) |
| **Menus** | Arrow keys | Navigate, Enter to select, Escape to close |
| **Dialogs** | Escape | Close, Tab trapped inside |
| **Combobox** | Arrow keys | Navigate options, Enter to select |

### Focus Trapping (Modals/Dialogs)

```tsx
import { useEffect, useRef } from 'react';

function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousActiveElement.current = document.activeElement;

      // Focus first focusable element in modal
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusableElements[0]?.focus();
    }

    return () => {
      // Return focus when modal closes
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  // Handle tab key to trap focus
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key !== 'Tab') return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
```

---

## 3. Screen Readers

### Semantic HTML First

```jsx
// ✓ GOOD: Semantic HTML
<header>
  <nav aria-label="Main">
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>
<main>
  <article>
    <h1>Page Title</h1>
    <p>Content...</p>
  </article>
</main>
<footer>
  <p>Copyright 2024</p>
</footer>

// ❌ BAD: Div soup
<div class="header">
  <div class="nav">
    <div onclick="...">Home</div>
  </div>
</div>
```

### ARIA Landmarks

| HTML Element | ARIA Role | Purpose |
|--------------|-----------|---------|
| `<header>` | banner | Site header |
| `<nav>` | navigation | Navigation links |
| `<main>` | main | Primary content |
| `<aside>` | complementary | Related content |
| `<footer>` | contentinfo | Site footer |
| `<section>` | region (if labeled) | Distinct section |
| `<form>` | form (if labeled) | Form region |

### ARIA Attributes

```jsx
// aria-label: Labels element directly
<button aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>

// aria-labelledby: References another element's text
<section aria-labelledby="section-heading">
  <h2 id="section-heading">Products</h2>
</section>

// aria-describedby: Additional description
<input
  aria-label="Email"
  aria-describedby="email-hint"
/>
<p id="email-hint">We'll never share your email</p>

// aria-expanded: Expandable elements
<button
  aria-expanded={isOpen}
  aria-controls="menu"
>
  Menu
</button>
<ul id="menu" hidden={!isOpen}>
  <li>Item 1</li>
</ul>

// aria-current: Current item in navigation
<nav>
  <a href="/" aria-current="page">Home</a>
  <a href="/about">About</a>
</nav>

// aria-live: Announce dynamic content
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// aria-busy: Loading state
<div aria-busy={isLoading}>
  {isLoading ? 'Loading...' : content}
</div>

// aria-invalid: Form validation
<input
  aria-invalid={hasError}
  aria-errormessage="error-msg"
/>
<p id="error-msg" role="alert">
  {errorMessage}
</p>
```

### Hiding Content

```jsx
// Hide from everyone (visual + screen readers)
<div hidden>Hidden content</div>
<div style={{ display: 'none' }}>Hidden content</div>

// Hide from screen readers only (decorative)
<img src="decoration.svg" alt="" aria-hidden="true" />
<span aria-hidden="true">🎉</span>

// Visually hidden but readable by screen readers
<span className="sr-only">
  Additional context for screen readers
</span>

// CSS for sr-only class
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Live Regions

```jsx
// Polite announcements (waits for silence)
<div aria-live="polite" aria-atomic="true">
  {message}
</div>

// Assertive announcements (interrupts)
<div aria-live="assertive" role="alert">
  {errorMessage}
</div>

// Status updates
<div role="status" aria-live="polite">
  {`${items.length} results found`}
</div>

// Progress updates
<div role="progressbar" aria-valuenow={50} aria-valuemin={0} aria-valuemax={100}>
  50% complete
</div>
```

---

## 4. Forms

### Labels

```jsx
// ✓ GOOD: Explicit label association
<label htmlFor="email">Email address</label>
<input id="email" type="email" />

// ✓ GOOD: Implicit label (wrapping)
<label>
  Email address
  <input type="email" />
</label>

// ✓ GOOD: aria-label for icon buttons
<button aria-label="Search">
  <SearchIcon aria-hidden="true" />
</button>

// ❌ BAD: Placeholder as label
<input placeholder="Email" />  // Disappears on focus!

// ✓ GOOD: Placeholder + label
<label htmlFor="email">Email</label>
<input id="email" placeholder="john@example.com" />
```

### Error Messages

```jsx
function FormField({ label, error, hint, ...props }) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = [
    hint && hintId,
    error && errorId
  ].filter(Boolean).join(' ');

  return (
    <div>
      <label htmlFor={id}>{label}</label>

      {hint && (
        <p id={hintId} className="text-gray-500">
          {hint}
        </p>
      )}

      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy || undefined}
        {...props}
      />

      {error && (
        <p id={errorId} role="alert" className="text-red-500">
          <AlertIcon aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
```

### Required Fields

```jsx
// Visual + programmatic indication
<label htmlFor="name">
  Name <span aria-hidden="true" className="text-red-500">*</span>
</label>
<input
  id="name"
  required
  aria-required="true"
/>

// Or announce in label
<label htmlFor="name">Name (required)</label>
```

### Fieldsets for Groups

```jsx
// Group related fields
<fieldset>
  <legend>Shipping Address</legend>

  <label htmlFor="street">Street</label>
  <input id="street" />

  <label htmlFor="city">City</label>
  <input id="city" />
</fieldset>

// Radio button groups
<fieldset>
  <legend>Payment Method</legend>

  <input type="radio" id="card" name="payment" />
  <label htmlFor="card">Credit Card</label>

  <input type="radio" id="paypal" name="payment" />
  <label htmlFor="paypal">PayPal</label>
</fieldset>
```

---

## 5. Images & Media

### Images

```jsx
// Informative images - describe content
<img
  src="chart.png"
  alt="Sales increased 25% from Q1 to Q2 2024"
/>

// Decorative images - empty alt
<img src="decorative-line.svg" alt="" />

// Complex images - longer description
<figure>
  <img
    src="org-chart.png"
    alt="Organization chart"
    aria-describedby="org-desc"
  />
  <figcaption id="org-desc">
    Company structure: CEO Jane Doe oversees 3 departments:
    Engineering (50 staff), Sales (30 staff), and Operations (20 staff).
  </figcaption>
</figure>

// Icon buttons - aria-label on button
<button aria-label="Delete item">
  <TrashIcon aria-hidden="true" />
</button>

// Icons with adjacent text - hide icon
<button>
  <SaveIcon aria-hidden="true" />
  Save Changes
</button>
```

### Video

```jsx
<video controls>
  <source src="video.mp4" type="video/mp4" />

  {/* Captions for deaf users */}
  <track
    kind="captions"
    src="captions.vtt"
    srclang="en"
    label="English Captions"
    default
  />

  {/* Audio descriptions for blind users */}
  <track
    kind="descriptions"
    src="descriptions.vtt"
    srclang="en"
    label="Audio Descriptions"
  />

  {/* Transcript link as fallback */}
  <p>
    <a href="transcript.html">Read transcript</a>
  </p>
</video>
```

---

## 6. Motion & Animation

### Reduced Motion

**REQUIRED**: Always respect `prefers-reduced-motion`.

```css
/* Base styles with animation */
.animated-element {
  transition: transform 0.3s ease;
}

.animated-element:hover {
  transform: scale(1.05);
}

/* Disable for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    transition: none;
  }

  .animated-element:hover {
    transform: none;
  }
}

/* Or use this global reset */
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

```tsx
// React hook for reduced motion
function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// Usage
function AnimatedComponent() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      animate={prefersReducedMotion ? {} : { scale: 1.05 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
    >
      Content
    </motion.div>
  );
}
```

### Auto-Playing Content

```jsx
// ❌ BAD: Auto-playing animation with no control
<video autoPlay loop>

// ✓ GOOD: Paused by default, user controls
<video controls>

// ✓ GOOD: Provide pause/stop mechanism
function AutoPlayBanner() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <>
      <div className={isPaused ? 'paused' : 'animated'}>
        Banner content
      </div>
      <button onClick={() => setIsPaused(!isPaused)}>
        {isPaused ? 'Play' : 'Pause'} animation
      </button>
    </>
  );
}
```

---

## 7. Touch & Mobile

### Touch Targets

**Minimum size**: 44×44 CSS pixels (WCAG 2.5.5 Level AAA recommends 44×44).

```css
/* Buttons */
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}

/* Icon buttons */
.icon-button {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Links in text - increase hit area */
.inline-link {
  padding: 8px 0;  /* Vertical padding for easier tapping */
  margin: -8px 0;
}

/* Checkbox/radio - increase clickable area */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  min-height: 44px;
  cursor: pointer;
}
```

### Spacing Between Targets

```css
/* Adequate spacing between buttons */
.button-group {
  display: flex;
  gap: 8px;  /* Minimum gap between targets */
}

/* List items */
.list-item {
  padding: 16px;
  border-bottom: 1px solid var(--color-gray-200);
}
```

---

## 8. Testing Checklist

### Manual Testing

- [ ] **Keyboard Navigation**: Tab through entire page, all interactive elements reachable
- [ ] **Focus Indicators**: Visible focus on every focusable element
- [ ] **Screen Reader**: Test with NVDA (Windows), VoiceOver (Mac/iOS), TalkBack (Android)
- [ ] **Zoom**: Test at 200% zoom, no horizontal scrolling, text reflows
- [ ] **Color Contrast**: Use browser dev tools or contrast checker
- [ ] **Motion**: Test with `prefers-reduced-motion: reduce`
- [ ] **Touch**: Test on actual mobile device, targets adequate size

### Automated Testing

```bash
# Install axe-core for automated testing
npm install @axe-core/react axe-core

# Or use Playwright with axe
npm install @axe-core/playwright
```

```tsx
// React development mode check
import React from 'react';
import ReactDOM from 'react-dom';

if (process.env.NODE_ENV !== 'production') {
  const axe = require('@axe-core/react');
  axe(React, ReactDOM, 1000);
}
```

```tsx
// Playwright accessibility test
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### Screen Reader Testing Commands

| Screen Reader | Start | Stop | Next Element | List All |
|---------------|-------|------|--------------|----------|
| NVDA (Windows) | Ctrl+Alt+N | Insert+Q | Tab / Down | Insert+F7 |
| VoiceOver (Mac) | Cmd+F5 | Cmd+F5 | Tab / Ctrl+Opt+Right | Ctrl+Opt+U |
| VoiceOver (iOS) | Triple-click Home | Triple-click Home | Swipe Right | Rotor (twist) |
| TalkBack (Android) | Volume keys | Volume keys | Swipe Right | Swipe up then right |

---

## 9. Common Patterns

### Accessible Button

```tsx
// Standard button
<button
  type="button"
  onClick={handleClick}
  disabled={isDisabled}
  aria-busy={isLoading}
  className="button"
>
  {isLoading ? (
    <>
      <Spinner aria-hidden="true" />
      <span className="sr-only">Loading...</span>
    </>
  ) : (
    'Submit'
  )}
</button>

// Icon button
<button
  type="button"
  aria-label="Delete item"
  onClick={handleDelete}
>
  <TrashIcon aria-hidden="true" />
</button>

// Toggle button
<button
  type="button"
  aria-pressed={isPressed}
  onClick={() => setIsPressed(!isPressed)}
>
  <HeartIcon aria-hidden="true" />
  {isPressed ? 'Remove from favorites' : 'Add to favorites'}
</button>
```

### Accessible Modal

```tsx
function AccessibleModal({ isOpen, onClose, title, children }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <h2 id="modal-title">{title}</h2>

      <div id="modal-description">
        {children}
      </div>

      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
      >
        <XIcon aria-hidden="true" />
      </button>
    </div>
  );
}
```

### Accessible Tabs

```tsx
function Tabs({ tabs }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowRight') {
      setActiveIndex((index + 1) % tabs.length);
    } else if (e.key === 'ArrowLeft') {
      setActiveIndex((index - 1 + tabs.length) % tabs.length);
    }
  };

  return (
    <>
      <div role="tablist" aria-label="Content tabs">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={index === activeIndex}
            aria-controls={`panel-${tab.id}`}
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={() => setActiveIndex(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={index !== activeIndex}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </>
  );
}
```

### Accessible Dropdown Menu

```tsx
function DropdownMenu({ trigger, items }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuRef = useRef(null);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0) {
          items[activeIndex].onClick();
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div>
      <button
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="dropdown-menu"
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </button>

      {isOpen && (
        <ul
          ref={menuRef}
          id="dropdown-menu"
          role="menu"
          onKeyDown={handleKeyDown}
        >
          {items.map((item, index) => (
            <li
              key={item.id}
              role="menuitem"
              tabIndex={-1}
              className={index === activeIndex ? 'active' : ''}
              onClick={item.onClick}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 10. Resources

### Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Inclusive Components](https://inclusive-components.design/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Evaluation Tool](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Pa11y](https://pa11y.org/)

### Screen Readers
- [NVDA (Free, Windows)](https://www.nvaccess.org/)
- [VoiceOver (Built-in, Mac/iOS)](https://www.apple.com/accessibility/vision/)
- [TalkBack (Built-in, Android)](https://support.google.com/accessibility/android/answer/6283677)
