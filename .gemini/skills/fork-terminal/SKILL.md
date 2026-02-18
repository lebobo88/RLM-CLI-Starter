---
name: fork-terminal
description: "Spawn isolated terminal contexts for experimental commands and risky operations."
user-invocable: true
context: fork
model: haiku
argument-hint: "<command-to-test>"
allowed-tools:
  - run_shell_command
---

# Fork Terminal Skill

Spawn isolated terminal contexts for experimental commands, dependency testing, and risky operations without affecting the primary session.

## Use Cases

### Dependency Testing
Test package installations or version changes before committing:
```
/fork-terminal npm install some-new-package
```

### Command Experimentation
Try potentially destructive or unknown commands safely:
```
/fork-terminal git rebase -i HEAD~5
```

### Diagnostics
Run system diagnostics that might produce large output:
```
/fork-terminal npx tsc --noEmit --extendedDiagnostics
```

### Build Testing
Test build configurations without polluting the main environment:
```
/fork-terminal npm run build -- --config=experimental
```

## How It Works

1. **Fork**: Creates an isolated terminal context (new tmux pane if available, or background process)
2. **Execute**: Runs the provided command in isolation
3. **Report**: Returns output and exit code to the primary session
4. **Cleanup**: Automatically tears down the forked context

## Isolation Rules

- Forked terminal inherits read access to the project directory
- File writes in the fork do NOT propagate to the primary session
- Environment variables from the primary session are inherited (read-only)
- The fork has its own process group for clean termination

## Fallback Behavior

If tmux is not available:
1. Execute command in a subshell with redirected output
2. Capture stdout/stderr to temporary files
3. Return results to the primary session
4. Clean up temporary files

## Cleanup

Forked terminals are automatically cleaned up when:
- The command completes (success or failure)
- The primary session ends
- A timeout is reached (default: 5 minutes)
