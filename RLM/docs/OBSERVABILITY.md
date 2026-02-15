# Multi-Agent Observability

> Lightweight event collector and real-time broadcaster for monitoring parallel RLM agents.

## Architecture Overview

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Coder Agent │  │ Tester Agent │  │Reviewer Agent│
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       │    emit event   │    emit event   │    emit event
       ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────┐
│                  EventCollector                      │
│  ┌─────────────────────────────────────────────┐    │
│  │  In-Memory Store  │  SQLite Backend (opt.)  │    │
│  └─────────────────────────────────────────────┘    │
│  • addEvent()   • queryEvents()   • exportEvents()  │
│  • getSessionSummary()            • importEvents()   │
└─────────────────────┬───────────────────────────────┘
                      │
                      │ broadcast
                      ▼
┌─────────────────────────────────────────────────────┐
│                 EventBroadcaster                     │
│         WebSocket Server (port 3100)                 │
│  • subscribe(sessionId?, callback)                   │
│  • broadcast(event)                                  │
│  • getSubscriberCount()                              │
└─────────────────────┬───────────────────────────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
     Dashboard    CLI Monitor   Log File
```

**Data Flow**: Agents emit events via HTTP POST or direct API calls. The EventCollector stores events in memory (with optional SQLite persistence). The EventBroadcaster pushes events to WebSocket subscribers in real-time.

## Event Types and Schema

### Event Types

| Type | Description | Example Data |
|------|-------------|-------------|
| `tool-use` | Agent used a tool (Write, Read, Shell) | `{ tool, path, duration }` |
| `sub-agent-start` | Sub-agent was spawned | `{ taskId, agentRole }` |
| `sub-agent-complete` | Sub-agent finished work | `{ taskId, filesCreated, testsPassed }` |
| `error` | Error occurred during execution | `{ message, stack, severity }` |
| `stop` | Agent stopped (graceful or forced) | `{ reason, exitCode }` |

### Event Schema

```typescript
interface ObservabilityEvent {
  eventId: string;       // UUID v4
  sessionId: string;     // Session identifier
  agentId: string;       // Agent name (e.g., "coder", "tester")
  eventType: EventType;  // One of the types above
  timestamp: string;     // ISO 8601 datetime
  data: Record<string, any>;  // Arbitrary event payload
  summary?: string;      // Human-readable description
}
```

### Event Filter

```typescript
interface EventFilter {
  sessionId?: string;   // Filter to specific session
  agentId?: string;     // Filter to specific agent
  eventType?: EventType; // Filter to event type
  since?: string;       // ISO 8601 timestamp lower bound
}
```

### Session Summary

```typescript
interface SessionSummary {
  sessionId: string;
  totalEvents: number;
  eventsByType: Record<string, number>;
  agentIds: string[];
  firstEvent: string;   // ISO timestamp
  lastEvent: string;    // ISO timestamp
  durationMs: number;
  errorCount: number;
}
```

## Setup Instructions

### 1. Install the Package

```bash
cd packages/observability
npm install
npm run build
```

### 2. Basic Usage (In-Memory)

```typescript
import { EventCollector, EventBroadcaster } from '@rlm/observability';

// Create collector (in-memory only)
const collector = new EventCollector();

// Create broadcaster with auto-start WebSocket server
const broadcaster = new EventBroadcaster({ port: 3100, autoStart: true });

// Add an event
collector.add({
  eventId: crypto.randomUUID(),
  sessionId: 'session-001',
  agentId: 'coder',
  eventType: 'tool-use',
  timestamp: new Date().toISOString(),
  data: { tool: 'Write', path: 'src/Login.tsx' },
  summary: 'Created login component',
});

// Broadcast to all subscribers
broadcaster.broadcast(event);

