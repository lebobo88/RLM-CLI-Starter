# Context Optimization Guide

## Overview

RLM implements two-tier context optimization to minimize token usage while maintaining implementation quality:

1. **Selective Loading** - Load only relevant files based on task type
2. **MI-Based Compression** - Rank and filter context chunks by relevance

These optimizations can reduce context usage by 30-50% without degrading code quality.

## Selective Context Loading

### Purpose

Different task types require different contextual information. Loading only relevant files reduces token waste.

### Script

`RLM/scripts/load-task-context.ps1`

### Usage

```powershell
.\RLM\scripts\load-task-context.ps1 `
    -TaskId "TASK-045" `
    -TaskType "implementation" `
    -MaxTokens 10000
```

### Task Types and Context

| Task Type | Loaded Files | Typical Tokens |
|-----------|--------------|----------------|
| **implementation** | Constitution + Task + Feature Spec + Design Spec + Design Tokens | ~2,500 |
| **testing** | Constitution + Task + Test Patterns + Implementation Files | ~3,000 |
| **architecture** | Constitution + Task + All Architecture Specs | ~4,000 |
| **design** | Constitution + Task + Design System + Tokens + Component Specs | ~3,500 |
| **documentation** | Constitution + Task + README + RLM Docs | ~2,000 |

### Implementation Context Example

For a task to implement a login form:

```
BASELINE (Always Loaded):
- RLM/specs/constitution.md (~500 tokens)
- RLM/tasks/active/TASK-045.md (~300 tokens)

IMPLEMENTATION-SPECIFIC:
- RLM/specs/features/FTR-003.md (~800 tokens)
- RLM/specs/features/FTR-003/design-spec.md (~600 tokens)
- RLM/specs/design/tokens/tokens.json (~300 tokens)

TOTAL: ~2,500 tokens (vs. ~8,000 for full codebase load)
```

### Testing Context Example

For a task to write tests for an API endpoint:

```
BASELINE:
- RLM/specs/constitution.md (~500 tokens)
- RLM/tasks/active/TASK-047.md (~300 tokens)

TESTING-SPECIFIC:
- RLM/docs/testing-patterns.md (~600 tokens)
- src/api/endpoints/auth.ts (~800 tokens) [implementation file]
- src/api/middleware/validate.ts (~500 tokens) [dependency]

TOTAL: ~2,700 tokens
```

### Integration

The Coder agent can call this script before implementation:

```markdown
# In .github/agents/rlm-implement.agent.md Step 1

Before reading files manually, use selective loading:

powershell -ExecutionPolicy Bypass -File "RLM/scripts/load-task-context.ps1" -TaskId "TASK-XXX" -TaskType "implementation"

This loads only relevant files and outputs context to:
RLM/progress/task-context-TASK-XXX.json

Read this JSON file to get optimized context.
```

## MI-Based Context Compression

### Purpose

When context still exceeds limits after selective loading, compress by ranking chunks using Mutual Information (MI) scoring.

### Script

`RLM/scripts/compress-context-mi.ps1`

### MI Scoring Algorithm

Each context chunk receives a score (0-100) based on:

| Factor | Points | Description |
|--------|--------|-------------|
| **Keyword Overlap** | 0-40 | Matching keywords between task and chunk |
| **Recency** | 0-30 | How recently this chunk was used (today=30, this week=20, this month=10) |
| **Dependency Relevance** | 0-20 | Chunk is from a file mentioned in task dependencies |
| **File Type Relevance** | 0-10 | File type matches task type (e.g., `.test.ts` for testing tasks) |

**Example Scores:**

```
src/components/LoginForm.tsx
- Keyword overlap: 32 (task mentions "login", "form", "validation", "submit")
- Recency: 30 (used yesterday)
- Dependency: 20 (listed in task dependencies)
- File type: 10 (component task)
TOTAL: 92

