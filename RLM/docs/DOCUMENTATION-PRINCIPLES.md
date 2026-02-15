# RLM Documentation Principles

> **Internal Document:** This covers documentation methodology for RLM framework maintainers. For end-user docs, see [QUICK-REFERENCE.md](QUICK-REFERENCE.md).

This document establishes core principles for maintaining documentation in RLM projects.

## Core Principle: Cohesive Current-State Documentation

**All documentation must describe the system as it currently exists, not as a historical layering of versions.**

### What This Means

1. **No Version Tags in Features**: Don't label features with "(v2.7)" or "(new in v2.6)". The documentation describes what IS, not when it was added.

2. **Single Source of Truth**: Each capability is documented once, in the appropriate location. There are no "previous version" sections within main docs.

3. **Version History in One Place**: All version history and changelogs are tracked via commit messages and git tags, not scattered throughout documentation.

4. **Updates Replace, Not Layer**: When adding new features, update the existing documentation to include them cohesively. Don't append a new section saying "NEW: ..."

## Anti-Patterns to Avoid

### Version-Tagged Features

**Wrong:**
```markdown
## Features

- **9-Phase Pipeline** - Complete automation from idea to verified code
- **Sub-Agent Reliability (v2.7.1)** - Completion manifests and hooks
- **Token Tracking (v2.7.1)** - Estimation-based tracking
```

**Correct:**
```markdown
## Features

- **9-Phase Pipeline** - Complete automation from idea to verified code
- **Sub-Agent Reliability** - Completion manifests and hooks
- **Token Tracking** - Estimation-based tracking
```

### Layered Version Sections

**Wrong:**
```markdown
### v2.7.1 Features
- Sub-Agent Reliability
- Token Tracking

### v2.7 Features
- Prompt Patterns
- Design System

### v2.6 Features
- Progress Reporting
```

**Correct:**
```markdown
## Features

### Core Workflow
- 9-Phase Pipeline
- TDD by Default
- Resume Capability

### Sub-Agent System
- Completion Manifests
- Executable Hooks
- File Verification

### Token Tracking
- Real-Time Estimation
- Post-Session Capture
```

### "New" Labels

**Wrong:**
```markdown
| `@rlm-report` | - | Display token usage estimates | - | **NEW** |
```

**Correct:**
```markdown
| `@rlm-report` | - | Display token usage estimates | - |
```

## How to Update Documentation

When adding a new feature:

1. **Identify the logical location** in existing docs where the feature belongs
2. **Integrate the feature** into existing sections, maintaining flow
3. **Remove any version labels** from the main documentation
5. **Ensure cross-references** point to the right places

## Documentation Structure

### Main Docs (Current State)

| Document | Purpose | Updates |
|----------|---------|---------|
| `AGENTS.md` | AI agent instructions | Cohesive current state |
| `RLM/README.md` | Project overview | Cohesive current state |
| `RLM/START-HERE.md` | Quick start guide | Cohesive current state |
| `RLM/docs/*.md` | Feature documentation | Cohesive current state |

### Version History (Changelog)

Version history is tracked via commit messages and git tags rather than a separate changelog file.

## Enforcement

This principle is a core part of the RLM methodology:

1. **During updates**: Always consolidate, never layer
2. **During reviews**: Check for version tags and historical sections
3. **Moving forward**: All documentation changes follow this principle

## Rationale

- **Readers care about what the system does NOW**, not its development history
- **Layered docs become confusing** with overlapping feature descriptions
- **Single source of truth** prevents contradictions and stale information
- **Version history has its place** (commit messages and git tags) for those who need it
