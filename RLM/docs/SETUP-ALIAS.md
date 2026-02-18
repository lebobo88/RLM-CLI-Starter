# RLM Alias Setup Guide

This guide shows you how to set up the `rlm` shell alias for instant orchestrator access.

## What is the `rlm` Alias?

The `rlm` alias is a shell shortcut that launches the RLM Orchestrator agent directly, bypassing the `/agents` menu:

```bash
rlm  # Instead of: copilot --agent rlm-orchestrator
```

This is the **fastest way** to start working with the RLM pipeline.

## Three Ways to Start the Orchestrator

| Method | Command | Speed | Notes |
|--------|---------|-------|-------|
| **⭐ Shell Alias** | `rlm` | Fastest | Requires one-time setup (this guide) |
| **🔧 CLI Flag** | `copilot --agent rlm-orchestrator` | Fast | Works immediately, no setup |
| **🖱️ Interactive Menu** | `copilot` → `/agents` → `rlm-orchestrator` | Slowest | Good for exploration |

---

## Installation

Choose your shell below and follow the installation steps.

### PowerShell (Windows)

1. **Run the installer:**
   ```powershell
   .github\hooks\scripts\setup-rlm-alias.ps1
   ```

2. **Restart PowerShell** (or reload profile):
   ```powershell
   . $PROFILE
   ```

3. **Test it:**
   ```powershell
   rlm
   ```

**What it does:**
- Adds a `rlm` function to your PowerShell profile (`~\Documents\PowerShell\profile.ps1`)
- Backs up your existing profile before modification
- The function navigates to your RLM project directory and launches the orchestrator

### Bash / Zsh (Linux / macOS)

1. **Run the installer:**
   ```bash
   bash .github/hooks/scripts/setup-rlm-alias.sh
   ```

2. **Reload your shell config:**
   ```bash
   # For Bash:
   source ~/.bashrc
   
   # For Zsh:
   source ~/.zshrc
   ```

3. **Test it:**
   ```bash
   rlm
   ```

**What it does:**
- Adds an `alias rlm='...'` to your shell config file (`~/.bashrc` or `~/.zshrc`)
- Backs up your existing config before modification
- The alias navigates to your RLM project directory and launches the orchestrator

### Fish Shell

1. **Run the installer:**
   ```fish
   fish .github/hooks/scripts/setup-rlm-alias.fish
   ```

2. **Reload your Fish config:**
   ```fish
   source ~/.config/fish/config.fish
   ```

3. **Test it:**
   ```fish
   rlm
   ```

**What it does:**
- Adds an `alias rlm='...'` to your Fish config (`~/.config/fish/config.fish`)
- Backs up your existing config before modification
- The alias navigates to your RLM project directory and launches the orchestrator

---

## Manual Installation (Alternative)

If you prefer to manually add the alias, edit your shell config file:

### PowerShell

Add to `~\Documents\PowerShell\profile.ps1`:

```powershell
# RLM Method - Quick launch orchestrator
function rlm {
    Set-Location "H:\RLM_CLI_Starter"  # Replace with your project path
    copilot --agent rlm-orchestrator
}
```

### Bash / Zsh

Add to `~/.bashrc` or `~/.zshrc`:

```bash
# RLM Method - Quick launch orchestrator
alias rlm='cd /path/to/RLM_CLI_Starter && copilot --agent rlm-orchestrator'
```

### Fish

Add to `~/.config/fish/config.fish`:

```fish
# RLM Method - Quick launch orchestrator
alias rlm='cd /path/to/RLM_CLI_Starter && copilot --agent rlm-orchestrator'
```

---

## Uninstalling

To remove the `rlm` alias:

### PowerShell

```powershell
.github\hooks\scripts\uninstall-rlm-alias.ps1
```

### Bash / Zsh / Fish

Manually edit your config file and remove the `# RLM Method` section and the `alias rlm=` line.

---

## How It Works

The `rlm` alias performs two actions:

1. **Navigates to your RLM project directory** — Ensures the orchestrator has access to `RLM/specs/`, `RLM/tasks/`, etc.
2. **Launches the orchestrator agent** — Uses the `--agent` CLI flag to skip the `/agents` menu

### Under the Hood

```bash
# What happens when you type: rlm
cd /path/to/RLM_CLI_Starter  # Step 1: Navigate to project
copilot --agent rlm-orchestrator  # Step 2: Launch agent
```

This is equivalent to:

```bash
copilot  # Start Copilot CLI
/agents  # Open agents menu
# Select: rlm-orchestrator
```

But **much faster**! ⚡

---

## Troubleshooting

### Alias not found

**Problem:** `rlm: command not found` or `rlm is not recognized`

**Solution:**
1. Make sure you reloaded your shell config:
   - PowerShell: `. $PROFILE`
   - Bash/Zsh: `source ~/.bashrc` or `source ~/.zshrc`
   - Fish: `source ~/.config/fish/config.fish`
2. Or restart your terminal

### Wrong directory

**Problem:** `rlm` launches but can't find RLM artifacts

**Solution:**
1. Re-run the installer from your RLM project root directory
2. The installer embeds the current directory path in the alias
3. If you move your project, re-run the installer

### Permission denied (Bash/Zsh/Fish)

**Problem:** `Permission denied: .github/hooks/scripts/setup-rlm-alias.sh`

**Solution:**
```bash
chmod +x .github/hooks/scripts/setup-rlm-alias.sh
bash .github/hooks/scripts/setup-rlm-alias.sh
```

---

## Advanced: Multiple Projects

If you work with multiple RLM projects, you can create project-specific aliases:

### PowerShell

```powershell
function rlm-project1 {
    Set-Location "C:\Projects\project1"
    copilot --agent rlm-orchestrator
}

function rlm-project2 {
    Set-Location "C:\Projects\project2"
    copilot --agent rlm-orchestrator
}
```

### Bash / Zsh / Fish

```bash
alias rlm-project1='cd /path/to/project1 && copilot --agent rlm-orchestrator'
alias rlm-project2='cd /path/to/project2 && copilot --agent rlm-orchestrator'
```

---

## See Also

- **[README.md](../../README.md)** — Main project documentation
- **[RLM/START-HERE.md](../../RLM/START-HERE.md)** — RLM pipeline guide
- **[AGENTS.md](../../AGENTS.md)** — All available agents

---

**Next Steps:**
1. Install the alias for your shell
2. Type `rlm` to launch the orchestrator
3. Start building! 🚀
