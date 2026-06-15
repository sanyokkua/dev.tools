export type CatalogPlatform = 'macos' | 'windows' | 'linux';

export type LinuxDistro = 'debian' | 'fedora' | 'arch' | 'suse' | 'universal';

export type CatalogManager =
    | 'brew'
    | 'mas'
    | 'winget'
    | 'choco'
    | 'scoop'
    | 'apt'
    | 'dnf'
    | 'pacman'
    | 'zypper'
    | 'flatpak'
    | 'snap'
    | 'appimage'
    | 'npm'
    | 'uv'
    | 'pipx'
    | 'cargo'
    | 'go'
    | 'script'
    | 'installer';

export interface CatalogMethod {
    manager: CatalogManager;
    id?: string;
    kind?: 'cask' | 'formula';
    install: string;
    update?: string;
    upgrade?: string;
    remove?: string;
    verify?: string;
}

export type LinuxMethods = Partial<Record<LinuxDistro, CatalogMethod[]>>;

export interface CatalogApp {
    id: string;
    name: string;
    category: string;
    description: string;
    site?: string;
    platforms: { macos: boolean; windows: boolean; linux: boolean };
    methods: { macos?: CatalogMethod[]; windows?: CatalogMethod[]; linux?: LinuxMethods };
    notes?: string;
    verifyBeforeEmit?: boolean;
    parameterized?: boolean;
    versions?: string[];
}

export interface AppsCatalogManagers {
    macos: CatalogManager[];
    windows: CatalogManager[];
    linux: Record<LinuxDistro, CatalogManager[]>;
    dev: CatalogManager[];
}

export interface AppsCatalog {
    version: string;
    generatedFrom: string;
    platforms: CatalogPlatform[];
    linuxDistros: LinuxDistro[];
    managers: AppsCatalogManagers;
    appCount: number;
    apps: CatalogApp[];
}
