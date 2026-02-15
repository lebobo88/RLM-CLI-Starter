# Design Patterns Library

A comprehensive reference of UI/UX patterns for common interface challenges, organized by category.

---

## Navigation Patterns

### 1. Sidebar Navigation

**Best For**: Applications with 5-15 primary navigation items, desktop-first apps.

```
┌──────────────────────────────────────────────────┐
│ ┌────────┐                                       │
│ │ Logo   │  Header                               │
│ └────────┘                                       │
├─────────┬────────────────────────────────────────┤
│         │                                        │
│ Nav 1   │                                        │
│ Nav 2   │           Main Content                 │
│ Nav 3   │                                        │
│ ─────── │                                        │
│ Nav 4   │                                        │
│         │                                        │
└─────────┴────────────────────────────────────────┘
```

**Accessibility**:
- `<nav aria-label="Main navigation">`
- Current page: `aria-current="page"`
- Collapsible: `aria-expanded`, `aria-controls`

**States**:
- Default, Hover, Active (current page), Focus, Collapsed (mobile)

---

### 2. Top Navigation Bar

**Best For**: Marketing sites, simple apps with 3-7 items.

```
┌──────────────────────────────────────────────────┐
│ Logo     Nav1  Nav2  Nav3  Nav4    [CTA Button]  │
├──────────────────────────────────────────────────┤
│                                                  │
│                 Main Content                     │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Responsive**: Hamburger menu below tablet breakpoint.

---

### 3. Tab Navigation

**Best For**: Content that belongs to the same hierarchy level.

```
┌────────────────────────────────────┐
│  [Tab 1]  [Tab 2]  [Tab 3]         │
├────────────────────────────────────┤
│                                    │
│     Tab Panel Content              │
│                                    │
└────────────────────────────────────┘
```

**Accessibility**:
```jsx
<div role="tablist" aria-label="Account settings">
  <button role="tab" aria-selected="true" aria-controls="panel-1">Profile</button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">Security</button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  Content...
</div>
```

**Keyboard**: Arrow keys to navigate, Enter/Space to select.

---

### 4. Breadcrumb Navigation

**Best For**: Deep hierarchical structures, e-commerce categories.

```
Home > Products > Electronics > Phones > iPhone 15
```

**Accessibility**:
```jsx
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/products/electronics">Electronics</a></li>
    <li aria-current="page">iPhone 15</li>
  </ol>
</nav>
```

---

## Data Display Patterns

### 1. Data Table

**Best For**: Structured data with multiple columns, sortable/filterable data.

```
┌─────────────────────────────────────────────────────┐
│ ☐  Name ▼        Email              Role      Actions│
├─────────────────────────────────────────────────────┤
│ ☐  John Doe      john@ex.com        Admin     ⋮     │
│ ☐  Jane Smith    jane@ex.com        User      ⋮     │
│ ☐  Bob Wilson    bob@ex.com         Editor    ⋮     │
├─────────────────────────────────────────────────────┤
│ ◀  Page 1 of 10  ▶         Showing 1-10 of 100     │
└─────────────────────────────────────────────────────┘
```

**States**:
- Row hover highlight
- Selected row(s)
- Sortable column headers (asc/desc/none)
- Loading (skeleton rows)
- Empty state

**Accessibility**:
```jsx
<table role="grid" aria-label="Users">
  <thead>
    <tr>
      <th scope="col" aria-sort="ascending">Name</th>
      <th scope="col" aria-sort="none">Email</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>john@example.com</td>
    </tr>
  </tbody>
</table>
```

---

### 2. Card Grid

**Best For**: Visual content, products, profiles, dashboards.

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Image   │  │  Image   │  │  Image   │
│          │  │          │  │          │
│  Title   │  │  Title   │  │  Title   │
│  Desc... │  │  Desc... │  │  Desc... │
│  [CTA]   │  │  [CTA]   │  │  [CTA]   │
└──────────┘  └──────────┘  └──────────┘
```

**Responsive Grid**:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns

**Accessibility**: Use `<article>` for independent content, proper heading hierarchy.

---

### 3. List View

**Best For**: Sequential data, emails, messages, tasks.

