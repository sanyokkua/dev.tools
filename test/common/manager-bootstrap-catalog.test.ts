import { APPS_CATALOG } from '@/common/apps-catalog';
import type { CatalogManager, CatalogPlatform, LinuxDistro } from '@/common/apps-catalog-types';
import {
    LINUX_FLATPAK_INSTALL_APT,
    LINUX_FLATPAK_VERIFY,
    LINUX_SNAP_INSTALL_APT,
    LINUX_SNAP_VERIFY,
} from '@/common/linux-utils';
import { MAC_OS_BREW_INSTALL_SCRIPT, MAC_OS_BREW_VERIFY_INSTALLATION } from '@/common/macos-utils';
import { getBootstrapSource, MANAGER_BOOTSTRAP, PROVIDER_RESOLVED_MANAGERS } from '@/common/manager-bootstrap-catalog';
import { WINDOWS_CHOCO_INSTALL, WINDOWS_CHOCO_VERIFY, WINDOWS_SCOOP_VERIFY } from '@/common/windows-utils';

const HIDDEN_MANAGERS: CatalogManager[] = ['mas'];

function allSourcesFor(manager: CatalogManager): { platform: CatalogPlatform; linuxDistro?: LinuxDistro }[] {
    const combos: { platform: CatalogPlatform; linuxDistro?: LinuxDistro }[] = [
        { platform: 'macos' },
        { platform: 'windows' },
        { platform: 'linux', linuxDistro: 'debian' },
        { platform: 'linux', linuxDistro: 'fedora' },
        { platform: 'linux', linuxDistro: 'arch' },
        { platform: 'linux', linuxDistro: 'suse' },
    ];
    return combos.filter((c) => getBootstrapSource(manager, c.platform, c.linuxDistro));
}

