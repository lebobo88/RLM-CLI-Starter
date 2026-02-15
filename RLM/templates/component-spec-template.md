# Component Specification: [Component Name]

**Version:** 1.0
**Last Updated:** [Date]
**Status:** Draft | Review | Approved
**Design System:** [Link to design-system.md]

---

## Overview

### Purpose
[What problem does this component solve? Why does it exist?]

### When to Use
- [Use case 1]
- [Use case 2]

### When NOT to Use
- [Anti-use case 1] → Use [Alternative] instead
- [Anti-use case 2] → Use [Alternative] instead

---

## Visual Design

### Layout (ASCII Wireframe)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  [Icon]  Content Area                    [X]    │
│          Secondary text here                    │
│                                                 │
│  [Primary Action]  [Secondary Action]           │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Anatomy

| Part | Required | Description |
|------|----------|-------------|
| Container | Yes | Outer wrapper with padding and border |
| Icon | No | Leading visual indicator |
| Title | Yes | Primary text content |
| Description | No | Secondary supporting text |
| Actions | No | Interactive buttons/links |
| Close Button | No | Dismissal control |

### Variants

| Variant | Description | Use Case |
|---------|-------------|----------|
| `default` | Standard appearance | Most common usage |
| `primary` | Emphasized styling | Primary actions |
| `secondary` | Subtle styling | Secondary information |
| `destructive` | Warning/danger styling | Delete, remove actions |
| `ghost` | Minimal styling | Tertiary actions |

### Sizes

| Size | Height | Padding | Font Size | Use Case |
|------|--------|---------|-----------|----------|
| `sm` | 32px | 8px 12px | 14px | Compact UIs, tables |
| `md` | 40px | 12px 16px | 14px | Default, most common |
| `lg` | 48px | 16px 24px | 16px | Prominent actions |

---

## States

### State Matrix

| State | Background | Border | Text | Icon | Cursor | Opacity |
|-------|------------|--------|------|------|--------|---------|
| **Default** | `primary-500` | none | white | white | pointer | 100% |
| **Hover** | `primary-600` | none | white | white | pointer | 100% |
| **Focus** | `primary-500` | 2px ring | white | white | pointer | 100% |
| **Active** | `primary-700` | none | white | white | pointer | 100% |
| **Disabled** | `gray-200` | none | `gray-400` | `gray-400` | not-allowed | 50% |
| **Loading** | `primary-500` | none | hidden | spinner | wait | 100% |
| **Error** | `error-500` | none | white | white | pointer | 100% |
| **Empty** | `gray-100` | dashed `gray-300` | `gray-500` | `gray-400` | default | 100% |

### State Details

#### Default
- Base resting state
- No user interaction
```css
.component {
  background: var(--color-primary-500);
  color: white;
}
```

#### Hover (Desktop only)
- Mouse over the component
- Subtle visual feedback
```css
.component:hover {
  background: var(--color-primary-600);
}
```

