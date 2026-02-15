# Full-Stack in Sandbox

Build and test a complete full-stack application (frontend + backend + database) inside a single sandbox.

## Architecture
- Frontend: Served on port 3000
- Backend API: Served on port 8080
- Database: Local SQLite or sandbox-internal service

## Steps

### 1. Create sandbox with extended timeout
```bash
uv run sbx sandbox create --template node --timeout 1800
```

### 2. Set up backend
```bash
uv run sbx files upload-dir <id> ./server /workspace/server
uv run sbx exec run <id> "npm install" --cwd /workspace/server --root
uv run sbx exec run <id> "npm start" --cwd /workspace/server --background
```

### 3. Set up frontend
```bash
uv run sbx files upload-dir <id> ./client /workspace/client
uv run sbx exec run <id> "npm install" --cwd /workspace/client --root
uv run sbx exec run <id> "npm run build" --cwd /workspace/client
uv run sbx exec run <id> "npx serve -s build -l 3000" --cwd /workspace/client --background
```

### 4. Verify both endpoints
```bash
uv run sbx sandbox get-host <id> --port 3000   # Frontend
uv run sbx sandbox get-host <id> --port 8080   # Backend API
```

### 5. Integration testing
```bash
uv run sbx exec run <id> "npm run test:integration" --cwd /workspace
```