src/utils/date-formatting.ts
- Keyword overlap: 8 (only "format" matches)
- Recency: 0 (never used)
- Dependency: 0 (not in dependencies)
- File type: 0 (utility, not relevant)
TOTAL: 8
```

### Usage

```powershell
$chunks = @(
    "src/components/LoginForm.tsx",
    "src/components/Button.tsx",
    "src/utils/validation.ts",
    "src/utils/date-formatting.ts",
    "src/api/auth.ts"
)

.\RLM\scripts\compress-context-mi.ps1 `
    -TaskId "TASK-045" `
    -ContextChunks $chunks `
    -TargetTokens 5000 `
    -RecentContext @{ "src/components/LoginForm.tsx" = "2026-02-03" }
```

### Output Example

```
=== Compression Results ===
[INCLUDE] src/components/LoginForm.tsx (Score: 92, Tokens: 1,200)
[INCLUDE] src/api/auth.ts (Score: 85, Tokens: 1,500)
[INCLUDE] src/utils/validation.ts (Score: 75, Tokens: 800)
[INCLUDE] src/components/Button.tsx (Score: 65, Tokens: 600)
[EXCLUDE] src/utils/date-formatting.ts (Score: 8, Tokens: 400)

=== Compression Summary ===
Original Chunks: 5
Selected Chunks: 4
Compression Ratio: 80.0%
Original Tokens: 4,500
Compressed Tokens: 4,100
Token Reduction: 8.9%
```

### When to Use Compression

Trigger compression when:
- Context exceeds 75% of model limit
- Selective loading still produces >10k tokens
- Working with large codebases (100+ files)
- Implementing features with many dependencies

### Integration with Compressor Agent

The Compressor agent (`.github/agents/rlm-implement.agent.md`) automatically triggers compression:

```markdown
When context window >75%:
1. Run load-task-context.ps1 for selective loading
2. If still >75%, run compress-context-mi.ps1
3. Report compressed file list to PRIMARY
```

## Combined Optimization Workflow

### Step 1: Selective Loading

```powershell
# Load only relevant files for task type
.\RLM\scripts\load-task-context.ps1 -TaskId "TASK-045" -TaskType "implementation"
```

**Result**: 8,000 → 2,500 tokens (68% reduction)

### Step 2: Check Token Budget

```powershell
$context = Get-Content "RLM/progress/task-context-TASK-045.json" | ConvertFrom-Json
$tokenLimit = 10000
$utilization = $context.token_count / $tokenLimit

if ($utilization -gt 0.75) {
    Write-Host "Context exceeds 75%, triggering compression"
}
```

### Step 3: MI-Based Compression (if needed)

```powershell
.\RLM\scripts\compress-context-mi.ps1 `
    -TaskId "TASK-045" `
    -ContextChunks $context.loaded_files `
    -TargetTokens 7500  # 75% of limit
```

**Result**: 2,500 → 1,800 tokens (additional 28% reduction)

## Token Usage Comparison

### Baseline (No Optimization)

```
Full codebase loading:
- All feature specs: 5,000 tokens
- All design specs: 3,000 tokens
- All implementation files: 8,000 tokens
- All tests: 4,000 tokens
TOTAL: 20,000 tokens

Model limit (Sonnet 4.5): ~200,000 tokens
Effective tasks per session: ~10
```

### With Selective Loading

```
Task-specific loading:
- Constitution: 500 tokens
- Task file: 300 tokens
- Feature spec: 800 tokens
- Design spec: 600 tokens
- Design tokens: 300 tokens
TOTAL: 2,500 tokens

Effective tasks per session: ~80 (8x improvement)
```

### With Selective + Compression

```
Compressed context:
- Top 5 most relevant files: 1,800 tokens
- All other context excluded

Effective tasks per session: ~110 (11x improvement)
```

## Best Practices

### 1. Always Use Selective Loading

For all sub-agents (Coder, Tester, Reviewer):

```markdown
Step 0: Load Context
powershell -ExecutionPolicy Bypass -File "RLM/scripts/load-task-context.ps1" -TaskId "TASK-XXX" -TaskType "[type]"
```

### 2. Trigger Compression Only When Needed

