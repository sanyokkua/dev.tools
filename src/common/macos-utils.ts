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
export const MAC_OS_BREW_ADD_TO_PROFILE = `echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> /Users/ok/.zprofile`;
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
