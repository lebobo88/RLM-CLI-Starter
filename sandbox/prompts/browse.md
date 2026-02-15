# Browse Sandbox Application

Interact with a sandbox-hosted application using Playwright browser automation.

## Prerequisites
```bash
uv run sbx browser init <id>   # Install Playwright + Chromium (once)
```

## Navigation
```bash
uv run sbx browser nav <id> "<url>"
```

## Interaction
```bash
uv run sbx browser click <id> "#submit-button"
uv run sbx browser type <id> "#email-input" "user@example.com"
```

## Verification
```bash
uv run sbx browser screenshot <id> --output result.png
uv run sbx browser a11y <id>     # Accessibility tree
uv run sbx browser dom <id>      # DOM structure
```

## JavaScript Evaluation
```bash
uv run sbx browser eval <id> "document.title"
```
