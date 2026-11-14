import {
    generateGitCommands,
    GH_AUTH_LOGIN,
    GH_AUTH_SETUP_GIT,
    GH_INSTALL,
    GH_INSTALL_FEDORA,
    GH_SETUP,
    GH_USAGE,
    GIT_CONFIG_GLOBAL_DEFAULT_BRANCH,
    GIT_CONFIG_GLOBAL_PULL_REBASE,
    GIT_CONFIG_GLOBAL_USER_EMAIL,
    GIT_CONFIG_GLOBAL_USER_NAME,
    GIT_CONFIG_GLOBAL_VERIFY,
    GIT_CONFIG_USER_EMAIL,
    GIT_CONFIG_USER_NAME,
    GIT_CONFIG_VERIFY,
    GIT_INSTALL_LINUX,
    GIT_INSTALL_MACOS,
    GIT_INSTALL_WINDOWS,
    GIT_VERIFY_INSTALL,
    GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ADD_KEY,
    GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ENABLE_COMMIT_SIGNING,
    GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ENABLE_TAG_SIGNING,
    GPG_CONFIGURE_GIT_SIGNING_ADD_KEY,
    GPG_CONFIGURE_GIT_SIGNING_ENABLE_COMMIT_SIGNING,
    GPG_CONFIGURE_GIT_SIGNING_ENABLE_TAG_SIGNING,
    GPG_GENERATE_KEY,
    GPG_GET_KEY_ID,
    GPG_INSTALL_LINUX,
    GPG_INSTALL_MACOS,
    GPG_INSTALL_WINDOWS,
    GPG_PINENTRY_ADD_EXPORT_TO_PROFILE,
    GPG_PINENTRY_INSTALL,
    GPG_PINENTRY_RELOAD_AGENT,
    GPG_PINENTRY_SETUP_ADD_AGENT_RECORD,
    GPG_PINENTRY_SETUP_ADD_AGENT_TO_CONFIG,
    GPG_PINENTRY_SETUP_MKDIR_GNUPG,
    GPG_TEST,
    GPG_VERIFY_INSTALL,
    INSTALL_WL_CLIPBOARD,
    INSTALL_XCLIP,
    joinCommands,
    SSH_CONFIG_MACOS_APPEND,
    SSH_KEY_ADD_AGENT,
    SSH_KEY_ADD_AGENT_WINDOWS,
    SSH_KEY_COPY_PUBLIC_KEY_LINUX,
    SSH_KEY_COPY_PUBLIC_KEY_LINUX_WAYLAND,
    SSH_KEY_COPY_PUBLIC_KEY_MACOS,
    SSH_KEY_COPY_PUBLIC_KEY_WINDOWS,
    SSH_KEY_GENERATE,
    SSH_KEY_TEST,
} from '../../src/common/git-utils';

