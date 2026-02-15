# Test in Sandbox

Run test suites and collect coverage data inside a sandbox.

## Test Execution
```bash
# Run full test suite
uv run sbx exec run <id> "npm test" --cwd /workspace

# Run with coverage
uv run sbx exec run <id> "npm run test:coverage" --cwd /workspace

# Run specific test file
uv run sbx exec run <id> "npx vitest run src/auth.test.ts" --cwd /workspace
```

## Download Results
```bash
# Download coverage report
uv run sbx files download-dir <id> /workspace/coverage ./coverage

# Download test output
uv run sbx files download <id> /workspace/test-results.json ./test-results.json
```

## TDD Workflow
1. Upload failing tests first (Red)
2. Run tests — confirm failure
3. Upload implementation (Green)
4. Run tests — confirm pass
5. Download passing code
