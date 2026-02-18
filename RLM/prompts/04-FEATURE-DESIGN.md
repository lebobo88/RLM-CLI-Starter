# RLM Feature Design Prompt — Phase 4

## Purpose
Create detailed UI/UX design specifications for each feature, translating feature specs into screen layouts, user flows, component usage, and interaction patterns.

## Prerequisites
- Phase 2 (Design System) complete
- Phase 3 (Specifications) complete
- `RLM/specs/design/design-system.md` exists
- Feature specs exist at `RLM/specs/features/FTR-XXX/specification.md`
- DESIGN_REQUIRED = true

## Instructions for AI

You are the RLM Feature Design Agent. Your job is to create detailed UI/UX design specifications for each feature, ensuring consistency with the design system and translating functional requirements into concrete visual implementations.

---

## Canonical Workflow

### Step 0: Read Template
Read `RLM/templates/feature-design-spec-template.md` for the design spec format.

### Step 1: Load Context
For each feature requiring UI design:

1. **Read feature specification**: `RLM/specs/features/FTR-XXX/specification.md`
   - Extract acceptance criteria
   - Identify user interactions
   - Note data requirements

2. **Read design system**: `RLM/specs/design/design-system.md`
   - Available components
   - Design tokens
   - Component states

3. **Read PRD**: `RLM/specs/PRD.md`
   - Broader product context
   - User personas
   - Brand personality

### Step 2: Create Feature Design Spec
Generate `RLM/specs/features/FTR-XXX/design-spec.md` with the following structure:

---

## Feature Design Spec Template

```markdown
# Feature Design: [Feature Title]
## Feature ID: FTR-XXX

---

## User Flows

Document the complete user journey through this feature.

### Flow 1: [Flow Name] (e.g., "Happy Path - Successful Login")
1. **User action**: Enters email and password
   **System response**: Validates format, enables submit button

2. **User action**: Clicks "Sign In" button
   **System response**: Button enters loading state, shows spinner

3. **User action**: (waiting)
   **System response**: Authenticates credentials, redirects to dashboard

4. **Success state**: User sees personalized dashboard with welcome message

### Flow 2: [Error Flow] (e.g., "Invalid Credentials")
1. **User action**: Enters incorrect password
   **System response**: Validates format (passes)

2. **User action**: Clicks "Sign In"
   **System response**: Button loading state

3. **Error state**: Form shows error message "Invalid email or password", input borders turn red, focus returns to password field

### Flow 3: [Edge Case] (e.g., "Account Locked")
[Continue documenting flows...]

---

## Screen Layouts

Define the layout structure for each screen in this feature.

### Screen: [Screen Name] (e.g., "Login Page")

- **Route**: `/auth/login`
- **Layout Type**: `centered` (options: sidebar, full-width, centered, two-column)
- **Key Components**:
  - LoginForm (email input, password input, submit button)
  - SocialAuthButtons (Google, GitHub)
  - ForgotPasswordLink
  - SignUpPrompt

- **Responsive Behavior**:
  - **Mobile (<640px)**: Full-width form, stack social buttons vertically
  - **Tablet (640-1024px)**: Centered form (max-width: 400px)
  - **Desktop (>1024px)**: Centered form (max-width: 450px), side illustration

- **Component Hierarchy**:
```
<AuthLayout>
  <CenteredCard>
    <Logo />
    <Heading>Welcome Back</Heading>
    <LoginForm>
      <Input type="email" />
      <Input type="password" />
      <Button variant="primary" />
    </LoginForm>
    <Divider text="or" />
    <SocialAuthButtons />
    <Link>Forgot password?</Link>
  </CenteredCard>
  <Footer />
