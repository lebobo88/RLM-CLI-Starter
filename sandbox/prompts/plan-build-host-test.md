# Plan-Build-Host-Test Workflow

Full lifecycle pattern: initialize sandbox, plan implementation, build code, host application, test with browser.

## Steps

### 1. Initialize
```bash
uv run sbx sandbox create --template node --timeout 900
```

### 2. Plan
- Read feature specs and task requirements
- Design implementation approach
- No sandbox commands needed for planning

### 3. Build
```bash
# Upload source
uv run sbx files upload-dir <id> ./src /workspace/src

# Install dependencies
uv run sbx exec run <id> "npm install" --cwd /workspace --root

# Run tests (TDD)
uv run sbx exec run <id> "npm test" --cwd /workspace
```

### 4. Host
```bash
# Start application in background
uv run sbx exec run <id> "npm start" --cwd /workspace --background

# Get public URL
uv run sbx sandbox get-host <id> --port 3000
```

### 5. Test
```bash
# Initialize browser
uv run sbx browser init <id>

# Navigate to hosted app
uv run sbx browser nav <id> "https://<host-url>"

# Take verification screenshot
uv run sbx browser screenshot <id> --output verification.png
```

### 6. Cleanup
```bash
uv run sbx sandbox kill <id>
```
