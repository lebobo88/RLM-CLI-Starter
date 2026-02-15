# Tech Stack

## Core Technologies
- **Language**: TypeScript 5+ (Strict Mode)
- **Runtime**: Node.js 18+ (LTS)
- **Package Manager**: npm (or pnpm for speed)

## Frameworks & Libraries
- **CLI**: `oclif` (v3+) - Robust, plugin-based CLI framework.
- **UI**:
  - `ora` (v6+) - Elegant terminal spinners.
  - `chalk` (v5+) - Terminal string styling.
  - `inquirer` (v9+) or `@inquirer/prompts` - Interactive prompts.
  - `cli-table3` - Formatting tables for results.
- **AI Integration**:
  - `@anthropic-ai/sdk` (v0.16+) - Official Anthropic client.
  - `openai` (v4+) - Official OpenAI client (optional secondary).
  - `tiktoken` (v1+) - Token counting for accurate context management.
- **Utilities**:
  - `zod` (v3+) - TypeScript-first schema validation.
  - `execa` (v8+) - Process execution (shell commands).
  - `globby` (v13+) - User-friendly glob matching.
  - `conf` (v11+) - Simple config handling.
  - `uuid` (v9+) - Unique ID generation.

## Testing & Quality
- **Test Runner**: `vitest` (v1+) - Fast, modern unit testing framework.
- **Linting**: `eslint` (v8+) - Pluggable linting utility.
- **Formatting**: `prettier` (v3+) - Opinionated code formatter.

## Build & Release
- **Bundler**: `tsup` (v8+) or `esbuild` - Fast TypeScript bundling.
- **Release**: `semantic-release` (optional) - Automated version management.

## Rationale
- **TypeScript**: Essential for type safety and maintainability in a complex codebase.
- **oclif**: Proven, well-documented, and extensible.
- **execa**: Better cross-platform support and Promise-based API than native `child_process`.
- **zod**: Runtime validation ensures data integrity, especially for AI outputs.