describe('git-utils constants', () => {
    it('GIT_INSTALL_MACOS uses brew', () => {
        expect(GIT_INSTALL_MACOS).toBe('brew install git');
    });

    it('GIT_INSTALL_LINUX uses apt', () => {
        expect(GIT_INSTALL_LINUX).toContain('apt');
    });

    it('GIT_INSTALL_WINDOWS uses winget', () => {
        expect(GIT_INSTALL_WINDOWS).toContain('winget');
    });

    it('GIT_VERIFY_INSTALL is git --version', () => {
        expect(GIT_VERIFY_INSTALL).toBe('git --version');
    });

    it('SSH_KEY_GENERATE starts with ssh-keygen', () => {
        expect(SSH_KEY_GENERATE).toMatch(/^ssh-keygen/);
    });

    it('SSH_KEY_ADD_AGENT is per-OS and only bash/macOS use eval', () => {
        expect(SSH_KEY_ADD_AGENT.macos).toContain('--apple-use-keychain');
        expect(SSH_KEY_ADD_AGENT.linux).toContain('eval "$(ssh-agent -s)"');
        expect(SSH_KEY_ADD_AGENT.windows).toBe(SSH_KEY_ADD_AGENT_WINDOWS);
        expect(SSH_KEY_ADD_AGENT_WINDOWS).not.toContain('eval');
        expect(SSH_KEY_ADD_AGENT_WINDOWS).toContain('Start-Service ssh-agent');
    });

    it('macOS ssh config append is guarded and includes the keychain block', () => {
        expect(SSH_CONFIG_MACOS_APPEND).toContain('grep -qxF');
        expect(SSH_CONFIG_MACOS_APPEND).toContain('UseKeychain yes');
    });

    it('GPG_TEST is non-destructive (no commit)', () => {
        expect(GPG_TEST).toBe('echo "test" | gpg --clearsign');
    });

    it('pinentry setup uses mkdir -p/chmod 700 and append-if-missing', () => {
        expect(GPG_PINENTRY_SETUP_MKDIR_GNUPG).toBe('mkdir -p ~/.gnupg && chmod 700 ~/.gnupg');
        expect(GPG_PINENTRY_SETUP_ADD_AGENT_RECORD).toContain('>>');
        expect(GPG_PINENTRY_SETUP_ADD_AGENT_RECORD).toContain('grep -qxF');
        expect(GPG_PINENTRY_SETUP_ADD_AGENT_TO_CONFIG).toContain('grep -qxF');
        expect(GPG_PINENTRY_RELOAD_AGENT).toBe('gpgconf --kill gpg-agent');
    });

    it('Wayland clipboard uses wl-copy', () => {
        expect(INSTALL_WL_CLIPBOARD).toContain('wl-clipboard');
        expect(SSH_KEY_COPY_PUBLIC_KEY_LINUX_WAYLAND).toContain('wl-copy');
    });

    it('GH data covers install per OS, setup and usage', () => {
        expect(GH_INSTALL.macos).toBe('brew install gh');
        expect(GH_INSTALL.windows).toContain('GitHub.cli');
        expect(GH_INSTALL.linux).toContain('githubcli-archive-keyring.gpg');
        expect(GH_INSTALL_FEDORA).toContain('dnf5-plugins');
        expect(GH_SETUP.map((c) => c.command)).toEqual(
            expect.arrayContaining(['gh auth login', 'gh auth setup-git', 'gh auth status']),
        );
        expect(GH_USAGE.length).toBeGreaterThan(10);
        [...GH_SETUP, ...GH_USAGE].forEach((c) => {
            expect(c.description.length).toBeGreaterThan(0);
            expect(c.command.startsWith('gh ')).toBe(true);
        });
    });

    it('joinCommands uses ; on Windows and && elsewhere', () => {
        const c = [
            { description: 'a', command: 'one' },
            { description: 'b', command: 'two' },
        ];
        expect(joinCommands(c, 'windows')).toBe('one; two');
        expect(joinCommands(c, 'macos')).toBe('one && two');
        expect(joinCommands(c, 'linux')).toBe('one && two');
    });

    it('SSH_KEY_COPY_PUBLIC_KEY_MACOS uses pbcopy', () => {
        expect(SSH_KEY_COPY_PUBLIC_KEY_MACOS).toContain('pbcopy');
    });

    it('SSH_KEY_COPY_PUBLIC_KEY_LINUX uses xclip', () => {
        expect(SSH_KEY_COPY_PUBLIC_KEY_LINUX).toContain('xclip');
    });

    it('SSH_KEY_COPY_PUBLIC_KEY_WINDOWS uses Set-Clipboard', () => {
        expect(SSH_KEY_COPY_PUBLIC_KEY_WINDOWS).toContain('Set-Clipboard');
    });

    it('GPG_INSTALL_MACOS uses brew', () => {
        expect(GPG_INSTALL_MACOS).toContain('brew');
    });

    it('GPG_INSTALL_LINUX uses apt', () => {
        expect(GPG_INSTALL_LINUX).toContain('apt');
    });

    it('GPG_INSTALL_WINDOWS uses winget', () => {
        expect(GPG_INSTALL_WINDOWS).toContain('winget');
    });

    it('INSTALL_XCLIP installs only xclip', () => {
        expect(INSTALL_XCLIP).toContain('xclip');
        expect(INSTALL_XCLIP).not.toContain('gnupg');
        expect(INSTALL_XCLIP).not.toContain(' git ');
    });
});