// Query events
const errors = collector.query({ eventType: 'error' });
const summary = collector.getSessionSummary('session-001');
```

### 3. With SQLite Persistence

```typescript
const collector = new EventCollector({
  sqlitePath: './observability.db',
  maxEvents: 10000,  // Keep last 10k events in memory
});
```

### 4. With Event Limit

```typescript
// Only retain last 5000 events in memory (FIFO eviction)
const collector = new EventCollector({ maxEvents: 5000 });
```

## Hook Integration for Copilot CLI

### Active Hook Wiring

The following observability events are wired into `.github/hooks/`:

| Hook | Matcher | Event Type | Description |
|------|---------|------------|-------------|
| PostToolUse | `Task` | `sub-agent-complete` | Emitted when a sub-agent Task tool completes |
| PostToolUse | `Edit` | `tool-use` | Emitted when the Edit tool modifies a file |
| PostToolUse | `Write` | `tool-use` | Emitted when the Write tool creates/overwrites a file |
| Stop | `.*` | `stop` | Emitted when the session ends |

All events route through `emit-observability-event.ps1` which POSTs to the collector (if running) or saves to `RLM/progress/observability-events/` as local fallback. Errors are logged to `RLM/progress/logs/observability-errors.log`.

### Adding Custom Events

To add observability to additional hooks in `.github/hooks/`:

```json
{
  "PostToolUse": [{
    "matcher": "Write|Edit",
    "hooks": [{
      "command": "powershell -ExecutionPolicy Bypass -File RLM/scripts/emit-observability-event.ps1 -EventType 'tool-use' -AgentId 'coder' -Data '{\"tool\":\"$TOOL_NAME\"}'",
      "timeout": 5000
    }]
  }],
  "SubAgentStart": [{
    "hooks": [{
      "command": "powershell -ExecutionPolicy Bypass -File RLM/scripts/emit-observability-event.ps1 -EventType 'sub-agent-start' -AgentId '$AGENT_ID' -Data '{\"taskId\":\"$TASK_ID\"}'",
      "timeout": 5000
    }]
  }]
}
```

### PowerShell Script Usage

```powershell
# Emit a tool-use event
.\emit-observability-event.ps1 `
  -EventType "tool-use" `
  -AgentId "coder" `
  -Data '{"tool":"Write","path":"src/Login.tsx"}'

# Emit a sub-agent start with summary
.\emit-observability-event.ps1 `
  -EventType "sub-agent-start" `
  -AgentId "tester" `
  -Summary "TestWriter spawned for TASK-045" `
  -Data '{"taskId":"TASK-045"}'

# Emit an error event
.\emit-observability-event.ps1 `
  -EventType "error" `
  -AgentId "coder" `
  -Summary "Build failed" `
  -Data '{"exitCode":1,"stderr":"Type error in Login.tsx"}'
```

### Fallback Behavior

When the collector is unreachable, the PowerShell script saves events locally to `RLM/progress/observability-events/` as individual JSON files. These can be bulk-imported later:

```typescript
import * as fs from 'fs';
import * as path from 'path';

const eventsDir = 'RLM/progress/observability-events';
const files = fs.readdirSync(eventsDir).filter(f => f.endsWith('.json'));
const events = files.map(f =>
  JSON.parse(fs.readFileSync(path.join(eventsDir, f), 'utf-8'))
);

collector.importEvents(events);
```

## API Reference

### EventCollector

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `add(event)` | `ObservabilityEvent` | `void` | Store a validated event |
| `query(filter)` | `EventFilter` | `ObservabilityEvent[]` | Query events matching filter |
| `getSessionSummary(id)` | `string` | `SessionSummary \| null` | Get session statistics |
| `exportEvents()` | — | `ObservabilityEvent[]` | Export all events as array |
| `importEvents(events)` | `ObservabilityEvent[]` | `number` | Import events (deduped), returns count added |
| `count()` | — | `number` | Total stored events |
| `clear()` | — | `void` | Remove all events |
| `close()` | — | `void` | Close SQLite connection |

**Constructor Options:**

```typescript
interface EventCollectorOptions {
  maxEvents?: number;   // 0 = unlimited (default)
  sqlitePath?: string;  // Path for SQLite persistence (optional)
}
```

