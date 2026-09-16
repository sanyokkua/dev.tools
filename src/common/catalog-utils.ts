import type {
    AppsCatalog,
    CatalogApp,
    CatalogManager,
    CatalogMethod,
    CatalogPlatform,
    LinuxDistro,
} from './apps-catalog-types';

// Managers technically present in the catalog data but not offered as a selectable
// preference anywhere in the Software Installer UI (e.g. `mas` requires an interactive
// App Store sign-in and has no scriptable install path for third-party apps).
export const HIDDEN_MANAGERS: CatalogManager[] = ['mas'];

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
    return [...new Set(apps.map((a) => a.category))].sort((a, b) => a.localeCompare(b));
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

const VALID_MANAGERS = new Set<CatalogManager>([
    'brew',
    'mas',
    'winget',
    'choco',
    'scoop',
    'apt',
    'dnf',
    'pacman',
    'zypper',
    'flatpak',
    'snap',
    'appimage',
    'npm',
    'uv',
    'pipx',
    'cargo',
    'go',
    'script',
    'installer',
]);

const COMMAND_FIELDS = ['repoSetup', 'install', 'update', 'upgrade', 'remove', 'verify'] as const;
const PROSE_PREFIX =
    /^(download|re-download|manual(?:ly)?|direct\b|install the|open the|visit |see |follow |run the official|use the generic|add .* per |register the|from https?:\/\/|github releases\b|official installer\b|delete\b|https?:\/\/)/i;
const PROSE_CONTENT =
    /\b(?:static (?:build|tar)|then run|direct \.(?:dmg|exe|pkg|deb|rpm)|\.AppImage\s*[—-]|release(?:s)?\s*\([^)]*\)|chmod \+x[^\n]*then)\b/i;

function isExecutableCommand(value: string): boolean {
    const trimmed = value.trim();
    return (
        trimmed.length > 0 &&
        !PROSE_PREFIX.test(trimmed) &&
        !PROSE_CONTENT.test(trimmed) &&
        !/\[-D[A-Z_]+=.*\]/.test(trimmed)
    );
}

function getAllMethods(app: CatalogApp): CatalogMethod[] {
    return [
        ...(app.methods.macos ?? []),
        ...(app.methods.windows ?? []),
        ...Object.values(app.methods.linux ?? {}).flatMap((methods) => methods ?? []),
    ];
}

/**
 * Returns structural catalog issues without performing network calls. External package and
 * vendor freshness checks remain a dated maintenance audit rather than a CI dependency.
 */
export function validateCatalog(catalog: AppsCatalog): string[] {
    const issues: string[] = [];
    const ids = new Set<string>();

    if (catalog.appCount !== catalog.apps.length) {
        issues.push(`appCount ${catalog.appCount} does not match ${catalog.apps.length} apps`);
    }

    for (const app of catalog.apps) {
        if (ids.has(app.id)) issues.push(`duplicate app id: ${app.id}`);
        ids.add(app.id);

        const platformMethods: Record<CatalogPlatform, CatalogMethod[]> = {
            macos: app.methods.macos ?? [],
            windows: app.methods.windows ?? [],
            linux: Object.values(app.methods.linux ?? {}).flatMap((methods) => methods ?? []),
        };

        for (const platform of ['macos', 'windows', 'linux'] as const) {
            if (app.platforms[platform] !== platformMethods[platform].length > 0) {
                issues.push(`${app.id}: ${platform} flag does not match method availability`);
            }
        }

        if (Object.values(platformMethods).every((methods) => methods.length === 0)) {
            issues.push(`${app.id}: no executable methods`);
        }

        if (app.parameterized && (!app.versions || app.versions.length === 0)) {
            issues.push(`${app.id}: parameterized app has no versions`);
        }
        if (!app.parameterized && app.versions) {
            issues.push(`${app.id}: versions are present without parameterized=true`);
        }
        if (app.parameterized && app.versions && new Set(app.versions).size !== app.versions.length) {
            issues.push(`${app.id}: parameterized app has duplicate versions`);
        }

        for (const method of getAllMethods(app)) {
            if (!VALID_MANAGERS.has(method.manager)) {
                issues.push(`${app.id}: invalid manager ${String(method.manager)}`);
            }
            for (const field of COMMAND_FIELDS) {
                const value = method[field];
                if (field === 'install' && !isExecutableCommand(value)) {
                    issues.push(`${app.id}/${method.manager}: install is not an executable command`);
                } else if (value !== undefined && !isExecutableCommand(value)) {
                    issues.push(`${app.id}/${method.manager}: ${field} is not an executable command`);
                }
                if (!app.parameterized && value?.includes('{version}')) {
                    issues.push(`${app.id}/${method.manager}: ${field} uses {version} without parameterized=true`);
                }
            }
        }
    }

    return issues;
}
