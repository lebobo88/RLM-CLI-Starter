<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Give me deep research on Claude Code directly referencing anthropic's documents located at the following URLs. Consider i'm building an agenting coding framework and UI for managing and deploying new app and development projects and want to make claude code the center of it and make use of all its features, using max subscription, and staying within their TOS.

i have claude code max \$200 subscription for context. my ai agentic coding framework is here: [https://github.com/lebobo88/RLMcoding](https://github.com/lebobo88/RLMcoding)
I also have github copilot pro + \$40 and Cursor Pro \$20 subscriptions.

RLMcoding aims to be a completely automated ai agentic coding framework using the rlm-platform app in the packages folder of its repo. we want to make use of sandboxing with claude code agents to scale compute using RLM method and github repo management for prs and features branches, etc, and utilize any available cloud features of GitHub Copilot and Cursor and Claude Code.

[https://code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents)
[https://code.claude.com/docs/en/agent-teams](https://code.claude.com/docs/en/agent-teams)
[https://code.claude.com/docs/en/plugins](https://code.claude.com/docs/en/plugins)
[https://code.claude.com/docs/en/discover-plugins](https://code.claude.com/docs/en/discover-plugins)
[https://code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills)
[https://code.claude.com/docs/en/output-styles](https://code.claude.com/docs/en/output-styles)
[https://code.claude.com/docs/en/hooks-guide](https://code.claude.com/docs/en/hooks-guide)
[https://code.claude.com/docs/en/headless](https://code.claude.com/docs/en/headless)
[https://code.claude.com/docs/en/mcp](https://code.claude.com/docs/en/mcp)
[https://code.claude.com/docs/en/troubleshooting](https://code.claude.com/docs/en/troubleshooting)
[https://code.claude.com/docs/en/how-claude-code-works](https://code.claude.com/docs/en/how-claude-code-works)
[https://code.claude.com/docs/en/features-overview](https://code.claude.com/docs/en/features-overview)
[https://code.claude.com/docs/en/common-workflows](https://code.claude.com/docs/en/common-workflows)
[https://code.claude.com/docs/en/best-practices](https://code.claude.com/docs/en/best-practices)
[https://code.claude.com/docs/en/claude-code-on-the-web](https://code.claude.com/docs/en/claude-code-on-the-web)
[https://code.claude.com/docs/en/desktop](https://code.claude.com/docs/en/desktop)
[https://code.claude.com/docs/en/chrome](https://code.claude.com/docs/en/chrome)
[https://code.claude.com/docs/en/vs-code](https://code.claude.com/docs/en/vs-code)
[https://code.claude.com/docs/en/github-actions](https://code.claude.com/docs/en/github-actions)
[https://code.claude.com/docs/en/gitlab-ci-cd](https://code.claude.com/docs/en/gitlab-ci-cd)
[https://code.claude.com/docs/en/monitoring-usage](https://code.claude.com/docs/en/monitoring-usage)
[https://code.claude.com/docs/en/data-usage](https://code.claude.com/docs/en/data-usage)
[https://code.claude.com/docs/en/costs](https://code.claude.com/docs/en/costs)

Based on my comprehensive research of Anthropic's Claude Code documentation, I'll create a detailed technical research report for your RLMcoding framework integration.

# Claude Code Deep Research: Building AI Agentic Coding Framework Integration

## Executive Summary

Claude Code is Anthropic's agentic coding assistant that can be integrated into automated development workflows. With your \$200 Claude Max subscription, GitHub Copilot Pro, and Cursor Pro subscriptions, you have powerful tools to build an AI agentic coding framework. This research covers how to leverage Claude Code's advanced features—particularly sub-agents, agent teams, sandboxing, MCP integration, skills, hooks, and GitHub Actions—to scale your RLMcoding platform.

***

## 1. Core Architecture \& Capabilities

### 1.1 The Agentic Loop

Claude Code operates through three phases:

1. **Gather Context** - Reading files, searching codebases, understanding structure
2. **Take Action** - Editing files, running commands, executing tests
3. **Verify Results** - Running tests, checking outputs, validating changes

**Key for RLMcoding**: This loop can be programmatically controlled via the Agent SDK, making it ideal for automated coding workflows.

### 1.2 Available Execution Modes

| Mode | Use Case | Best For RLMcoding |
| :-- | :-- | :-- |
| **Interactive CLI** | Terminal-based development | Development/debugging |
| **Headless Mode** (`-p` flag) | CI/CD, automation | Automated code generation |
| **Agent SDK** | Programmatic control | Framework integration |
| **GitHub Actions** | PR automation | Code review, feature implementation |
| **Desktop App** | Visual interface | Project management |
| **VS Code/JetBrains** | IDE integration | Developer workflows |

**Recommendation**: Focus on Headless Mode + Agent SDK for RLMcoding automation.

***

## 2. Sub-Agents: Scaling Compute Through Isolation

### 2.1 What Are Sub-Agents?

Sub-agents are **isolated Claude Code instances** that:

- Run in **separate context windows** (don't consume main conversation tokens)
- Have **restricted tool access** for security
- Return **summarized results** only
- Can run in **foreground** (blocking) or **background** (concurrent)


### 2.2 Architecture

```
Main Conversation (You + Claude)
    ├── Sub-agent: Code Reviewer (Read-only tools)
    ├── Sub-agent: Test Runner (Bash + Read)
    └── Sub-agent: Security Analyzer (Grep, Read, Glob)
```


### 2.3 Configuration

Sub-agents are defined in `.claude/agents/<name>.md`:

```markdown
---
name: security-reviewer
description: Reviews code for security vulnerabilities. Use proactively after code changes.
tools: Read, Grep, Glob, Bash
model: sonnet
permissionMode: dontAsk
maxTurns: 50
memory: user  # Persistent learning across sessions
---

You are a senior security engineer. Review code for:
- Injection vulnerabilities (SQL, XSS, command injection)
- Authentication and authorization flaws
- Secrets or credentials in code
- Insecure data handling

Provide specific line references and suggested fixes.
```


### 2.4 Key Features for RLMcoding

1. **Context Isolation**: Each sub-agent has its own 200K token context window
2. **Parallel Execution**: Background sub-agents run concurrently
3. **Tool Restrictions**: Limit dangerous operations (e.g., read-only for analysis)
4. **Persistent Memory**: Sub-agents can learn across sessions
5. **Auto-Compaction**: Automatically manage context when full

### 2.5 Programmatic Usage (Headless)

```bash
# Spawn sub-agent via CLI
claude -p "Use the security-reviewer sub-agent to analyze auth.py" \
  --allowedTools "Task(security-reviewer)"

# Or use Agent SDK (TypeScript)
import { runAgent } from '@anthropic-ai/claude-code-sdk';

const result = await runAgent({
  prompt: "Review all authentication code for vulnerabilities",
  agent: "security-reviewer",
  allowedTools: ["Read", "Grep", "Glob"]
});
```


***

## 3. Agent Teams: Coordinating Multiple Claude Instances

### 3.1 What Are Agent Teams?

**Agent teams** coordinate **multiple independent Claude Code sessions** with:

- **Shared task queue** - Teammates pick up tasks from a common pool
- **Peer-to-peer messaging** - Teammates communicate findings
- **Team lead** - Orchestrates work and synthesizes results
- **Isolated contexts** - Each teammate has separate 200K token window


### 3.2 Architecture

```
Team Lead (Main Claude)
    ├── Teammate 1: API Developer (implements endpoints)
    ├── Teammate 2: Test Writer (writes tests)
    ├── Teammate 3: Security Reviewer (checks vulnerabilities)
    └── Teammate 4: Performance Optimizer (profiling)
```


### 3.3 Configuration

Enable agent teams:

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

Or in `settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```


### 3.4 Spawning Teams

```bash
# Interactive mode
claude --permission-mode delegate

> Spawn a team to implement the user authentication feature.
> Create teammates for: backend API, frontend UI, tests, and documentation.
```

```bash
# Headless mode
claude -p "Spawn agent team: backend dev, frontend dev, tester" \
  --permission-mode delegate \
  --allowedTools "Task(*)"
```


### 3.5 Token Costs

- **~7x more tokens** than standard sessions (each teammate has full context)
- Use **Sonnet for teammates** (balances capability and cost)
- Keep teams **small** (3-5 teammates max)
- **Clean up teams** when work is done

***

## 4. Sandboxing: Secure Execution

### 4.1 What Is Sandboxing?

Claude Code supports **OS-level sandboxing** using:

- **Bubblewrap** (Linux/WSL2)
- **Namespace isolation** for filesystem and network access


### 4.2 Setup (WSL2/Linux)

```bash
# Install dependencies
sudo apt-get install bubblewrap socat

# Enable sandboxing
export CLAUDE_CODE_ENABLE_SANDBOXING=1
```


### 4.3 Usage

```bash
# Start sandboxed session
claude --permission-mode bypassPermissions --sandbox

# Or programmatically
claude -p "Run untrusted code in sandbox" --sandbox
```


### 4.4 Benefits for RLMcoding

1. **Safe code execution** - Isolate untrusted agent-generated code
2. **Controlled file access** - Restrict writes to specific directories
3. **Network isolation** - Prevent unauthorized external calls
4. **Auto-cleanup** - Ephemeral environments

***

## 5. MCP (Model Context Protocol): External Integrations

### 5.1 What Is MCP?

MCP connects Claude Code to **external tools and services**:

- **GitHub** - Create PRs, review code, manage issues
- **Slack** - Send notifications, post updates
- **Linear/Jira** - Track tasks, update issues
- **Databases** - Query PostgreSQL, MongoDB, etc.
- **Custom APIs** - Build your own MCP servers


### 5.2 Installing MCP Servers

```bash
# Add GitHub MCP server
claude mcp add --transport http github https://api.githubcopilot.com/mcp/

# Add database MCP server
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://user:pass@localhost:5432/db"

# List configured servers
claude mcp list
```


### 5.3 Configuration File (`.mcp.json`)

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "slack": {
      "type": "http",
      "url": "https://mcp.slack.com/anthropic"
    },
    "custom-api": {
      "type": "stdio",
      "command": "/path/to/custom-server",
      "env": {
        "API_KEY": "${API_KEY}"
      }
    }
  }
}
```


### 5.4 Dynamic MCP Servers in Plugins

Plugins can **bundle MCP servers** for automatic setup:

```json
// plugin.json
{
  "name": "rlm-platform-plugin",
  "mcpServers": {
    "rlm-api": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/rlm-server.js",
      "args": ["--port", "8080"],
      "env": {
        "RLM_API_KEY": "${RLM_API_KEY}"
      }
    }
  }
}
```


***

## 6. Skills: Reusable Workflows

### 6.1 What Are Skills?

Skills are **reusable prompts** that extend Claude's capabilities:

- **Agent Skills** - Claude loads automatically when relevant
- **Manual Skills** - Invoked via `/skill-name`
- **Frontmatter configuration** - Control invocation, tools, models


### 6.2 Skill Structure

```
.claude/skills/
├── code-review/
│   └── SKILL.md
├── deploy/
│   └── SKILL.md
└── fix-issue/
    └── SKILL.md
```


### 6.3 Example Skill

`.claude/skills/fix-issue/SKILL.md`:

```markdown
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
allowed-tools: Bash(gh *), Read, Edit, Grep
---

Fix GitHub issue $ARGUMENTS:

1. Use `gh issue view $ARGUMENTS` to get issue details
2. Search codebase for relevant files
3. Implement necessary changes
4. Write and run tests
5. Create commit and PR
6. Post PR URL to #dev-prs Slack channel
```


### 6.4 Invocation

```bash
# Manual invocation
claude -p "/fix-issue 123"

# Or let Claude decide
claude -p "Fix the authentication bug described in issue #123"
```


### 6.5 Skills with Subagents

Skills can **spawn subagents** for parallel work:

```markdown
---
name: review-pr
description: Comprehensive PR review
context: fork
agent: general-purpose
---

Review this PR across multiple dimensions:
1. Spawn security-reviewer subagent
2. Spawn performance-analyzer subagent
3. Spawn test-coverage-checker subagent
4. Synthesize findings into review comment
```


***

## 7. Hooks: Event-Driven Automation

### 7.1 What Are Hooks?

Hooks are **scripts that run automatically** on Claude Code events:


| Event | When It Fires |
| :-- | :-- |
| `PreToolUse` | Before tool executes (can block) |
| `PostToolUse` | After tool succeeds |
| `SessionStart` | Session begins/resumes |
| `UserPromptSubmit` | User submits prompt |
| `Stop` | Claude finishes responding |
| `SubagentStart/Stop` | Subagent lifecycle |
| `PreCompact` | Before context compaction |

### 7.2 Configuration

`.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/validate-command.sh"
          }
        ]
      }
    ]
  }
}
```


### 7.3 Hook Input/Output

Hooks receive JSON via stdin:

```json
{
  "session_id": "abc123",
  "cwd": "/path/to/project",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test"
  }
}
```

Exit codes control behavior:

- **0** - Allow action
- **2** - Block action (stderr message sent to Claude)


### 7.4 Advanced: Agent-Based Hooks

For verification requiring file inspection:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "Verify all unit tests pass. Run test suite and check results.",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```


***

## 8. GitHub Actions Integration

### 8.1 Claude Code GitHub Action

Automate development with `@claude` mentions in PRs/issues.

### 8.2 Setup

```yaml
# .github/workflows/claude.yml
name: Claude Code

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  claude:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          # Responds to @claude mentions automatically
```


### 8.3 Custom Workflows

```yaml
# Code review on PR
name: Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "/review"
          claude_args: "--max-turns 5"
```


### 8.4 Advanced: Multi-Step Automation

```yaml
# Feature implementation from issue
name: Auto-Implement Feature
on:
  issues:
    types: [labeled]

jobs:
  implement:
    if: contains(github.event.issue.labels.*.name, 'auto-implement')
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Implement the feature described in issue #${{ github.event.issue.number }}:
            1. Create feature branch
            2. Implement code changes
            3. Write tests
            4. Create PR
          claude_args: |
            --max-turns 20
            --allowedTools "Bash(git *),Read,Edit,Write"
```


***

## 9. Agent SDK: Programmatic Control

### 9.1 Installation

```bash
npm install @anthropic-ai/claude-code-sdk
```


### 9.2 Basic Usage

```typescript
import { runAgent } from '@anthropic-ai/claude-code-sdk';

const result = await runAgent({
  prompt: "Implement user authentication feature",
  workingDirectory: "./packages/auth",
  allowedTools: ["Read", "Edit", "Write", "Bash(npm test)"],
  maxTurns: 15,
  model: "claude-sonnet-4-5-20250929"
});

console.log(result.messages); // Full conversation
console.log(result.sessionId); // Resume later
```


### 9.3 Streaming Responses

```typescript
import { streamAgent } from '@anthropic-ai/claude-code-sdk';

for await (const event of streamAgent({
  prompt: "Fix all TypeScript errors",
  onPartialMessage: (msg) => console.log(msg)
})) {
  if (event.type === 'text_delta') {
    process.stdout.write(event.text);
  }
}
```


### 9.4 Tool Approval Callbacks

```typescript
const result = await runAgent({
  prompt: "Deploy to production",
  onToolApproval: async (tool, input) => {
    if (tool === "Bash" && input.command.includes("deploy")) {
      console.log(`Approve deployment: ${input.command}?`);
      return true; // Auto-approve
    }
    return false; // Deny others
  }
});
```


***

## 10. Integration Strategy for RLMcoding

### 10.1 Recommended Architecture

```
RLM Platform (Next.js)
    ├── API Routes
    │   ├── /api/agents/spawn - Create new Claude agent
    │   ├── /api/agents/{id}/task - Assign task to agent
    │   └── /api/agents/{id}/status - Get agent status
    │
    ├── Agent Orchestrator (Node.js Service)
    │   ├── Sub-agent Pool Manager
    │   ├── Task Queue (Bull/Redis)
    │   └── GitHub Repo Manager
    │
    └── Claude Code Integration
        ├── Headless CLI Wrapper
        ├── Agent SDK (TypeScript)
        └── GitHub Actions Automation
```


### 10.2 Core Components

#### 10.2.1 Agent Pool Manager

```typescript
// packages/agent-pool/src/manager.ts
import { runAgent } from '@anthropic-ai/claude-code-sdk';
import { v4 as uuid } from 'uuid';

export class AgentPoolManager {
  private activeAgents = new Map<string, AgentInstance>();

  async spawnAgent(config: AgentConfig): Promise<string> {
    const agentId = uuid();
    
    const instance = await runAgent({
      prompt: config.initialPrompt,
      workingDirectory: config.repoPath,
      allowedTools: config.allowedTools,
      agent: config.subagentType, // "security-reviewer", "code-reviewer"
      maxTurns: config.maxTurns || 20,
      onToolApproval: this.createApprovalHandler(config)
    });

    this.activeAgents.set(agentId, instance);
    return agentId;
  }

  async assignTask(agentId: string, task: string): Promise<AgentResponse> {
    const agent = this.activeAgents.get(agentId);
    if (!agent) throw new Error("Agent not found");

    return await agent.continueSession(task);
  }

  private createApprovalHandler(config: AgentConfig) {
    return async (tool: string, input: any) => {
      // Implement approval logic based on RLM method
      if (config.autoApprove?.includes(tool)) return true;
      
      // Log for human review
      await this.logToolUse(tool, input);
      return config.dangerousMode || false;
    };
  }
}
```


#### 10.2.2 GitHub Repo Management

```typescript
// packages/repo-manager/src/github.ts
import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';

export class GitHubRepoManager {
  private octokit: Octokit;

  async createFeatureBranch(repo: string, baseBranch: string): Promise<string> {
    const branchName = `rlm-agent/${Date.now()}`;
    
    // Create worktree for isolation
    execSync(`git worktree add /tmp/${branchName} -b ${branchName}`, {
      cwd: `/repos/${repo}`
    });

    return branchName;
  }

  async createPR(repo: string, branch: string, title: string, body: string) {
    return await this.octokit.pulls.create({
      owner: 'lebobo88',
      repo: 'RLMcoding',
      head: branch,
      base: 'main',
      title,
      body
    });
  }

  async cleanupWorktree(branchName: string) {
    execSync(`git worktree remove /tmp/${branchName}`, { force: true });
  }
}
```


#### 10.2.3 Task Queue Integration

```typescript
// packages/task-queue/src/processor.ts
import Bull from 'bull';
import { AgentPoolManager } from '@rlm/agent-pool';

const taskQueue = new Bull('rlm-tasks', {
  redis: { host: 'localhost', port: 6379 }
});

taskQueue.process(async (job) => {
  const { type, payload } = job.data;

  const manager = new AgentPoolManager();

  switch (type) {
    case 'implement-feature':
      const agentId = await manager.spawnAgent({
        initialPrompt: `Implement feature: ${payload.description}`,
        repoPath: `/repos/RLMcoding`,
        allowedTools: ["Read", "Edit", "Write", "Bash(git *)", "Bash(npm test)"],
        subagentType: "general-purpose",
        maxTurns: 25
      });

      job.progress(50);

      const result = await manager.assignTask(agentId, "Create PR when done");
      
      return { success: true, prUrl: result.prUrl };

    case 'code-review':
      // Spawn security + performance + style reviewers in parallel
      const reviewers = await Promise.all([
        manager.spawnAgent({ subagentType: "security-reviewer", ... }),
        manager.spawnAgent({ subagentType: "performance-analyzer", ... }),
        manager.spawnAgent({ subagentType: "code-reviewer", ... })
      ]);

      const reviews = await Promise.all(
        reviewers.map(id => manager.assignTask(id, `Review PR #${payload.prNumber}`))
      );

      return { reviews };
  }
});
```


### 10.3 Configuration Management

#### 10.3.1 Global Settings

`~/.claude/settings.json`:

```json
{
  "permissions": {
    "defaultMode": "bypassPermissions",
    "allow": [
      "Bash(git *)",
      "Bash(npm test)",
      "Bash(npm run build)",
      "Read",
      "Edit",
      "Write"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(curl *)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write $(jq -r '.tool_input.file_path')"
          }
        ]
      }
    ],
    "SubagentStop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/log-agent-metrics.sh"
          }
        ]
      }
    ]
  },
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1",
    "CLAUDE_CODE_ENABLE_SANDBOXING": "1",
    "MAX_THINKING_TOKENS": "15000"
  }
}
```


#### 10.3.2 Project-Level Skills

`.claude/skills/rlm-feature-implementation/SKILL.md`:

```markdown
---
name: rlm-feature
description: Implement feature using RLM method
disable-model-invocation: true
allowed-tools: Bash(git *), Bash(npm *), Read, Edit, Write, Grep, Glob
context: fork
agent: general-purpose
---

Implement feature using RLM (Recursive Learning Method):

**Phase 1: Research**
1. Analyze existing codebase structure
2. Identify similar features for patterns
3. List required files and dependencies

**Phase 2: Design**
1. Create design document in `docs/features/$ARGUMENTS.md`
2. Define API contracts
3. Identify test cases

**Phase 3: Implementation**
1. Generate code following existing patterns
2. Write unit tests (aim for >80% coverage)
3. Run `npm run build` and `npm test`

**Phase 4: Verification**
1. Review code for security issues
2. Check performance implications
3. Ensure TypeScript types are correct

**Phase 5: PR Creation**
1. Commit with descriptive message
2. Push to feature branch
3. Create PR with checklist
4. Post PR URL to #dev-prs Slack channel
```


### 10.4 Deployment Workflow

#### 10.4.1 Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  rlm-platform:
    build: ./packages/rlm-platform
    ports:
      - "3000:3000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - GITHUB_TOKEN=${GITHUB_TOKEN}
    volumes:
      - ./repos:/repos
      - ~/.claude:/root/.claude

  agent-orchestrator:
    build: ./packages/agent-orchestrator
    environment:
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./repos:/repos
      - ~/.claude:/root/.claude

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```


#### 10.4.2 Scaling Considerations

| Resource | Recommendation | Notes |
| :-- | :-- | :-- |
| **API Rate Limits** | 20K TPM per user for teams of 100-500 | See rate limits section |
| **Concurrent Agents** | 5-10 agents max | Each agent = 200K token context |
| **Sandboxing** | Enable for untrusted code | Requires bubblewrap on Linux |
| **Memory** | 4GB per agent instance | Monitor with `docker stats` |
| **Token Costs** | ~\$0.50-2 per feature implementation | Track with `/cost` command |


***

## 11. Advanced Features

### 11.1 Persistent Agent Memory

Sub-agents can **learn across sessions**:

```markdown
---
name: code-reviewer
memory: user  # or "project" or "local"
---
```

Memory is stored in:

- **user**: `~/.claude/agent-memory/<name>/`
- **project**: `.claude/agent-memory/<name>/`
- **local**: `.claude/agent-memory-local/<name>/`

Agents automatically:

- Read first 200 lines of `MEMORY.md`
- Update memory as they learn
- Curate memory to stay under 200 lines


### 11.2 Extended Thinking

Enable deeper reasoning for complex tasks:

```bash
# Set thinking token budget
export MAX_THINKING_TOKENS=31999

# Or configure per-model
claude --model opus-4-6 --effort-level high
```

Thinking tokens:

- **Default**: 31,999 tokens
- **Opus 4.6**: Adaptive reasoning (auto-adjusts)
- **Cost**: Billed as output tokens
- **Toggle**: `Option+T` (Mac) or `Alt+T` (Windows)


### 11.3 Code Intelligence Plugins

For typed languages, install LSP plugins:

```bash
# Install TypeScript LSP
/plugin install typescript-lsp@claude-plugins-official

# Install Python LSP
/plugin install pyright-lsp@claude-plugins-official
```

Benefits:

- **Automatic diagnostics** after every edit
- **Jump to definition** instead of grep
- **Find references** across codebase
- **Type errors** shown immediately

***

## 12. Security \& Compliance

### 12.1 Data Usage (Claude Max \$200 Subscription)

- **Training**: Consumer plans (Free/Pro/Max) allow data use for model improvement **by default**
- **Opt-out**: Change at https://claude.ai/settings/data-privacy-controls
- **Retention**: 30 days if opted out, 5 years if opted in
- **Local caching**: Sessions stored locally for 30 days


### 12.2 Telemetry \& Logging

Disable non-essential traffic:

```bash
export DISABLE_TELEMETRY=1
export DISABLE_ERROR_REPORTING=1
export DISABLE_BUG_COMMAND=1
export CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY=1
```

Or disable all at once:

```bash
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
```


### 12.3 Managed Settings (Enterprise)

For organization-wide policies:

**macOS**: `/Library/Application Support/ClaudeCode/managed-settings.json`
**Linux/WSL**: `/etc/claude-code/managed-settings.json`
**Windows**: `C:\Program Files\ClaudeCode\managed-settings.json`

Example:

```json
{
  "permissions": {
    "defaultMode": "default",
    "deny": ["Bash(curl *)", "Bash(wget *)"]
  },
  "env": {
    "ANTHROPIC_API_KEY": "org-key-here",
    "CLAUDE_CODE_ENABLE_SANDBOXING": "1"
  }
}
```


***

## 13. Monitoring \& Observability

### 13.1 OpenTelemetry Integration

Enable metrics export:

```bash
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```


### 13.2 Available Metrics

| Metric | Description |
| :-- | :-- |
| `claude_code.session.count` | Sessions started |
| `claude_code.lines_of_code.count` | Lines modified |
| `claude_code.cost.usage` | API costs (USD) |
| `claude_code.token.usage` | Tokens used (input/output/cache) |
| `claude_code.active_time.total` | Active time (seconds) |

### 13.3 Events/Logs

| Event | Attributes |
| :-- | :-- |
| `user_prompt` | Prompt length, content (if enabled) |
| `tool_result` | Tool name, success/failure, duration |
| `api_request` | Model, cost, tokens, duration |
| `tool_decision` | Tool name, accept/reject, source |


***

## 14. Cost Management

### 14.1 Token Usage Patterns

| Task | Estimated Tokens | Cost (Sonnet) |
| :-- | :-- | :-- |
| Simple bug fix | 5-10K | \$0.05-0.10 |
| Feature implementation | 50-100K | \$0.50-1.00 |
| Large refactor | 200K+ | \$2.00+ |
| Agent team (4 teammates) | 800K+ | \$8.00+ |

### 14.2 Cost Reduction Strategies

1. **Use Sonnet** for most tasks (Opus only for complex reasoning)
2. **Compact frequently** (`/compact` or auto-compaction)
3. **Subagents for verbose tasks** (isolation prevents context bloat)
4. **MCP via CLI tools** (more efficient than MCP servers)
5. **Shorter sessions** (`/clear` between unrelated tasks)
6. **Tool search** (`ENABLE_TOOL_SEARCH=auto:5`)

***

## 15. Recommended Implementation Plan for RLMcoding

### Phase 1: Foundation (Week 1-2)

1. **Setup Claude Code CLI** on development machines
2. **Configure `.claude/settings.json`** with RLM-specific permissions
3. **Create initial skills**:
    - `rlm-feature` - Feature implementation workflow
    - `code-review` - Code review checklist
    - `deploy` - Deployment workflow
4. **Test Agent SDK** integration with simple tasks

### Phase 2: Sub-Agent System (Week 3-4)

1. **Define sub-agents**:
    - `security-reviewer` - Security analysis
    - `test-writer` - Test generation
    - `performance-analyzer` - Performance profiling
2. **Build AgentPoolManager** service
3. **Integrate with Redis task queue**
4. **Test parallel sub-agent execution**

### Phase 3: GitHub Integration (Week 5-6)

1. **Setup GitHub Actions** workflows
2. **Configure MCP servers** (GitHub, Slack, Linear)
3. **Implement GitHubRepoManager** for PR automation
4. **Test end-to-end**: Issue → Feature Branch → Implementation → PR

### Phase 4: Agent Teams (Week 7-8)

1. **Enable experimental agent teams**
2. **Configure team lead sub-agent**
3. **Test multi-agent collaboration**
4. **Implement task delegation logic**

### Phase 5: Production (Week 9-10)

1. **Deploy to staging** with Docker Compose
2. **Enable monitoring** (OpenTelemetry + Prometheus)
3. **Load testing** with concurrent agents
4. **Security audit** (sandboxing, permissions)
5. **Launch** with limited users

***

## 16. Key Takeaways for RLMcoding

### What Makes Claude Code Ideal for Your Framework:

1. **Programmable via Agent SDK** - Full TypeScript/Python API
2. **Sub-agents for parallel work** - Each with 200K context
3. **Agent teams for complex projects** - Multi-session coordination
4. **Sandboxing for security** - Safe code execution
5. **GitHub Actions integration** - Automate PRs/reviews
6. **Hooks for automation** - Event-driven workflows
7. **MCP for external tools** - Connect to any API
8. **Skills for workflows** - Reusable processes
9. **Headless mode for CI/CD** - Run without UI
10. **Token cost management** - Track and optimize spend

### Integration Pattern:

```
GitHub Issue
    ↓
RLM Platform API (Next.js)
    ↓
Task Queue (Redis + Bull)
    ↓
Agent Orchestrator (Node.js)
    ↓
[Agent SDK] Spawn Claude Code Sub-Agent
    ↓
- Read codebase (skills: rlm-feature)
- Implement code (hooks: auto-format)
- Run tests (sandbox: isolated)
- Create PR (MCP: GitHub)
- Notify team (MCP: Slack)
    ↓
PR Review (GitHub Actions + Claude)
    ↓
Merge to Main
```


### Staying Within TOS:

✅ **Allowed**:

- Automate coding tasks via API
- Run multiple concurrent sessions
- Use sub-agents and agent teams
- Sandbox code execution
- GitHub Actions integration
- Headless/programmatic use

❌ **Prohibited**:

- Sharing API keys across organizations
- Exceeding rate limits (20K TPM for your tier)
- Using for prohibited use cases (see Anthropic AUP)

***

## 17. Next Steps

1. **Clone your RLMcoding repo** and review structure
2. **Install Claude Code** (`curl -fsSL https://claude.ai/install.sh | bash`)
3. **Create `.claude/` directory** with skills and settings
4. **Test Agent SDK** with a simple feature implementation
5. **Build AgentPoolManager** prototype
6. **Integrate with GitHub** for PR automation
7. **Scale with sub-agents** and agent teams

***

## 18. Resources

- **Documentation**: https://code.claude.com/docs
- **Agent SDK**: https://github.com/anthropics/claude-code-agent-sdk
- **GitHub Actions**: https://github.com/anthropics/claude-code-action
- **MCP Servers**: https://github.com/modelcontextprotocol/servers
- **Support**: https://support.anthropic.com

***

**This research provides a complete technical foundation for integrating Claude Code into your RLMcoding framework. The combination of sub-agents, agent teams, GitHub automation, and the Agent SDK creates a powerful agentic coding system that can scale to handle complex development workflows while staying within Claude Max subscription limits.**

