import {
    MAC_OS_BREW_ADD_TO_PROFILE,
    MAC_OS_BREW_HOME_LINK,
    MAC_OS_BREW_INSTALL_SCRIPT,
    MAC_OS_BREW_UPDATE_UPGRADE,
    MAC_OS_BREW_VERIFY_INSTALLATION,
    MAC_OS_CREATE_ZPROFILE,
    MAC_OS_ENV_ADD_TO_PATH,
    MAC_OS_ENV_EXPORT_EXAMPLE,
    MAC_OS_ENV_JAVA_HOME,
    MAC_OS_ENV_LAUNCH_AGENT_LOAD,
    MAC_OS_ENV_LAUNCH_AGENT_PLIST,
    MAC_OS_ENV_LAUNCHCTL_CONFIG_PATH,
    MAC_OS_ENV_LAUNCHCTL_GETENV,
    MAC_OS_ENV_LAUNCHCTL_SETENV_SESSION,
    MAC_OS_ENV_PATHS_D,
} from '@/common/macos-utils';

describe('macos-utils constants', () => {
    it.each([
        ['MAC_OS_BREW_HOME_LINK', MAC_OS_BREW_HOME_LINK],
        ['MAC_OS_BREW_INSTALL_SCRIPT', MAC_OS_BREW_INSTALL_SCRIPT],
        ['MAC_OS_CREATE_ZPROFILE', MAC_OS_CREATE_ZPROFILE],
        ['MAC_OS_BREW_ADD_TO_PROFILE', MAC_OS_BREW_ADD_TO_PROFILE],
        ['MAC_OS_BREW_VERIFY_INSTALLATION', MAC_OS_BREW_VERIFY_INSTALLATION],
        ['MAC_OS_BREW_UPDATE_UPGRADE', MAC_OS_BREW_UPDATE_UPGRADE],
        ['MAC_OS_ENV_EXPORT_EXAMPLE', MAC_OS_ENV_EXPORT_EXAMPLE],
        ['MAC_OS_ENV_JAVA_HOME', MAC_OS_ENV_JAVA_HOME],
        ['MAC_OS_ENV_ADD_TO_PATH', MAC_OS_ENV_ADD_TO_PATH],
        ['MAC_OS_ENV_LAUNCHCTL_SETENV_SESSION', MAC_OS_ENV_LAUNCHCTL_SETENV_SESSION],
        ['MAC_OS_ENV_LAUNCH_AGENT_PLIST', MAC_OS_ENV_LAUNCH_AGENT_PLIST],
        ['MAC_OS_ENV_LAUNCH_AGENT_LOAD', MAC_OS_ENV_LAUNCH_AGENT_LOAD],
        ['MAC_OS_ENV_LAUNCHCTL_GETENV', MAC_OS_ENV_LAUNCHCTL_GETENV],
        ['MAC_OS_ENV_PATHS_D', MAC_OS_ENV_PATHS_D],
        ['MAC_OS_ENV_LAUNCHCTL_CONFIG_PATH', MAC_OS_ENV_LAUNCHCTL_CONFIG_PATH],
    ])('%s is a non-empty string', (_name, value) => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
    });

    it('MAC_OS_ENV_LAUNCHCTL_SETENV_SESSION is a standalone command, not the LaunchAgent plist', () => {
        expect(MAC_OS_ENV_LAUNCHCTL_SETENV_SESSION).toContain('launchctl setenv');
        expect(MAC_OS_ENV_LAUNCHCTL_SETENV_SESSION).not.toContain('<string>');
        expect(MAC_OS_ENV_LAUNCH_AGENT_PLIST).not.toContain(MAC_OS_ENV_LAUNCHCTL_SETENV_SESSION);
    });

    it('MAC_OS_BREW_INSTALL_SCRIPT references Homebrew/install', () => {
        expect(MAC_OS_BREW_INSTALL_SCRIPT).toContain('Homebrew/install');
    });

    it('MAC_OS_ENV_JAVA_HOME references java_home and zshrc', () => {
        expect(MAC_OS_ENV_JAVA_HOME).toContain('java_home');
        expect(MAC_OS_ENV_JAVA_HOME).toContain('.zshrc');
    });

    it('MAC_OS_ENV_LAUNCH_AGENT_PLIST is a launchctl setenv LaunchAgent with RunAtLoad', () => {
        expect(MAC_OS_ENV_LAUNCH_AGENT_PLIST).toContain('launchctl');
        expect(MAC_OS_ENV_LAUNCH_AGENT_PLIST).toContain('setenv');
        expect(MAC_OS_ENV_LAUNCH_AGENT_PLIST).toContain('RunAtLoad');
    });

    it('MAC_OS_ENV_LAUNCH_AGENT_LOAD references LaunchAgents and launchctl load', () => {
        expect(MAC_OS_ENV_LAUNCH_AGENT_LOAD).toContain('LaunchAgents');
        expect(MAC_OS_ENV_LAUNCH_AGENT_LOAD).toContain('launchctl load');
    });

    it('MAC_OS_ENV_LAUNCHCTL_GETENV uses launchctl getenv', () => {
        expect(MAC_OS_ENV_LAUNCHCTL_GETENV).toContain('launchctl getenv');
    });

    it('MAC_OS_ENV_PATHS_D references /etc/paths.d', () => {
        expect(MAC_OS_ENV_PATHS_D).toContain('/etc/paths.d');
    });

    it('MAC_OS_ENV_LAUNCHCTL_CONFIG_PATH sets the user path domain', () => {
        expect(MAC_OS_ENV_LAUNCHCTL_CONFIG_PATH).toContain('launchctl config user path');
    });

    it('none of the env constants hardcode a /Users/ path', () => {
        const values = [
            MAC_OS_ENV_EXPORT_EXAMPLE,
            MAC_OS_ENV_JAVA_HOME,
            MAC_OS_ENV_ADD_TO_PATH,
            MAC_OS_ENV_LAUNCHCTL_SETENV_SESSION,
            MAC_OS_ENV_LAUNCH_AGENT_PLIST,
            MAC_OS_ENV_LAUNCH_AGENT_LOAD,
            MAC_OS_ENV_LAUNCHCTL_GETENV,
            MAC_OS_ENV_PATHS_D,
            MAC_OS_ENV_LAUNCHCTL_CONFIG_PATH,
        ];
        values.forEach((value) => expect(value).not.toContain('/Users/'));
    });
});
