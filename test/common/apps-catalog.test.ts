import { APPS_CATALOG } from '@/common/apps-catalog';
import { validateCatalog } from '@/common/catalog-utils';

describe('APPS_CATALOG integrity', () => {
    const allMethods = () =>
        APPS_CATALOG.apps.flatMap((app) => [
            ...(app.methods.macos ?? []),
            ...(app.methods.windows ?? []),
            ...Object.values(app.methods.linux ?? {}).flatMap((methods) => methods ?? []),
        ]);

    it('loads the catalog and derives its count from the app array', () => {
        expect(APPS_CATALOG.apps.length).toBeGreaterThan(0);
        expect(APPS_CATALOG.appCount).toBe(APPS_CATALOG.apps.length);
    });

    it('appCount field matches actual apps array length', () => {
        expect(APPS_CATALOG.appCount).toBe(APPS_CATALOG.apps.length);
    });

    it('all app ids are unique', () => {
        const ids = APPS_CATALOG.apps.map((a) => a.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });

    it('every app has a non-empty id, name, category, and description', () => {
        for (const app of APPS_CATALOG.apps) {
            expect(app.id).toBeTruthy();
            expect(app.name).toBeTruthy();
            expect(app.category).toBeTruthy();
            expect(app.description).toBeTruthy();
        }
    });

    it('every method across all platforms has a non-empty install string', () => {
        for (const method of allMethods()) {
            expect(method.install).toBeTruthy();
        }
    });

    it('contains executable commands only, never manual installation prose', () => {
        const prosePattern =
            /^(download|re-download|manually|manual|direct\b|install the|open the|visit |see |follow |run the official|use the generic|add .* per |register the|from https?:\/\/)/i;
        for (const method of allMethods()) {
            for (const field of ['repoSetup', 'install', 'update', 'upgrade', 'remove', 'verify'] as const) {
                const value = method[field];
                if (!value) continue;
                expect(value).not.toMatch(prosePattern);
                expect(value.trim()).not.toMatch(/^https?:\/\/\S+$/i);
            }
        }
    });

    it('passes the structural catalog validator', () => {
        expect(validateCatalog(APPS_CATALOG)).toEqual([]);
    });

    it('does not carry the unused verifyBeforeEmit flag', () => {
        for (const app of APPS_CATALOG.apps) {
            expect(app).not.toHaveProperty('verifyBeforeEmit');
        }
    });

    it('parameterized apps have a non-empty versions array', () => {
        const paramApps = APPS_CATALOG.apps.filter((a) => a.parameterized);
        for (const app of paramApps) {
            expect(app.versions).toBeDefined();
            expect(app.versions!.length).toBeGreaterThan(0);
        }
    });

    it('platform flags are consistent with methods presence', () => {
        for (const app of APPS_CATALOG.apps) {
            const macosAvailable = (app.methods.macos ?? []).length > 0;
            const windowsAvailable = (app.methods.windows ?? []).length > 0;
            const linuxAvailable = Object.values(app.methods.linux ?? {}).some((methods) => (methods ?? []).length > 0);

            expect(app.platforms.macos).toBe(macosAvailable);
            expect(app.platforms.windows).toBe(windowsAvailable);
            expect(app.platforms.linux).toBe(linuxAvailable);
        }
    });

    it('every method with a repoSetup also has a non-empty install string', () => {
        for (const app of APPS_CATALOG.apps) {
            for (const method of app.methods.macos ?? []) {
                if (method.repoSetup) expect(method.install).toBeTruthy();
            }
            for (const method of app.methods.windows ?? []) {
                if (method.repoSetup) expect(method.install).toBeTruthy();
            }
            if (app.methods.linux) {
                for (const methods of Object.values(app.methods.linux)) {
                    for (const method of methods ?? []) {
                        if (method.repoSetup) expect(method.install).toBeTruthy();
                    }
                }
            }
        }
    });

    it('migrated/added JDK vendor repoSetup entries contain the expected key phrase', () => {
        const apps = APPS_CATALOG.apps;
        const findMethod = (appId: string, distro: string, manager: string) => {
            const app = apps.find((a) => a.id === appId);
            const methods = app?.methods.linux?.[distro as keyof typeof app.methods.linux] ?? [];
            return methods.find((m) => m.manager === manager);
        };

        expect(findMethod('temurin', 'debian', 'apt')?.repoSetup).toContain('packages.adoptium.net');
        expect(findMethod('temurin', 'fedora', 'dnf')?.repoSetup).toContain('adoptium.repo');
        expect(findMethod('temurin', 'suse', 'zypper')?.repoSetup).toContain('packages.adoptium.net');

        expect(findMethod('corretto', 'debian', 'apt')?.repoSetup).toContain('apt.corretto.aws');
        expect(findMethod('corretto', 'fedora', 'dnf')?.repoSetup).toContain('yum.corretto.aws');
        expect(findMethod('corretto', 'suse', 'zypper')?.repoSetup).toContain('yum.corretto.aws');

        expect(findMethod('microsoft-openjdk', 'suse', 'zypper')?.repoSetup).toContain(
            'packages.microsoft.com/config/opensuse',
        );

        expect(findMethod('zulu', 'debian', 'apt')?.repoSetup).toContain('repos.azul.com');
        expect(findMethod('zulu', 'fedora', 'dnf')?.repoSetup).toContain('repos.azul.com');
        expect(findMethod('zulu', 'suse', 'zypper')?.repoSetup).toContain('cdn.azul.com');
    });

    it('microsoft-openjdk apt method uses a real repoSetup, not the old placeholder text', () => {
        const app = APPS_CATALOG.apps.find((a) => a.id === 'microsoft-openjdk');
        const method = app?.methods.linux?.debian?.find((m) => m.manager === 'apt');
        expect(method?.install).not.toContain('register the Microsoft');
        expect(method?.repoSetup).toContain('packages-microsoft-prod.deb');
    });

    it('microsoft-openjdk has no fedora methods (no documented install path exists)', () => {
        const app = APPS_CATALOG.apps.find((a) => a.id === 'microsoft-openjdk');
        expect(app?.methods.linux?.fedora).toBeDefined();
        expect(app?.methods.linux?.fedora).toHaveLength(0);
    });

    describe('Task 7 — Arch/openSUSE Go gaps', () => {
        const apps = APPS_CATALOG.apps;
        const findMethod = (appId: string, distro: string, manager: string) => {
            const app = apps.find((a) => a.id === appId);
            const methods = app?.methods.linux?.[distro as keyof typeof app.methods.linux] ?? [];
            return methods.find((m) => m.manager === manager);
        };

        it("go's Arch methods lead with a native pacman entry, not snap-only", () => {
            const app = apps.find((a) => a.id === 'go');
            const archMethods = app?.methods.linux?.arch ?? [];
            expect(archMethods[0]?.manager).toBe('pacman');
            expect(findMethod('go', 'arch', 'pacman')?.install).toBe('sudo pacman -S go');
        });

        it("go's openSUSE methods lead with a native zypper entry, not snap-only", () => {
            const app = apps.find((a) => a.id === 'go');
            const suseMethods = app?.methods.linux?.suse ?? [];
            expect(suseMethods[0]?.manager).toBe('zypper');
            expect(findMethod('go', 'suse', 'zypper')?.install).toBe('sudo zypper install go');
        });

        it("go's suse array has exactly one zypper method (no unreachable duplicate manager)", () => {
            const app = apps.find((a) => a.id === 'go');
            const suseMethods = app?.methods.linux?.suse ?? [];
            expect(suseMethods.filter((m) => m.manager === 'zypper')).toHaveLength(1);
        });

        it("go's notes document the openSUSE Leap OBS-repo caveat", () => {
            const app = apps.find((a) => a.id === 'go');
            expect(app?.notes).toContain('openSUSE');
            expect(app?.notes).toContain('Leap');
            expect(app?.notes).not.toContain('16.0');
        });

        it('JDK vendor entries omit unsupported Arch methods', () => {
            for (const id of ['corretto', 'temurin', 'microsoft-openjdk', 'zulu']) {
                const app = apps.find((a) => a.id === id);
                expect(app?.notes).toContain('Arch');
                expect(app?.methods.linux?.arch).toHaveLength(0);
            }
        });
    });

    describe('newly added package/version-manager entries (Task 6)', () => {
        const newIds = ['sdkman', 'fnm', 'goenv', 'corepack', 'bun'];

        it('all five new apps exist in the catalog', () => {
            for (const id of newIds) {
                expect(APPS_CATALOG.apps.find((a) => a.id === id)).toBeDefined();
            }
        });

        it('sdkman and goenv are macOS/Linux-only, with no Windows methods', () => {
            for (const id of ['sdkman', 'goenv']) {
                const app = APPS_CATALOG.apps.find((a) => a.id === id);
                expect(app?.platforms.windows).toBe(false);
                expect(app?.methods.windows).toEqual([]);
            }
        });

        it('fnm, corepack, and bun support Windows with at least one method', () => {
            for (const id of ['fnm', 'corepack', 'bun']) {
                const app = APPS_CATALOG.apps.find((a) => a.id === id);
                expect(app?.platforms.windows).toBe(true);
                expect(app?.methods.windows?.length).toBeGreaterThan(0);
            }
        });

        it('bun installs via the oven-sh/bun/bun tap on macOS, not plain "brew install bun"', () => {
            const app = APPS_CATALOG.apps.find((a) => a.id === 'bun');
            const brewMethod = app?.methods.macos?.find((m) => m.manager === 'brew');
            expect(brewMethod?.install).toContain('oven-sh/bun/bun');
        });

        it('bun has no winget method anywhere (none is officially documented)', () => {
            const app = APPS_CATALOG.apps.find((a) => a.id === 'bun');
            expect(app?.methods.windows?.some((m) => m.manager === 'winget')).toBe(false);
        });

        it('corepack installs via npm on every platform and every Linux distro', () => {
            const app = APPS_CATALOG.apps.find((a) => a.id === 'corepack');
            expect(app?.methods.macos?.some((m) => m.manager === 'npm')).toBe(true);
            expect(app?.methods.windows?.some((m) => m.manager === 'npm')).toBe(true);
            for (const distro of ['debian', 'fedora', 'arch', 'suse'] as const) {
                expect(app?.methods.linux?.[distro]?.some((m) => m.manager === 'npm')).toBe(true);
            }
        });
    });

    describe('current software inventory', () => {
        const requestedCasks = [
            'appcleaner',
            'corretto@8',
            'keka',
            'protonvpn',
            'upscayl',
            'bruno',
            'dbeaver-community',
            'libreoffice',
            'pycharm',
            'utm',
            'chatgpt',
            'claude',
            'claude-code',
            'codex',
            'diffusionbee',
            'drawio',
            'microsoft-edge',
            'microsoft-teams',
            'radix',
            'vlc',
            'vscodium',
            'firefox',
            'google-chrome',
            'homebrew-app',
            'intellij-idea',
            'jellyfin',
            'joplin',
            'lm-studio',
            'mochi-diffusion',
            'ollama-app',
            'opencode-desktop',
            'openmtp',
            'pearcleaner',
            'qlmarkdown',
            'signal',
            'spotify',
            'tad',
            'telegram',
            'tor-browser',
            'transmission',
            'corretto@11',
            'corretto@17',
            'corretto@21',
            'corretto@25',
            'visual-studio-code',
            'whatsapp',
        ];

        const caskMethods = () => allMethods().filter((method) => method.manager === 'brew' && method.kind === 'cask');

        it('covers every requested Homebrew cask token', () => {
            const methods = caskMethods();
            for (const token of requestedCasks) {
                const version = token.startsWith('corretto@') ? token.slice('corretto@'.length) : undefined;
                expect(
                    methods.some(
                        (method) =>
                            method.id === token ||
                            method.install.replaceAll('{version}', version ?? '').includes(token),
                    ),
                ).toBe(true);
            }
        });

        it('uses the current ChatGPT desktop identity instead of codex-app', () => {
            expect(APPS_CATALOG.apps.find((app) => app.id === 'codex-app')).toBeUndefined();
            const chatgpt = APPS_CATALOG.apps.find((app) => app.id === 'chatgpt');
            expect(chatgpt?.methods.macos?.some((method) => method.id === 'chatgpt')).toBe(true);
            expect(chatgpt?.methods.windows?.some((method) => method.id === '9NT1R1C2HH7J')).toBe(true);
        });

        it('adds the requested current CLI tools', () => {
            for (const id of ['github-cli', 'openspec', 'serena', 'spec-kit']) {
                expect(APPS_CATALOG.apps.find((app) => app.id === id)).toBeDefined();
            }

            const openspec = APPS_CATALOG.apps.find((app) => app.id === 'openspec');
            const openspecMethod = openspec?.methods.macos?.find((method) => method.manager === 'npm');
            expect(openspecMethod?.id).toBe('@fission-ai/openspec');
            expect(openspecMethod?.update).toContain('@fission-ai/openspec@latest');

            const serena = APPS_CATALOG.apps.find((app) => app.id === 'serena');
            expect(serena?.methods.macos?.find((method) => method.manager === 'uv')?.update).toBe(
                'uv tool upgrade serena-agent',
            );

            const specKit = APPS_CATALOG.apps.find((app) => app.id === 'spec-kit');
            expect(specKit?.methods.macos?.find((method) => method.manager === 'uv')?.id).toBe('specify-cli');
        });

        it('keeps Gemini CLI and Antigravity CLI distinct', () => {
            const gemini = APPS_CATALOG.apps.find((app) => app.id === 'gemini-cli');
            expect(gemini?.methods.macos?.find((method) => method.manager === 'npm')?.id).toBe('@google/gemini-cli');

            const antigravityCli = APPS_CATALOG.apps.find((app) => app.id === 'antigravity-cli');
            expect(antigravityCli?.methods.macos?.some((method) => method.id === 'antigravity-cli')).toBe(true);
            expect(antigravityCli?.methods.macos?.some((method) => method.verify === 'agy --version')).toBe(true);
            expect(JSON.stringify(antigravityCli)).not.toContain('delete');
        });

        it('removes known stale hardcoded installer values', () => {
            const serialized = JSON.stringify(APPS_CATALOG);
            expect(serialized).not.toContain('v0.40.3');
            expect(serialized).not.toContain('1.0.3-1.noarch.rpm');
            expect(serialized).not.toContain('devel:languages:go/16.0');
        });

        it('renames Goose without losing the Homebrew package token', () => {
            expect(APPS_CATALOG.apps.find((app) => app.id === 'block-goose-cli')).toBeUndefined();
            const goose = APPS_CATALOG.apps.find((app) => app.id === 'goose-cli');
            expect(goose?.methods.macos?.find((method) => method.manager === 'brew')?.id).toBe('block-goose-cli');
        });

        it('keeps Jellyfin server and desktop client methods on separate products', () => {
            const server = APPS_CATALOG.apps.find((app) => app.id === 'jellyfin');
            const player = APPS_CATALOG.apps.find((app) => app.id === 'jellyfin-media-player');

            expect(server?.methods.windows?.some((method) => method.id === 'Jellyfin.Server')).toBe(true);
            expect(server?.methods.windows?.some((method) => method.id === 'Jellyfin.JellyfinMediaPlayer')).toBe(false);
            expect(player?.methods.macos?.some((method) => method.id === 'jellyfin-media-player')).toBe(true);
            expect(player?.methods.windows?.some((method) => method.id === 'Jellyfin.JellyfinMediaPlayer')).toBe(true);
            expect(JSON.stringify(server)).not.toContain('com.github.iwalton3.jellyfin-media-player');
            expect(JSON.stringify(player)).toContain('com.github.iwalton3.jellyfin-media-player');
        });
    });
});
