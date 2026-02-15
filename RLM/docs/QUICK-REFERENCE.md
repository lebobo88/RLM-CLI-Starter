# RLM Quick Reference

## Complete Workflow Diagram

```
+----------------------------------------------------------------------------+
|                         RLM 9-PHASE PIPELINE                                |
+----------------------------------------------------------------------------+
|                                                                            |
|  PATH 1: FROM ZERO              PATH 2: FROM PRD                           |
|  @rlm-orchestrator [idea]       @rlm-orchestrator --from-prd               |
|       |                              |                                     |
|       v                              |                                     |
|  Phase 1: DISCOVER <-----------------+                                     |
|       |   (Auto-detects research in RLM/research/project/)                 |
|       v                                                                    |
|  Phase 2: DESIGN SYSTEM -------> @rlm-design system (if UI)                |
|       |   (Auto-detected: UI vs Non-UI classification)                     |
|       v                                                                    |
|  Phase 3: SPECS ---------------> @rlm-specs                                |
|       |                                                                    |
|       v                                                                    |
|  Phase 4: FEATURE DESIGN ------> @rlm-feature-design FTR-XXX (if UI)      |
|       |                                                                    |
|       v                                                                    |
|  Phase 5: TASKS ---------------> @rlm-tasks (checkpoint system)            |
|       |                                                                    |
|       v                                                                    |
|  Phase 6: IMPLEMENT -----------> @rlm-implement all (primary-led parallel) |
|       |   (Primary orchestrates focused sub-agents, 66% token reduction)   |
|       v                                                                    |
|  Phase 7a: QUALITY ------------> @rlm-quality (design qa + review + tests) |
|       |   (80% coverage gate blocks verification if not met)               |
|       v                                                                    |
|  Phase 7b: CONTRACT TESTS -----> @rlm-quality contracts (validate bounds)  |
|       |   (Module boundary validation before E2E)                          |
|       v                                                                    |
|  Phase 7c: E2E GENERATION -----> @rlm-verify e2e (generate before verify)  |
|       |                                                                    |
|       v                                                                    |
|  Phase 8: VERIFY --------------> @rlm-verify all (parallel verification)   |
|       |                                                                    |
|       v                                                                    |
|  Phase 9: REPORT -------------> @rlm-report detailed (auto or manual)     |
|                                                                            |
+----------------------------------------------------------------------------+
```

## Commands

> **Automatic Documentation**: All `@rlm-*` agent commands automatically fetch up-to-date documentation. Cached to `RLM/research/docs/` with 30-day TTL.

### Main Commands (Copilot CLI)

| Command | Phase | Purpose |
|---------|-------|---------|
| `@rlm-orchestrator [idea]` | All | Complete 9-phase automation |
| `@rlm-orchestrator --from-prd` | 2-9 | Start from existing PRD |
| `@rlm-discover [idea]` | 1 | Discovery with research agent |
| `@rlm-design system` | 2 | Generate design system |
| `@rlm-specs` | 3 | Specs from PRD |
| `@rlm-feature-design FTR-XXX` | 4 | Feature UI/UX specs |
| `@rlm-tasks` | 5 | Break features into tasks |
| `@rlm-implement [task\|all]` | 6 | Primary-led TDD implementation |
| `@rlm-quality design-qa` | 7a | 117-point design QA |
| `@rlm-quality review` | 7a | Code review |
| `@rlm-quality coverage` | 7a | Coverage analysis (80% gate) |
| `@rlm-quality contracts [FTR]` | 7b | Run contract tests for module boundaries |
| `@rlm-verify FTR-XXX` | 7c | Generate E2E tests for feature |
| `@rlm-verify all` | 7c | Generate E2E tests for all features |
| `@rlm-verify FTR-XXX` | 8 | E2E feature verification |
| `@rlm-verify all` | 8 | Verify all features in parallel |
| `@rlm-report [type]` | 9 | Generate final project report |

### Utility Commands

| Command | Purpose |
|---------|---------|
| `@rlm-verify [name]` | Run isolated test project for methodology validation |
| `@rlm-debug context-audit` | Analyze context usage and optimization |
| `@rlm-debug` | Full diagnostic scan and reconciliation |
| `@rlm-debug quick` | Fast scan for common issues |
| `@rlm-debug --auto-fix` | Auto-fix safe issues |

### GitHub Copilot Integration

Cost optimization through task delegation to GitHub Copilot Pro+:

