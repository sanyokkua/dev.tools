/**
 * The official URL for Homebrew, a package manager for macOS.
 * This constant is used to reference the Homebrew website where users can find installation instructions and resources.
 */
export const MAC_OS_BREW_HOME_LINK = 'https://brew.sh/';
/**
 * The shell script command used to install Homebrew on macOS.
 * This command executes a bash script that downloads and runs the Homebrew installation process
 * from the official GitHub repository.
 */
export const MAC_OS_BREW_INSTALL_SCRIPT =
    '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"';
/**
 * A command string to create a `.zprofile` file in the user's home directory on macOS.
 * This is typically used to set up environment variables or aliases specific to the shell session.
 */
export const MAC_OS_CREATE_ZPROFILE = 'cd ~ && touch .zprofile';
/**
 * This constant represents a shell command that appends the Homebrew shell environment to the user's profile.
 * The command ensures that Homebrew is initialized in new shell sessions, making its binaries available in the PATH.
 */
export const MAC_OS_BREW_ADD_TO_PROFILE = `echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile`;
/**
 * A command to verify the installation of Homebrew on macOS systems.
 * This command runs `brew doctor`, which checks for potential issues in the Homebrew installation and environment.
 */
export const MAC_OS_BREW_VERIFY_INSTALLATION = 'brew doctor';
/**
 * Represents the command to update, upgrade, and clean up Homebrew packages on macOS.
 * This command ensures that all installed Homebrew formulas are up to date,
 * removes outdated versions of installed formulae, and cleans up cached downloads.
 */
export const MAC_OS_BREW_UPDATE_UPGRADE = ' brew update && brew upgrade && brew autoremove && brew cleanup\n';

/**
 * Sets an environment variable for the current Terminal session only via `export`.
 * Lost the moment the terminal window/tab closes; never seen by GUI apps.
 */
export const MAC_OS_ENV_EXPORT_EXAMPLE = `export MY_VAR="value"`;

/**
 * Persists JAVA_HOME (and PATH) for the current user by appending to `~/.zshrc`.
 * Reaches future Terminal sessions for this user, but not GUI apps launched from
 * Spotlight/Dock — those never read shell profile files.
 */
export const MAC_OS_ENV_JAVA_HOME =
    `echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 21)' >> ~/.zshrc\n` +
    `echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc`;

/**
 * Persists a directory on PATH for the current user via the shell profile.
 * Same terminal-only reach as MAC_OS_ENV_JAVA_HOME.
 */
export const MAC_OS_ENV_ADD_TO_PATH =
    `# Add a directory to PATH (replace /your/tool/bin)\n` +
    `echo 'export PATH="/your/tool/bin:$PATH"' >> ~/.zshrc\n` +
    `source ~/.zshrc`;

/**
 * Sets a variable directly in the launchd registry for the current login session —
 * every app launched afterward (Dock, Spotlight, a freshly-opened Terminal window)
 * inherits it immediately, with no plist and no logout required. Nothing is written
 * to disk, so this is lost on logout/restart/reboot; use the LaunchAgent below for
 * a value that needs to survive that.
 */
export const MAC_OS_ENV_LAUNCHCTL_SETENV_SESSION = `launchctl setenv OPENROUTER_API_KEY "sk-123456"`;

/**
 * A LaunchAgent plist that calls `launchctl setenv` at every login (`RunAtLoad`).
 * This is the de-facto community standard for reaching GUI apps on macOS — there is
 * no first-class Apple GUI for arbitrary environment variables, and shell profile
 * files are never read by `launchd`-spawned GUI apps.
 */
export const MAC_OS_ENV_LAUNCH_AGENT_PLIST = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>setenv.MYVAR</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/launchctl</string>
    <string>setenv</string>
    <string>MYVAR</string>
    <string>myvalue</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>`;

/**
 * Saves the plist to `~/Library/LaunchAgents/` and loads it immediately, so the
 * variable is available without a full logout/login.
 */
export const MAC_OS_ENV_LAUNCH_AGENT_LOAD =
    `mkdir -p ~/Library/LaunchAgents\n` +
    `# save the plist above as ~/Library/LaunchAgents/setenv.MYVAR.plist, then:\n` +
    `launchctl load ~/Library/LaunchAgents/setenv.MYVAR.plist`;

/**
 * Verifies a variable set via `launchctl setenv` is visible in the launchd domain.
 * Already-running apps (including Terminal) still won't see it — quit and relaunch
 * the target application to confirm.
 */
export const MAC_OS_ENV_LAUNCHCTL_GETENV = `launchctl getenv MYVAR`;

/**
 * PATH-only shortcut: each line in a file under `/etc/paths.d/` is one directory,
 * read by `path_helper` at login. Simpler than a LaunchAgent when only PATH needs
 * to change, but cannot carry arbitrary environment variables.
 */
export const MAC_OS_ENV_PATHS_D = `echo "/opt/myapp/bin" | sudo tee /etc/paths.d/myapp`;

/**
 * PATH-only, per-user, persists across reboots via the `launchd` user domain.
 * Requires a reboot to take effect and cannot be used for general variables.
 */
export const MAC_OS_ENV_LAUNCHCTL_CONFIG_PATH = `sudo launchctl config user path "/usr/local/bin:/opt/homebrew/bin:$PATH"`;
