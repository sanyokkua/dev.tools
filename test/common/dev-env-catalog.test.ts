import { DEV_ENV_CATALOG, DevEnvCategory, DevEnvManagerBootstrap, DevEnvOS } from '@/common/dev-env-catalog';

const CATEGORIES: DevEnvCategory[] = ['java', 'python', 'go', 'nodejs', 'bun'];
const OSES: DevEnvOS[] = ['macos', 'windows', 'linux'];

function allEntriesFor(os: DevEnvOS, data: (typeof DEV_ENV_CATALOG)[DevEnvCategory]): DevEnvManagerBootstrap[] {
    const generic = data.managersByOS[os];
    if (os !== 'linux' || !data.linuxDistroOverrides) return generic;
    return [generic, ...Object.values(data.linuxDistroOverrides).flat()].flat();
}

function findByManagerId(managerId: string): DevEnvManagerBootstrap[] {
    const found: DevEnvManagerBootstrap[] = [];
    for (const category of CATEGORIES) {
        const data = DEV_ENV_CATALOG[category];
        for (const os of OSES) {
            for (const entry of allEntriesFor(os, data)) {
                if (entry.managerId === managerId) found.push(entry);
            }
        }
    }
    return found;
}

describe('DEV_ENV_CATALOG integrity', () => {
    it('has exactly the 5 expected category keys, each self-consistent', () => {
        expect(new Set(Object.keys(DEV_ENV_CATALOG))).toEqual(new Set(CATEGORIES));
        for (const category of CATEGORIES) {
            expect(DEV_ENV_CATALOG[category].category).toBe(category);
        }
    });

    it('every category has at least one manager entry for every OS it claims to support', () => {
        for (const category of CATEGORIES) {
            const data = DEV_ENV_CATALOG[category];
            for (const os of OSES) {
                expect(data.managersByOS[os].length).toBeGreaterThan(0);
            }
        }
    });

    it('every manager entry is only present in an OS array its availableOn includes', () => {
        for (const category of CATEGORIES) {
            const data = DEV_ENV_CATALOG[category];
            for (const os of OSES) {
                for (const entry of data.managersByOS[os]) {
                    expect(entry.availableOn).toContain(os);
                }
            }
            for (const distroEntries of Object.values(data.linuxDistroOverrides ?? {})) {
                for (const entry of distroEntries ?? []) {
                    expect(entry.availableOn).toContain('linux');
                }
            }
        }
    });

    it('has no duplicate managerId within any single managersByOS or linuxDistroOverrides array', () => {
        for (const category of CATEGORIES) {
            const data = DEV_ENV_CATALOG[category];
            const arrays = [
                ...OSES.map((os) => data.managersByOS[os]),
                ...Object.values(data.linuxDistroOverrides ?? {}),
            ];
            for (const arr of arrays) {
                const ids = (arr ?? []).map((e) => e!.managerId);
                expect(new Set(ids).size).toBe(ids.length);
            }
        }
    });

    it('every entry has non-empty managerId, managerLabel, installTool, and verify', () => {
        for (const category of CATEGORIES) {
            const data = DEV_ENV_CATALOG[category];
            for (const os of OSES) {
                for (const entry of allEntriesFor(os, data)) {
                    expect(entry.managerId).toBeTruthy();
                    expect(entry.managerLabel).toBeTruthy();
                    expect(entry.installTool).toBeTruthy();
                    expect(entry.verify).toBeTruthy();
                }
            }
        }
    });

    it('every entry with repoSetup also has a non-empty installTool', () => {
        for (const category of CATEGORIES) {
            const data = DEV_ENV_CATALOG[category];
            for (const os of OSES) {
                for (const entry of allEntriesFor(os, data)) {
                    if (entry.repoSetup) expect(entry.installTool).toBeTruthy();
                }
            }
        }
    });

    it('caveat-bearing managers (jenv, sdkman, goenv, nvm-windows, pyenv-win) each carry non-empty notes', () => {
        for (const managerId of ['jenv', 'sdkman', 'goenv', 'nvm-windows', 'pyenv-win']) {
            const entries = findByManagerId(managerId);
            expect(entries.length).toBeGreaterThan(0);
            for (const entry of entries) {
                expect(entry.notes).toBeTruthy();
            }
        }
    });

    it('Java on Windows has no jenv entry but has a manual JAVA_HOME fallback', () => {
        const windowsJava = DEV_ENV_CATALOG.java.managersByOS.windows;
        expect(windowsJava.length).toBeGreaterThan(0);
        expect(windowsJava.some((e) => e.managerId === 'jenv')).toBe(false);
        expect(windowsJava.some((e) => /JAVA_HOME/.test(e.installTool) || /JAVA_HOME/.test(e.configure ?? ''))).toBe(
            true,
        );
    });

    it('Go openSUSE Leap entry uses a version-pinned OBS repoSetup', () => {
        const entry = DEV_ENV_CATALOG.go.linuxDistroOverrides?.suse?.find((e) => e.managerId === 'zypper-leap-obs');
        expect(entry?.repoSetup).toBeDefined();
        expect(entry!.repoSetup).toContain('devel:languages:go/16.0');
    });

    it('Go on Arch always does a full sync+upgrade, never a partial -Sy', () => {
        const entry = DEV_ENV_CATALOG.go.linuxDistroOverrides?.arch?.find((e) => e.managerId === 'pacman');
        expect(entry?.update).toBe('sudo pacman -Syu');
    });

    it('Bun has no winget entry anywhere', () => {
        const allBun = OSES.flatMap((os) => allEntriesFor(os, DEV_ENV_CATALOG.bun));
        expect(allBun.some((e) => e.managerId === 'winget')).toBe(false);
    });
});
