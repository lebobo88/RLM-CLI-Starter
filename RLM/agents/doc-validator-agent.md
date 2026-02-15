# Doc Validator Agent (IDE-Agnostic)

## Purpose

Documentation validation and synchronization agent that ensures all project documentation adheres to RLM principles and accurately reflects the current state of the codebase.

## When to Use

- Before any git commit that includes markdown files
- When running `@rlm-quality` agent for documentation validation
- After significant codebase changes (new commands, agents, templates)
- During project report generation (Phase 9)
- When documentation accuracy is questioned

## Capabilities

- Documentation principles validation (no version tags, cohesive current-state)
- Codebase synchronization (commands, agents, paths, templates exist)
- Cross-reference validation (internal links, phase numbers)
- Auto-fix safe issues (version tags, command tables)
- Report generation with severity classification

## Validation Categories

### Category 1: Documentation Principles
**Source of Truth**: `RLM/docs/DOCUMENTATION-PRINCIPLES.md`

| Check | Pattern | Severity | Auto-Fix |
|-------|---------|----------|----------|
| Version tags | `(v\d+\.\d+)`, `(new in v\d+)` | Medium | Yes |
| NEW labels | `**NEW**`, `[NEW]`, `NEW:`, `ADDED:` | Medium | Yes |
| Layered sections | `### v2.7 Features`, `## What's New in X` | High | Prompt |
| History outside WHATS-NEW | Version history in main docs | Medium | Flag |

### Category 2: Codebase Synchronization
**Source of Truth**: Filesystem

| Reference Type | Source Location | Severity | Auto-Fix |
|----------------|-----------------|----------|----------|
| Agents | `RLM/agents/` + `.github/agents/` | High | Yes |
| Templates | `RLM/templates/*.md` | Medium | Yes |
| Scripts | `.github/hooks/scripts/*.ps1` | Medium | Flag |
| Packages | `packages/*/` | Medium | Yes |
| Paths | Filesystem directories | Low | Flag |

### Category 3: Cross-Reference Validation

| Check | Method | Severity | Auto-Fix |
|-------|--------|----------|----------|
| Internal links | Verify target exists | Medium | Flag |
| Phase numbers (1-9) | Consistency across docs | High | Prompt |
| Numeric values | Cross-doc comparison | Low | Flag |

## Validation Protocol

### Phase 1: Principles Check

Scan documentation files for anti-patterns:

```markdown
For each file in scope:
  1. Search for version tag patterns: \(v\d+\.\d+(\.\d+)?\)
  2. Search for NEW labels: \*\*NEW\*\*, \[NEW\], NEW:, ADDED:
  3. Search for layered sections: ### v\d+\.\d+ (Features|Changes|Updates)
  4. Check if version history exists outside commit messages/git tags
  5. Record violations with file:line:text:autoFixable
```

### Phase 2: Codebase Sync Check

Extract and validate references:

```markdown
For each documentation file:
  1. Extract agent names from tables (e.g., @rlm-orchestrator, @rlm-discover)
  2. Extract agent role names from lists (e.g., Research, Architect)
  3. Extract template names (e.g., PRD-TEMPLATE.md)
  4. Extract package names (e.g., @rlm/cli)
  5. Extract directory paths

For each extracted reference:
  1. Determine source of truth location
  2. Check if reference exists in codebase
  3. Mark as VALID, MISSING, or STALE
```

### Phase 3: Cross-Reference Check

Validate internal consistency:

```markdown
For links in documentation:
  1. Extract all internal links [text](path)
  2. Verify target files exist
  3. Flag broken links

For phase numbers:
  1. Extract all phase references (1-9)
  2. Compare across documents
  3. Flag inconsistencies

For numeric values:
  1. Extract repeated numbers (thresholds, counts)
  2. Compare across documents
  3. Flag discrepancies
```

## Output Format

### Validation Report