#### Focus
- Keyboard focus indicator
- Must be visible for accessibility
```css
.component:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

#### Active/Pressed
- During click or tap
- Brief feedback state
```css
.component:active {
  background: var(--color-primary-700);
  transform: scale(0.98);
}
```

#### Disabled
- Not interactive
- Clearly visually distinct
```css
.component:disabled {
  background: var(--color-gray-200);
  color: var(--color-gray-400);
  cursor: not-allowed;
  opacity: 0.5;
}
```

#### Loading
- Async operation in progress
- Disable interaction during load
```css
.component.loading {
  pointer-events: none;
}
.component.loading .content {
  visibility: hidden;
}
.component.loading::after {
  /* Spinner styles */
}
```

#### Error
- Validation or operation failure
- Clear error indication
```css
.component.error {
  background: var(--color-error-500);
  border-color: var(--color-error-600);
}
```

#### Empty/Placeholder
- No content state
- Guide user to add content
```css
.component.empty {
  background: var(--color-gray-100);
  border: 1px dashed var(--color-gray-300);
  color: var(--color-gray-500);
}
```

---

## Responsive Behavior

### Breakpoint Adaptations

| Breakpoint | Changes |
|------------|---------|
| **Mobile** (< 640px) | Full width, stacked layout, larger touch targets |
| **Tablet** (640-1023px) | Flexible width, horizontal layout |
| **Desktop** (1024px+) | Fixed/max width, all features visible |

### Mobile-Specific Considerations
- Touch target: Minimum 44×44px
- Increase padding for touch
- Stack horizontal elements vertically if needed
- Consider bottom sheet instead of modal on mobile

---

## Accessibility

### ARIA Requirements

| Attribute | Value | When |
|-----------|-------|------|
| `role` | `[role]` | Always / When [condition] |
| `aria-label` | `[descriptive text]` | When no visible label |
| `aria-labelledby` | `[id]` | When label element exists |
| `aria-describedby` | `[id]` | When description exists |
| `aria-disabled` | `true/false` | When disabled |
| `aria-busy` | `true` | When loading |
| `aria-live` | `polite` | For dynamic content |

### Keyboard Interaction

| Key | Action |
|-----|--------|
| `Tab` | Move focus to/from component |
| `Enter` | Activate/submit |
| `Space` | Activate (for buttons) |
| `Escape` | Close/cancel (for modals, dropdowns) |
| `Arrow Keys` | Navigate options (for menus, tabs) |

### Screen Reader Announcements

| Event | Announcement |
|-------|--------------|
| Focus | "[Label] [type]" |
| State change | "[New state]" |
| Loading start | "Loading" |
| Loading complete | "Loaded" or content |
| Error | "[Error message]" |

### Color Contrast Requirements

| Element | Ratio Required | Actual |
|---------|----------------|--------|
| Text on background | 4.5:1 | [X]:1 ✓/✗ |
| Focus indicator | 3:1 | [X]:1 ✓/✗ |
| Border/icon | 3:1 | [X]:1 ✓/✗ |

---

## Animation

### Animation Tier: [MINIMAL | MODERATE | RICH]

### Transitions

| Property | Duration | Easing | Trigger |
|----------|----------|--------|---------|
| Background | 150ms | ease-out | Hover, focus |
| Transform | 100ms | ease-out | Active |
| Opacity | 200ms | ease-in-out | Show/hide |

### Motion Specification

```css
/* Standard transition */
.component {
  transition:
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .component {
    transition: none;
  }
}
```

---

## Design Tokens Used

### Colors
| Token | Usage |
|-------|-------|
| `color-primary-500` | Default background |
| `color-primary-600` | Hover background |
| `color-primary-700` | Active background |
| `color-white` | Text color |
| `color-gray-200` | Disabled background |

### Spacing
| Token | Usage |
|-------|-------|
| `space-2` | Vertical padding (sm) |
| `space-3` | Horizontal padding (sm) |
| `space-4` | Default padding |

### Typography
| Token | Usage |
|-------|-------|
| `text-sm` | Small size text |
| `text-base` | Default text |
| `font-medium` | Button text weight |

### Effects
| Token | Usage |
|-------|-------|
| `radius-md` | Border radius |
| `shadow-sm` | Subtle elevation |
| `duration-fast` | Transition speed |

---

## Code Reference

### Basic Implementation

```tsx
interface ComponentProps {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Component({
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick,
}: ComponentProps) {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        // Size variants
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-sm': size === 'md',
          'h-12 px-6 text-base': size === 'lg',
        },
        // Color variants
        {
          'bg-primary-500 text-white hover:bg-primary-600': variant === 'default',
          'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'secondary',
          'bg-red-500 text-white hover:bg-red-600': variant === 'destructive',
          'bg-transparent hover:bg-gray-100': variant === 'ghost',
        },
        // States
        {
          'opacity-50 cursor-not-allowed': disabled,
          'cursor-wait': loading,
        }
      )}
      disabled={disabled || loading}
      onClick={onClick}
      aria-disabled={disabled}
      aria-busy={loading}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
```

### Usage Examples

```tsx
// Default usage
<Component>Click me</Component>

// With variant and size
<Component variant="primary" size="lg">
  Large Primary Button
</Component>

// Disabled state
<Component disabled>
  Can't click
</Component>

// Loading state
<Component loading>
  Saving...
</Component>
```

---

## Testing Requirements

### Unit Tests
- [ ] Renders correctly with default props
- [ ] Applies variant styles correctly
- [ ] Applies size styles correctly
- [ ] Handles disabled state
- [ ] Handles loading state
- [ ] Fires onClick when clicked
- [ ] Does not fire onClick when disabled

### Accessibility Tests
- [ ] Has correct role
- [ ] Has accessible name
- [ ] Focus is visible
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly

### Visual Tests
- [ ] All variants render correctly
- [ ] All sizes render correctly
- [ ] All states display correctly
- [ ] Responsive behavior works

---

## Related Components

| Component | Relationship |
|-----------|--------------|
| [Component A] | Parent/container |
| [Component B] | Often used together |
| [Component C] | Alternative for [use case] |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [Date] | [Name] | Initial specification |