| Command | Purpose | Example |
|---------|---------|---------|
| `@rlm-implement all --smart-route` | Auto-route tasks by complexity | 70 tasks: 78% savings |
| `@rlm-implement assign TASK-XXX` | Manually assign task to Copilot | Single task delegation |
| `@rlm-report status` | Check quota and assignments | Quota: 258/300 (14%) |
| `@rlm-implement import PR-NUM` | Validate and merge Copilot PR | Import PR #123 |
| `@rlm-quality review PR-NUM` | Request Copilot code review | Review PR #123 |

**Quick Examples:**

```bash
# Check quota before assigning
powershell RLM/scripts/check-copilot-quota.ps1 -SKU "coding_agent"

# Validate external code (hard gates)
powershell RLM/scripts/validate-external-code.ps1 -Branch "copilot/task-045" -TaskId "TASK-045"

# Update quota after task completion
powershell RLM/scripts/update-copilot-quota.ps1 -SKU "coding_agent" -Requests 1 -TaskId "TASK-045"

# Run integration tests
powershell RLM/scripts/test-copilot-workflow.ps1

# Run Pester unit tests
Invoke-Pester RLM/scripts/tests/
```

**Hard Gates (External Code):**
1. ✅ Build (`npm run build`)
2. ✅ Lint (`npm run lint`)
3. ✅ Type-check (`npx tsc --noEmit`)
4. ✅ Tests (`npm test`)
5. ✅ Coverage ≥80%

**SKU Budgets:**
- `copilot`: 500 requests
- `coding_agent`: 300 requests
- `spark`: 200 requests

## Prompt Pattern Library

| Pattern | Use Case | Applied By |
|---------|----------|------------|
| `root-cause-analysis.md` | Bug investigation, 5-Whys | Coder, Tester |
| `decision-matrix.md` | Technology selection | Architect |
| `comparative-analysis.md` | Alternative evaluation | Architect, Research |
| `problem-decomposition.md` | Complex task breakdown | Coder |

## Primary-Led Sub-Agents

| Agent | Responsibility | Context |
|-------|----------------|---------|
| TestWriter | Write ONE test file | ~500 tokens |
| CodeWriter | Write ONE impl file | ~600 tokens |
| (Primary) | Orchestration, verification, manifest | Full context |

## Infrastructure Sub-Agents

| Agent | Responsibility | Triggers |
|-------|----------------|----------|
| Compressor | Context compression with MI scoring | Context >75%, sub-agent prep |
| Router | Task-to-model routing decisions | Cost optimization, complexity |
| Learner | Expertise extraction from tasks | Task completion, session end |

## Supported IDE

Copilot CLI is the supported IDE for this workspace. Agent configuration is in `.github/agents/*.agent.md`.

## Cross-Platform CLI

```bash
npx @rlm/cli status                     # Show project status
npx @rlm/cli init --ide all             # Setup all IDE configs
npx @rlm/cli manifest --task TASK-001   # Write completion manifest
npx @rlm/cli complete --task TASK-001   # Complete task atomically
```

## For Other IDEs

Use AGENTS.md (universal) or read prompts directly:
```
Read AGENTS.md for project instructions.
Then read RLM/prompts/[prompt-name].md and follow it
```

## Automation Levels

| Level | AI Autonomy | Pauses At |
|-------|-------------|-----------|
| **AUTO** | Full | Blockers only |
| **SUPERVISED** | Guided | Key decisions |
| **MANUAL** | Step-by-step | Every action |

## Sub-Agents

| Agent | Purpose | Phase | Proactive Triggers |
|-------|---------|-------|-------------------|
| Research | Web research, competitors | 1 | "what do others do?", market research |
| Architect | Tech decisions, ADRs | 1, 3 | "which technology?", trade-offs |
| Designer | Design system, UI/UX specs | 2, 4, 7 | UI feature start, colors/typography |
| Coder | TDD implementation | 6 | "build/implement/create", tasks |
| CopilotBridge | GitHub Copilot delegation | 6 | Trivial tasks (complexity 1-3), --smart-route |
| Tester | Test coverage | 7 | Coverage < 80%, flaky tests |
| Reviewer | Code review, security | 7 | Before commits, security code |
| Verifier | E2E tests, accessibility | 8 | Feature completion |
| Compressor | Context compression (MI) | - | Context >75%, sub-agent prep |
| Router | Multi-model routing | - | Cost optimization, task complexity |
| Learner | Expertise extraction | - | Task completion, session end |

## Key Directories

