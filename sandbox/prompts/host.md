# Host Application in Sandbox

Make a sandbox application publicly accessible via E2B's port forwarding.

## Steps

### 1. Start the application
```bash
uv run sbx exec run <id> "npm start" --cwd /workspace --background
```

### 2. Get public URL
```bash
uv run sbx sandbox get-host <id> --port <port>
```
Returns: `https://<sandbox-id>-<port>.e2b.dev`

### 3. Verify accessibility
```bash
uv run sbx browser init <id>
uv run sbx browser nav <id> "https://<host-url>"
```

## Notes
- Each port gets a unique public URL
- Use unique ports when multiple agents share a sandbox
- URLs are temporary and expire when the sandbox is killed