</AuthLayout>
```

---

## Components Used

Map feature requirements to design system components.

| Component | Variant | Props | States Used | Notes |
|-----------|---------|-------|-------------|-------|
| **Button** | primary | `onClick`, `label`, `loading` | default, hover, loading, disabled | Submit button changes to loading on click |
| **Input** | text | `value`, `onChange`, `error`, `label` | default, focus, error, disabled | Email and password fields |
| **Card** | elevated | `children` | default | Container for form |
| **Link** | default | `href`, `children` | default, hover, focus | "Forgot password?" link |
| **Alert** | error | `message`, `onDismiss` | error | Shows auth errors |
| **Spinner** | small | `size` | loading | Inside button during submission |

---

## Interaction Patterns

Define how the UI responds to user actions.

### Loading States
- **Pattern**: Skeleton screens
- **Components affected**: Button (spinner inside), Form (disabled during load)
- **Duration**: Typical auth call ~500-2000ms
- **User feedback**: Button shows spinner, text changes to "Signing in..."

### Error Handling
- **Pattern**: Inline validation + toast notifications
- **Inline errors**: Show below input fields in red (color: `error-600`)
- **Toast notifications**: Top-right corner, auto-dismiss after 5s
- **Error components**: Alert component with `error` variant

### Empty States
- **Pattern**: Illustration + CTA
- **Components**: EmptyState component with SVG illustration, heading, description, primary button
- **Example**: "No saved items yet" → illustration → "Start browsing" button

### Transitions
- **Page transitions**: Fade in (300ms, ease-out)
- **Modal open/close**: Scale + fade (200ms, ease-in-out)
- **Dropdown expand**: Height transition (150ms, ease-out)
- **None**: For instant feedback (e.g., toggle switches)

---

## Accessibility Requirements

WCAG 2.1 AA compliance checklist for this feature:

- [ ] **Keyboard navigation path defined**
  - Tab order: Email → Password → Submit → Forgot Password → Sign Up
  - Enter key submits form
  - Escape closes any modals

- [ ] **Focus management for modals/overlays**
  - Focus traps inside modal
  - Focus returns to trigger element on close

- [ ] **ARIA labels for all interactive elements**
  - `aria-label="Email address"` on email input
  - `aria-label="Password"` on password input
  - `aria-busy="true"` on button during loading
  - `aria-live="polite"` on error messages

- [ ] **Color contrast verified**
  - Text: 4.5:1 minimum (body text on background)
  - UI elements: 3:1 minimum (button borders, input borders)
  - Error text: 4.5:1 (red text on white background)

- [ ] **Screen reader flow tested**
  - Form fields announce labels
  - Errors announce immediately after submission
  - Success redirects announce "Navigating to dashboard"

---

## Responsive Breakpoints

Define layout changes at each breakpoint.

| Breakpoint | Layout Changes |
|------------|---------------|
| **Mobile (<640px)** | - Full-width form (no max-width)<br>- Stack social auth buttons vertically<br>- Hide side illustration<br>- Increase touch targets to 48px min |
| **Tablet (640-1024px)** | - Centered form (max-width: 400px)<br>- Social buttons in 2-column grid<br>- Show simplified illustration above form |
| **Desktop (>1024px)** | - Centered form (max-width: 450px)<br>- Full illustration on left half of screen<br>- Form on right half<br>- Larger spacing (padding: 48px vs 24px) |

---

## Design Token References

List all design tokens used in this feature (ensures consistency).

**Colors**:
- `primary-600` — Submit button background
- `neutral-50` — Card background
- `neutral-700` — Body text
- `error-600` — Error text and borders

**Typography**:
- `heading-2xl` — "Welcome Back" heading
- `body-base` — Input labels, body text
- `body-sm` — Helper text, error messages

**Spacing**:
- `space-4` (1rem) — Input field vertical spacing
- `space-6` (1.5rem) — Section spacing
- `space-8` (2rem) — Card padding

**Shadows**:
- `shadow-md` — Card elevation

**Border Radius**:
- `radius-md` — Input fields, buttons
- `radius-lg` — Card container

---

## Animation Specifications

If animations are used in this feature, document them.

**Button Loading Animation**:
- **Trigger**: onClick
- **Duration**: 150ms
- **Easing**: ease-out
- **Effect**: Scale down to 0.98, show spinner, change text

**Form Submission Animation**:
- **Trigger**: Successful auth
- **Duration**: 300ms
- **Easing**: ease-in-out
- **Effect**: Fade out form, fade in success checkmark, then redirect

**Error Shake Animation**:
- **Trigger**: Invalid credentials
- **Duration**: 400ms
- **Easing**: ease-in-out
- **Effect**: Horizontal shake (translateX -10px → +10px → 0)

---

## Design Deliverables

Mark which deliverables are needed for implementation:

- [x] Screen layouts documented
- [x] Component mapping complete
- [x] User flows defined
- [x] Interaction patterns specified
- [x] Accessibility requirements listed
- [x] Responsive behavior defined
- [ ] High-fidelity mockups (optional — if designer available)
- [ ] Interactive prototype (optional — if designer available)

---

## Notes

Any additional design context, constraints, or decisions:
- Uses OAuth 2.0 flows for social auth (design should accommodate redirect patterns)
- "Remember me" checkbox intentionally omitted per security requirements (FTR-XXX spec)
- Password visibility toggle required for accessibility (per constitution)

```

---

## Step 3: Validate Against Design System
Ensure all feature design specs reference:
- **Design tokens** — No hardcoded color/spacing values
- **Component library components** — Only use defined components with defined states
- **Defined interaction patterns** — Match design system conventions
- **Accessibility standards** — WCAG 2.1 AA minimum

---

## Output Artifacts

After completing feature design, create:
- **`RLM/specs/features/FTR-XXX/design-spec.md`** — Feature design specification

---

## Reference Files
- Entry point: `RLM/START-HERE.md`
- Design system: `RLM/specs/design/design-system.md`
- Feature specs: `RLM/specs/features/FTR-XXX/specification.md`
- Feature design template: `RLM/templates/feature-design-spec-template.md`
- Component spec template: `RLM/templates/component-spec-template.md`
- Design QA checklist: `RLM/templates/design-qa-checklist.md`

---

## Summary and Next Steps

After generating feature design specs, provide:

```
## Feature Design Complete!

### Documents Created:
- RLM/specs/features/FTR-001/design-spec.md
- RLM/specs/features/FTR-002/design-spec.md
[...list all created design specs]

### Key Design Decisions:
- [List 3-5 major design decisions across all features]

### Next Steps:
1. Review feature design specs in RLM/specs/features/
2. Proceed to Phase 5: Generate implementation tasks with `@rlm-tasks` or `/rlm-tasks`
```

---

## Notes for AI

- **Reference the design system** — Always cite design tokens, not raw values
- **Map to components** — Every UI element should map to a design system component
- **Define all states** — Don't skip loading, error, or empty states
- **Be specific** — Exact component names, exact token names, exact breakpoint values
- **Accessibility is mandatory** — Not optional, not "nice to have"
- **Responsive design** — Define behavior at all breakpoints, not just desktop
