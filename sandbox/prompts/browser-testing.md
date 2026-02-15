# Browser Testing Pattern

Multi-agent parallel browser testing with unique ports.

## Port Isolation
When multiple agents test simultaneously, each must use a unique port:
- Agent 1: `--port 3001`
- Agent 2: `--port 3002`
- Agent 3: `--port 3003`

## Parallel Test Flow

### Per-agent setup
```bash
# Start app on unique port
uv run sbx exec run <id> "PORT=<port> npm start" --cwd /workspace --background

# Get unique URL
uv run sbx sandbox get-host <id> --port <port>

# Initialize browser
uv run sbx browser init <id>

# Run test scenarios
uv run sbx browser nav <id> "https://<host-url>"
uv run sbx browser screenshot <id> --output agent-<n>-result.png
```

## Best-of-N Pattern
Run N implementations in parallel sandboxes, pick the best:
1. Create N sandboxes
2. Build different approaches in each
3. Run same test suite in all
4. Compare results, keep best implementation
5. Kill all sandboxes