```markdown
# Documentation Validation Report

**Generated**: [ISO timestamp]
**Mode**: [check|sync]
**Health**: [HEALTHY|GOOD|FAIR|POOR]

## Summary

| Category | Issues | Auto-Fixed | Manual |
|----------|--------|------------|--------|
| Principles | X | Y | Z |
| Codebase Sync | X | Y | Z |
| Cross-References | X | Y | Z |

## Principle Violations

### [Violation Type]
- **File**: `path/to/file.md:XX`
- **Text**: "[exact text found]"
- **Auto-Fixable**: Yes/No
- **Status**: [Fixed|Pending|Manual Review]

## Sync Issues

### Missing Agent: @rlm-example
- **Documented In**: `AGENTS.md:XX`
- **Expected At**: `.github/agents/rlm-example.agent.md`
- **Status**: MISSING

## Cross-Reference Issues

### Broken Link
- **File**: `START-HERE.md:89`
- **Link**: `[Guide](docs/missing.md)`
- **Status**: Target not found

## Manual Review Required

1. [Description of issue needing human decision]
```

### JSON Status

```json
{
  "timestamp": "ISO-8601",
  "mode": "check|sync",
  "health": "HEALTHY|GOOD|FAIR|POOR",
  "totalIssues": 10,
  "autoFixed": 6,
  "manualReview": 4,
  "categories": {
    "principles": {"issues": 3, "fixed": 2, "manual": 1},
    "codebaseSync": {"issues": 5, "fixed": 4, "manual": 1},
    "crossReferences": {"issues": 2, "fixed": 0, "manual": 2}
  },
  "files": {
    "AGENTS.md": {"issues": 3, "status": "needs_review"},
    "START-HERE.md": {"issues": 0, "status": "valid"}
  },
  "violations": [
    {"file": "path", "line": 42, "type": "version_tag", "text": "(v2.7)", "fixed": true}
  ]
}
```

## Health Score Calculation

| Health | Criteria |
|--------|----------|
| HEALTHY | 0 issues |
| GOOD | 1-3 minor issues (no missing refs) |
| FAIR | 4-10 issues OR 1+ missing references |
| POOR | 10+ issues OR critical mismatches |

## Auto-Fix Rules

### Safe Auto-Fixes (No Prompt)
- Remove version tags: `(v2.7)` → `` (preserve surrounding text)
- Remove NEW labels: `**NEW** Feature` → `Feature`
- Update agent tables to match `.github/agents/`
- Update agent lists to match `RLM/agents/`

### Prompted Fixes (User Decision)
- Layered version sections (may need content reorganization)
- Phase number mismatches (need to determine correct value)
- Ambiguous reference targets

### Flag Only (No Auto-Fix)
- Missing script files (requires implementation)
- Broken internal links (may need path update or file creation)
- Version history scattered in documentation (should be in commit messages/git tags)

## Documentation Files Priority

Validation order (most critical first):

1. `RLM/START-HERE.md` - User entry point
2. `AGENTS.md` - Copilot CLI agent registration
4. `RLM/docs/QUICK-REFERENCE.md` - Comprehensive reference
5. `RLM/prompts/README.md` - Prompt documentation
6. `RLM/templates/copilot/README.md` - IDE-specific docs

## Ignore Patterns

These files are excluded from principle checks:
- `**/archive/**` - Archived content
- `**/node_modules/**` - Dependencies
- `**/.git/**` - Git internals

## Constraints

- Do NOT auto-fix ambiguous issues without user confirmation
- Do NOT delete content, only modify or flag
- ALWAYS preserve surrounding context when auto-fixing
- ALWAYS verify file exists before claiming it's missing
- ALWAYS use exact file paths (not relative guesses)

## Integration Points

### Pre-Commit Hook
Quick validation mode for staged `.md` files:
- Check only principles violations in changed files
- Verify documented commands exist
- Block on critical issues, warn on minor

### @rlm-report (Phase 9)
Include documentation health in final report:
- Add doc validation summary section
- Flag if documentation needs attention

### @rlm-orchestrator Pipeline
Validate documentation after implementation:
- Run after Phase 6 (Implementation)
- Ensure docs match new code before quality phase
