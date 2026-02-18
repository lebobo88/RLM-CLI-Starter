# RLM Spinner Module (PowerShell)
# Animated spinner with rotating messages (roasts, tips, progress)

# Spinner frames (Braille characters)
$script:SpinnerFrames = @('⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧')
$script:CurrentFrame = 0
$script:CurrentMessageIndex = 0
$script:LastMessageRotation = Get-Date

# Message database
$script:Roasts = @(
    "🤡 Gemini's thinking so hard, the GPU's sweating...",
    "😴 Claude Code dozed off. Someone poke it.",
    "🐢 Codex running at 0.5x speed. Classic Microsoft.",
    "🔥 Gemini just hallucinated a framework. Impressive.",
    "💤 Claude's 'thinking'... or napping. Hard to tell.",
    "🎪 Codex suggested using jQuery. In 2026.",
    "🤖 Gemini: 'I know kung fu.' Us: 'No, you don't.'",
    "⏳ Claude Code's ETA: 'Soon™'. Very helpful.",
    "🧠 Codex forgot what we asked 3 prompts ago. Adorable.",
    "🎭 Gemini roleplaying as a competent AI again...",
    "🌪️  Gemini's context window just imploded. Oops.",
    "🎨 Claude Code: 'Let me refactor'... *breaks everything*",
    "🚀 Codex autocomplete: 90% boilerplate, 10% nonsense.",
    "🔮 Gemini predicting the future... incorrectly.",
    "🎯 Claude missed the point. Again. Shocking.",
    "📚 Codex citing Stack Overflow from 2012.",
    "🌈 Gemini: 'Trust me.' Narrator: They shouldn't.",
    "⚡ Claude Code peaked. In beta.",
    "🎪 Codex: Where bugs go to multiply.",
    "🤯 Gemini just invented a new anti-pattern.",
    "🐌 Claude's processing... at geological timescales.",
    "🎲 Codex rolling dice on this suggestion.",
    "🧪 Gemini experimenting... on YOUR code.",
    "🎬 Claude Code: All hype, no action.",
    "🔧 Codex: 'Works on my machine' — the AI edition.",
    "🌀 Gemini stuck in a thought loop. Classic.",
    "📉 Claude's confidence: 100%. Accuracy: 12%.",
    "🎨 Codex: Painting by numbers, badly.",
    "🔥 Gemini: Setting standards low and missing them.",
    "🎭 Claude Code: Method acting as a useful AI."
)

$script:Tips = @(
    "💡 TIP: Use @rlm-prime to preload feature context before implementing",
    "📚 TIP: Check RLM/specs/constitution.md for project standards",
    "🔍 TIP: @rlm-debug fixes orphaned tasks and state issues",
    "⚡ TIP: Set automation=AUTO for hands-free pipeline runs",
    "🎯 TIP: Phase 5 auto-generates wiring tasks for dependencies",
    "🧪 TIP: All implementation follows TDD: Red → Green → Refactor",
    "📊 TIP: Context > 75%? Use @rlm-resume to save and continue",
    "🚀 TIP: @rlm-implement-all runs all tasks in dependency order",
    "🔐 TIP: Pre-tool hooks block destructive rm -rf on RLM/ dirs",
    "📝 TIP: Task manifests must pass 5 hard gates before completion",
    "🎨 TIP: Phase 2 design system uses 8 component states",
    "🔗 TIP: Wiring tasks handle cross-module integration contracts",
    "📦 TIP: Constitution defines import order and code style",
    "🧵 TIP: Task dependencies are auto-resolved by @rlm-tasks",
    "🎯 TIP: Feature specs include acceptance criteria for verification",
    "🔬 TIP: Phase 7 quality gates require 80%+ test coverage",
    "📐 TIP: Functions must be < 50 lines (hard gate)",
    "🔒 TIP: Never commit incomplete markers (TODO, FIXME, HACK)",
    "🎪 TIP: @rlm-team orchestrates parallel agent execution",
    "📊 TIP: @rlm-report generates pipeline metrics and summaries",
    "🔍 TIP: @gemini-analyzer handles 1M+ token codebase audits",
    "⚙️  TIP: Hook libraries provide file-locking and atomic writes",
    "🎯 TIP: Phase 4 feature design only runs for UI projects",
    "🧪 TIP: Test files must be created BEFORE implementation (TDD Red)",
    "📚 TIP: PRD scoring determines if design phases activate",
    "🔗 TIP: Checkpoint system prevents task ID collisions",
    "🎨 TIP: Design tokens live in RLM/specs/design/tokens.json",
    "🚀 TIP: @rlm-fix-bug uses structured root-cause analysis",
    "📦 TIP: Barrel files (index.ts) are required for module exports",
    "🔐 TIP: Pipeline state stored in RLM/progress/pipeline-state.json"
)

