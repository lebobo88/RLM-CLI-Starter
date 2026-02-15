# Build in Sandbox

Implement code from a plan inside an active sandbox.

## Prerequisites
- Active sandbox with ID available
- Plan or task specification loaded

## Workflow

### 1. Upload project skeleton
```bash
uv run sbx files upload-dir <id> ./ /workspace --exclude node_modules --exclude .git
```

### 2. Install dependencies
```bash
uv run sbx exec run <id> "npm install" --cwd /workspace --root
```

### 3. Implement iteratively
For each file to create/modify:
```bash
uv run sbx files write <id> /workspace/src/module.ts "<code>"
```

### 4. Verify with tests
```bash
uv run sbx exec run <id> "npm test" --cwd /workspace
```

### 5. Download results
```bash
uv run sbx files download-dir <id> /workspace/src ./src
uv run sbx files download-dir <id> /workspace/tests ./tests
```
