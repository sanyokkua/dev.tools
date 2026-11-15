import {
    applyVersion,
    DEFAULT_GRADLE_VERSION,
    DEFAULT_MAVEN_VERSION,
    DEV_ENV_CATALOG,
    DevEnvCategory,
    DevEnvManagerBootstrap,
    DevEnvOS,
    resolveVersion,
    VERSION_PLACEHOLDER,
} from '@/common/dev-env-catalog';

const CATEGORIES: DevEnvCategory[] = ['java', 'maven', 'gradle', 'python', 'go', 'rust', 'nodejs', 'bun'];
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
    it('has exactly the 8 expected category keys, each self-consistent', () => {
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

    it('Rust has a rustup entry on every OS, each verifying via cargo/rustc', () => {
        for (const os of OSES) {
            const entries = DEV_ENV_CATALOG.rust.managersByOS[os];
            const rustup = entries.find((e) => e.managerId === 'rustup');
            expect(rustup).toBeDefined();
            expect(rustup!.verify).toContain('cargo --version');
        }
    });

    it('Rust Linux distro overrides have no rustup duplicate and no version switching (distro packages only)', () => {
        for (const distro of ['debian', 'fedora', 'arch', 'suse'] as const) {
            const overrideEntries = DEV_ENV_CATALOG.rust.linuxDistroOverrides?.[distro] ?? [];
            expect(overrideEntries.some((e) => e.managerId === 'rustup')).toBe(false);
            expect(overrideEntries.every((e) => e.versionSwitch === undefined)).toBe(true);
        }
    });

    it('Python has a pipx entry on every OS with no official Windows package manager', () => {
        for (const os of OSES) {
            const pipx = DEV_ENV_CATALOG.python.managersByOS[os].find((e) => e.managerId === 'pipx');
            expect(pipx).toBeDefined();
            expect(pipx!.verify).toBe('pipx --version');
        }
        const windowsPipx = DEV_ENV_CATALOG.python.managersByOS.windows.find((e) => e.managerId === 'pipx');
        expect(windowsPipx!.notes).toContain('no official winget/Chocolatey package');
    });

    it('Maven and Gradle only ever expose manual + automated-script managers, never a package manager', () => {
        for (const category of ['maven', 'gradle'] as const) {
            for (const os of OSES) {
                const ids = DEV_ENV_CATALOG[category].managersByOS[os].map((e) => e.managerId).sort();
                expect(ids).toEqual(['automated-script', 'manual']);
            }
            expect(DEV_ENV_CATALOG[category].linuxDistroOverrides).toBeUndefined();
        }
    });

    it('Maven never assigns M2_HOME (deprecated/unsupported since Maven 3.5.0)', () => {
        for (const os of OSES) {
            for (const entry of DEV_ENV_CATALOG.maven.managersByOS[os]) {
                expect(entry.installTool).not.toContain('M2_HOME=');
                expect(entry.configure ?? '').not.toContain('M2_HOME=');
            }
        }
    });

    it('Gradle wires GRADLE_HOME on every OS', () => {
        for (const os of OSES) {
            for (const entry of DEV_ENV_CATALOG.gradle.managersByOS[os]) {
                expect(`${entry.installTool}${entry.configure ?? ''}`).toContain('GRADLE_HOME');
            }
        }
    });

    it('Maven and Gradle scripts contain no checksum verification', () => {
        for (const category of ['maven', 'gradle'] as const) {
            for (const os of OSES) {
                for (const entry of DEV_ENV_CATALOG[category].managersByOS[os]) {
                    const text = [entry.installTool, entry.configure, entry.update, entry.notes].join('\n');
                    expect(text).not.toMatch(/sha-?(256|512)|get-filehash|checksum|[0-9a-f]{64}/i);
                }
            }
        }
    });

    it('Maven and Gradle install scripts carry the version placeholder, and it is substituted', () => {
        for (const category of ['maven', 'gradle'] as const) {
            for (const os of OSES) {
                for (const entry of DEV_ENV_CATALOG[category].managersByOS[os]) {
                    expect(entry.installTool).toContain(VERSION_PLACEHOLDER);
                    const out = applyVersion(entry.installTool, '1.2.3');
                    expect(out).not.toContain(VERSION_PLACEHOLDER);
                    expect(out).toContain('"1.2.3"');
                }
            }
        }
    });

    it('Maven downloads come from archive.apache.org with the major derived from the version', () => {
        for (const os of OSES) {
            for (const entry of DEV_ENV_CATALOG.maven.managersByOS[os]) {
                expect(entry.installTool).toContain('https://archive.apache.org/dist/maven/maven-');
                expect(entry.installTool).not.toContain('dlcdn.apache.org');
                expect(entry.installTool).toMatch(/MAVEN_VERSION%%\.\*|Split\('\.'\)\[0\]/);
            }
        }
    });

    it('Maven MAVEN_HOME points at a stable path that does not embed the version', () => {
        for (const os of OSES) {
            for (const entry of DEV_ENV_CATALOG.maven.managersByOS[os]) {
                const text = `${entry.installTool}\n${entry.configure ?? ''}`;
                expect(text).not.toMatch(/MAVEN_HOME=\S*apache-maven-/);
                expect(text).toMatch(
                    /apache-maven\/latest|INSTALL_ROOT\/latest|\$Root\\apache-maven"|C:\\Tools\\apache-maven/,
                );
            }
        }
    });

    it('resolveVersion accepts valid versions and falls back on invalid input', () => {
        expect(resolveVersion('9.8.0', DEFAULT_GRADLE_VERSION)).toBe('9.8.0');
        expect(resolveVersion(' 3.9.9 ', DEFAULT_MAVEN_VERSION)).toBe('3.9.9');
        expect(resolveVersion('4.0.0-rc-3', DEFAULT_MAVEN_VERSION)).toBe('4.0.0-rc-3');
        expect(resolveVersion('', DEFAULT_MAVEN_VERSION)).toBe(DEFAULT_MAVEN_VERSION);
        expect(resolveVersion('latest', DEFAULT_MAVEN_VERSION)).toBe(DEFAULT_MAVEN_VERSION);
        expect(resolveVersion('9; rm -rf /', DEFAULT_GRADLE_VERSION)).toBe(DEFAULT_GRADLE_VERSION);
    });

    it('Maven and Gradle manual entries name their required JDK version', () => {
        expect(DEV_ENV_CATALOG.maven.managersByOS.macos.find((e) => e.managerId === 'manual')!.notes).toContain(
            'JDK 8+',
        );
        expect(DEV_ENV_CATALOG.gradle.managersByOS.macos.find((e) => e.managerId === 'manual')!.notes).toContain(
            'JDK 17+',
        );
    });

    it('every Go install method configures $GOPATH/bin (or GOBIN) on PATH, with no exceptions', () => {
        for (const os of OSES) {
            for (const entry of allEntriesFor(os, DEV_ENV_CATALOG.go)) {
                expect(entry.configure).toBeTruthy();
                if (os === 'windows') {
                    expect(entry.configure).toContain('GOPATH');
                } else {
                    expect(entry.configure).toContain('go env GOPATH');
                }
            }
        }
    });
});
