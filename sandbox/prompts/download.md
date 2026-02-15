# Download from Sandbox

Download build artifacts, test results, screenshots, and other files from a sandbox.

## Single File
```bash
uv run sbx files download <id> /workspace/dist/bundle.js ./dist/bundle.js
```

## Directory (recursive)
```bash
uv run sbx files download-dir <id> /workspace/dist ./dist
uv run sbx files download-dir <id> /workspace/coverage ./coverage
```

## Common Downloads
| Artifact | Sandbox Path | Local Path |
|----------|-------------|------------|
| Build output | `/workspace/dist` | `./dist` |
| Test coverage | `/workspace/coverage` | `./coverage` |
| Screenshots | `/tmp/screenshot.png` | `./screenshots/` |
| Test results | `/workspace/test-results.json` | `./test-results.json` |
| Logs | `/workspace/logs/` | `./logs/` |