describe('generateGitCommands — macOS global config', () => {
    const name = 'Alice';
    const email = 'alice@example.com';
    const cmds = generateGitCommands(name, email, true, 'macos');

    it('returns an array of commands', () => {
        expect(Array.isArray(cmds)).toBe(true);
        expect(cmds.length).toBeGreaterThan(0);
    });

    it('first command installs git for macOS', () => {
        expect(cmds[0].command).toBe(GIT_INSTALL_MACOS);
    });

    it('second command verifies git', () => {
        expect(cmds[1].command).toBe(GIT_VERIFY_INSTALL);
    });

    it('uses global config commands for user name', () => {
        const nameCmd = cmds.find((c) => c.command.includes(GIT_CONFIG_GLOBAL_USER_NAME));
        expect(nameCmd).toBeDefined();
        expect(nameCmd!.command).toContain(`"${name}"`);
    });

    it('uses global config commands for user email', () => {
        const emailCmd = cmds.find((c) => c.command.includes(GIT_CONFIG_GLOBAL_USER_EMAIL));
        expect(emailCmd).toBeDefined();
        expect(emailCmd!.command).toContain(`"${email}"`);
    });

    it('includes global verify command', () => {
        const verifyCmd = cmds.find((c) => c.command === GIT_CONFIG_GLOBAL_VERIFY);
        expect(verifyCmd).toBeDefined();
    });

    it('does NOT include local user.name config', () => {
        const localName = cmds.find(
            (c) => c.command.startsWith(GIT_CONFIG_USER_NAME) && !c.command.startsWith(GIT_CONFIG_GLOBAL_USER_NAME),
        );
        expect(localName).toBeUndefined();
    });

    it('includes SSH key generation command with email', () => {
        const sshCmd = cmds.find((c) => c.command.includes(SSH_KEY_GENERATE));
        expect(sshCmd).toBeDefined();
        expect(sshCmd!.command).toContain(`"${email}"`);
    });

    it('includes SSH agent setup', () => {
        const agentCmd = cmds.find((c) => c.command === SSH_KEY_ADD_AGENT.macos);
        expect(agentCmd).toBeDefined();
    });

    it('includes keychain ssh config and default branch/pull settings', () => {
        expect(cmds.find((c) => c.command === SSH_CONFIG_MACOS_APPEND)).toBeDefined();
        expect(cmds.find((c) => c.command === GIT_CONFIG_GLOBAL_DEFAULT_BRANCH)).toBeDefined();
        expect(cmds.find((c) => c.command === GIT_CONFIG_GLOBAL_PULL_REBASE)).toBeDefined();
    });

    it('restarts gpg-agent after pinentry config', () => {
        expect(cmds.find((c) => c.command === GPG_PINENTRY_RELOAD_AGENT)).toBeDefined();
    });

    it('omits gh commands by default and appends them when requested', () => {
        expect(cmds.find((c) => c.command === GH_AUTH_LOGIN)).toBeUndefined();
        const withGh = generateGitCommands('Alice', 'alice@example.com', true, 'macos', true);
        const tail = withGh.slice(-3).map((c) => c.command);
        expect(tail).toEqual([GH_INSTALL.macos, GH_AUTH_LOGIN, GH_AUTH_SETUP_GIT]);
    });

    it('does NOT add xclip step on macOS', () => {
        const xclipCmd = cmds.find((c) => c.command === INSTALL_XCLIP);
        expect(xclipCmd).toBeUndefined();
    });

    it('uses macOS SSH copy command', () => {
        const copyCmd = cmds.find((c) => c.command === SSH_KEY_COPY_PUBLIC_KEY_MACOS);
        expect(copyCmd).toBeDefined();
    });

    it('includes SSH key test', () => {
        const testCmd = cmds.find((c) => c.command === SSH_KEY_TEST);
        expect(testCmd).toBeDefined();
    });

    it('includes GPG installation for macOS', () => {
        const gpgInstall = cmds.find((c) => c.command === GPG_INSTALL_MACOS);
        expect(gpgInstall).toBeDefined();
    });

    it('includes GPG verify install', () => {
        expect(cmds.find((c) => c.command === GPG_VERIFY_INSTALL)).toBeDefined();
    });

    it('includes GPG key generation', () => {
        expect(cmds.find((c) => c.command === GPG_GENERATE_KEY)).toBeDefined();
    });

    it('includes GPG get key ID', () => {
        expect(cmds.find((c) => c.command === GPG_GET_KEY_ID)).toBeDefined();
    });

    it('uses global GPG signing key config', () => {
        const keyCmd = cmds.find((c) => c.command === GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ADD_KEY);
        expect(keyCmd).toBeDefined();
    });

    it('uses global commit signing config', () => {
        expect(cmds.find((c) => c.command === GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ENABLE_COMMIT_SIGNING)).toBeDefined();
    });

    it('uses global tag signing config', () => {
        expect(cmds.find((c) => c.command === GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ENABLE_TAG_SIGNING)).toBeDefined();
    });

    it('includes macOS pinentry steps', () => {
        expect(cmds.find((c) => c.command === GPG_PINENTRY_INSTALL)).toBeDefined();
        expect(cmds.find((c) => c.command === GPG_PINENTRY_SETUP_MKDIR_GNUPG)).toBeDefined();
        expect(cmds.find((c) => c.command === GPG_PINENTRY_SETUP_ADD_AGENT_RECORD)).toBeDefined();
        expect(cmds.find((c) => c.command === GPG_PINENTRY_SETUP_ADD_AGENT_TO_CONFIG)).toBeDefined();
        expect(cmds.find((c) => c.command === GPG_PINENTRY_ADD_EXPORT_TO_PROFILE)).toBeDefined();
    });

    it('includes GPG test at the end', () => {
        expect(cmds.find((c) => c.command === GPG_TEST)).toBeDefined();
    });

    it('each command has a non-empty description', () => {
        cmds.forEach((c) => {
            expect(typeof c.description).toBe('string');
            expect(c.description.length).toBeGreaterThan(0);
        });
    });
});

