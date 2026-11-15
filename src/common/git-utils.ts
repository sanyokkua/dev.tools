import { Command, OSType } from '@/common/types';

export const GIT_INSTALL_MACOS = 'brew install git';
export const GIT_INSTALL_LINUX = 'sudo apt update && sudo apt install -y git';
export const GIT_INSTALL_WINDOWS = 'winget install -e --id Git.Git';
export const GIT_INSTALL: Record<OSType, string> = {
    macos: GIT_INSTALL_MACOS,
    linux: GIT_INSTALL_LINUX,
    windows: GIT_INSTALL_WINDOWS,
};
export const GIT_VERIFY_INSTALL = 'git --version';

export const GIT_CONFIG_GLOBAL_USER_NAME = 'git config --global user.name';
export const GIT_CONFIG_GLOBAL_USER_EMAIL = 'git config --global user.email';
export const GIT_CONFIG_GLOBAL_VERIFY = 'git config --global --list';

export const GIT_CONFIG_USER_NAME = 'git config user.name';
export const GIT_CONFIG_USER_EMAIL = 'git config user.email';
export const GIT_CONFIG_VERIFY = 'git config --list';

export const SSH_KEY_GENERATE = 'ssh-keygen -t ed25519 -C';
export const SSH_KEY_ADD_AGENT_MACOS = 'eval "$(ssh-agent -s)" && ssh-add --apple-use-keychain ~/.ssh/id_ed25519';
export const SSH_KEY_ADD_AGENT_LINUX = 'eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519';
export const SSH_KEY_ADD_AGENT_WINDOWS =
    'Get-Service ssh-agent | Set-Service -StartupType Automatic; Start-Service ssh-agent; ssh-add $env:USERPROFILE\\.ssh\\id_ed25519';
export const SSH_KEY_ADD_AGENT: Record<OSType, string> = {
    macos: SSH_KEY_ADD_AGENT_MACOS,
    linux: SSH_KEY_ADD_AGENT_LINUX,
    windows: SSH_KEY_ADD_AGENT_WINDOWS,
};
export const SSH_CONFIG_MACOS_BLOCK = `Host github.com
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_ed25519`;
export const SSH_CONFIG_MACOS_APPEND =
    "mkdir -p ~/.ssh && { grep -qxF 'Host github.com' ~/.ssh/config 2>/dev/null || printf 'Host github.com\\n  AddKeysToAgent yes\\n  UseKeychain yes\\n  IdentityFile ~/.ssh/id_ed25519\\n' >> ~/.ssh/config; }";
export const SSH_KEY_COPY_PUBLIC_KEY_MACOS = 'cat ~/.ssh/id_ed25519.pub | pbcopy';
export const SSH_KEY_COPY_PUBLIC_KEY_LINUX = 'cat ~/.ssh/id_ed25519.pub | xclip -selection clipboard';
export const SSH_KEY_COPY_PUBLIC_KEY_WINDOWS = 'Get-Content ~/.ssh/id_ed25519.pub | Set-Clipboard';
export const SSH_KEY_COPY_PUBLIC_KEY_LINUX_WAYLAND = 'cat ~/.ssh/id_ed25519.pub | wl-copy';
export const INSTALL_XCLIP = 'sudo apt update && sudo apt install -y xclip';
export const INSTALL_WL_CLIPBOARD = 'sudo apt update && sudo apt install -y wl-clipboard';
const SSH_KEY_COPY: Record<OSType, string> = {
    macos: SSH_KEY_COPY_PUBLIC_KEY_MACOS,
    linux: SSH_KEY_COPY_PUBLIC_KEY_LINUX,
    windows: SSH_KEY_COPY_PUBLIC_KEY_WINDOWS,
};

