import type { CatalogApp, CatalogManager, CatalogPlatform, LinuxDistro } from './apps-catalog-types';

export const MANAGER_LABEL: Partial<Record<CatalogManager, string>> = {
    brew: 'Homebrew',
    mas: 'Mac App Store',
    winget: 'winget',
    choco: 'Chocolatey',
    scoop: 'Scoop',
    apt: 'apt',
    dnf: 'dnf',
    pacman: 'pacman',
    zypper: 'zypper',
    flatpak: 'Flatpak',
    snap: 'Snap',
    appimage: 'AppImage',
    npm: 'npm',
    uv: 'uv',
    pipx: 'pipx',
    cargo: 'cargo',
    go: 'go',
    script: 'Script',
    installer: 'Installer',
};

export function filterCatalog(apps: CatalogApp[], search: string, category: string | null): CatalogApp[] {
    const q = search.toLowerCase().trim();
    return apps.filter((app) => {
        if (category && app.category !== category) return false;
        if (!q) return true;
        return app.name.toLowerCase().includes(q) || app.description.toLowerCase().includes(q);
    });
}

export function getCategories(apps: CatalogApp[]): string[] {
    return [...new Set(apps.map((a) => a.category))].sort();
}

export function getAvailableManagers(
    app: CatalogApp,
    platform: CatalogPlatform,
    linuxDistro: LinuxDistro,
): CatalogManager[] {
    if (!app.platforms[platform]) return [];
    let methods;
    if (platform === 'linux') {
        methods = app.methods.linux?.[linuxDistro];
    } else if (platform === 'macos') {
        methods = app.methods.macos;
    } else {
        methods = app.methods.windows;
    }
    return methods ? methods.map((m) => m.manager) : [];
}
