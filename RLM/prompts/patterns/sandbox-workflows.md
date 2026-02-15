# Sandbox Workflow Patterns

> Pattern catalog for sandbox workflows. Reference from `RLM/prompts/10-SANDBOX.md`.

## Provider Selection

Before starting any workflow, determine the provider:

| Condition | Provider | Why |
|-----------|----------|-----|
| `E2B_API_KEY` set, need public URLs | E2B | Cloud-hosted, accessible from anywhere |
| Docker running, offline/local dev | Docker | Free, no cloud dependency |
| `--provider` flag specified | As specified | Explicit user choice |
| Neither available | Error | Cannot proceed without a backend |

---

## Pattern 1: Plan-Build-Host-Test

The standard full-lifecycle pattern for building and verifying features in isolation.

```
Create Sandbox -> Upload Source -> Install Deps -> Run Tests (TDD)
    -> Host App -> Get Host URL -> Browser Test -> Download Results -> Kill Sandbox
```

**When to use**: Feature implementation with verification requirements.

### E2B Variant
```bash
uv run sbx sandbox create --template node --timeout 900
# ... upload, install, test ...
uv run sbx sandbox get-host <id> --port 3000
# Returns: https://<id>-3000.e2b.dev (public URL)
uv run sbx browser nav <id> "https://<host-url>"
```

### Docker Variant
```bash
uv run sbx --provider docker sandbox create --template node --timeout 900
# ... upload, install, test ...
uv run sbx sandbox get-host <id> --port 3000
# Returns: http://localhost:<mapped_port> (local URL)
uv run sbx browser nav <id> "http://localhost:<mapped_port>"
```

---

## Pattern 2: Full-Stack in Sandbox

Build frontend, backend, and database in a single sandbox with separate ports.

```
Create Sandbox -> Setup Backend (:8080) -> Setup Frontend (:3000)
    -> Integration Tests -> Download Artifacts -> Kill Sandbox
```

**When to use**: Features that span multiple services or require database access.

### E2B Variant
```bash
uv run sbx sandbox create --template node --timeout 1200
uv run sbx sandbox get-host <id> --port 8080  # Backend: https://...
uv run sbx sandbox get-host <id> --port 3000  # Frontend: https://...
```

### Docker Variant
```bash
uv run sbx --provider docker sandbox create --template node --timeout 1200
uv run sbx sandbox get-host <id> --port 8080  # Backend: http://localhost:<port>
uv run sbx sandbox get-host <id> --port 3000  # Frontend: http://localhost:<port>
```

---

## Pattern 3: Best-of-N Parallel

Run N different implementations in parallel sandboxes, evaluate all, keep the best.

```
Create N Sandboxes -> Build Variant in Each -> Run Same Test Suite
    -> Compare Results (pass rate, performance, code quality)
    -> Download Best -> Kill All Sandboxes
```

**When to use**: Performance-critical code, algorithm selection, or when multiple valid approaches exist.

**Setup**:
1. Create N sandboxes: `uv run sbx sandbox create` (repeat N times)
2. Upload different implementations to each
3. Run identical test suite in all
4. Compare: test pass rate, execution time, coverage
5. Download the winning implementation
6. Kill all N sandboxes

**Trade-offs**:
- **E2B**: Costs N times the compute, but sandboxes are fully isolated VMs
- **Docker**: Free but uses local resources; N containers share host CPU/memory

---

## Pattern 4: Sandbox-Assisted Debugging

Reproduce and fix bugs in an isolated environment without risking the host.

```
Create Sandbox -> Upload Buggy Code -> Reproduce Bug -> Apply Fix
    -> Verify Fix -> Download Fixed Code -> Kill Sandbox
```

**When to use**: Debugging issues that are hard to reproduce locally or that could damage host state.

**Steps**:
1. Create sandbox matching production environment
2. Upload the code with the reported bug
3. Run the reproduction steps
4. Apply candidate fixes
5. Verify each fix doesn't break other tests
6. Download the verified fix

---

## Pattern 5: Browser E2E Testing

Automated browser testing of sandbox-hosted applications.

```
Create Sandbox -> Build & Host App -> Init Browser -> Navigate
    -> Interact (click, type, etc.) -> Screenshot -> Accessibility Audit
    -> Download Evidence -> Kill Sandbox
```

**When to use**: E2E verification, visual regression testing, accessibility audits.

**Port allocation**:
- Use unique ports per concurrent browser test
- Agent 1: `:3001`, Agent 2: `:3002`, Agent 3: `:3003`

### URL differences
- **E2B**: `uv run sbx browser nav <id> "https://<host-url>"`
- **Docker**: `uv run sbx browser nav <id> "http://localhost:<mapped_port>"`

---

## Pattern 6: File Sync

Keep host and sandbox files synchronized during iterative development.

```
Upload Source -> Edit in Sandbox -> Test -> Download Changes
    -> Edit Locally -> Upload Again -> Test -> ...
```

**When to use**: Interactive development sessions where you alternate between local editing and sandbox testing.

**Commands**:
```bash
# Initial sync (host -> sandbox)
uv run sbx files upload-dir <id> ./src /workspace/src

# After sandbox changes (sandbox -> host)
uv run sbx files download-dir <id> /workspace/src ./src

# After local changes (host -> sandbox)
uv run sbx files upload-dir <id> ./src /workspace/src
```

---

## Choosing a Pattern

| Scenario | Pattern |
|----------|---------|
| Standard feature work | Plan-Build-Host-Test |
| Multi-service features | Full-Stack in Sandbox |
| Algorithm/approach selection | Best-of-N Parallel |
| Bug investigation | Sandbox-Assisted Debugging |
| Visual/a11y verification | Browser E2E Testing |
| Iterative development | File Sync |

## Choosing a Provider

| Scenario | Recommended Provider |
|----------|---------------------|
| Offline development | Docker |
| CI/CD pipelines | Docker |
| Need public URLs | E2B |
| Cost-sensitive | Docker |
| Kernel-level isolation required | E2B |
| Quick local testing | Docker |
| Collaborative testing (share URLs) | E2B |
