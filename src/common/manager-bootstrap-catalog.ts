import type { CatalogManager, CatalogPlatform, LinuxDistro } from './apps-catalog-types';
import {
    LINUX_FLATPAK_FLATHUB,
    LINUX_FLATPAK_INSTALL_APT,
    LINUX_FLATPAK_INSTALL_DNF,
    LINUX_FLATPAK_INSTALL_PACMAN,
    LINUX_FLATPAK_INSTALL_ZYPPER,
    LINUX_FLATPAK_VERIFY,
    LINUX_SNAP_INSTALL_APT,
    LINUX_SNAP_INSTALL_DNF,
    LINUX_SNAP_INSTALL_PACMAN,
    LINUX_SNAP_INSTALL_ZYPPER,
    LINUX_SNAP_VERIFY,
} from './linux-utils';
import { MAC_OS_BREW_ADD_TO_PROFILE, MAC_OS_BREW_INSTALL_SCRIPT, MAC_OS_BREW_VERIFY_INSTALLATION } from './macos-utils';
import {
    WINDOWS_CHOCO_INSTALL,
    WINDOWS_CHOCO_VERIFY,
    WINDOWS_SCOOP_INSTALL,
    WINDOWS_SCOOP_VERIFY,
} from './windows-utils';

/**
 * How to bootstrap a CatalogManager that isn't native to the target OS.
 * - `fixed`: a root/self-contained manager (brew, choco, scoop, flatpak, snap) — command and verify
 *   are the exact, already fact-checked strings used on the matching OS-setup cheat-sheet page
 *   (mac-os-setup / windows-setup / linux-setup), never re-typed here.
 * - `provider-app`: a dev-manager (npm, go, uv, cargo, pipx) that comes bundled with installing a
 *   regular Software Installer catalog app — `appIds` is ordered, first entry is the default.
 */
export type BootstrapSource =
    | { kind: 'fixed'; command: string; verify: string; guidePath: string }
    | { kind: 'provider-app'; appIds: string[]; guidePath: string };

type PlatformBootstrap = {
    macos?: BootstrapSource;
    windows?: BootstrapSource;
    linux?: Partial<Record<LinuxDistro, BootstrapSource>>;
};

const NPM_PROVIDERS: BootstrapSource = {
    kind: 'provider-app',
    appIds: ['node', 'nvm', 'fnm'],
    guidePath: '/dev-environment-setup',
};
const GO_PROVIDERS: BootstrapSource = { kind: 'provider-app', appIds: ['go'], guidePath: '/dev-environment-setup' };
const UV_PROVIDERS: BootstrapSource = { kind: 'provider-app', appIds: ['uv'], guidePath: '/dev-environment-setup' };
const CARGO_PROVIDERS: BootstrapSource = {
    kind: 'provider-app',
    appIds: ['rust'],
    guidePath: '/dev-environment-setup',
};
const PIPX_PROVIDERS: BootstrapSource = { kind: 'provider-app', appIds: ['pipx'], guidePath: '/dev-environment-setup' };

// Every dev-manager provider resolves identically across platform/distro — the choice of *which*
// app provides it doesn't vary by OS, only that provider app's own install method does (handled by
// resolveProviderCommand in script-builder.ts, not here).
const DEV_MANAGER_BOOTSTRAP = (source: BootstrapSource): PlatformBootstrap => ({
    macos: source,
    windows: source,
    linux: { debian: source, fedora: source, arch: source, suse: source },
});