| Directory | Contents |
|-----------|----------|
| `RLM/prompts/` | Workflow prompts |
| `RLM/prompts/patterns/` | Prompt patterns |
| `RLM/specs/` | PRD, constitution, feature specs |
| `RLM/specs/design/` | Design system, tokens, components |
| `RLM/specs/architecture/` | Architecture decision records (7 ADRs) |
| `RLM/tasks/active/` | Pending tasks |
| `RLM/tasks/completed/` | Done tasks |
| `RLM/progress/` | Status, checkpoint, logs, config |
| `RLM/research/project/` | Auto-detected project research |
| `packages/` | @rlm/* TypeScript packages (10) |
| `apps/dashboard/` | Next.js Core Four web dashboard |
| `infrastructure/` | Docker, PostgreSQL migrations |

## Key Files

| File | Purpose |
|------|---------|
| `RLM/START-HERE.md` | Entry point |
| `RLM/specs/PRD.md` | Product requirements |
| `RLM/specs/constitution.md` | Project standards |
| `RLM/specs/design/design-system.md` | Design system |
| `RLM/tasks/INDEX.md` | Task overview |
| `RLM/progress/status.json` | Current state |
| `RLM/progress/checkpoint.json` | Incremental tracking |
| `RLM/progress/rlm-config.json` | Configuration |
| `RLM/templates/PRD-TEMPLATE.md` | PRD template |
| `RLM/templates/behavioral-economics-checklist.md` | Design checklist |

## Task Lifecycle

```
pending -> in_progress -> completed
                     \-> blocked
```

## Feature Lifecycle

```
in_progress -> verification-pending -> verified
                      |
              verification-failed
                      |
              (fix bugs, retry)
```

## Multi-Model Routing

| Provider | Models | Best For |
|----------|--------|----------|
| Anthropic | Haiku, Sonnet, Opus | Complex reasoning, coding |
| GitHub Copilot | Opus 4.5, GPT-5 (Pro+) | Trivial tasks, GitHub-native ops |
| OpenAI | GPT-4o, GPT-4o-mini | Routine tasks, fast responses |
| Google | Gemini Flash, Pro | Vision, multimodal |
| Ollama | Llama 3, CodeLlama | Local, privacy-sensitive |

### Smart Routing (--smart-route)

Complexity-based task distribution:

| Complexity | Score | Routed To | Cost | Savings |
|------------|-------|-----------|------|---------|
| Trivial | 1-3 | GitHub Copilot | 1 premium request | 78% |
| Simple | 4-5 | Copilot CLI Sub-Agent | API tokens | 94% |
| Medium | 6-7 | Copilot CLI Sub-Agent | API tokens | - |
| Complex | 8-10 | Copilot CLI PRIMARY | API tokens | - |

**Overrides:**
- Security-sensitive → Always Copilot CLI
- GitHub-native → Copilot
- Offline/private → Local only

### Cost Controls

| Model | Per-Session | Daily |
|-------|-------------|-------|
| Claude Opus | $3.00 | $30.00 |
| Claude Sonnet | $1.00 | $15.00 |
| Claude Haiku | $0.25 | $5.00 |
| GPT-4o | $1.00 | $15.00 |
| Ollama | $0.00 | $0.00 |

## Core Four Architecture

Real-time monitoring of the four leverage points:

| Dimension | What it Tracks |
|-----------|----------------|
| **Context** | Window usage, efficiency metrics |
| **Model** | Active model, capability alignment |
| **Prompt** | Active prompts, versions, performance |
| **Tools** | Available tools, usage patterns |

## ZTE Metrics (Zero Trivial Engineering)

| Metric | Description |
|--------|-------------|
| Plan Velocity | Time reduction in planning |
| Review Velocity | Time reduction in review |
| Autonomous Frequency | Tasks without human intervention |
| Context Efficiency | Token usage optimization |
| Success Ratio | First-attempt success rate |

## Agent Experts System

Self-improvement through Act-Learn-Reuse:

1. **Act**: Execute task
2. **Learn**: Extract insights from success
3. **Reuse**: Apply patterns to future tasks

Storage: PostgreSQL + JSON files (Git-trackable)

## 5-Step Progress Model (Primary-Led)

```
Step 1: Load specs and context      (0-20%)   PRIMARY primes ~400 tokens
Step 2: Write tests (TDD Red)       (20-40%)  TestWriter sub-agent
Step 3: Implement code (TDD Green)  (40-70%)  CodeWriter sub-agent
Step 4: Run tests and fix           (70-85%)  PRIMARY verifies files exist
Step 5: Quality checks and review   (85-100%) PRIMARY writes manifest
```

## Coverage Gate

| Gate | Threshold | Action |
|------|-----------|--------|
| Unit Coverage | < 80% | BLOCKS `@rlm-verify` |
| Critical Paths | < 100% | WARNING (auth, payments, security) |
| Gap Report | On fail | `RLM/progress/coverage-gaps.md` |

## 3-Tier Context Management

| Tier | Goal | Strategy |
|------|------|----------|
| **Tier 1: REDUCE** | Minimize loaded | Selective file reading, summaries |
| **Tier 2: DELEGATE** | Offload high-token work | Sub-agent delegation |
| **Tier 3: MANAGE** | Handle overflow | Checkpoints, smart truncation |

## Context Thresholds

| Threshold | Action |
|-----------|--------|
| 50% | Save checkpoint, log warning, continue |
| 75% | Save checkpoint, activate truncation, suggest wrap-up |
| 90% | Save checkpoint, complete current task only, pause |
| 95% | Emergency bundle save, stop all work |

## Token Efficiency Ratings

| Rating | Tokens/Task | Interpretation |
|--------|-------------|----------------|
| Excellent | < 10,000 | Simple task |
| Good | 10-20,000 | Normal complexity |
| Fair | 20-35,000 | Complex or rework |
| Poor | > 35,000 | Consider splitting |

## Behavioral Economics Principles

| Principle | Application |
|-----------|-------------|
| Choice Architecture | Design defaults to guide choices |
| Prospect Theory | Frame as loss/gain appropriately |
| Anchoring | Strategic pricing presentation |
| Social Proof | Display genuine user activity |
| Endowment Effect | Create ownership through personalization |
| Scarcity/Urgency | Use only for genuine constraints |
| Cognitive Load | Progressive disclosure |

## Cognitive Psychology Laws

| Law | UX Application |
|-----|----------------|
| Fitts's Law | Min 44x44px targets |
| Hick's Law | Max 7+/-2 choices |
| Miller's Law | Chunk information |
| Jakob's Law | Use familiar patterns |
| Peak-End Rule | Polish endings |
| Von Restorff Effect | Visual hierarchy for CTAs |

## Output by Phase

| Phase | Command | Creates |
|-------|---------|---------|
| 1. Discovery | `@rlm-discover` | PRD.md, constitution.md |
| 2. Design | `@rlm-design system` | design-system.md, tokens/, public/ (favicon assets) |
| 3. Specs | `@rlm-specs` | features/, architecture/ |
| 4. Feature Design | `@rlm-feature-design` | FTR-XXX/design-spec.md |
| 5. Tasks | `@rlm-tasks` | tasks/active/*.md, checkpoint.json |
| 6. Implement | `@rlm-implement` | Source code, tests (primary-led) |
| 7a. Quality | `@rlm-quality` | qa-report.json, review-report.json, metrics.json |
| 7b. E2E Gen | `@rlm-verify e2e` | tests/e2e/features/FTR-XXX/*.spec.ts |
| 8. Verify | `@rlm-verify all` | verification/, e2e results |
| 9. Report | `@rlm-report` | final-report.md, reports/ |

## Debug Issues Detected

| Issue Type | Description |
|------------|-------------|
| `orphan-tasks` | Tasks with no parent feature |
| `missing-tasks` | Features with incomplete coverage |
| `status-mismatch` | File status vs status.json |
| `checkpoint-drift` | Checkpoint out of sync |
| `broken-deps` | Non-existent dependencies |
| `duplicate-ids` | Same ID used twice |
| `missing-specs` | Tasks referencing missing specs |
| `stale-progress` | Progress files > 24h old |
| `blocked-loop` | Circular blocking dependencies |
| `incomplete-metadata` | Missing required fields |

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| AI doesn't know RLM | "Read RLM/START-HERE.md" |
| Missing PRD | Run `@rlm-discover` first |
| Missing design system | Run `@rlm-design system` |
| Can't resume | Check status.json or checkpoint.json |
| State inconsistent | Run `@rlm-debug quick` |
| Context overflow | Session auto-saved, use `@rlm-resume` |
| Tasks overwritten | Use checkpoint system (auto) |
| High token usage | Run `@rlm-debug context-audit` |
| Verification blocked | Coverage < 80%, run `@rlm-quality coverage` |
| No E2E tests | Run `@rlm-verify FTR-XXX` before verification |
| Sub-agent file missing | Primary-led pattern auto-verifies |
| **Copilot quota exhausted** | Check quota: `check-copilot-quota.ps1 -SKU "coding_agent"` |
| **Copilot PR failed gates** | Run validation: `validate-external-code.ps1 -Branch "copilot/task-XXX"` |
| **Quota not updating** | Manually run: `update-copilot-quota.ps1 -SKU "coding_agent" -TaskId "TASK-XXX"` |
| **Integration test fails** | Run: `test-copilot-workflow.ps1 -SkipCleanup` for debugging |

## Document Locations

```
Specifications:
  RLM/specs/PRD.md
  RLM/specs/constitution.md
  RLM/specs/features/FTR-XXX/spec.md
  RLM/specs/features/FTR-XXX/design-spec.md
  RLM/specs/architecture/overview.md

Design:
  RLM/specs/design/design-system.md
  RLM/specs/design/tokens/tokens.json
  RLM/specs/design/components/[name].md

Tasks:
  RLM/tasks/active/TASK-XXX.md
  RLM/tasks/completed/TASK-XXX.md
  RLM/tasks/INDEX.md

Progress:
  RLM/progress/status.json
  RLM/progress/checkpoint.json
  RLM/progress/rlm-config.json
  RLM/progress/token-usage/
  RLM/progress/bundles/
  RLM/progress/verification/

Research:
  RLM/research/project/

Patterns:
  RLM/prompts/patterns/root-cause-analysis.md
  RLM/prompts/patterns/decision-matrix.md
  RLM/prompts/patterns/comparative-analysis.md
  RLM/prompts/patterns/problem-decomposition.md

Templates:
  RLM/templates/PRD-TEMPLATE.md
  RLM/templates/behavioral-economics-checklist.md

Packages:
  packages/rlm-cli/           # Cross-platform CLI
  packages/metrics-api/       # Core Four metrics
  packages/model-router/      # Multi-model routing
  packages/expertise/         # Agent Experts
  packages/sandbox/           # Docker sandboxes
  packages/infinite-loop/     # Recursive improvement
  packages/context-compression/  # MI compression
  packages/zte/               # ZTE metrics
  packages/adw/               # AI Developer Workflows
  packages/cli-dashboard/     # CLI dashboard
  apps/dashboard/             # Web dashboard

Infrastructure:
  infrastructure/docker/docker-compose.yml
  infrastructure/docker/agent-sandbox/Dockerfile
  infrastructure/db/migrations/
```

## Design Quick Reference

### 8 Component States
```
Default -> Hover -> Focus -> Active
                     |
Disabled <- Loading <- Error <- Empty
```

### Animation Tiers
| Tier | Technology | Duration |
|------|------------|----------|
| MINIMAL | CSS | 150-200ms |
| MODERATE | Framer Motion | 200-400ms |
| RICH | GSAP | 300-600ms |

### Design QA Categories
| Category | Points | Pass |
|----------|--------|------|
| Visual | 20 | 18+ |
| Accessibility | 25 | 23+ |
| States | 18 | 16+ |
| Responsive | 18 | 16+ |
| Animation | 12 | 11+ |
| Error | 12 | 11+ |
| Performance | 12 | 11+ |
| **Total** | **117** | **>=105** |

## Verification Tests

| Type | Tool | Checks |
|------|------|--------|
| Functional | Playwright | User flows, forms, navigation |
| Accessibility | axe-core | WCAG 2.1 AA compliance |
| Visual | Screenshots | UI states, responsive layouts |

## Skip Options for @rlm-orchestrator

```bash
--skip-design-research    # Skip UX research phase
--skip-feature-design     # Skip feature design specs
--skip-design-qa          # Skip design QA checks
--skip-verification       # Skip E2E verification
```

## Configuration Options

```bash
# Configure via RLM/progress/rlm-config.json
parallel_limit: 8              # Concurrent sub-agents
automation_level: auto         # Full autonomy
reporting.mode: both           # realtime + silent
design.auto_detect: true       # Auto UI/Non-UI
enhancements.prompt_patterns.enabled: true
enhancements.behavioral_economics.enabled: true
```

## Test Mode

```bash
@rlm-verify my-test-project                    # Interactive
@rlm-verify my-test-project --from-prd path/   # From PRD
@rlm-verify my-test-project --idea "desc"      # With idea
```

Creates: `test_projects/[name]-[timestamp]/`
Collects: tokens, time, LOC, coverage

## Docker Infrastructure

Start the development stack:

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

Services:
- PostgreSQL (expertise, metrics, ZTE)
- Agent sandbox containers (isolated execution)