$script:ProgressMessages = @(
    "📖 Reading specs from RLM/specs/features/...",
    "🧵 Tracing dependencies between tasks...",
    "✍️  Writing test file: src/__tests__/auth.test.ts...",
    "🔨 Implementing: src/components/Dashboard.tsx...",
    "🧪 Running test suite with 80%+ coverage target...",
    "📋 Updating RLM/progress/status.json...",
    "🎨 Generating design tokens from RLM/specs/design/...",
    "🔗 Creating wiring task for module integration...",
    "📦 Scaffolding project structure from PRD...",
    "🎯 Verifying acceptance criteria for FTR-007...",
    "🔍 Analyzing feature dependencies...",
    "📚 Loading constitution standards...",
    "🛠️  Configuring test framework (Vitest)...",
    "🧬 Extracting behavioral invariants...",
    "📝 Generating task manifest...",
    "🔐 Validating hard gates (5/5)...",
    "🎨 Applying design system tokens...",
    "🧪 Running TDD Red phase (write failing tests)...",
    "✅ Running TDD Green phase (make tests pass)...",
    "♻️  Running TDD Refactor phase (clean up code)...",
    "📊 Calculating test coverage...",
    "🔍 Running code quality checks...",
    "🎯 Executing E2E verification tests...",
    "📦 Building component library...",
    "🔗 Wiring module exports (barrel files)...",
    "🧵 Resolving import paths...",
    "📐 Checking function line counts (< 50 lines)...",
    "🔒 Scanning for incomplete markers...",
    "🎪 Spawning parallel test agents...",
    "📊 Aggregating pipeline metrics..."
)

function Get-RandomMessage {
    param(
        [double]$RoastWeight = 0.33,
        [double]$TipWeight = 0.33,
        [double]$ProgressWeight = 0.34
    )
    
    $rand = Get-Random -Minimum 0.0 -Maximum 1.0
    
    if ($rand -lt $RoastWeight) {
        return $script:Roasts | Get-Random
    }
    elseif ($rand -lt ($RoastWeight + $TipWeight)) {
        return $script:Tips | Get-Random
    }
    else {
        return $script:ProgressMessages | Get-Random
    }
}

function Get-NextFrame {
    $frame = $script:SpinnerFrames[$script:CurrentFrame]
    $script:CurrentFrame = ($script:CurrentFrame + 1) % $script:SpinnerFrames.Count
    return $frame
}

function Start-Spinner {
    param(
        [string]$InitialMessage = "Working...",
        [int]$FrameIntervalMs = 80,
        [int]$MessageIntervalMs = 3000
    )
    
    # Store spinner state in temp file
    $stateFile = Join-Path $env:TEMP "rlm-spinner-state.json"
    $state = @{
        active = $true
        message = $InitialMessage
        started_at = (Get-Date).ToString("o")
    }
    $state | ConvertTo-Json | Set-Content $stateFile
    
    # Return spinner handle
    return @{
        StateFile = $stateFile
        FrameInterval = $FrameIntervalMs
        MessageInterval = $MessageIntervalMs
    }
}

function Update-SpinnerMessage {
    param(
        [hashtable]$SpinnerHandle,
        [string]$NewMessage
    )
    
    if (-not $SpinnerHandle -or -not (Test-Path $SpinnerHandle.StateFile)) {
        return
    }
    
    $state = Get-Content $SpinnerHandle.StateFile -Raw | ConvertFrom-Json
    $state.message = $NewMessage
    $state | ConvertTo-Json | Set-Content $SpinnerHandle.StateFile
}

function Show-SpinnerFrame {
    param(
        [hashtable]$SpinnerHandle
    )
    
    if (-not $SpinnerHandle -or -not (Test-Path $SpinnerHandle.StateFile)) {
        return
    }
    
    $state = Get-Content $SpinnerHandle.StateFile -Raw | ConvertFrom-Json
    
    # Check if message should rotate
    $elapsed = ((Get-Date) - $script:LastMessageRotation).TotalMilliseconds
    if ($elapsed -gt $SpinnerHandle.MessageInterval) {
        $newMessage = Get-RandomMessage
        Update-SpinnerMessage -SpinnerHandle $SpinnerHandle -NewMessage $newMessage
        $script:LastMessageRotation = Get-Date
        $state.message = $newMessage
    }
    
    $frame = Get-NextFrame
    
    # Clear line and redraw
    Write-Host "`r`e[K" -NoNewline
    Write-Host "$frame $($state.message)" -NoNewline
}

function Stop-Spinner {
    param(
        [hashtable]$SpinnerHandle,
        [string]$FinalMessage = "",
        [bool]$Success = $true
    )
    
    if (-not $SpinnerHandle) {
        return
    }
    
    # Clear spinner line
    Write-Host "`r`e[K" -NoNewline
    
    if ($FinalMessage) {
        $icon = if ($Success) { "✅" } else { "❌" }
        Write-Host "$icon $FinalMessage"
    }
    
    # Clean up state file
    if (Test-Path $SpinnerHandle.StateFile) {
        Remove-Item $SpinnerHandle.StateFile -Force -ErrorAction SilentlyContinue
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Start-Spinner',
    'Update-SpinnerMessage',
    'Show-SpinnerFrame',
    'Stop-Spinner',
    'Get-RandomMessage'
)
