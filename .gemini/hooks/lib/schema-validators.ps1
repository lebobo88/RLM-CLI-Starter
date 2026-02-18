# Schema Validators for RLM State Files
# Lightweight structural validation (not full JSON Schema)

function Test-CheckpointSchema {
    param([string]$JsonContent)

    try {
        $obj = $JsonContent | ConvertFrom-Json

        # Required: lastSession object
        if (-not $obj.PSObject.Properties['lastSession']) {
            return "Missing required field: lastSession"
        }

        $session = $obj.lastSession
        if (-not $session.PSObject.Properties['endedAt']) {
            return "Missing required field: lastSession.endedAt"
        }

        # Validate ISO 8601 date format
        $endedAt = $session.endedAt
        if ($endedAt -and -not ($endedAt -match '^\d{4}-\d{2}-\d{2}T')) {
            return "lastSession.endedAt is not ISO 8601 format: $endedAt"
        }

        # Optional: generations array (if present, must be array)
        if ($obj.PSObject.Properties['generations']) {
            if ($obj.generations -isnot [System.Array]) {
                return "generations must be an array"
            }
        }

        return $null  # Valid
    } catch {
        return "Invalid JSON: $_"
    }
}

function Test-PipelineStateSchema {
    param([string]$JsonContent)

    try {
        $obj = $JsonContent | ConvertFrom-Json

        # Required: current_phase
        if (-not $obj.PSObject.Properties['current_phase']) {
            return "Missing required field: current_phase"
        }

        $phase = $obj.current_phase
        if ($phase -is [int] -or $phase -is [double]) {
            if ($phase -lt 0 -or $phase -gt 9) {
                return "current_phase must be 0-9, got: $phase"
            }
        }

        # Optional: phases object
        if ($obj.PSObject.Properties['phases']) {
            if ($obj.phases -isnot [PSCustomObject]) {
                return "phases must be an object"
            }
        }

        return $null  # Valid
    } catch {
        return "Invalid JSON: $_"
    }
}

function Test-StatusSchema {
    param([string]$JsonContent)

    try {
        $obj = $JsonContent | ConvertFrom-Json

        # Required: status field
        if (-not $obj.PSObject.Properties['status']) {
            return "Missing required field: status"
        }

        # Optional: currentTask (if present, must match TASK-NNN)
        if ($obj.PSObject.Properties['currentTask']) {
            $task = $obj.currentTask
            if ($task -and -not ($task -match '^TASK-\d{3}')) {
                return "currentTask must match TASK-NNN format, got: $task"
            }
        }

        # Optional: tasks array
        if ($obj.PSObject.Properties['tasks']) {
            if ($obj.tasks -isnot [System.Array]) {
                return "tasks must be an array"
            }
        }

        # Optional: completedTasks array
        if ($obj.PSObject.Properties['completedTasks']) {
            if ($obj.completedTasks -isnot [System.Array]) {
                return "completedTasks must be an array"
            }
        }

        return $null  # Valid
    } catch {
        return "Invalid JSON: $_"
    }
}

# Dispatch validator by file path
function Get-SchemaValidator {
    param([string]$FilePath)

    $normalized = $FilePath -replace '\\', '/'

    if ($normalized -like "*/checkpoint.json") {
        return { param($json) Test-CheckpointSchema $json }
    }
    if ($normalized -like "*/pipeline-state.json") {
        return { param($json) Test-PipelineStateSchema $json }
    }
    if ($normalized -like "*/status.json") {
        return { param($json) Test-StatusSchema $json }
    }

    return $null
}