export const SSH_KEY_TEST = 'ssh -T git@github.com';
export const GPG_INSTALL_MACOS = 'brew install gnupg';
export const GPG_INSTALL_LINUX = 'sudo apt install -y gnupg';
export const GPG_INSTALL_WINDOWS = 'winget install -e --id GnuPG.Gpg4win';
export const GPG_INSTALL: Record<OSType, string> = {
    macos: GPG_INSTALL_MACOS,
    linux: GPG_INSTALL_LINUX,
    windows: GPG_INSTALL_WINDOWS,
};
export const GPG_VERIFY_INSTALL = 'gpg --version';
export const GPG_GENERATE_KEY = 'gpg --full-generate-key';
export const GPG_GET_KEY_ID = 'gpg --list-secret-keys --keyid-format=long';

export const GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ADD_KEY = 'git config --global user.signingkey YOUR_KEY_ID';
export const GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ENABLE_COMMIT_SIGNING = 'git config --global commit.gpgsign true';
export const GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ENABLE_TAG_SIGNING = 'git config --global tag.gpgSign true';

export const GPG_CONFIGURE_GIT_SIGNING_ADD_KEY = 'git config user.signingkey YOUR_KEY_ID';
export const GPG_CONFIGURE_GIT_SIGNING_ENABLE_COMMIT_SIGNING = 'git config commit.gpgsign true';
export const GPG_CONFIGURE_GIT_SIGNING_ENABLE_TAG_SIGNING = 'git config tag.gpgSign true';
export const GPG_PINENTRY_INSTALL = 'brew install pinentry-mac';
export const GPG_PINENTRY_SETUP_MKDIR_GNUPG = 'mkdir -p ~/.gnupg && chmod 700 ~/.gnupg';
export const GPG_PINENTRY_SETUP_ADD_AGENT_RECORD =
    'grep -qxF "pinentry-program $(brew --prefix)/bin/pinentry-mac" ~/.gnupg/gpg-agent.conf 2>/dev/null || echo "pinentry-program $(brew --prefix)/bin/pinentry-mac" >> ~/.gnupg/gpg-agent.conf';
export const GPG_PINENTRY_SETUP_ADD_AGENT_TO_CONFIG =
    "grep -qxF 'use-agent' ~/.gnupg/gpg.conf 2>/dev/null || echo 'use-agent' >> ~/.gnupg/gpg.conf";
export const GPG_PINENTRY_RELOAD_AGENT = 'gpgconf --kill gpg-agent';
export const GPG_PINENTRY_ADD_EXPORT_TO_PROFILE = 'export GPG_TTY=$(tty)';
// Non-destructive signing test: prints a clearsigned message and leaves no commit behind.
export const GPG_TEST = 'echo "test" | gpg --clearsign';

export const GIT_CONFIG_GLOBAL_DEFAULT_BRANCH = 'git config --global init.defaultBranch main';
// `false` keeps git's default merge behavior and silences the "divergent branches" warning.
export const GIT_CONFIG_GLOBAL_PULL_REBASE = 'git config --global pull.rebase false';

export const GH_INSTALL_MACOS = 'brew install gh';
export const GH_INSTALL_WINDOWS = 'winget install --id GitHub.cli --source winget';
export const GH_INSTALL_DEBIAN = `(type -p wget >/dev/null || (sudo apt update && sudo apt install wget -y)) \\
    && sudo mkdir -p -m 755 /etc/apt/keyrings \\
    && out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \\
    && cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \\
    && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \\
    && sudo mkdir -p -m 755 /etc/apt/sources.list.d \\
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \\
    && sudo apt update \\
    && sudo apt install gh -y`;
export const GH_INSTALL_FEDORA =
    'sudo dnf install dnf5-plugins && sudo dnf config-manager addrepo --from-repofile=https://cli.github.com/packages/rpm/gh-cli.repo && sudo dnf install gh';
export const GH_INSTALL: Record<OSType, string> = {
    macos: GH_INSTALL_MACOS,
    linux: GH_INSTALL_DEBIAN,
    windows: GH_INSTALL_WINDOWS,
};
export const GH_AUTH_LOGIN = 'gh auth login';
export const GH_AUTH_SETUP_GIT = 'gh auth setup-git';

