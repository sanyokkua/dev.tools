import {
    LINUX_APT_UPDATE,
    LINUX_APT_VERIFY,
    LINUX_BREW_DEPS_APT,
    LINUX_BREW_DEPS_DNF,
    LINUX_BREW_INSTALL,
    LINUX_BREW_PATH,
    LINUX_BREW_VERIFY,
    LINUX_DNF_UPDATE,
    LINUX_DNF_VERIFY,
    LINUX_ENV_ADD_TO_PATH,
    LINUX_ENV_ETC_ENVIRONMENT,
    LINUX_ENV_EXPORT_EXAMPLE,
    LINUX_ENV_JAVA_HOME,
    LINUX_ENV_PERSIST_USER_PROFILE,
    LINUX_ENV_PROFILE_D,
    LINUX_ENV_RELOAD,
    LINUX_ENV_SYSTEMD_SERVICE,
    LINUX_ENV_SYSTEMD_USER,
    LINUX_ENV_VERIFY,
    LINUX_FLATPAK_FLATHUB,
    LINUX_FLATPAK_INSTALL_APT,
    LINUX_FLATPAK_INSTALL_DNF,
    LINUX_FLATPAK_INSTALL_PACMAN,
    LINUX_FLATPAK_INSTALL_ZYPPER,
    LINUX_FLATPAK_VERIFY,
    LINUX_PACMAN_UPDATE,
    LINUX_PACMAN_VERIFY,
    LINUX_SNAP_INSTALL_APT,
    LINUX_SNAP_INSTALL_DNF,
    LINUX_SNAP_INSTALL_PACMAN,
    LINUX_SNAP_INSTALL_ZYPPER,
    LINUX_SNAP_VERIFY,
    LINUX_ZYPPER_UPDATE,
    LINUX_ZYPPER_VERIFY,
} from '@/common/linux-utils';