describe('generateGitCommands — Linux local config', () => {
    const cmds = generateGitCommands('Bob', 'bob@example.com', false, 'linux');

    it('first command installs git for Linux', () => {
        expect(cmds[0].command).toBe(GIT_INSTALL_LINUX);
    });

    it('uses local (non-global) user name config', () => {
        const nameCmd = cmds.find((c) => c.command.startsWith(GIT_CONFIG_USER_NAME) && !c.command.includes('--global'));
        expect(nameCmd).toBeDefined();
    });

    it('uses local (non-global) user email config', () => {
        const emailCmd = cmds.find(
            (c) => c.command.startsWith(GIT_CONFIG_USER_EMAIL) && !c.command.includes('--global'),
        );
        expect(emailCmd).toBeDefined();
    });

    it('includes local verify command', () => {
        expect(cmds.find((c) => c.command === GIT_CONFIG_VERIFY)).toBeDefined();
    });

    it('adds xclip install step for Linux', () => {
        expect(cmds.find((c) => c.command === INSTALL_XCLIP)).toBeDefined();
    });

    it('uses Linux SSH copy command', () => {
        expect(cmds.find((c) => c.command === SSH_KEY_COPY_PUBLIC_KEY_LINUX)).toBeDefined();
    });

    it('uses Linux GPG install', () => {
        expect(cmds.find((c) => c.command === GPG_INSTALL_LINUX)).toBeDefined();
    });

    it('uses local signing key config (not global)', () => {
        expect(cmds.find((c) => c.command === GPG_CONFIGURE_GIT_SIGNING_ADD_KEY)).toBeDefined();
        expect(cmds.find((c) => c.command === GPG_CONFIGURE_GIT_GLOBAL_SIGNING_ADD_KEY)).toBeUndefined();
    });

    it('uses local commit signing config', () => {
        expect(cmds.find((c) => c.command === GPG_CONFIGURE_GIT_SIGNING_ENABLE_COMMIT_SIGNING)).toBeDefined();
    });

    it('uses local tag signing config', () => {
        expect(cmds.find((c) => c.command === GPG_CONFIGURE_GIT_SIGNING_ENABLE_TAG_SIGNING)).toBeDefined();
    });

    it('does NOT include macOS pinentry steps for Linux', () => {
        expect(cmds.find((c) => c.command === GPG_PINENTRY_INSTALL)).toBeUndefined();
    });
});