export const GH_SETUP: Command[] = [
    { description: 'Sign in to GitHub', command: GH_AUTH_LOGIN },
    { description: 'Use gh as the git credential helper for HTTPS', command: GH_AUTH_SETUP_GIT },
    { description: 'Check authentication status', command: 'gh auth status' },
    { description: 'Prefer SSH for git operations', command: 'gh config set git_protocol ssh' },
    { description: 'Use VS Code as the editor', command: 'gh config set editor "code --wait"' },
];

export const GH_USAGE: Command[] = [
    { description: 'Clone a repository', command: 'gh repo clone OWNER/REPO' },
    {
        description: 'Create a repository from the current folder',
        command: 'gh repo create my-repo --private --source=. --push',
    },
    { description: 'Fork a repository', command: 'gh repo fork OWNER/REPO --clone' },
    { description: 'Create a pull request', command: 'gh pr create --fill' },
    { description: 'List pull requests', command: 'gh pr list' },
    { description: 'Check out a pull request', command: 'gh pr checkout 123' },
    { description: 'View a pull request in the terminal', command: 'gh pr view 123' },
    { description: 'Review a pull request', command: 'gh pr review 123 --approve' },
    { description: 'Merge a pull request', command: 'gh pr merge 123 --squash --delete-branch' },
    { description: 'Create an issue', command: 'gh issue create --title "Title" --body "Details"' },
    { description: 'List issues', command: 'gh issue list' },
    { description: 'List workflow runs', command: 'gh run list' },
    { description: 'Watch a workflow run', command: 'gh run watch' },
    { description: 'Create a release', command: 'gh release create v1.0.0 --generate-notes' },
    { description: 'Call the GitHub API', command: 'gh api repos/OWNER/REPO' },
    { description: 'Open the repository in the browser', command: 'gh browse' },
    { description: 'Install a gh extension', command: 'gh extension install OWNER/gh-EXTENSION' },
];

/** PowerShell 5.1 has no `&&`, so Windows commands are joined with `;`. */
export function joinCommands(commands: Command[], os: OSType): string {
    return commands.map((cmd) => cmd.command).join(os === 'windows' ? '; ' : ' && ');
}

/**
 * Creates a git command object with description and command string.
 * @param description - Brief explanation of the git command's purpose
 * @param command - The actual git command to be executed
 */
function generateCommand(description: string, command: string): Command {
    return { description, command };
}

/**
 * Generates a sequence of Git configuration and setup commands based on the provided user information.
 * @param name - The user's full name for Git configuration
 * @param email - The user's email address used in Git identity settings
 * @param globalConfig - Flag indicating whether to configure Git settings globally or per-repository
 * @param os - Operating system type for OS-specific commands
 * @param includeGh - Append GitHub CLI install and authentication commands
 * @returns Array of Git-related command objects with instructions and execution details
 */
