# Universal Event Sender for RLM Observability
# Dot-source: . "$PSScriptRoot/lib/event-sender.ps1"
# Single point of event emission for all hooks

function Send-RlmEvent {
    param(
        [Parameter(Mandatory)][string]$EventType,
        [hashtable]$Data = @{},
        [string]$SessionId = "",
        [string]$AgentId = "",
        [string]$ProjectDir = "."
    )

    $logDir = Join-Path $ProjectDir "RLM" "progress" "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    }

    $traceId = if ($env:RLM_TRACE_ID) { $env:RLM_TRACE_ID } else { "" }
    $parentTraceId = if ($env:RLM_PARENT_TRACE_ID) { $env:RLM_PARENT_TRACE_ID } else { "" }

    $event = @{
        timestamp = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
        event_type = $EventType
        session_id = $SessionId
        agent_id = $AgentId
        trace_id = $traceId
        parent_trace_id = $parentTraceId
        data = $Data
    } | ConvertTo-Json -Compress

    Add-Content -Path (Join-Path $logDir "events.jsonl") -Value $event
}