```
┌─────────────────────────────────────────────────┐
│ ○  Task title                          Due: Today│
│    Description preview...                   High │
├─────────────────────────────────────────────────┤
│ ●  Completed task                    Done: 2h ago│
│    Description preview...                   Low  │
├─────────────────────────────────────────────────┤
│ ○  Another task                      Due: Tomorrow│
│    Description preview...                 Medium │
└─────────────────────────────────────────────────┘
```

**States**: Default, Hover, Selected, Completed, Overdue.

---

### 4. Empty State

**Best For**: When there's no data to display.

```
┌────────────────────────────────────────┐
│                                        │
│            [Illustration]              │
│                                        │
│          No projects yet               │
│                                        │
│    Create your first project to        │
│    get started with collaboration.     │
│                                        │
│         [Create Project]               │
│                                        │
└────────────────────────────────────────┘
```

**Required Elements**:
1. Visual (illustration or icon)
2. Clear message (what's empty)
3. Guidance (what to do next)
4. Primary action (CTA button)

---

## Form Patterns

### 1. Single Column Form

**Best For**: Most forms, mobile-first, focused flow.

```
┌────────────────────────────────────────┐
│          Create Account                │
│                                        │
│  Full Name                             │
│  ┌──────────────────────────────────┐  │
│  │ John Doe                         │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Email Address                         │
│  ┌──────────────────────────────────┐  │
│  │ john@example.com                 │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Password                              │
│  ┌──────────────────────────────────┐  │
│  │ ••••••••                      👁 │  │
│  └──────────────────────────────────┘  │
│  Min 8 characters, 1 number           │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │         Create Account           │  │
│  └──────────────────────────────────┘  │
│                                        │
│     Already have an account? Sign in   │
└────────────────────────────────────────┘
```

---

### 2. Multi-Step Form (Wizard)

**Best For**: Long forms, complex processes, checkout flows.

```
┌────────────────────────────────────────┐
│  Step 1 ──●── Step 2 ──○── Step 3     │
│  Account     Profile      Review       │
├────────────────────────────────────────┤
│                                        │
│          Account Details               │
│                                        │
│  Email                                 │
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Password                              │
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│                                        │
├────────────────────────────────────────┤
│  [Back]                     [Continue] │
└────────────────────────────────────────┘
```

**Accessibility**:
- Progress indicator: `aria-label="Step 1 of 3, Account details"`
- Current step: `aria-current="step"`
- Completed steps: checkmark icon + "completed" label

---

### 3. Inline Validation

**Best For**: Real-time feedback, preventing submission errors.

```
Email Address
┌──────────────────────────────────────┐
│ john@invalid                         │  ⚠
└──────────────────────────────────────┘
⚠ Please enter a valid email address

Password
┌──────────────────────────────────────┐
│ ••••••••                          👁 │  ✓
└──────────────────────────────────────┘
✓ Strong password
```

**Timing**:
- Validate on blur (when leaving field)
- Clear errors on input
- Don't validate empty fields until submit attempted

**Accessibility**:
```jsx
<input
  aria-invalid="true"
  aria-describedby="email-error"
/>
<p id="email-error" role="alert">
  Please enter a valid email address
</p>
```

---

### 4. Search with Filters

**Best For**: Large datasets, e-commerce, content libraries.

```
┌────────────────────────────────────────────────────┐
│  ┌────────────────────────────────┐  [Filter] [↓] │
│  │ 🔍 Search products...          │                │
│  └────────────────────────────────┘                │
├────────────────────────────────────────────────────┤
│                                                    │
│  Active Filters: [Category: Electronics ×]         │
│                  [Price: $100-$500 ×]     [Clear]  │
│                                                    │
│  Showing 24 results                                │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Filter Panel** (Sidebar or Dropdown):
```
┌─────────────────────┐
│ Filters             │
├─────────────────────┤
│ Category            │
│ ☐ Electronics       │
│ ☑ Clothing          │
│ ☐ Home & Garden     │
├─────────────────────┤
│ Price Range         │
│ [$100] - [$500]     │
├─────────────────────┤
│ Rating              │
│ ★★★★☆ & up         │
├─────────────────────┤
│ [Apply] [Reset]     │
└─────────────────────┘
```

---

## Feedback Patterns

### 1. Toast Notifications

**Best For**: Non-blocking feedback, action confirmations.

```
┌───────────────────────────────────────┐
│  ✓ Changes saved successfully      × │
└───────────────────────────────────────┘
```

**Variants**:
- Success (green): Confirmations
- Error (red): Failed actions
- Warning (yellow): Caution messages
- Info (blue): Informational

**Behavior**:
- Auto-dismiss: 5 seconds for success/info
- Persist: errors require manual dismiss
- Position: top-right or bottom-center

**Accessibility**:
```jsx
<div role="status" aria-live="polite" aria-atomic="true">
  Changes saved successfully
</div>
```

---

### 2. Modal Dialog

**Best For**: Critical decisions, focused tasks, confirmations.

```
┌────────────────────────────────────────┐
│  Delete Project?                    × │
├────────────────────────────────────────┤
│                                        │
│  Are you sure you want to delete       │
│  "My Project"? This action cannot      │
│  be undone.                            │
│                                        │
├────────────────────────────────────────┤
│              [Cancel]  [Delete]        │
└────────────────────────────────────────┘
```

**Accessibility**:
```jsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Delete Project?</h2>
  <p id="dialog-description">
    Are you sure you want to delete "My Project"?
  </p>
</div>
```

**Focus Management**:
1. Focus trap inside modal
2. Initial focus on first focusable element (or close button)
3. Return focus to trigger element on close
4. Close on Escape key

---

### 3. Loading States

**Best For**: Async operations, data fetching.

**Spinner** (Short operations < 2s):
```
      ◠
     ◡
  Loading...
```

**Skeleton** (Content loading):
```
┌────────────────────────────────────────┐
│ ░░░░░░░░░░░░░                         │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░            │
│ ░░░░░░░░░░░░░░░░░░                    │
└────────────────────────────────────────┘
```

**Progress Bar** (Determinate operations):
```
Uploading file...
████████████░░░░░░░░░░░░░  48%
```

**Accessibility**:
```jsx
<div aria-busy="true" aria-live="polite">
  Loading content...
</div>
```

---

### 4. Error States

**Best For**: Failed operations, validation errors, system errors.

**Inline Field Error**:
```
Email
┌──────────────────────────────────┐
│ invalid-email                    │ ⚠
└──────────────────────────────────┘
Please enter a valid email address
```

**Form Error Summary**:
```
┌────────────────────────────────────────┐
│ ⚠ Please fix the following errors:    │
│                                        │
│ • Email address is invalid             │
│ • Password must be at least 8 chars    │
└────────────────────────────────────────┘
```

**Full Page Error**:
```
┌────────────────────────────────────────┐
│                                        │
│            [Error Icon]                │
│                                        │
│      Something went wrong              │
│                                        │
│   We couldn't load your data.          │
│   Please try again.                    │
│                                        │
│           [Try Again]                  │
│                                        │
└────────────────────────────────────────┘
```

---

## Behavioral Psychology Patterns

### 1. Social Proof

**Use Ethically For**: Building trust, reducing uncertainty.

```
┌────────────────────────────────────────┐
│  ★★★★★ 4.8/5 from 2,347 reviews       │
│                                        │
│  "Best project management tool I've    │
│   ever used!" - Sarah M.               │
│                                        │
│  Trusted by 10,000+ companies          │
│  [Logo] [Logo] [Logo] [Logo]           │
└────────────────────────────────────────┘
```

**Variations**:
- Customer count: "Join 50,000+ users"
- Testimonials with photos/names
- Trust badges and certifications
- Real-time activity: "23 people viewing this"

---

### 2. Scarcity & Urgency

**Use Ethically For**: Limited offers, event deadlines.

**Genuine Scarcity**:
```
┌────────────────────────────────────────┐
│  Only 3 left in stock                  │
│  ───────────────────                   │
│  Order within 2h 15m for delivery      │
│  by tomorrow                           │
└────────────────────────────────────────┘
```

**Time-Limited Offer**:
```
┌────────────────────────────────────────┐
│  ⏱ Sale ends in: 23:45:30             │
│                                        │
│  $49.99  $99.99                        │
│  50% off - Limited time only           │
└────────────────────────────────────────┘
```

**Ethical Guidelines**:
- Only use for genuinely limited offers
- Never fake scarcity
- Clearly indicate when offers reset/return

---

### 3. Anchoring

**Use Ethically For**: Pricing pages, plan comparisons.

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Basic     │  │ RECOMMENDED │  │ Enterprise  │
│             │  │   Pro       │  │             │
│   $9/mo     │  │   $29/mo    │  │   $99/mo    │
│             │  │             │  │             │
│ 5 projects  │  │ Unlimited   │  │ Unlimited   │
│ 1 user      │  │ 5 users     │  │ Unlimited   │
│ 1GB storage │  │ 50GB        │  │ 500GB       │
│             │  │             │  │             │
│ [Start]     │  │ [Start]     │  │ [Contact]   │
└─────────────┘  └─────────────┘  └─────────────┘
```

**Best Practices**:
- Show "most popular" or "recommended" option
- Display annual savings prominently
- Highlight value, not just price

---

### 4. Progressive Disclosure

**Use Ethically For**: Complex information, onboarding.

**Expandable Details**:
```
Product Specifications
──────────────────────
▶ Technical Details
▶ Dimensions & Weight
▼ Warranty Information
   └─ 2-year manufacturer warranty
   └─ 30-day return policy
   └─ Free repairs for defects
```

**"Show More" Pattern**:
```
This product features advanced technology
that enables seamless connectivity...
                        [Read more]
```

---

### 5. Defaults & Pre-selection

**Use Ethically For**: Recommended options, common choices.

```
Shipping Method
───────────────
○ Standard (5-7 days) - Free
● Express (2-3 days) - $9.99  ← Pre-selected
○ Overnight (1 day) - $24.99
```

**Ethical Guidelines**:
- Pre-select options that benefit the user
- Never pre-select add-ons or upsells
- Make it easy to change selections

---

## Responsive Patterns

### 1. Mobile Navigation

**Hamburger Menu**:
```
Mobile:                    Expanded:
┌─────────────────┐       ┌─────────────────┐
│ [≡] Logo    [○] │       │ [×] Logo    [○] │
├─────────────────┤       ├─────────────────┤
│                 │       │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│     Content     │       │ │ Home         │ │
│                 │       │ │ Products     │ │
│                 │       │ │ About        │ │
└─────────────────┘       │ │ Contact      │ │
                          │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
                          └─────────────────┘
```

**Bottom Navigation** (Mobile apps):
```
┌─────────────────────────┐
│                         │
│       Content           │
│                         │
├─────────────────────────┤
│  🏠    📦    🔍    👤   │
│ Home  Items  Search User│
└─────────────────────────┘
```

---

### 2. Responsive Tables

**Card on Mobile**:
```
Desktop Table:                 Mobile Cards:
┌───────────────────────┐     ┌─────────────────┐
│ Name   Email    Role  │     │ John Doe        │
├───────────────────────┤     │ john@ex.com     │
│ John   john@   Admin  │     │ Admin           │
│ Jane   jane@   User   │     └─────────────────┘
└───────────────────────┘     ┌─────────────────┐
                              │ Jane Smith      │
                              │ jane@ex.com     │
                              │ User            │
                              └─────────────────┘
```

**Horizontal Scroll** (Data tables):
```
┌─────────────────────────────────────→
│ Name    Email         Role    Actions
├─────────────────────────────────────→
│ John    john@ex.com   Admin   Edit
└─────────────────────────────────────→
            ← Scroll →
```

---

### 3. Responsive Forms

**Stacked on Mobile**:
```
Desktop:                     Mobile:
┌─────────────────────────┐  ┌───────────────┐
│ First Name  Last Name   │  │ First Name    │
│ [________] [_________]  │  │ [___________] │
│                         │  │               │
│ Email                   │  │ Last Name     │
│ [_____________________] │  │ [___________] │
└─────────────────────────┘  │               │
                             │ Email         │
                             │ [___________] │
                             └───────────────┘
```

---

## Quick Reference: When to Use What

| Pattern | Use When |
|---------|----------|
| Modal | Blocking decision, focused task |
| Toast | Non-blocking confirmation |
| Drawer | Additional context without losing page |
| Dropdown | Selection from 5-15 options |
| Autocomplete | Large option sets (100+) |
| Tabs | Same-level content switching |
| Accordion | Collapsible related sections |
| Wizard | Multi-step sequential process |
| Card | Visual/scannable content |
| Table | Structured data comparison |
| List | Sequential items |
| Search + Filter | Large datasets |