### EventBroadcaster

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `startServer()` | — | `void` | Start WebSocket server |
| `stopServer()` | — | `Promise<void>` | Stop server, disconnect clients |
| `subscribe(sessionId?, cb?)` | `string?, Function?` | `string` | Register local subscriber, returns ID |
| `unsubscribe(id)` | `string` | `boolean` | Remove subscriber |
| `broadcast(event)` | `ObservabilityEvent` | `void` | Send event to matching subscribers |
| `getSubscriberCount()` | — | `number` | Active subscriber count |
| `getSubscriberSummary()` | — | `Record<string, number>` | Subscribers grouped by session |

**Constructor Options:**

```typescript
interface EventBroadcasterOptions {
  port?: number;       // WebSocket port (default: 3100)
  autoStart?: boolean; // Start server immediately (default: false)
}
```

### WebSocket Protocol

**Client -> Server:**

```json
{ "type": "subscribe", "sessionId": "session-001" }
```

**Server -> Client (on connect):**

```json
{ "type": "connected", "subscriberId": "sub-123", "message": "RLM Observability stream connected" }
```

**Server -> Client (on event):**

```json
{ "type": "event", "event": { "eventId": "...", "sessionId": "...", ... } }
```

## Export and Import

### Export to JSON File

```typescript
const events = collector.exportEvents();
fs.writeFileSync(
  'RLM/progress/observability-export.json',
  JSON.stringify(events, null, 2)
);
```

### Import from JSON File

```typescript
const raw = fs.readFileSync('RLM/progress/observability-export.json', 'utf-8');
const events = JSON.parse(raw);
const added = collector.importEvents(events);
console.log(`Imported ${added} new events (duplicates skipped)`);
```

## Integration with RLM Pipeline

The observability system integrates with key RLM workflow stages:

| Phase | Events Emitted |
|-------|---------------|
| `@rlm-implement` | `sub-agent-start`, `tool-use`, `sub-agent-complete` |
| `@rlm-quality` | `sub-agent-start`, `tool-use`, `sub-agent-complete` |
| `@rlm-verify` | `sub-agent-start`, `error` (on failure), `sub-agent-complete` |
| Smart routing | `tool-use` (routing decision), `sub-agent-start` (delegation) |
| Health monitoring | `error` (stale tasks), `stop` (hung agents) |

## Troubleshooting

| Issue | Solution |
|-------|---------|
| Collector unreachable | Events saved to `RLM/progress/observability-events/` as fallback |
| WebSocket disconnects | Clients auto-reconnect; broadcaster cleans up stale connections |
| SQLite lock contention | Use in-memory mode for high-throughput; SQLite for persistence |
| Memory usage grows | Set `maxEvents` to cap in-memory storage with FIFO eviction |

## Future Enhancements (Planned)

The following enhancements are documented in the foundational research but not yet implemented:

### Intelligence Layer (Haiku-Based Event Summarization)

**Source**: `start/research/Multi-Agent Observability Architecture.md`

A lightweight model (e.g., Claude Haiku) would pre-process observability events before broadcasting to reduce cognitive load on human observers:

- **Event Summarization**: Condense raw events into human-readable summaries at the edge (in agent hooks)
- **Anomaly Detection**: Identify unusual patterns (e.g., agent stuck in loop, unexpected tool failures, cost spikes)
- **Trend Reporting**: Aggregate metrics across sessions (tokens/task, success rates, cost trends)
- **Alert Generation**: Surface critical issues proactively rather than requiring manual monitoring

**Implementation Approach**: Add a summarization step in the EventCollector that calls a fast model before persisting/broadcasting events. This would add ~50ms latency per event but significantly improve the signal-to-noise ratio of the event stream.

### Real-Time Dashboard

A Vue.js or React frontend that connects to the WebSocket broadcaster for live monitoring:

- Activity Pulse Feed (real-time event stream)
- Agent status cards (active, idle, errored)
- Cost accumulation graph
- Task DAG visualization with live status updates

**Status**: Infrastructure ready (EventBroadcaster with WebSocket on port 3100), frontend not yet implemented.