Don't compress unnecessarily:

```powershell
# Check utilization first
$context = Get-Content "RLM/progress/task-context-TASK-XXX.json" | ConvertFrom-Json

if ($context.token_count -gt 7500) {  # >75% of 10k budget
    # Compress
} else {
    # Use selective loading as-is
}
```

### 3. Track Recent Usage

Maintain a recent context cache:

```json
// RLM/progress/recent-context.json
{
  "src/components/LoginForm.tsx": "2026-02-04T14:30:00Z",
  "src/api/auth.ts": "2026-02-04T10:15:00Z",
  "src/utils/validation.ts": "2026-02-03T16:45:00Z"
}
```

Pass this to compression script:

```powershell
$recentContext = Get-Content "RLM/progress/recent-context.json" | ConvertFrom-Json -AsHashtable

.\RLM\scripts\compress-context-mi.ps1 `
    -TaskId "TASK-XXX" `
    -ContextChunks $chunks `
    -TargetTokens 5000 `
    -RecentContext $recentContext
```

### 4. Validate Compression Quality

After compression, verify no critical files excluded:

```powershell
$compressed = Get-Content "RLM/progress/compressed-context-TASK-XXX.json" | ConvertFrom-Json

# Check if task dependencies are included
$taskDeps = @("src/api/auth.ts", "src/utils/validation.ts")
$missing = $taskDeps | Where-Object { $_ -notin $compressed.selected_chunks.path }

if ($missing) {
    Write-Warning "Critical dependencies excluded: $($missing -join ', ')"
    # Re-run compression with higher target tokens
}
```

## Performance Metrics

### Target Metrics

- **Token Reduction**: 30-50% via selective loading
- **Additional Compression**: 10-30% via MI-based filtering
- **Quality Preservation**: 95%+ code quality maintained
- **False Exclusions**: <5% of tasks missing critical context

### Monitoring

Track optimization effectiveness:

```json
// RLM/progress/optimization-metrics.json
{
  "session_id": "session-2026-02-04",
  "tasks_completed": 12,
  "avg_context_tokens": 2100,
  "avg_reduction_pct": 68.5,
  "compression_triggered": 3,
  "quality_issues": 0
}
```

## Troubleshooting

### Problem: Tests fail due to missing implementation file

**Cause**: Compression excluded a dependency

**Solution**: Lower compression threshold or manually include file

```powershell
# Re-run with higher target
.\RLM\scripts\compress-context-mi.ps1 `
    -TargetTokens 8000  # Increase from 5000
```

### Problem: Design spec missing from implementation context

**Cause**: Task type detection failed

**Solution**: Explicitly set task type

```powershell
# Force design loading
.\RLM\scripts\load-task-context.ps1 -TaskType "design"
```

### Problem: MI score too low for critical file

**Cause**: Keyword mismatch (file uses different terminology)

**Solution**: Add file path to task dependencies

```markdown
## Dependencies
- [ ] src/utils/critical-helper.ts - Critical utility
```

This increases "Dependency Relevance" score by 20 points.

## Future Enhancements

### Planned Improvements

1. **Semantic Embeddings**: Replace keyword matching with vector similarity
2. **Learned Weights**: Train MI scoring weights based on task outcomes
3. **Dependency Graph Analysis**: Auto-detect transitive dependencies
4. **Incremental Loading**: Load additional context mid-task if needed
5. **Cross-Task Context Sharing**: Reuse context across related tasks

### Research Integration

This implementation follows patterns from "Advanced Engineering Frameworks" (Section 7):
- ✅ Selective context loading by task type
- ✅ MI-based relevance scoring
- ✅ Token budget enforcement
- ⚠️ Semantic analysis (planned for v3.1)

## Related Documents

- [VALIDATION-HOOKS.md](VALIDATION-HOOKS.md) - Hook-based validation protocols

## Version History

- **v1.0.0** (2026-02-04): Initial context optimization system
  - Selective loading by task type
  - MI-based compression algorithm
  - Integration with Compressor agent
