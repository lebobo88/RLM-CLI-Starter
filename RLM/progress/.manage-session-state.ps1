#!/usr/bin/env pwsh
# Session State Management Utility for RLM Pipeline
# This script provides functions to read, update, and manage session state

param(
    [ValidateSet('init', 'update', 'read', 'checkpoint', 'history')]
    [string]$Action = 'read',
    
    [string]$SessionId = '',
    [string]$PipelineId = '',
    [int]$Phase = 0,
    [string]$Agent = '',
    [string]$Event = '',
    [string]$Description = ''
)

$ErrorActionPreference = 'Stop'
$ProgressDir = $PSScriptRoot
$SessionStateFile = Join-Path $ProgressDir "session-state.json"
$CheckpointFile = Join-Path $ProgressDir "checkpoint.json"
$ContextFile = Join-Path $ProgressDir ".session-context.md"

function Get-Timestamp {
    return (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
}

function Read-SessionState {
    if (Test-Path $SessionStateFile) {
        return Get-Content $SessionStateFile -Raw | ConvertFrom-Json
    }
    return $null
}

function Write-SessionState {
    param($State)
    $State | ConvertTo-Json -Depth 10 | Set-Content $SessionStateFile -Encoding UTF8
}

function Initialize-SessionState {
    param(
        [string]$SessionId,
        [string]$PipelineId,
        [int]$Phase,
        [string]$AutomationLevel = 'auto'
    )
    
    $timestamp = Get-Timestamp
    
    $state = @{
        session_id = $SessionId
        pipeline_id = $PipelineId
        started_at = $timestamp
        last_activity = $timestamp
        status = 'active'
        current_phase = $Phase
        current_agent = 'rlm-orchestrator'
        automation_level = $AutomationLevel
        context = @{
            active_feature = $null
            active_task = $null
            last_checkpoint = $timestamp
            token_usage = 0
            token_threshold_50_warned = $false
            token_threshold_75_warned = $false
            token_threshold_90_warned = $false
        }
        history = @(
            @{
                timestamp = $timestamp
                event = 'session_started'
                phase = $Phase
                agent = 'rlm-orchestrator'
                description = 'Session initialized'
            }
        )
        metadata = @{
            workspace = $PWD.Path
            branch = (git rev-parse --abbrev-ref HEAD 2>$null) ?? 'unknown'
            last_commit = (git rev-parse --short HEAD 2>$null) ?? $null
        }
    }
    
    Write-SessionState $state
    Write-Host "✓ Session state initialized: $SessionId" -ForegroundColor Green
    return $state
}

function Update-SessionState {
    param(
        [string]$Event,
        [string]$Description,
        [int]$Phase = -1,
        [string]$Agent = '',
        [string]$ActiveFeature = '',
        [string]$ActiveTask = '',
        [int]$TokenUsage = -1
    )
    
    $state = Read-SessionState
    if (-not $state) {
        Write-Error "No active session state found. Initialize first."
        return
    }
    
    $timestamp = Get-Timestamp
    $state.last_activity = $timestamp
    
    # Update phase if provided
    if ($Phase -ge 0) {
        $state.current_phase = $Phase
    }
    
    # Update agent if provided
    if ($Agent) {
        $state.current_agent = $Agent
    }
    
    # Update context
    if ($ActiveFeature) {
        $state.context.active_feature = $ActiveFeature
    }
    if ($ActiveTask) {
        $state.context.active_task = $ActiveTask
    }
    if ($TokenUsage -ge 0) {
        $state.context.token_usage = $TokenUsage
    }
    
    # Add history entry
    if ($Event) {
        $historyEntry = @{
            timestamp = $timestamp
            event = $Event
            phase = $state.current_phase
            agent = $state.current_agent
            description = $Description
        }
        $state.history += $historyEntry
    }
    
    Write-SessionState $state
    Write-Host "✓ Session state updated: $Event" -ForegroundColor Green
    return $state
}

function Save-Checkpoint {
    $state = Read-SessionState
    if (-not $state) {
        Write-Error "No active session state found."
        return
    }
    
    $checkpoint = Get-Content $CheckpointFile -Raw | ConvertFrom-Json
    
    # Create a new lastSession object with all required properties
    $checkpoint.lastSession = @{
        sessionId = $state.session_id
        reason = 'checkpoint_save'
        startedAt = $state.started_at
        pipeline_id = $state.pipeline_id
        phase = $state.current_phase
        status = $state.status
        lastActivity = $state.last_activity
        endedAt = $null
    }
    
    # Update session in history
    $existingSessionIndex = -1
    for ($i = 0; $i -lt $checkpoint.sessions.Count; $i++) {
        if ($checkpoint.sessions[$i].sessionId -eq $state.session_id) {
            $existingSessionIndex = $i
            break
        }
    }
    
    $sessionEntry = @{
        sessionId = $state.session_id
        reason = 'checkpoint_save'
        startedAt = $state.started_at
        pipeline_id = $state.pipeline_id
        phase = $state.current_phase
        status = $state.status
        lastActivity = $state.last_activity
    }
    
    if ($existingSessionIndex -ge 0) {
        $checkpoint.sessions[$existingSessionIndex] = $sessionEntry
    } else {
        $sessions = @($checkpoint.sessions)
        $sessions += $sessionEntry
        $checkpoint.sessions = $sessions
    }
    
    $checkpoint | ConvertTo-Json -Depth 10 | Set-Content $CheckpointFile -Encoding UTF8
    
    # Update context timestamp
    $state.context.last_checkpoint = Get-Timestamp
    Write-SessionState $state
    
    Write-Host "✓ Checkpoint saved" -ForegroundColor Green
}

function Show-SessionHistory {
    $state = Read-SessionState
    if (-not $state) {
        Write-Error "No active session state found."
        return
    }
    
    Write-Host "`n=== Session History ===" -ForegroundColor Cyan
    Write-Host "Session: $($state.session_id)" -ForegroundColor Yellow
    Write-Host "Pipeline: $($state.pipeline_id)" -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($entry in $state.history) {
        $time = $entry.timestamp
        $event = $entry.event
        $desc = $entry.description
        Write-Host "[$time] $event" -ForegroundColor Green
        if ($desc) {
            Write-Host "  → $desc" -ForegroundColor Gray
        }
    }
    Write-Host ""
}

# Main execution
switch ($Action) {
    'init' {
        Initialize-SessionState -SessionId $SessionId -PipelineId $PipelineId -Phase $Phase
    }
    'update' {
        Update-SessionState -Event $Event -Description $Description -Agent $Agent -Phase $Phase
    }
    'read' {
        $state = Read-SessionState
        if ($state) {
            $state | ConvertTo-Json -Depth 10
        } else {
            Write-Error "No session state found"
        }
    }
    'checkpoint' {
        Save-Checkpoint
    }
    'history' {
        Show-SessionHistory
    }
}