export function generateGitCommands(
    name: string,
    email: string,
    globalConfig: boolean,
    os: OSType,
    includeGh = false,
): Command[] {
    const commands: Command[] = [];

    commands.push(generateCommand('Install Git', GIT_INSTALL[os]), generateCommand('Verify Git', GIT_VERIFY_INSTALL));

    if (globalConfig) {
        commands.push(
            generateCommand('Configure Git Global User Name', `${GIT_CONFIG_GLOBAL_USER_NAME} "${name}"`),
            generateCommand('Configure Git Global User Email', `${GIT_CONFIG_GLOBAL_USER_EMAIL} "${email}"`),
            generateCommand('Set default branch name to main', GIT_CONFIG_GLOBAL_DEFAULT_BRANCH),
            generateCommand('Use merge (not rebase) on git pull', GIT_CONFIG_GLOBAL_PULL_REBASE),
            generateCommand('Verify Git Global Config', GIT_CONFIG_GLOBAL_VERIFY),
        );
    } else {
        commands.push(
            generateCommand('Configure Git User Name', `${GIT_CONFIG_USER_NAME} "${name}"`),
            generateCommand('Configure Git User Email', `${GIT_CONFIG_USER_EMAIL} "${email}"`),
            generateCommand('Verify Git Config', GIT_CONFIG_VERIFY),
        );
    }

    commands.push(
        generateCommand('Generate SSH Key', `${SSH_KEY_GENERATE} "${email}"`),
        generateCommand('Add SSH Key to SSH Agent', SSH_KEY_ADD_AGENT[os]),
    );
    if (os === 'macos') {
        commands.push(
            generateCommand('Persist the key in the macOS keychain (~/.ssh/config)', SSH_CONFIG_MACOS_APPEND),
        );
    }
    if (os === 'linux') {
        commands.push(generateCommand('Install xclip for copy from terminal', INSTALL_XCLIP));
    }
    commands.push(
        generateCommand('Copy SSH Public Key', SSH_KEY_COPY[os]),
        generateCommand('Test SSH Connection', SSH_KEY_TEST),
        generateCommand('Install GPG', GPG_INSTALL[os]),
        generateCommand('Verify GPG', GPG_VERIFY_INSTALL),
        generateCommand('Generate GPG Key', GPG_GENERATE_KEY),
        generateCommand('Get GPG Key ID (sec   algorithm/YOUR_KEY_ID YYYY-MM-DD [SC]\n)', GPG_GET_KEY_ID),
    );

    if (globalConfig) {
        commands.push(
            generateCommand(
                'Configure Git Global Signing (replace YOUR_KEY_ID with the key ID from the previous command)',
                GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ADD_KEY,
            ),
            generateCommand(
                'Configure Git Global Commit Signing',
                GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ENABLE_COMMIT_SIGNING,
            ),
            generateCommand('Configure Git Global Tag Signing', GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ENABLE_TAG_SIGNING),
        );
    } else {
        commands.push(
            generateCommand(
                'Configure Git Signing (replace YOUR_KEY_ID with the key ID from the previous command)',
                GPG_CONFIGURE_GIT_SIGNING_ADD_KEY,
            ),
            generateCommand('Configure Git Commit Signing', GPG_CONFIGURE_GIT_SIGNING_ENABLE_COMMIT_SIGNING),
            generateCommand('Configure Git Tag Signing', GPG_CONFIGURE_GIT_SIGNING_ENABLE_TAG_SIGNING),
        );
    }
    if (os === 'macos') {
        commands.push(
            generateCommand('To enable visual pass prompts for GPG signing, install pinentry', GPG_PINENTRY_INSTALL),
            generateCommand("Create GPG config folder (if it doesn't exist)", GPG_PINENTRY_SETUP_MKDIR_GNUPG),
            generateCommand(
                'Add pinentry to gpg-agent config (if entry not present)',
                GPG_PINENTRY_SETUP_ADD_AGENT_RECORD,
            ),
            generateCommand("Add 'use-agent' to GPG config (if missing)", GPG_PINENTRY_SETUP_ADD_AGENT_TO_CONFIG),
            generateCommand('Restart gpg-agent to apply the config', GPG_PINENTRY_RELOAD_AGENT),
            generateCommand(
                'Add environment variable export to shell profile (~/.zprofile or ~/.bashrc or ~/.zshrc)',
                GPG_PINENTRY_ADD_EXPORT_TO_PROFILE,
            ),
        );
    }
    commands.push(generateCommand('Test GPG', GPG_TEST), generateCommand('Test SSH', SSH_KEY_TEST));

    if (includeGh) {
        commands.push(
            generateCommand('Install GitHub CLI (gh)', GH_INSTALL[os]),
            generateCommand('Sign in to GitHub', GH_AUTH_LOGIN),
            generateCommand('Use gh as the git credential helper', GH_AUTH_SETUP_GIT),
        );
    }

    return commands;
}