describe('MANAGER_BOOTSTRAP integrity', () => {
    it('has no entry for OS-native managers (apt/dnf/pacman/zypper/winget) — they need no bootstrap', () => {
        const osNative: CatalogManager[] = ['apt', 'dnf', 'pacman', 'zypper', 'winget'];
        for (const manager of osNative) {
            expect(MANAGER_BOOTSTRAP[manager]).toBeUndefined();
        }
    });

    it('has no entry for mas/appimage/script/installer — not real bootstrappable managers', () => {
        const excluded: CatalogManager[] = ['mas', 'appimage', 'script', 'installer'];
        for (const manager of excluded) {
            expect(MANAGER_BOOTSTRAP[manager]).toBeUndefined();
        }
    });

    it('reuses the exact fact-checked constants from macos-utils/windows-utils/linux-utils — never re-typed', () => {
        expect(getBootstrapSource('brew', 'macos')?.kind).toBe('fixed');
        const brew = getBootstrapSource('brew', 'macos');
        if (brew?.kind === 'fixed') {
            expect(brew.command).toContain(MAC_OS_BREW_INSTALL_SCRIPT);
            expect(brew.verify).toBe(MAC_OS_BREW_VERIFY_INSTALLATION);
        }

        const choco = getBootstrapSource('choco', 'windows');
        expect(choco?.kind).toBe('fixed');
        if (choco?.kind === 'fixed') {
            expect(choco.command).toBe(WINDOWS_CHOCO_INSTALL);
            expect(choco.verify).toBe(WINDOWS_CHOCO_VERIFY);
        }

        const scoop = getBootstrapSource('scoop', 'windows');
        expect(scoop?.kind).toBe('fixed');
        if (scoop?.kind === 'fixed') {
            expect(scoop.verify).toBe(WINDOWS_SCOOP_VERIFY);
        }

        const flatpakDebian = getBootstrapSource('flatpak', 'linux', 'debian');
        expect(flatpakDebian?.kind).toBe('fixed');
        if (flatpakDebian?.kind === 'fixed') {
            expect(flatpakDebian.command).toContain(LINUX_FLATPAK_INSTALL_APT);
            expect(flatpakDebian.verify).toBe(LINUX_FLATPAK_VERIFY);
        }

        const snapDebian = getBootstrapSource('snap', 'linux', 'debian');
        expect(snapDebian?.kind).toBe('fixed');
        if (snapDebian?.kind === 'fixed') {
            expect(snapDebian.command).toBe(LINUX_SNAP_INSTALL_APT);
            expect(snapDebian.verify).toBe(LINUX_SNAP_VERIFY);
        }
    });

    it('every provider-app appIds entry resolves to a real, non-hidden app in APPS_CATALOG', () => {
        for (const manager of PROVIDER_RESOLVED_MANAGERS) {
            for (const combo of allSourcesFor(manager)) {
                const source = getBootstrapSource(manager, combo.platform, combo.linuxDistro);
                expect(source?.kind).toBe('provider-app');
                if (source?.kind === 'provider-app') {
                    expect(source.appIds.length).toBeGreaterThan(0);
                    for (const appId of source.appIds) {
                        const app = APPS_CATALOG.apps.find((a) => a.id === appId);
                        expect(app).toBeDefined();
                    }
                }
            }
        }
    });

    it('every guidePath points at one of the four known cheat-sheet pages', () => {
        const validPaths = ['/mac-os-setup', '/windows-setup', '/linux-setup', '/dev-environment-setup'];
        const allManagers = Object.keys(MANAGER_BOOTSTRAP) as CatalogManager[];
        for (const manager of allManagers) {
            for (const combo of allSourcesFor(manager)) {
                const source = getBootstrapSource(manager, combo.platform, combo.linuxDistro);
                expect(validPaths).toContain(source?.guidePath);
            }
        }
    });

    it('flatpak bootstrap also registers the flathub remote (needed by every flatpak app install)', () => {
        for (const distro of ['debian', 'fedora', 'arch', 'suse'] as const) {
            const source = getBootstrapSource('flatpak', 'linux', distro);
            expect(source?.kind).toBe('fixed');
            if (source?.kind === 'fixed') {
                expect(source.command).toContain('flathub');
            }
        }
    });

    it('npm has multiple provider candidates (node, nvm, fnm) — satisfies "multiple ways to install" ', () => {
        const source = getBootstrapSource('npm', 'macos');
        expect(source?.kind).toBe('provider-app');
        if (source?.kind === 'provider-app') {
            expect(source.appIds).toEqual(expect.arrayContaining(['node', 'nvm', 'fnm']));
        }
    });

    it('every CatalogManager offered in the software-installer UI that is non-OS-native has a bootstrap entry', () => {
        // Regression guard: catches "added a new manager to apps-catalog.json, forgot to add its
        // MANAGER_BOOTSTRAP entry" the same way manager-maintenance-catalog.test.ts guards MANAGER_MAINTENANCE.
        const osNative: CatalogManager[] = ['apt', 'dnf', 'pacman', 'zypper', 'winget'];
        const excluded: CatalogManager[] = ['mas', 'appimage', 'script', 'installer'];

        const macosManagers = APPS_CATALOG.managers.macos.filter((m) => !HIDDEN_MANAGERS.includes(m));
        for (const manager of macosManagers) {
            if (osNative.includes(manager) || excluded.includes(manager)) continue;
            expect(getBootstrapSource(manager, 'macos')).toBeDefined();
        }

        const windowsManagers = APPS_CATALOG.managers.windows.filter((m) => !HIDDEN_MANAGERS.includes(m));
        for (const manager of windowsManagers) {
            if (osNative.includes(manager) || excluded.includes(manager)) continue;
            expect(getBootstrapSource(manager, 'windows')).toBeDefined();
        }

        for (const distro of ['debian', 'fedora', 'arch', 'suse'] as const) {
            const linuxManagers = APPS_CATALOG.managers.linux[distro].filter((m) => !HIDDEN_MANAGERS.includes(m));
            for (const manager of linuxManagers) {
                if (osNative.includes(manager) || excluded.includes(manager)) continue;
                expect(getBootstrapSource(manager, 'linux', distro)).toBeDefined();
            }
        }

        for (const manager of APPS_CATALOG.managers.dev) {
            if (excluded.includes(manager)) continue;
            expect(getBootstrapSource(manager, 'macos')).toBeDefined();
            expect(getBootstrapSource(manager, 'windows')).toBeDefined();
            expect(getBootstrapSource(manager, 'linux', 'debian')).toBeDefined();
        }
    });
});
