# RLM Validation Hooks Guide

## Overview

The RLM framework includes a comprehensive validation hook system that provides automated quality gates throughout the development workflow. This document describes all available validation hooks and how to use them.

## Hook Categories

### 1. Automatic Hooks (Triggered by Tools)

These hooks execute automatically when specific tools are used:

- **post-write-verify.ps1** - Verifies files exist after Write tool
- **post-write-validation.ps1** - Runs linting/type-checking after Write tool
- **permission-request.ps1** - Pre-validates sensitive Bash commands

### 2. Manual Hooks (Called Explicitly by Agents)

These hooks are called explicitly in agent workflows:

- **validate-new-file.ps1** - Structural validation for file creation
- **validate-file-contains.ps1** - Semantic validation for required sections
- **post-tool-failure.ps1** - Error analysis and recovery suggestions

---

## Automatic Hooks

### post-write-verify.ps1

**Trigger**: Automatically after Write tool
**Purpose**: Verify file was created successfully
**Exit Code**: 0 (always succeeds, logs warnings only)

**What it checks:**
- File exists at expected path
- File has content (warns if empty)

**Example output:**
```
File verification: src/components/Button.tsx
✓ File exists
✓ File size: 1234 bytes
```

### post-write-validation.ps1

**Trigger**: Automatically after Write tool
**Purpose**: Run linting and type-checking on newly written files
**Exit Code**: 0 (provides feedback but doesn't block)
**Timeout**: 10 seconds

**Supported file types:**
- **TypeScript/JavaScript** (.ts, .tsx, .js, .jsx)
  - Runs `npx tsc --noEmit` for type checking
  - Runs `npx eslint` for linting
- **Python** (.py)
  - Runs `ruff check` for linting
  - Runs `mypy` for type checking
- **PowerShell** (.ps1)
  - Runs `Invoke-ScriptAnalyzer` for linting
- **JSON** (.json)
  - Validates JSON syntax
- **YAML** (.yaml, .yml)
  - Basic YAML validation

**Example output:**
```
==========================================
Post-Write Validation: Button.tsx
==========================================
Validating TypeScript/JavaScript file...
  Running TypeScript type checking...
  ✓ TypeScript type checking passed
  Running ESLint...
  ✗ ESLint errors found:
    src/components/Button.tsx:45 - Missing return type annotation
==========================================
⚠ Validation completed with errors

AGENT INSTRUCTIONS:
  - Review the errors above
  - Fix validation issues before proceeding
  - Re-write the file using the Edit or Write tool
```

**Agent response:**
When validation errors are found, the agent should fix them immediately using Edit or Write tool.

### permission-request.ps1

**Trigger**: Automatically before Bash tool execution
**Purpose**: Detect and warn about sensitive/destructive operations
**Exit Code**: 0 (warning) or 1 (critical - blocks operation)
**Timeout**: 3 seconds

**Detected patterns:**

| Pattern | Severity | Description |
|---------|----------|-------------|
| `git push --force` | CRITICAL | Force push can overwrite history |
| `git push origin main --force` | CRITICAL | Force push to main/master |
| `npm publish` | HIGH | Publishing to npm registry |
| `docker push` | HIGH | Pushing Docker image |
| `ALTER TABLE` | CRITICAL | Database schema modification |
| `DROP TABLE/DATABASE` | CRITICAL | Destructive database operation |
| `TRUNCATE TABLE` | HIGH | Delete all table rows |
| `rm -rf /` | CRITICAL | Recursive delete from root |
| `rm -rf *` | HIGH | Recursive delete all files |
| `chmod 777` | HIGH | Overly permissive permissions |
| `git reset --hard` | MEDIUM | Discard uncommitted changes |
| `curl \| bash` | HIGH | Execute remote script |

**Example output:**
```
==========================================
⚠ PERMISSION REQUEST: SENSITIVE OPERATION
==========================================

Tool: Bash
Command: git push --force

Severity: CRITICAL
Issue: Force push can overwrite remote history
Suggestion: Use git push --force-with-lease instead, or create a new branch

==========================================
⚠ This command requires user approval
==========================================

AGENT INSTRUCTIONS:
  - Review the warnings above carefully
  - If this is a test/development environment, you may proceed
  - If this is production, consider using AskUserQuestion tool
  - The command has been logged for audit trail
```

**How agents should respond:**
- **CRITICAL severity**: Use AskUserQuestion to get user approval
- **HIGH severity**: Proceed with caution, log warning
- **MEDIUM severity**: Informational, proceed normally

---

## Manual Validation Hooks

### validate-new-file.ps1

**Usage**: Called explicitly by agents after creating files
**Purpose**: Verify file was created at correct path with correct extension

**Parameters:**
- `-ExpectedPath` (required): Path where file should exist
- `-ExpectedExtension` (required): Expected file extension (e.g., "md", "ts")
- `-WorkspaceRoot` (optional): Workspace root directory
- `-AllowMissing` (optional): Don't fail if file is missing

**Example usage in agent workflow:**
```powershell
# After creating a feature spec
powershell -ExecutionPolicy Bypass -File ".github/hooks/scripts/validate-new-file.ps1" `
  -ExpectedPath "RLM/specs/features/FTR-001.md" `
  -ExpectedExtension "md"
```

**Example output:**
```
==========================================
Structural Validation: File Creation
==========================================
Expected Path: C:\workspace\RLM\specs\features\FTR-001.md
Expected Extension: .md

✓ File exists at expected path
✓ File extension correct: .md
✓ File size: 2345 bytes

==========================================
✓ Validation passed: File created successfully
==========================================

{
  "valid": true,
  "path": "C:\\workspace\\RLM\\specs\\features\\FTR-001.md",
  "extension": "md",
  "size": 2345,
  "timestamp": "2025-01-15T14:30:00Z"
}
```

**When to use:**
- After `@rlm-specs` to verify all spec files were created
- After `@rlm-specs` to verify architecture docs exist
- After creating task files with create-paired-tasks.ps1
- Any time you need to verify file creation

### validate-file-contains.ps1

**Usage**: Called explicitly by agents to verify file structure
**Purpose**: Ensure files contain required sections/content

**Parameters:**
- `-FilePath` (required): Path to file to validate
- `-RequiredSections` (required): Array of section headers or patterns
- `-WorkspaceRoot` (optional): Workspace root directory
- `-SectionType` (optional): "markdown" (default), "yaml", or "regex"
- `-CaseSensitive` (optional): Case-sensitive matching

**Example usage - Feature spec validation:**
```powershell
powershell -ExecutionPolicy Bypass -File ".github/hooks/scripts/validate-file-contains.ps1" `
  -FilePath "RLM/specs/features/FTR-001.md" `
  -RequiredSections @(
    "## Overview",
    "## User Stories",
    "## Acceptance Criteria",
    "## Technical Requirements"
  ) `
  -SectionType "markdown"
```

**Example usage - Architecture spec validation:**
```powershell
powershell -ExecutionPolicy Bypass -File ".github/hooks/scripts/validate-file-contains.ps1" `
  -FilePath "RLM/specs/architecture/system-design.md" `
  -RequiredSections @(
    "## Technology Stack",
    "## Data Architecture",
    "## API Design",
    "## Security Considerations"
  ) `
  -SectionType "markdown"
```

**Example usage - Package.json validation:**
```powershell
powershell -ExecutionPolicy Bypass -File ".github/hooks/scripts/validate-file-contains.ps1" `
  -FilePath "package.json" `
  -RequiredSections @('"name":', '"version":', '"dependencies":') `
  -SectionType "regex"
```

**Example output (success):**
```
==========================================
Semantic Validation: Required Sections
==========================================
File: C:\workspace\RLM\specs\features\FTR-001.md
Section Type: markdown
Required Sections: 4

✓ File loaded successfully (2345 characters)

✓ Found: ## Overview (1 occurrence(s))
✓ Found: ## User Stories (1 occurrence(s))
✓ Found: ## Acceptance Criteria (1 occurrence(s))
✓ Found: ## Technical Requirements (1 occurrence(s))

==========================================
✓ All required sections present (4/4)
==========================================
```

**Example output (failure):**
```
==========================================
Semantic Validation: Required Sections
==========================================
File: C:\workspace\RLM\specs\features\FTR-001.md
Section Type: markdown
Required Sections: 4

✓ File loaded successfully (1234 characters)

✓ Found: ## Overview (1 occurrence(s))
✗ Missing: ## User Stories
✓ Found: ## Acceptance Criteria (1 occurrence(s))
✗ Missing: ## Technical Requirements

==========================================
✗ Validation failed: 2 section(s) missing

Missing Sections:
  - ## User Stories
  - ## Technical Requirements

AGENT INSTRUCTIONS:
  - Add the missing sections to RLM/specs/features/FTR-001.md
  - Ensure section headers match exactly (case-sensitive: False)
  - Use markdown header format (e.g., '## Section Name')
  - Required sections:
    - ## Overview
    - ## User Stories
    - ## Acceptance Criteria
    - ## Technical Requirements
```

**When to use:**
- After creating specs to verify template compliance
- After creating tasks to ensure all required sections present
- Before marking tasks complete to verify documentation
- Any validation requiring content structure

### post-tool-failure.ps1

**Usage**: Can be called by agents when encountering failures
**Purpose**: Log failures and provide recovery suggestions

**Parameters:**
- `-ToolName` (required): Name of tool that failed
- `-Command` (required): Command or operation attempted
- `-ErrorOutput` (required): Error message received
- `-WorkspaceRoot` (optional): Workspace root
- `-TaskId` (optional): Current task ID

**Example usage:**
```powershell
# After a Bash command fails
powershell -ExecutionPolicy Bypass -File ".github/hooks/scripts/post-tool-failure.ps1" `
  -ToolName "Bash" `
  -Command "npm test" `
  -ErrorOutput "Error: Tests failed with 3 failures" `
  -TaskId "TASK-045"
```

**Error categories detected:**
- File Not Found (ENOENT)
- Permission Denied (EACCES)
- Network Errors (ECONNREFUSED)
- Out of Memory (OOM)
- Syntax Errors
- Type Errors
- Test Failures
- Compilation Errors
- Dependency Errors
- Git Errors
- Database Errors

**Example output:**
```
==========================================
Post-Tool Failure Handler
==========================================
Tool: Bash
Timestamp: 2025-01-15T14:30:00Z
Task: TASK-045

✓ Failure logged to: RLM/progress/logs/tool-failures-2025-01-15.json

==========================================
Error Analysis & Recovery Suggestions
==========================================

Category: Test Failure
Severity: Medium
Suggestion: Tests are failing.
Action: Review test output, check if implementation matches test expectations, or update tests if requirements changed.

==========================================
Error Details
==========================================
Error: Tests failed with 3 failures

Recovery handler completed.
```

**Recurring error detection:**
If the same error occurs multiple times, the script will warn and suggest iterative retry:
```
⚠ RECURRING ERROR DETECTED
This error has occurred 3 times today.

AGENT INSTRUCTIONS:
  - This is a recurring issue that may need a different approach
  - Review previous attempts and try an alternative solution
  - Consider using AskUserQuestion to request guidance
  - If task is blocked, update task status to 'blocked' and create recovery task

==========================================
Auto-Retry Integration
==========================================

This task has failed multiple times. Consider invoking autonomous repair loop:
    @rlm-debug TASK-045
```

---

## Health Monitoring Hooks (Phase 8)

### monitor-task-health.ps1

**Usage**: Manual invocation or triggered via SessionStart/Stop hooks
**Purpose**: Proactive health monitoring to detect stalled tasks, orphaned files, broken dependencies

**Parameters:**
- `-WorkspaceRoot` (optional): Workspace root directory (default: ".")
- `-StaleThresholdMinutes` (optional): Minutes before task considered stale (default: 30)
- `-AutoFix` (optional): Attempt automatic repairs for fixable issues
- `-AutoRetry` (optional): Auto-retry for detected issues
- `-Verbose` (optional): Show detailed logging
- `-OutputFormat` (optional): "console" (default), "json", or "markdown"

**Health Check Categories:**

1. **Stale Task Detection**
   - Finds tasks in `in_progress` status with no updates for > threshold
   - Reports task ID, age, and suggests iterative retry

2. **Manifest Verification**
   - Checks that completed tasks have corresponding manifests
   - Warns if manifests are missing

3. **Orphaned File Detection**
   - Finds source files not tracked in any task manifest
   - Suggests creating cleanup tasks or adding to existing tasks

4. **Dependency Graph Validation**
   - Verifies all task dependencies point to existing tasks
   - Flags broken dependencies as critical issues

5. **Test Coverage Gaps**
   - Identifies source files without corresponding test files
   - Suggests creating test tasks for uncovered files

**Example usage - Manual invocation:**
```powershell
# Quick console check
powershell .github/hooks/scripts/monitor-task-health.ps1

# Verbose output with JSON report
powershell .github/hooks/scripts/monitor-task-health.ps1 -Verbose -OutputFormat json

# With custom stale threshold
powershell .github/hooks/scripts/monitor-task-health.ps1 -StaleThresholdMinutes 45
```

**Example output (console):**
```
Task Health Monitor
━━━━━━━━━━━━━━━━━━━━━━━━━
Workspace: c:\workspace
Scan started: 2026-02-04 16:30:00

Issues Detected: 3

CRITICAL ISSUES (1)
━━━━━━━━━━━━━━━━━━━━━━━━━

  [STALE_TASK]
  task_id: TASK-045
  status: in_progress
  last_update: 2026-02-04T15:45:00Z
  age_minutes: 45
  suggestion: Run @rlm-implement TASK-045 or review task status

WARNINGS (1)
━━━━━━━━━━━━━━━━━━━━━━━━━

  [ORPHANED_FILE]
  file_path: src/components/UnusedComponent.tsx
  suggestion: File not tracked in any task manifest. Consider adding to existing task or creating cleanup task

INFO: 1 informational items (use -Verbose to display)

Health check complete.
```

**Integration with status.json:**

Health check results are automatically logged to `RLM/progress/status.json`:

```json
{
  "health_checks": [
    {
      "timestamp": "2026-02-04T16:30:00Z",
      "issues_found": 3,
      "critical": 1,
      "warning": 1,
      "info": 1,
      "report_path": "RLM/progress/health-reports/health-20260204-163000.json"
    }
  ]
}
```

**Hook integration - SessionStart:**

Add to `.github/hooks/` to run health check at session start:

```json
{
  "SessionStart": [
    {
      "matcher": ".*",
      "hooks": [
        {
          "type": "command",
          "command": "powershell -ExecutionPolicy Bypass -File \".github/hooks/scripts/monitor-task-health.ps1\" -WorkspaceRoot \".\"",
          "timeout": 10000,
          "description": "Run health check at session start"
        }
      ]
    }
  ]
}
```

**Hook integration - Stop (Session End):**

```json
{
  "Stop": [
    {
      "matcher": ".*",
      "hooks": [
        {
          "type": "command",
          "command": "powershell -ExecutionPolicy Bypass -File \".github/hooks/scripts/monitor-task-health.ps1\" -WorkspaceRoot \".\" -OutputFormat \"console\"",
          "timeout": 10000,
          "description": "Run health check at session end"
        }
      ]
    }
  ]
}
```

### detect-test-failure.ps1

**Usage**: Automatically triggered via PostToolUse hook for Bash commands
**Purpose**: Detect consecutive test failures and suggest iterative retry

**Parameters:**
- `-ExitCode` (required): Exit code from test command
- `-Command` (required): Command that was executed
- `-WorkspaceRoot` (optional): Workspace root directory

**How it works:**
1. Monitors all Bash commands for test-related execution (npm test, jest, vitest, playwright)
2. Tracks test failures in `RLM/progress/test-failure-history.json`
3. After 2 consecutive test failures, suggests using `@rlm-implement TASK-XXX`
4. Clears history on test success to avoid false positives

**Example output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Test Failure Detected (2x consecutive)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tests have failed twice in a row. Consider using the
iterative fixing:

  @rlm-implement TASK-XXX

Or for custom iterations:
  @rlm-implement custom "Fix failing tests" --max-iterations 10
```

**Hook integration:**

Add to `.github/hooks/` PostToolUse section:

```json
{
  "PostToolUse": [
    {
      "matcher": "Bash",
      "hooks": [
        {
          "type": "command",
          "command": "powershell -ExecutionPolicy Bypass -File \".github/hooks/scripts/detect-test-failure.ps1\" -ExitCode \"$exit_code\" -Command \"$command\" -WorkspaceRoot \".\"",
          "timeout": 3000,
          "description": "Detect test failures and suggest debug loop"
        }
      ]
    }
  ]
}
```

**When to use:**
- Automatically triggered on test failures (no manual invocation needed)
- Integrates with autonomous iterative fixing
- Complements the implementation phase of RLM workflow

**Failure history tracking:**

The script maintains a rolling history in `RLM/progress/test-failure-history.json`:

```json
{
  "failures": [
    {
      "timestamp": "2026-02-04T16:30:00Z",
      "command": "npm test -- auth.test.ts",
      "exit_code": 1
    },
    {
      "timestamp": "2026-02-04T16:35:00Z",
      "command": "npm test -- auth.test.ts",
      "exit_code": 1
    }
  ]
}
```

History is cleared on first successful test run to avoid stale alerts.

---

## Agent Workflow Examples

### Example 1: Creating a Feature Spec

```markdown
Agent: @rlm-specs

1. Generate feature spec content
2. Write file: RLM/specs/features/FTR-001.md
   → Automatic: post-write-verify.ps1 runs (verifies file exists)
   → Automatic: post-write-validation.ps1 runs (checks markdown)

3. Manual validation:
   powershell validate-new-file.ps1 -ExpectedPath "RLM/specs/features/FTR-001.md" -ExpectedExtension "md"
   → Verifies file created at correct path

4. Manual validation:
   powershell validate-file-contains.ps1 -FilePath "RLM/specs/features/FTR-001.md" -RequiredSections @("## Overview", "## User Stories", "## Acceptance Criteria")
   → Verifies all required sections present

5. If validation passes:
   → Mark spec creation task as complete
   → Report success to PRIMARY

6. If validation fails:
   → Fix missing sections
   → Re-run validation
   → Report issues to PRIMARY
```

### Example 2: Implementing a Task with TDD

```markdown
Agent: Coder implementing TASK-045

1. Write test file: src/__tests__/auth.test.ts
   → Automatic: post-write-verify.ps1 runs
   → Automatic: post-write-validation.ps1 runs
   → TypeScript type-checking runs
   → ESLint runs
   → If errors found: Agent fixes immediately

2. Run tests (Red phase):
   bash: npm test
   → Tests fail (expected in TDD)

3. Write implementation: src/lib/auth.ts
   → Automatic: post-write-verify.ps1 runs
   → Automatic: post-write-validation.ps1 runs
   → TypeScript type-checking runs
   → ESLint runs
   → If errors found: Agent fixes immediately

4. Run tests (Green phase):
   bash: npm test
   → If tests fail:
     post-tool-failure.ps1 provides recovery suggestions
     Agent analyzes and fixes issues

5. Create manifest and mark complete
```

### Example 3: Sensitive Operation

```markdown
Agent: Attempting to publish package

1. Bash command: npm publish
   → Automatic: permission-request.ps1 runs (PreToolUse hook)
   → Detects HIGH severity operation
   → Logs to RLM/progress/logs/permission-requests-YYYY-MM-DD.json
   → Provides warning to agent

2. Agent response:
   - Sees warning about publishing to npm
   - Uses AskUserQuestion to confirm with user
   - User approves
   - Agent proceeds with publish
```

---

## Configuration

### Enabling/Disabling Hooks

Hooks are configured in `.github/hooks/`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "powershell -ExecutionPolicy Bypass -File \".github/hooks/scripts/permission-request.ps1\" -Command \"$command\" -ToolName \"Bash\" -WorkspaceRoot \".\"",
            "timeout": 3000,
            "description": "Check for sensitive operations before executing Bash commands"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "powershell -ExecutionPolicy Bypass -File \".github/hooks/scripts/post-write-verify.ps1\" -FilePath \"$file_path\" -WorkspaceRoot \".\"",
            "timeout": 5000
          },
          {
            "type": "command",
            "command": "powershell -ExecutionPolicy Bypass -File \".github/hooks/scripts/post-write-validation.ps1\" -FilePath \"$file_path\" -WorkspaceRoot \".\"",
            "timeout": 10000,
            "description": "Run linting/type-checking after file write"
          }
        ]
      }
    ]
  }
}
```

To disable a hook, remove it from the hooks.json or comment out the command.

### Customizing Validation Rules

#### Adding Custom Sensitive Patterns

Edit `.github/hooks/scripts/permission-request.ps1` and add to `$sensitivePatterns` array:

```powershell
$sensitivePatterns = @(
    @{
        pattern = 'your-custom-pattern'
        severity = 'HIGH'
        description = 'Your description'
        suggestion = 'Your suggestion'
    }
)
```

#### Adding Custom Error Recovery Patterns

Edit `.github/hooks/scripts/post-tool-failure.ps1` and add error detection:

```powershell
if ($ErrorOutput -match 'your-error-pattern') {
    $suggestions += @{
        category = "Your Category"
        severity = "High"
        suggestion = "Your suggestion"
        action = "Your recommended action"
    }
}
```

---

## Troubleshooting

### Hook Not Executing

1. **Check hooks.json syntax**: Validate JSON is correct
2. **Check PowerShell execution policy**: Run `Get-ExecutionPolicy`, should allow script execution
3. **Check script permissions**: Ensure .ps1 files are not blocked
4. **Check timeout**: Increase timeout if validation is slow
5. **Check logs**: Look in `RLM/progress/logs/session.log` for hook execution

### Validation Too Strict

If validation is blocking legitimate operations:

1. **Adjust severity levels** in permission-request.ps1
2. **Add exceptions** for specific patterns
3. **Use -AllowMissing flag** for optional file validation
4. **Increase timeout** if validation is timing out

### Performance Impact

If hooks are slowing down development:

1. **Disable expensive hooks** during rapid iteration
2. **Increase timeout values** to allow completion
3. **Run validation manually** instead of automatically
4. **Use selective validation** (only validate changed files)

---

## Log Files

All validation hooks log to structured files for analysis:

| Log File | Purpose | Format |
|----------|---------|--------|
| `RLM/progress/logs/session.log` | General session events | Plain text |
| `RLM/progress/logs/tool-failures-YYYY-MM-DD.json` | Tool execution failures | JSON (one per line) |
| `RLM/progress/logs/permission-requests-YYYY-MM-DD.json` | Sensitive operations | JSON (one per line) |

### Analyzing Logs

```powershell
# Count failures by tool type
$failures = Get-Content "RLM/progress/logs/tool-failures-2025-01-15.json" | ConvertFrom-Json
$failures | Group-Object tool | Select-Object Name, Count

# Find recurring errors
$failures | Group-Object error | Where-Object Count -gt 1 | Select-Object Name, Count

# List all permission requests
$requests = Get-Content "RLM/progress/logs/permission-requests-2025-01-15.json" | ConvertFrom-Json
$requests | Format-Table timestamp, command, @{Name="Issues";Expression={$_.issues.Count}}
```

---

## Best Practices

### For Agents

1. **Always check validation output** - Don't ignore warnings
2. **Fix validation errors immediately** - Don't defer to later
3. **Use manual validation** for critical operations (specs, architecture)
4. **Ask for approval** on CRITICAL severity operations
5. **Log context** when calling post-tool-failure.ps1 manually

### For Users

1. **Review permission logs regularly** - Audit sensitive operations
2. **Customize patterns** for your specific needs
3. **Keep hooks updated** as new tools/patterns emerge
4. **Monitor performance impact** and adjust timeouts
5. **Document custom validations** in project README

---

## See Also

- [RLM/prompts/patterns/root-cause-analysis.md](../prompts/patterns/root-cause-analysis.md) - Debugging pattern
- [RLM/templates/validation-checklist.md](../templates/validation-checklist.md) - Validation checklist template
- `.github/agents/rlm-quality.agent.md` - Reviewer agent instructions
