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
export const SSH_KEY_ADD_AGENT = 'eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519';
export const SSH_KEY_COPY_PUBLIC_KEY_MACOS = 'cat ~/.ssh/id_ed25519.pub | pbcopy';
export const SSH_KEY_COPY_PUBLIC_KEY_LINUX = 'cat ~/.ssh/id_ed25519.pub | xclip -selection clipboard';
export const SSH_KEY_COPY_PUBLIC_KEY_WINDOWS = 'Get-Content ~/.ssh/id_ed25519.pub | Set-Clipboard';
export const INSTALL_XCLIP = 'sudo apt update && sudo apt install -y git gnupg xclip';
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
export const GPG_PINENTRY_SETUP_MKDIR_GNUPG = 'mkdir ~/.gnupg';
export const GPG_PINENTRY_SETUP_ADD_AGENT_RECORD =
    'echo "pinentry-program $(brew --prefix)/bin/pinentry-mac" > ~/.gnupg/gpg-agent.conf';
export const GPG_PINENTRY_SETUP_ADD_AGENT_TO_CONFIG = "echo 'use-agent' > ~/.gnupg/gpg.conf";
export const GPG_PINENTRY_ADD_EXPORT_TO_PROFILE = 'export GPG_TTY=$(tty)';
export const GPG_TEST = 'echo "test" | git commit -S --file=- && git log --show-signature -1';

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
 * @returns Array of Git-related command objects with instructions and execution details
 */
export function generateGitCommands(name: string, email: string, globalConfig: boolean, os: OSType): Command[] {
    const commands: Command[] = [];

    commands.push(generateCommand('Install Git', GIT_INSTALL[os]));
    commands.push(generateCommand('Verify Git', GIT_VERIFY_INSTALL));

    if (globalConfig) {
        commands.push(generateCommand('Configure Git Global User Name', `${GIT_CONFIG_GLOBAL_USER_NAME} "${name}"`));
        commands.push(generateCommand('Configure Git Global User Email', `${GIT_CONFIG_GLOBAL_USER_EMAIL} "${email}"`));
        commands.push(generateCommand('Verify Git Global Config', GIT_CONFIG_GLOBAL_VERIFY));
    } else {
        commands.push(generateCommand('Configure Git User Name', `${GIT_CONFIG_USER_NAME} "${name}"`));
        commands.push(generateCommand('Configure Git User Email', `${GIT_CONFIG_USER_EMAIL} "${email}"`));
        commands.push(generateCommand('Verify Git Config', GIT_CONFIG_VERIFY));
    }

    commands.push(generateCommand('Generate SSH Key', `${SSH_KEY_GENERATE} "${email}"`));
    commands.push(generateCommand('Add SSH Key to SSH Agent', SSH_KEY_ADD_AGENT));
    if (os === 'linux') {
        commands.push(generateCommand('Install xclip for copy from terminal', INSTALL_XCLIP));
    }
    commands.push(generateCommand('Copy SSH Public Key', SSH_KEY_COPY[os]));
    commands.push(generateCommand('Test SSH Connection', SSH_KEY_TEST));
    commands.push(generateCommand('Install GPG', GPG_INSTALL[os]));
    commands.push(generateCommand('Verify GPG', GPG_VERIFY_INSTALL));
    commands.push(generateCommand('Generate GPG Key', GPG_GENERATE_KEY));
    commands.push(generateCommand('Get GPG Key ID (sec   algorithm/YOUR_KEY_ID YYYY-MM-DD [SC]\n)', GPG_GET_KEY_ID));

    if (globalConfig) {
        commands.push(
            generateCommand(
                'Configure Git Global Signing (replace YOUR_KEY_ID with the key ID from the previous command)',
                GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ADD_KEY,
            ),
        );
        commands.push(
            generateCommand(
                'Configure Git Global Commit Signing',
                GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ENABLE_COMMIT_SIGNING,
            ),
        );
        commands.push(
            generateCommand('Configure Git Global Tag Signing', GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ENABLE_TAG_SIGNING),
        );
    } else {
        commands.push(
            generateCommand(
                'Configure Git Signing (replace YOUR_KEY_ID with the key ID from the previous command)',
                GPG_CONFIGURE_GIT_SIGNING_ADD_KEY,
            ),
        );
        commands.push(generateCommand('Configure Git Commit Signing', GPG_CONFIGURE_GIT_SIGNING_ENABLE_COMMIT_SIGNING));
        commands.push(generateCommand('Configure Git Tag Signing', GPG_CONFIGURE_GIT_SIGNING_ENABLE_TAG_SIGNING));
    }
    if (os === 'macos') {
        commands.push(
            generateCommand('To enable visual pass prompts for GPG signing, install pinentry', GPG_PINENTRY_INSTALL),
        );
        commands.push(
            generateCommand("Create GPG config folder (if it doesn't exist)", GPG_PINENTRY_SETUP_MKDIR_GNUPG),
        );
        commands.push(
            generateCommand(
                'Add pinentry to gpg-agent config (if entry not present)',
                GPG_PINENTRY_SETUP_ADD_AGENT_RECORD,
            ),
        );
        commands.push(
            generateCommand("Add 'use-agent' to GPG config (if missing)", GPG_PINENTRY_SETUP_ADD_AGENT_TO_CONFIG),
        );
        commands.push(
            generateCommand(
                'Add environment variable export to shell profile (~/.zprofile or ~/.bashrc or ~/.zshrc)',
                GPG_PINENTRY_ADD_EXPORT_TO_PROFILE,
            ),
        );
    }
    commands.push(generateCommand('Copy SSH Public Key', SSH_KEY_COPY[os]));
    commands.push(generateCommand('Test GPG', GPG_TEST));
    commands.push(generateCommand('Test SSH', SSH_KEY_TEST));

    return commands;
}