export const MANAGER_BOOTSTRAP: Partial<Record<CatalogManager, PlatformBootstrap>> = {
    brew: {
        macos: {
            kind: 'fixed',
            command: `${MAC_OS_BREW_INSTALL_SCRIPT}\n${MAC_OS_BREW_ADD_TO_PROFILE}`,
            verify: MAC_OS_BREW_VERIFY_INSTALLATION,
            guidePath: '/mac-os-setup',
        },
    },
    choco: {
        windows: {
            kind: 'fixed',
            command: WINDOWS_CHOCO_INSTALL,
            verify: WINDOWS_CHOCO_VERIFY,
            guidePath: '/windows-setup',
        },
    },
    scoop: {
        windows: {
            kind: 'fixed',
            command: WINDOWS_SCOOP_INSTALL,
            verify: WINDOWS_SCOOP_VERIFY,
            guidePath: '/windows-setup',
        },
    },
    flatpak: {
        linux: {
            debian: {
                kind: 'fixed',
                command: `${LINUX_FLATPAK_INSTALL_APT}\n${LINUX_FLATPAK_FLATHUB}`,
                verify: LINUX_FLATPAK_VERIFY,
                guidePath: '/linux-setup',
            },
            fedora: {
                kind: 'fixed',
                command: `${LINUX_FLATPAK_INSTALL_DNF}\n${LINUX_FLATPAK_FLATHUB}`,
                verify: LINUX_FLATPAK_VERIFY,
                guidePath: '/linux-setup',
            },
            arch: {
                kind: 'fixed',
                command: `${LINUX_FLATPAK_INSTALL_PACMAN}\n${LINUX_FLATPAK_FLATHUB}`,
                verify: LINUX_FLATPAK_VERIFY,
                guidePath: '/linux-setup',
            },
            suse: {
                kind: 'fixed',
                command: `${LINUX_FLATPAK_INSTALL_ZYPPER}\n${LINUX_FLATPAK_FLATHUB}`,
                verify: LINUX_FLATPAK_VERIFY,
                guidePath: '/linux-setup',
            },
        },
    },
    snap: {
        linux: {
            debian: {
                kind: 'fixed',
                command: LINUX_SNAP_INSTALL_APT,
                verify: LINUX_SNAP_VERIFY,
                guidePath: '/linux-setup',
            },
            fedora: {
                kind: 'fixed',
                command: LINUX_SNAP_INSTALL_DNF,
                verify: LINUX_SNAP_VERIFY,
                guidePath: '/linux-setup',
            },
            arch: {
                kind: 'fixed',
                command: LINUX_SNAP_INSTALL_PACMAN,
                verify: LINUX_SNAP_VERIFY,
                guidePath: '/linux-setup',
            },
            suse: {
                kind: 'fixed',
                command: LINUX_SNAP_INSTALL_ZYPPER,
                verify: LINUX_SNAP_VERIFY,
                guidePath: '/linux-setup',
            },
        },
    },
    npm: DEV_MANAGER_BOOTSTRAP(NPM_PROVIDERS),
    go: DEV_MANAGER_BOOTSTRAP(GO_PROVIDERS),
    uv: DEV_MANAGER_BOOTSTRAP(UV_PROVIDERS),
    cargo: DEV_MANAGER_BOOTSTRAP(CARGO_PROVIDERS),
    pipx: DEV_MANAGER_BOOTSTRAP(PIPX_PROVIDERS),
};

/**
 * Managers resolved via a provider catalog app rather than a fixed command. Excluded when
 * resolving a provider app's OWN install method (see resolveProviderCommand in script-builder.ts)
 * so a bootstrap chain can never exceed one level of indirection — e.g. the `uv` app's own Linux
 * methods include `pipx` and `cargo`, which would otherwise risk uv → pipx → uv style cycles.
 */
export const PROVIDER_RESOLVED_MANAGERS: CatalogManager[] = ['npm', 'go', 'uv', 'cargo', 'pipx'];

export function getBootstrapSource(
    manager: CatalogManager,
    platform: CatalogPlatform,
    linuxDistro?: LinuxDistro,
): BootstrapSource | undefined {
    const entry = MANAGER_BOOTSTRAP[manager];
    if (!entry) return undefined;
    if (platform === 'linux') {
        return linuxDistro ? entry.linux?.[linuxDistro] : undefined;
    }
    return entry[platform];
}
