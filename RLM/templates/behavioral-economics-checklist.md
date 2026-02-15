# Behavioral Economics Design Checklist

## Purpose

This checklist applies behavioral economics principles to UI/UX design decisions. Use it during the design phase to create more effective, user-respecting interfaces that guide users toward desired outcomes without manipulation.

## When to Use

- During feature design specification (`@rlm-feature-design`)
- When designing onboarding flows
- For conversion optimization (sign-up, purchase, upgrade)
- When creating pricing pages or plan selection
- For user engagement and retention features

---

## 1. Choice Architecture & Nudge Theory

### Definition
The way choices are presented influences decisions. Small changes in presentation can significantly impact user behavior without restricting freedom.

### Checklist

| Item | Implemented? | Notes |
|------|-------------|-------|
| Default options set to recommended/beneficial choice | [ ] | |
| Clear visual hierarchy guides attention to primary action | [ ] | |
| Number of choices limited (Hick's Law: 7±2) | [ ] | |
| Progressive disclosure hides complexity until needed | [ ] | |
| Smart defaults pre-fill forms with reasonable values | [ ] | |
| Opt-out (vs opt-in) for beneficial features | [ ] | |

### Design Examples

```
GOOD: Newsletter signup defaults to "Essential updates only"
BAD: Newsletter signup defaults to all 15 email lists

GOOD: Settings page shows 5 common options, "Advanced" reveals 20 more
BAD: All 25 settings displayed on one overwhelming page
```

---

## 2. Prospect Theory (Loss/Gain Framing)

### Definition
People feel losses more strongly than equivalent gains (loss aversion ~2x). How outcomes are framed significantly affects perception and decisions.

### Checklist

| Item | Implemented? | Notes |
|------|-------------|-------|
| Loss framing used for important features | [ ] | |
| Gain framing used for promotional content | [ ] | |
| Trial expirations emphasize what user will lose | [ ] | |
| Upgrades emphasize features gained | [ ] | |
| Progress shown as "X% complete" vs "X% remaining" | [ ] | |
| Unused features highlighted as missed opportunities | [ ] | |

### Design Examples

```
LOSS FRAME (for retention):
"Your 14-day trial ends tomorrow. Don't lose access to:
- 50 saved projects
- Advanced analytics
- Team collaboration"

GAIN FRAME (for acquisition):
"Upgrade to Pro and unlock:
- Unlimited projects
- Advanced analytics
- Team collaboration"
```

---

## 3. Anchoring & Decoy Effects

### Definition
Initial information serves as an anchor that influences subsequent judgments. A decoy option can make another option more attractive.

### Checklist

| Item | Implemented? | Notes |
|------|-------------|-------|
| Pricing shows high anchor first (if appropriate) | [ ] | |
| "Was $X, now $Y" format for discounts | [ ] | |
| Three-tier pricing with strategic middle option | [ ] | |
| Comparison tables highlight recommended option | [ ] | |
| Original values shown when discounted | [ ] | |
| "Most popular" or "Best value" labels used | [ ] | |

### Design Examples

```
THREE-TIER PRICING (Decoy Effect):
┌─────────────────────────────────────────────────────────┐
│  Basic        │  Pro (BEST VALUE)  │  Enterprise       │
│  $9/mo        │  $19/mo            │  $49/mo           │
│               │  ★ Most Popular    │                   │
│  5 projects   │  50 projects       │  Unlimited        │
│  1 user       │  5 users           │  Unlimited users  │
│  Basic support│  Priority support  │  Dedicated support│
└─────────────────────────────────────────────────────────┘

The Pro tier is positioned as the obvious choice due to value anchoring.
```

---

## 4. Social Proof Integration

### Definition
People look to others' behavior to determine appropriate actions, especially in uncertainty. Social validation reduces perceived risk.

### Checklist

| Item | Implemented? | Notes |
|------|-------------|-------|
| User count/activity displayed ("10,000+ users") | [ ] | |
| Real-time activity indicators ("X users viewing") | [ ] | |
| Testimonials with names, photos, companies | [ ] | |
| Industry-specific customer logos | [ ] | |
| Review scores and counts visible | [ ] | |
| User-generated content showcased | [ ] | |
| "Customers also bought" recommendations | [ ] | |

### Design Examples

```
EFFECTIVE SOCIAL PROOF:
"Join 47,382 designers who ship faster with [Product]"
+ Logos: Stripe, Airbnb, Spotify, Netflix

WEAK SOCIAL PROOF:
"Many people use our product"
```

---

## 5. Endowment Effect Triggers

### Definition
People value things more once they own or feel ownership of them. Creating psychological ownership increases perceived value and retention.

### Checklist

| Item | Implemented? | Notes |
|------|-------------|-------|
| Early personalization during onboarding | [ ] | |
| User-generated content prominently displayed | [ ] | |
| Progress tracking creates investment | [ ] | |
| Customization options available early | [ ] | |
| "Your" language used consistently | [ ] | |
| Trial includes full features (creates ownership) | [ ] | |
| Data portability shown (implies ownership) | [ ] | |

### Design Examples

```
CREATING OWNERSHIP:
Onboarding Step 1: "Name your workspace"
Onboarding Step 2: "Choose your theme"
Onboarding Step 3: "Invite your team"

Result: User has invested time and created something "theirs"
```

---

## 6. Scarcity & Urgency Signals

### Definition
Limited availability increases perceived value. Time constraints create urgency that motivates action.

### Checklist

| Item | Implemented? | Notes |
|------|-------------|-------|
| Limited-time offers clearly communicated | [ ] | |
| Countdown timers for expiring deals | [ ] | |
| Stock/availability indicators shown | [ ] | |
| Exclusive access messaging used | [ ] | |
| Early-bird pricing communicated | [ ] | |
| Waitlist for high-demand features | [ ] | |

### ETHICAL GUIDELINES

```
ETHICAL SCARCITY:
- Must be genuine (real limited availability)
- Timers must be accurate (no fake resets)
- Stock counts must be real
- "Limited time" must have actual end date

UNETHICAL (AVOID):
- Fake countdown timers that reset
- False "only X left" when unlimited
- Artificial scarcity for digital goods
- Pressure tactics without real constraints
```

---

## 7. Cognitive Load Management

### Definition
Users have limited mental processing capacity. Reducing cognitive load improves decision quality and user satisfaction.

### Checklist

| Item | Implemented? | Notes |
|------|-------------|-------|
| Forms chunked into logical steps | [ ] | |
| Important information above the fold | [ ] | |
| Visual hierarchy reduces scanning effort | [ ] | |
| Consistent patterns reduce learning | [ ] | |
| Error prevention vs error recovery | [ ] | |
| Recognition over recall (menus vs commands) | [ ] | |
| Default suggestions provided | [ ] | |

---

## Scoring Matrix

Rate each section 0-5 (0 = Not Applied, 5 = Fully Applied):

| Principle | Score | Weight | Weighted Score |
|-----------|-------|--------|----------------|
| Choice Architecture | /5 | 20% | |
| Prospect Theory | /5 | 15% | |
| Anchoring & Decoy | /5 | 15% | |
| Social Proof | /5 | 15% | |
| Endowment Effect | /5 | 15% | |
| Scarcity/Urgency | /5 | 10% | |
| Cognitive Load | /5 | 10% | |
| **Total** | | **100%** | **/5.0** |

### Interpretation

| Score | Rating | Action |
|-------|--------|--------|
| 4.0-5.0 | Excellent | Ship with confidence |
| 3.0-3.9 | Good | Minor optimizations recommended |
| 2.0-2.9 | Fair | Review and apply missing principles |
| < 2.0 | Needs Work | Significant behavioral design gaps |

---

## Ethical Boundaries

### ALWAYS ACCEPTABLE
- Making beneficial choices easier
- Presenting information clearly
- Using social proof from real users
- Creating genuine urgency for real constraints
- Helping users understand value

### NEVER ACCEPTABLE
- Fake scarcity or urgency
- Dark patterns that trick users
- Hidden costs or surprise charges
- Manipulating users against their interests
- Exploiting psychological vulnerabilities
- Opt-out designs for harmful defaults

### GRAY AREAS (Use Judgment)
- Loss framing for engagement features
- Gamification for habit formation
- Personalized urgency based on user data

---

## Integration with RLM Workflow

### During `@rlm-feature-design for FTR-XXX`

Include in feature design spec:

```markdown
## Behavioral Economics Review

### Applicable Principles
- [List which principles apply to this feature]

### Implementation
- [How each principle will be applied]

### Ethical Considerations
- [Any gray areas or concerns]

### Checklist Score: X.X/5.0
```

### During `@rlm-quality for design QA`

Add behavioral economics review as part of design QA:

```markdown
## Behavioral Economics QA

- [ ] Choice architecture optimizes for user benefit
- [ ] Framing is appropriate (loss/gain)
- [ ] Social proof is genuine and relevant
- [ ] No dark patterns or manipulation
- [ ] Cognitive load is minimized

Score: X/10 points
```

---

## References

- Thaler & Sunstein (2008). Nudge: Improving Decisions About Health, Wealth, and Happiness
- Kahneman (2011). Thinking, Fast and Slow
- Cialdini (2006). Influence: The Psychology of Persuasion
- Ariely (2008). Predictably Irrational

---

*Last Updated: v2.6*
*Part of RLM Design System*
