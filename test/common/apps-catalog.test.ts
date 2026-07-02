import { APPS_CATALOG } from '@/common/apps-catalog';

describe('APPS_CATALOG integrity', () => {
    it('loads and has exactly 153 apps', () => {
        expect(APPS_CATALOG.apps).toHaveLength(153);
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
        for (const app of APPS_CATALOG.apps) {
            for (const method of app.methods.macos ?? []) {
                expect(method.install).toBeTruthy();
            }
            for (const method of app.methods.windows ?? []) {
                expect(method.install).toBeTruthy();
            }
            if (app.methods.linux) {
                for (const methods of Object.values(app.methods.linux)) {
                    for (const method of methods ?? []) {
                        expect(method.install).toBeTruthy();
                    }
                }
            }
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
            if (app.platforms.macos) {
                expect(app.methods.macos).toBeDefined();
            }
            if (app.platforms.windows) {
                expect(app.methods.windows).toBeDefined();
            }
            if (app.platforms.linux) {
                expect(app.methods.linux).toBeDefined();
            }
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
});
