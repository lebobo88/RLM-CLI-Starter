# Sandbox Reboot

Restart a sandbox while preserving important state.

## When to Reboot
- Sandbox environment is corrupted
- Need to reset system state but keep files
- Process table is full

## Reboot Procedure

### 1. Save state
```bash
# Download critical files
uv run sbx files download-dir <id> /workspace ./workspace-backup
```

### 2. Kill old sandbox
```bash
uv run sbx sandbox kill <id>
```

### 3. Create new sandbox
```bash
uv run sbx sandbox create --template <same-template> --timeout <same-timeout>
```

### 4. Restore state
```bash
# Upload saved files
uv run sbx files upload-dir <new-id> ./workspace-backup /workspace
```

### 5. Reinstall dependencies
```bash
uv run sbx exec run <new-id> "npm install" --cwd /workspace --root
```

## Important
- Update sandbox ID in your agent context after reboot
- Verify restored state before continuing work
