# Defense-in-Depth: Layered Security Model

> Swiss Cheese defense model for RLM projects -- multiple independent defense layers where each layer's gaps are covered by adjacent layers.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Code Generation                       │
│                                                         │
│  Layer 1 ─── Prompt Engineering (R.A.I.L.G.U.A.R.D.)   │
│       │                                                 │
│  Layer 2 ─── Tool Permission Gates                      │
│       │                                                 │
│  Layer 3 ─── Output Validation                          │
│       │                                                 │
│  Layer 4 ─── Code Review                                │
│       │                                                 │
│  Layer 5 ─── Runtime Monitoring                         │
│                                                         │
│                    Production Code                       │
└─────────────────────────────────────────────────────────┘
```

Each layer operates independently. A failure in any single layer is caught by subsequent layers.

## Layer 1: Prompt Engineering (R.A.I.L.G.U.A.R.D.)

**Purpose**: Prevent insecure code from being generated in the first place.

**Implementation**: Security blueprints embedded in agent definitions.

| Blueprint | Scope | Agent File |
|-----------|-------|------------|
| 1. Zero-Trust Input Handling | Validate all inputs, parameterize queries, sanitize HTML | `.github/agents/rlm-implement.agent.md` |
| 2. Least Privilege Authorization | Deny-by-default, RBAC, no hardcoded roles | `.github/agents/rlm-implement.agent.md` |
| 3. Output Sanitization | Context-aware encoding, no stack traces to clients | `.github/agents/rlm-implement.agent.md` |
| 4. Secure Cryptographic Operations | AES-256-GCM, Argon2id, no custom crypto | `.github/agents/rlm-implement.agent.md` |
| 5. AI-Specific Safety | Validate packages, flag eval/exec, no secrets in prompts | `.github/agents/rlm-implement.agent.md` |

**Source**: Cloud Security Alliance R.A.I.L.G.U.A.R.D. framework

**Coverage**: Prevents ~60% of common vulnerability patterns at generation time.

**Gaps**: Relies on model compliance with instructions; does not enforce at runtime.

## Layer 2: Tool Permission Gates

**Purpose**: Block destructive or unauthorized operations before execution.

**Implementation**: Pre-tool hooks that intercept dangerous commands.

| Gate | Script | What It Blocks |
|------|--------|----------------|
| Bash Permission | `RLM/scripts/permission-request.ps1` | `git push --force`, `rm -rf`, `DROP TABLE`, destructive commands |
| Copilot Quota | `RLM/scripts/check-copilot-quota.ps1` | Delegation when quota exhausted |
| Security Keywords | `RLM/scripts/route-tasks.ps1` | External routing of auth/secret/payment tasks |
| Privacy Guard | `RLM/scripts/privacy-guard.ps1` | Blocks .env, secrets, credentials from leaving local |

**Hook Configuration**: `.github/hooks/` (PreToolUse matchers)

**Coverage**: Prevents unauthorized system operations and data exfiltration to external tools.

**Gaps**: Only covers operations that go through the hook system; direct file writes bypass Bash permission checks.

## Layer 3: Output Validation

**Purpose**: Verify generated code meets standards after writing.

**Implementation**: Post-tool hooks that validate written files.

| Validator | Script | What It Checks |
|-----------|--------|----------------|
| Post-Write Verify | `RLM/scripts/post-write-verify.ps1` | File exists after Write tool |
| Post-Write Validation | `RLM/scripts/post-write-validation.ps1` | Linting, type-checking after file write |
| External Code Validation | `RLM/scripts/validate-external-code.ps1` | 5 hard gates (build, lint, typecheck, tests, coverage) for generated code |
| New File Validation | `RLM/scripts/validate-new-file.ps1` | Structural validation for file creation |
| Content Validation | `RLM/scripts/validate-file-contains.ps1` | Semantic validation for required sections |

**Hook Configuration**: `.github/hooks/` (PostToolUse matchers for Write and Edit)

**Coverage**: Catches type errors, lint violations, and structural issues in generated code.

**Gaps**: Does not perform deep semantic security analysis; relies on linter rules and type system.

## Layer 4: Code Review

**Purpose**: Human-level security and quality review before code is committed.

**Implementation**: Reviewer sub-agent with security checklists.

| Review Component | Location | What It Covers |
|------------------|----------|----------------|
| ASVS Security Checklist | `.github/agents/rlm-quality.agent.md` | OWASP ASVS v5.0 L2 mapped checks |
| R.A.I.L.G.U.A.R.D. Review | `.github/agents/rlm-quality.agent.md` | 5 blueprint compliance verification |
| Design Review | `.github/agents/rlm-quality.agent.md` | Accessibility, responsive, component states |
| Compilation Tests | `.github/agents/rlm-quality.agent.md` | Type-check, build, unit tests (mandatory first) |
| Builder-Validator | `RLM/docs/TASK-ORCHESTRATION.md` | Paired tasks: implementation + validation |

**Trigger**: `@rlm-quality` agent, or automatically before commits during `@rlm-implement`.

**Coverage**: Catches security vulnerabilities, architectural issues, and quality problems through structured checklists.

**Gaps**: Dependent on reviewer agent thoroughness; time-constrained reviews may miss deep issues.

## Layer 5: Runtime Monitoring

**Purpose**: Detect issues in running code and agent behavior.

**Implementation**: Health monitoring, observability events, and test failure detection.

| Monitor | Script/Package | What It Detects |
|---------|---------------|-----------------|
| Health Monitor | `RLM/scripts/monitor-task-health.ps1` | Stale tasks, missing manifests, broken dependencies, missing tests |
| Test Failure Detection | `RLM/scripts/detect-test-failure.ps1` | Consecutive test failures, suggests iterative debug loop |
| Observability Events | `packages/observability/` | Agent lifecycle events, anomalies |
| Session Logging | `.github/hooks/` (Stop hook) | Context bundle generation, session tracking |

**Coverage**: Catches operational issues, stale states, and test regressions.

**Gaps**: No real-time anomaly detection or Haiku-based event summarization (planned enhancement).

## Coverage Matrix

| Vulnerability Type | L1 Prompt | L2 Permission | L3 Validation | L4 Review | L5 Monitoring |
|-------------------|-----------|---------------|---------------|-----------|---------------|
| SQL Injection | Blueprint 1 | -- | Lint rules | ASVS V5.3.1 | Test failure |
| XSS | Blueprint 1,3 | -- | Lint rules | ASVS V5.3.3 | Test failure |
| Auth Bypass | Blueprint 2 | Keyword block | Type-check | ASVS V4.1.1 | Health check |
| Secrets in Code | Blueprint 5 | Privacy gate | -- | Blueprint 4 review | -- |
| Destructive Operations | -- | Permission hook | -- | -- | Session log |
| Data Exfiltration | Blueprint 5 | Privacy gate | External code validation | -- | Audit log |
| Weak Crypto | Blueprint 4 | -- | -- | Blueprint 4 review | -- |
| Prompt Injection | Blueprint 5 | -- | -- | Blueprint 5 review | -- |

## Known Gaps and Planned Mitigations

| Gap | Impact | Planned Mitigation |
|-----|--------|-------------------|
| No runtime prompt injection defense | Medium | Structured input/output delimiters in agent prompts |
| No model output validation for hallucinated code | Medium | Package existence verification in CI pipeline |
| No real-time anomaly detection | Low | Haiku-based event summarization in observability package |
| Deep semantic security analysis | Low | SAST/DAST scanning gates in CI/CD pipeline |

## Adding New Defense Layers

When implementing new security features, identify which layer they belong to and update this document:

1. Determine which layer the new defense fits into (or propose a new layer)
2. Implement the defense mechanism
3. Add the mechanism to the appropriate layer table above
4. Update the Coverage Matrix
5. Document any new gaps
