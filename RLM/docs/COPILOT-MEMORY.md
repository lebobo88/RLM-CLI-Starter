# Copilot Memory + RLM Integration

## Overview

**Copilot Memory** is a feature that allows GitHub Copilot to build persistent, repository-level understanding of your codebase. It stores "memories" — tightly scoped pieces of information about coding conventions, patterns, and preferences — that Copilot deduces as it works.

RLM Method and Copilot Memory are **complementary systems**:
- **RLM** provides **structured specifications** (PRDs, feature specs, task definitions)
- **Copilot Memory** learns **coding patterns** (conventions, architecture decisions, style preferences)

## How They Work Together

### During Discovery (Phase 1)
- RLM creates `PRD.md` and `constitution.md` with project standards
- Copilot Memory learns from these docs and remembers conventions for future sessions

### During Implementation (Phase 6)
- RLM provides task specs and acceptance criteria
- Copilot Memory remembers coding patterns learned during implementation:
  - Import ordering conventions
  - Error handling patterns
  - Test structure preferences
  - API contract patterns
- Future implementation tasks benefit from accumulated memories

### During Code Review (Phase 7)
- Copilot Memory applies learned conventions during review
- Inconsistencies with established patterns are flagged automatically

## Benefits

| Without Memory | With Memory |
|---------------|-------------|
| Must explain conventions every session | Conventions are remembered |
| Custom instructions must cover everything | Memory supplements instructions |
| Each session starts from scratch | Progressive understanding |
| Instructions require manual maintenance | Memories self-update |

## Enabling Copilot Memory

1. **Individual users**: Enable in personal Copilot settings on GitHub
2. **Organizations**: Enable in organization Copilot settings for all members
3. Copilot Memory works with Copilot CLI, Copilot coding agent, and Copilot code review

## Memory Lifecycle

- Memories are stored with citations to specific code locations
- Before use, citations are validated against the current codebase
- Memories expire after 28 days if not refreshed
- Active memories are renewed when validated and used

## Best Practices

1. **Let Copilot discover patterns naturally** — Don't try to force memories; they're created as Copilot works
2. **Use RLM constitution for explicit rules** — Hard requirements go in `constitution.md`; Memory handles soft patterns
3. **Review memories periodically** — Repository owners can view and delete memories in repo settings
4. **Don't duplicate** — If something is in `constitution.md`, Copilot Memory doesn't need to store it separately

## References

- [About Copilot Memory](https://docs.github.com/en/copilot/concepts/agents/copilot-memory)
- [Enabling Copilot Memory](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/copilot-memory)