describe('linux-utils constants', () => {
    it.each([
        ['LINUX_APT_VERIFY', LINUX_APT_VERIFY],
        ['LINUX_APT_UPDATE', LINUX_APT_UPDATE],
        ['LINUX_DNF_VERIFY', LINUX_DNF_VERIFY],
        ['LINUX_DNF_UPDATE', LINUX_DNF_UPDATE],
        ['LINUX_PACMAN_VERIFY', LINUX_PACMAN_VERIFY],
        ['LINUX_PACMAN_UPDATE', LINUX_PACMAN_UPDATE],
        ['LINUX_ZYPPER_VERIFY', LINUX_ZYPPER_VERIFY],
        ['LINUX_ZYPPER_UPDATE', LINUX_ZYPPER_UPDATE],
        ['LINUX_FLATPAK_INSTALL_APT', LINUX_FLATPAK_INSTALL_APT],
        ['LINUX_FLATPAK_INSTALL_DNF', LINUX_FLATPAK_INSTALL_DNF],
        ['LINUX_FLATPAK_INSTALL_PACMAN', LINUX_FLATPAK_INSTALL_PACMAN],
        ['LINUX_FLATPAK_INSTALL_ZYPPER', LINUX_FLATPAK_INSTALL_ZYPPER],
        ['LINUX_FLATPAK_FLATHUB', LINUX_FLATPAK_FLATHUB],
        ['LINUX_FLATPAK_VERIFY', LINUX_FLATPAK_VERIFY],
        ['LINUX_SNAP_INSTALL_APT', LINUX_SNAP_INSTALL_APT],
        ['LINUX_SNAP_INSTALL_DNF', LINUX_SNAP_INSTALL_DNF],
        ['LINUX_SNAP_INSTALL_PACMAN', LINUX_SNAP_INSTALL_PACMAN],
        ['LINUX_SNAP_INSTALL_ZYPPER', LINUX_SNAP_INSTALL_ZYPPER],
        ['LINUX_SNAP_VERIFY', LINUX_SNAP_VERIFY],
        ['LINUX_BREW_DEPS_APT', LINUX_BREW_DEPS_APT],
        ['LINUX_BREW_DEPS_DNF', LINUX_BREW_DEPS_DNF],
        ['LINUX_BREW_INSTALL', LINUX_BREW_INSTALL],
        ['LINUX_BREW_PATH', LINUX_BREW_PATH],
        ['LINUX_BREW_VERIFY', LINUX_BREW_VERIFY],
        ['LINUX_ENV_EXPORT_EXAMPLE', LINUX_ENV_EXPORT_EXAMPLE],
        ['LINUX_ENV_PERSIST_USER_PROFILE', LINUX_ENV_PERSIST_USER_PROFILE],
        ['LINUX_ENV_ADD_TO_PATH', LINUX_ENV_ADD_TO_PATH],
        ['LINUX_ENV_JAVA_HOME', LINUX_ENV_JAVA_HOME],
        ['LINUX_ENV_RELOAD', LINUX_ENV_RELOAD],
        ['LINUX_ENV_ETC_ENVIRONMENT', LINUX_ENV_ETC_ENVIRONMENT],
        ['LINUX_ENV_PROFILE_D', LINUX_ENV_PROFILE_D],
        ['LINUX_ENV_SYSTEMD_USER', LINUX_ENV_SYSTEMD_USER],
        ['LINUX_ENV_SYSTEMD_SERVICE', LINUX_ENV_SYSTEMD_SERVICE],
        ['LINUX_ENV_VERIFY', LINUX_ENV_VERIFY],
    ])('%s is a non-empty string', (_name, value) => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
    });

    it('LINUX_BREW_INSTALL contains Homebrew/install', () => {
        expect(LINUX_BREW_INSTALL).toContain('Homebrew/install');
    });

    it('LINUX_FLATPAK_FLATHUB contains flathub.org', () => {
        expect(LINUX_FLATPAK_FLATHUB).toContain('flathub.org');
    });

    it('LINUX_BREW_PATH contains linuxbrew and covers bash and zsh', () => {
        expect(LINUX_BREW_PATH).toContain('linuxbrew');
        expect(LINUX_BREW_PATH).toContain('~/.bashrc');
        expect(LINUX_BREW_PATH).toContain('~/.zshrc');
    });

    it('LINUX_BREW_DEPS_DNF uses dnf group install development-tools', () => {
        expect(LINUX_BREW_DEPS_DNF).toContain('sudo dnf group install development-tools');
        expect(LINUX_BREW_DEPS_DNF).not.toContain('groupinstall');
    });

    it('JAVA_HOME examples target JDK 25', () => {
        expect(LINUX_ENV_JAVA_HOME).toContain('java-25-openjdk');
        expect(LINUX_ENV_JAVA_HOME).not.toContain('java-21');
        expect(LINUX_ENV_ETC_ENVIRONMENT).toContain('java-25-openjdk');
    });

    it('LINUX_ENV_VERIFY mentions both Debian and Fedora PAM files', () => {
        expect(LINUX_ENV_VERIFY).toContain('common-session');
        expect(LINUX_ENV_VERIFY).toContain('system-auth');
    });

    it('LINUX_ENV_ADD_TO_PATH contains PATH', () => {
        expect(LINUX_ENV_ADD_TO_PATH).toContain('PATH');
    });

    it('LINUX_ENV_ETC_ENVIRONMENT contains /etc/environment and no export syntax', () => {
        expect(LINUX_ENV_ETC_ENVIRONMENT).toContain('/etc/environment');
        expect(LINUX_ENV_ETC_ENVIRONMENT).not.toContain('export ');
    });

    it('LINUX_ENV_PROFILE_D contains profile.d and export', () => {
        expect(LINUX_ENV_PROFILE_D).toContain('profile.d');
        expect(LINUX_ENV_PROFILE_D).toContain('export');
    });

    it('LINUX_ENV_SYSTEMD_USER contains environment.d', () => {
        expect(LINUX_ENV_SYSTEMD_USER).toContain('environment.d');
    });

    it('LINUX_ENV_SYSTEMD_SERVICE contains Environment= and systemctl', () => {
        expect(LINUX_ENV_SYSTEMD_SERVICE).toContain('Environment=');
        expect(LINUX_ENV_SYSTEMD_SERVICE).toContain('systemctl');
    });

    it('LINUX_ENV_VERIFY contains printenv', () => {
        expect(LINUX_ENV_VERIFY).toContain('printenv');
    });
});
