# Agent Tracer Library
# Sub-agent trace logging for observability
# Dot-source this file to use: . $PSScriptRoot/lib/agent-tracer.ps1

function Start-AgentTrace {
    param(
        [string]$AgentId,
        [string]$SessionId = "",
        [string]$ProjectDir = "."
    )

    $logDir = Join-Path $ProjectDir "RLM" "progress" "logs" "agents"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    }

    $traceId = if ($env:RLM_TRACE_ID) { $env:RLM_TRACE_ID } else { "" }
    $parentTraceId = if ($env:RLM_PARENT_TRACE_ID) { $env:RLM_PARENT_TRACE_ID } else { "" }

    $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'

    # Store start time for duration calculation
    $startTimePath = Join-Path $logDir "$AgentId.start_time"
    (Get-Date).Ticks.ToString() | Set-Content -Path $startTimePath -NoNewline -ErrorAction SilentlyContinue

    $logEntry = @{
        timestamp = $now
        event = "agent.start"
        agentId = $AgentId
        sessionId = $SessionId
        trace_id = $traceId
        parent_trace_id = $parentTraceId
    } | ConvertTo-Json -Compress

    $logFile = Join-Path $logDir "$AgentId.jsonl"
    Add-Content -Path $logFile -Value $logEntry
}

function Stop-AgentTrace {
    param(
        [string]$AgentId,
        [string]$SessionId = "",
        [string]$ProjectDir = "."
    )

    $logDir = Join-Path $ProjectDir "RLM" "progress" "logs" "agents"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    }

    $traceId = if ($env:RLM_TRACE_ID) { $env:RLM_TRACE_ID } else { "" }
    $parentTraceId = if ($env:RLM_PARENT_TRACE_ID) { $env:RLM_PARENT_TRACE_ID } else { "" }

    # Calculate duration if start time is available
    $durationMs = $null
    $startTimePath = Join-Path $logDir "$AgentId.start_time"
    if (Test-Path $startTimePath) {
        try {
            $startTicks = [long](Get-Content $startTimePath -Raw -ErrorAction SilentlyContinue)
            $durationMs = [math]::Round(((Get-Date).Ticks - $startTicks) / 10000)
            Remove-Item $startTimePath -Force -ErrorAction SilentlyContinue
        } catch { }
    }

    $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
    $logEntry = @{
        timestamp = $now
        event = "agent.stop"
        agentId = $AgentId
        sessionId = $SessionId
        trace_id = $traceId
        parent_trace_id = $parentTraceId
    }
    if ($null -ne $durationMs) {
        $logEntry.duration_ms = $durationMs
    }
    $logEntry = $logEntry | ConvertTo-Json -Compress

    $logFile = Join-Path $logDir "$AgentId.jsonl"
    Add-Content -Path $logFile -Value $logEntry
}

function Add-AgentEvent {
    param(
        [string]$AgentId,
        [string]$EventType,
        [hashtable]$Data = @{},
        [string]$SessionId = "",
        [string]$ProjectDir = "."
    )

    $logDir = Join-Path $ProjectDir "RLM" "progress" "logs" "agents"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    }

    $traceId = if ($env:RLM_TRACE_ID) { $env:RLM_TRACE_ID } else { "" }

    $now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
    $logEntry = @{
        timestamp = $now
        event = $EventType
        agentId = $AgentId
        sessionId = $SessionId
        trace_id = $traceId
        data = $Data
    } | ConvertTo-Json -Compress

    $logFile = Join-Path $logDir "$AgentId.jsonl"
    Add-Content -Path $logFile -Value $logEntry
}