describe('generateGitCommands — Windows global config', () => {
    const cmds = generateGitCommands('Carol', 'carol@example.com', true, 'windows');

    it('first command installs git for Windows', () => {
        expect(cmds[0].command).toBe(GIT_INSTALL_WINDOWS);
    });

    it('uses Windows SSH copy command', () => {
        expect(cmds.find((c) => c.command === SSH_KEY_COPY_PUBLIC_KEY_WINDOWS)).toBeDefined();
    });

    it('uses Windows GPG install', () => {
        expect(cmds.find((c) => c.command === GPG_INSTALL_WINDOWS)).toBeDefined();
    });

    it('uses PowerShell ssh-agent commands, not eval', () => {
        const agentCmd = cmds.find((c) => c.command === SSH_KEY_ADD_AGENT.windows);
        expect(agentCmd).toBeDefined();
        expect(cmds.some((c) => c.command.includes('eval'))).toBe(false);
    });

    it('appends the Windows gh install when requested', () => {
        const withGh = generateGitCommands('Carol', 'carol@example.com', true, 'windows', true);
        expect(withGh.find((c) => c.command === GH_INSTALL.windows)).toBeDefined();
    });

    it('does NOT add xclip install step for Windows', () => {
        expect(cmds.find((c) => c.command === INSTALL_XCLIP)).toBeUndefined();
    });

    it('does NOT include macOS pinentry steps for Windows', () => {
        expect(cmds.find((c) => c.command === GPG_PINENTRY_INSTALL)).toBeUndefined();
    });
});

describe('generateGitCommands — edge cases', () => {
    it('handles empty name and email gracefully', () => {
        const cmds = generateGitCommands('', '', true, 'macos');
        expect(Array.isArray(cmds)).toBe(true);
        const nameCmd = cmds.find((c) => c.command.includes(GIT_CONFIG_GLOBAL_USER_NAME));
        expect(nameCmd!.command).toContain('""');
    });

    it('handles long name and email without error', () => {
        const longName = 'A'.repeat(200);
        const longEmail = `${'b'.repeat(100)}@example.com`;
        const cmds = generateGitCommands(longName, longEmail, false, 'linux');
        expect(cmds.length).toBeGreaterThan(0);
        const nameCmd = cmds.find((c) => c.command.includes(GIT_CONFIG_USER_NAME) && !c.command.includes('--global'));
        expect(nameCmd!.command).toContain(longName);
    });

    it('handles non-ASCII characters in name', () => {
        const cmds = generateGitCommands('Ünïcödë Ñámê', 'unicode@test.com', true, 'linux');
        const nameCmd = cmds.find((c) => c.command.includes(GIT_CONFIG_GLOBAL_USER_NAME));
        expect(nameCmd!.command).toContain('Ünïcödë Ñámê');
    });
});
