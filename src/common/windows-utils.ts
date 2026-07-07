export const WINDOWS_WINGET_VERIFY = `winget --version`;

export const WINDOWS_WINGET_UPGRADE_SELF = `winget upgrade Microsoft.AppInstaller`;

export const WINDOWS_WINGET_UPDATE_ALL = `winget upgrade --all`;

export const WINDOWS_CHOCO_INSTALL =
    `Set-ExecutionPolicy Bypass -Scope Process -Force; \`\n` +
    `[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; \`\n` +
    `iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))`;

export const WINDOWS_CHOCO_VERIFY = `choco --version`;

export const WINDOWS_CHOCO_UPDATE_ALL = `choco upgrade all -y`;

export const WINDOWS_SCOOP_INSTALL =
    `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser\n` +
    `Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression`;

export const WINDOWS_SCOOP_VERIFY = `scoop --version`;

export const WINDOWS_SCOOP_UPDATE_ALL = `scoop update *`;

// Session only — current PowerShell process, lost when the window closes. NOT the same as SetEnvironmentVariable.
export const WINDOWS_ENV_SESSION_ONLY = `$env:MY_VAR = "value"`;

export const WINDOWS_ENV_SET_VARIABLE = String.raw`[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-21", "User")`;

export const WINDOWS_ENV_ADD_TO_PATH =
    `$current = [Environment]::GetEnvironmentVariable("PATH", "User")\n` +
    String.raw`[Environment]::SetEnvironmentVariable("PATH", "$current;C:\MyTool\bin", "User")`;

export const WINDOWS_ENV_VIEW_VARIABLE = `[Environment]::GetEnvironmentVariable("JAVA_HOME", "User")`;

// $env: shows the merged process view — query the registry directly for the authoritative per-scope value.
export const WINDOWS_ENV_REG_QUERY =
    `Get-ItemProperty "HKCU:\\Environment"\n` +
    `[System.Environment]::GetEnvironmentVariable("MY_VAR","User")\n` +
    `Get-ItemProperty "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment"\n` +
    `[System.Environment]::GetEnvironmentVariable("MY_VAR","Machine")`;

export const WINDOWS_ENV_MACHINE_LEVEL =
    `# Requires admin — sets system-wide (all users)\n` +
    `[Environment]::SetEnvironmentVariable("MY_VAR", "value", "Machine")`;

// Avoid `setx` for PATH: it silently truncates at 1024 characters, merges system+user PATH, and can convert
// REG_EXPAND_SZ to REG_SZ (losing %SystemRoot%-style placeholders) — a documented, reported installer bug class.
export const WINDOWS_ENV_SAFE_PATH_APPEND_MACHINE =
    `# Run PowerShell as Administrator\n` +
    String.raw`$add = "C:\Tools"` +
    `\n$current = [System.Environment]::GetEnvironmentVariable("PATH","Machine")\n` +
    `$new = ($current.TrimEnd(';') + ';' + $add).Trim(';')\n` +
    `[System.Environment]::SetEnvironmentVariable("PATH",$new,"Machine")`;

// GUI shortcut — opens the System Properties environment-variable editor directly, without navigating sysdm.cpl.
export const WINDOWS_ENV_GUI_EDITOR = `rundll32.exe sysdm.cpl,EditEnvironmentVariables`;
