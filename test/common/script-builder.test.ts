import type { CatalogApp } from '@/common/apps-catalog-types';
import type { BuilderConfig, ScriptAction } from '@/common/script-builder';
import { buildCombinedScript, buildPerAppScripts, getCommand, resolveManager } from '@/common/script-builder';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const FIREFOX: CatalogApp = {
    id: 'firefox',
    name: 'Firefox',
    category: 'browsers',
    description: 'Web browser',
    platforms: { macos: true, windows: true, linux: true },
    methods: {
        macos: [
            {
                manager: 'brew',
                id: 'firefox',
                kind: 'cask',
                install: 'brew install --cask firefox',
                update: 'brew upgrade --cask firefox',
                remove: 'brew uninstall --cask firefox',
            },
        ],
        windows: [
            {
                manager: 'winget',
                id: 'Mozilla.Firefox',
                install: 'winget install --id Mozilla.Firefox -e',
                update: 'winget upgrade --id Mozilla.Firefox -e',
                remove: 'winget uninstall --id Mozilla.Firefox -e',
            },
            {
                manager: 'choco',
                id: 'firefox',
                install: 'choco install firefox -y',
                update: 'choco upgrade firefox -y',
                remove: 'choco uninstall firefox -y',
            },
        ],
        linux: {
            debian: [
                {
                    manager: 'apt',
                    id: 'firefox',
                    install: 'sudo apt install -y firefox',
                    update: 'sudo apt upgrade firefox',
                    remove: 'sudo apt remove firefox',
                },
            ],
            fedora: [
                {
                    manager: 'dnf',
                    id: 'firefox',
                    install: 'sudo dnf install -y firefox',
                    update: 'sudo dnf upgrade firefox',
                    remove: 'sudo dnf remove firefox',
                },
            ],
        },
    },
};

const DUAL_MANAGER_APP: CatalogApp = {
    id: 'dual',
    name: 'Dual',
    category: 'test',
    description: 'App with two macOS managers',
    platforms: { macos: true, windows: false, linux: false },
    methods: {
        macos: [
            {
                manager: 'mas',
                id: '123456',
                install: 'mas install 123456',
                update: 'mas upgrade 123456',
                remove: 'mas uninstall 123456',
            },
            {
                manager: 'brew',
                id: 'dual',
                kind: 'cask',
                install: 'brew install --cask dual',
                update: 'brew upgrade --cask dual',
                remove: 'brew uninstall --cask dual',
            },
        ],
    },
};

const MACOS_ONLY_APP: CatalogApp = {
    id: 'iina',
    name: 'IINA',
    category: 'media',
    description: 'macOS video player',
    platforms: { macos: true, windows: false, linux: false },
    methods: {
        macos: [
            {
                manager: 'brew',
                id: 'iina',
                kind: 'cask',
                install: 'brew install --cask iina',
                update: 'brew upgrade --cask iina',
                remove: 'brew uninstall --cask iina',
            },
        ],
    },
};

const SNAP_ONLY_APP: CatalogApp = {
    id: 'snap-only',
    name: 'SnapOnly',
    category: 'test',
    description: 'Install-only app via snap',
    platforms: { macos: false, windows: false, linux: true },
    methods: {
        linux: {
            universal: [
                {
                    manager: 'snap',
                    id: 'snaponly',
                    install: 'sudo snap install snaponly',
                    // no update, no remove
                },
            ],
        },
    },
};

const CORRETTO: CatalogApp = {
    id: 'corretto',
    name: 'Amazon Corretto',
    category: 'runtimes',
    description: 'OpenJDK distribution',
    parameterized: true,
    versions: ['11', '17', '21'],
    platforms: { macos: true, windows: true, linux: false },
    methods: {
        macos: [
            {
                manager: 'brew',
                id: 'corretto@{version}',
                kind: 'cask',
                install: 'brew install --cask corretto@{version}',
                update: 'brew upgrade --cask corretto@{version}',
                remove: 'brew uninstall --cask corretto@{version}',
            },
        ],
        windows: [
            {
                manager: 'winget',
                id: 'Amazon.Corretto.{version}.JDK',
                install: 'winget install --id Amazon.Corretto.{version}.JDK -e',
                update: 'winget upgrade --id Amazon.Corretto.{version}.JDK -e',
                remove: 'winget uninstall --id Amazon.Corretto.{version}.JDK -e',
            },
        ],
    },
};

// ─── Base configs ─────────────────────────────────────────────────────────────

const macosConfig: BuilderConfig = {
    platform: 'macos',
    managers: ['brew', 'mas'],
    overrides: {},
    fallbackMode: 'preferred-only',
    selectedVersions: {},
};

const windowsConfig: BuilderConfig = {
    platform: 'windows',
    managers: ['winget', 'choco'],
    overrides: {},
    fallbackMode: 'preferred-only',
    selectedVersions: {},
};

const linuxDebianConfig: BuilderConfig = {
    platform: 'linux',
    linuxDistro: 'debian',
    managers: ['apt'],
    overrides: {},
    fallbackMode: 'preferred-only',
    selectedVersions: {},
};

// ─── resolveManager ───────────────────────────────────────────────────────────

describe('resolveManager', () => {
    describe('platform guard', () => {
        it('returns null when app has no build for the current platform', () => {
            expect(resolveManager(MACOS_ONLY_APP, windowsConfig)).toBeNull();
        });

        it('returns null when linux distro has no methods array', () => {
            const config: BuilderConfig = {
                platform: 'linux',
                linuxDistro: 'arch',
                managers: ['pacman'],
                overrides: {},
                fallbackMode: 'preferred-only',
                selectedVersions: {},
            };
            expect(resolveManager(FIREFOX, config)).toBeNull();
        });

        it('throws when platform is linux but linuxDistro is missing', () => {
            const config: BuilderConfig = {
                platform: 'linux',
                managers: ['apt'],
                overrides: {},
                fallbackMode: 'preferred-only',
                selectedVersions: {},
            };
            expect(() => resolveManager(FIREFOX, config)).toThrow('linuxDistro is required when platform is linux');
        });
    });

    describe('preferred-only skip', () => {
        it('returns null when no preferred manager has a method and fallback is off', () => {
            const config: BuilderConfig = {
                ...macosConfig,
                managers: ['winget', 'choco'],
                fallbackMode: 'preferred-only',
            };
            expect(resolveManager(FIREFOX, config)).toBeNull();
        });

        it('returns null when preferred manager list is empty', () => {
            const config: BuilderConfig = { ...macosConfig, managers: [], fallbackMode: 'preferred-only' };
            expect(resolveManager(FIREFOX, config)).toBeNull();
        });

        it('picks the first preferred manager that has a method (order matters)', () => {
            const config: BuilderConfig = { ...macosConfig, managers: ['mas', 'brew'], fallbackMode: 'preferred-only' };
            expect(resolveManager(DUAL_MANAGER_APP, config)).toBe('mas');
        });
    });

    describe('fallback pick', () => {
        it('returns first available manager when none in preferred list match', () => {
            const config: BuilderConfig = { ...macosConfig, managers: ['winget'], fallbackMode: 'fallback' };
            expect(resolveManager(FIREFOX, config)).toBe('brew');
        });

        it('still prefers the priority list before falling back', () => {
            const config: BuilderConfig = { ...macosConfig, managers: ['mas'], fallbackMode: 'fallback' };
            expect(resolveManager(DUAL_MANAGER_APP, config)).toBe('mas');
        });
    });

    describe('per-app override', () => {
        it('override wins over preferred manager priority', () => {
            const config: BuilderConfig = { ...macosConfig, managers: ['brew'], overrides: { dual: 'mas' } };
            expect(resolveManager(DUAL_MANAGER_APP, config)).toBe('mas');
        });

        it('ignores override when override manager has no method for this app', () => {
            const config: BuilderConfig = { ...macosConfig, managers: ['brew'], overrides: { firefox: 'mas' } };
            expect(resolveManager(FIREFOX, config)).toBe('brew');
        });
    });

    describe('parameterized version guard', () => {
        it('returns null when app is parameterized and no version is selected', () => {
            expect(resolveManager(CORRETTO, { ...macosConfig, selectedVersions: {} })).toBeNull();
        });

        it('returns the manager when a version is selected', () => {
            const config: BuilderConfig = { ...macosConfig, selectedVersions: { corretto: '17' } };
            expect(resolveManager(CORRETTO, config)).toBe('brew');
        });
    });

    describe('linux distro routing', () => {
        it('resolves to apt for debian distro', () => {
            expect(resolveManager(FIREFOX, linuxDebianConfig)).toBe('apt');
        });

        it('resolves to dnf for fedora distro', () => {
            const config: BuilderConfig = {
                platform: 'linux',
                linuxDistro: 'fedora',
                managers: ['dnf'],
                overrides: {},
                fallbackMode: 'preferred-only',
                selectedVersions: {},
            };
            expect(resolveManager(FIREFOX, config)).toBe('dnf');
        });
    });
});

// ─── getCommand ───────────────────────────────────────────────────────────────

describe('getCommand', () => {
    const brewMethod = FIREFOX.methods.macos![0];

    it('returns install command', () => {
        expect(getCommand(brewMethod, 'install')).toBe('brew install --cask firefox');
    });

    it('returns update command', () => {
        expect(getCommand(brewMethod, 'update')).toBe('brew upgrade --cask firefox');
    });

    it('returns remove command', () => {
        expect(getCommand(brewMethod, 'remove')).toBe('brew uninstall --cask firefox');
    });

    it('returns null for update when method has none', () => {
        const installOnly = SNAP_ONLY_APP.methods.linux!.universal![0];
        expect(getCommand(installOnly, 'update')).toBeNull();
    });

    it('returns null for remove when method has none', () => {
        const installOnly = SNAP_ONLY_APP.methods.linux!.universal![0];
        expect(getCommand(installOnly, 'remove')).toBeNull();
    });

    describe('parameterized substitution', () => {
        const correttoBrewMethod = CORRETTO.methods.macos![0];

        it('substitutes {version} in install command', () => {
            expect(getCommand(correttoBrewMethod, 'install', '17')).toBe('brew install --cask corretto@17');
        });

        it('substitutes {version} in update command', () => {
            expect(getCommand(correttoBrewMethod, 'update', '21')).toBe('brew upgrade --cask corretto@21');
        });

        it('substitutes {version} in remove command', () => {
            expect(getCommand(correttoBrewMethod, 'remove', '11')).toBe('brew uninstall --cask corretto@11');
        });

        it('substitutes ALL occurrences of {version} (not just the first)', () => {
            const wingetMethod = CORRETTO.methods.windows![0];
            expect(getCommand(wingetMethod, 'install', '17')).toBe('winget install --id Amazon.Corretto.17.JDK -e');
        });

        it('does not substitute when version is undefined', () => {
            expect(getCommand(correttoBrewMethod, 'install', undefined)).toBe('brew install --cask corretto@{version}');
        });
    });
});

// ─── buildCombinedScript ─────────────────────────────────────────────────────

describe('buildCombinedScript', () => {
    describe('.sh format (macOS)', () => {
        it('starts with bash shebang', () => {
            const script = buildCombinedScript([FIREFOX], 'install', macosConfig);
            expect(script.startsWith('#!/usr/bin/env bash')).toBe(true);
        });

        it('includes run_task boilerplate with success/fail counters', () => {
            const script = buildCombinedScript([FIREFOX], 'install', macosConfig);
            expect(script).toContain('set -uo pipefail; SUCCESS=0; FAILED=0');
            expect(script).toContain('run_task(){');
        });

        it('ends with success/failure summary', () => {
            const script = buildCombinedScript([FIREFOX], 'install', macosConfig);
            expect(script).toContain('echo "✔ $SUCCESS ok / ✖ $FAILED failed"');
        });

        it('emits run_task line for install action', () => {
            const script = buildCombinedScript([FIREFOX], 'install', macosConfig);
            expect(script).toContain('run_task "install Firefox (brew)" brew install --cask firefox');
        });

        it('emits run_task line for update action', () => {
            const script = buildCombinedScript([FIREFOX], 'update', macosConfig);
            expect(script).toContain('run_task "update Firefox (brew)" brew upgrade --cask firefox');
        });

        it('emits run_task line for remove action', () => {
            const script = buildCombinedScript([FIREFOX], 'remove', macosConfig);
            expect(script).toContain('run_task "remove Firefox (brew)" brew uninstall --cask firefox');
        });
    });

    describe('.ps1 format (Windows)', () => {
        it('does NOT include bash shebang', () => {
            const script = buildCombinedScript([FIREFOX], 'install', windowsConfig);
            expect(script).not.toContain('#!/usr/bin/env bash');
        });

        it('includes PowerShell counter initializers', () => {
            const script = buildCombinedScript([FIREFOX], 'install', windowsConfig);
            expect(script).toContain('$ok=0;$fail=0');
        });

        it('emits Write-Host line with command for install', () => {
            const script = buildCombinedScript([FIREFOX], 'install', windowsConfig);
            expect(script).toContain('Write-Host "install Firefox"; winget install --id Mozilla.Firefox -e');
        });

        it('emits Write-Host line with command for update', () => {
            const script = buildCombinedScript([FIREFOX], 'update', windowsConfig);
            expect(script).toContain('Write-Host "update Firefox"; winget upgrade --id Mozilla.Firefox -e');
        });

        it('emits Write-Host line with command for remove', () => {
            const script = buildCombinedScript([FIREFOX], 'remove', windowsConfig);
            expect(script).toContain('Write-Host "remove Firefox"; winget uninstall --id Mozilla.Firefox -e');
        });
    });

    describe('skipped apps', () => {
        it('emits platform-skip comment for unsupported platform', () => {
            const script = buildCombinedScript([MACOS_ONLY_APP], 'install', windowsConfig);
            expect(script).toContain('# IINA: no platform build — skipped');
        });

        it('emits no-manager comment in preferred-only mode with no matching manager', () => {
            const config: BuilderConfig = { ...macosConfig, managers: ['winget'], fallbackMode: 'preferred-only' };
            const script = buildCombinedScript([FIREFOX], 'install', config);
            expect(script).toContain('no preferred manager (fallback off) — skipped');
        });

        it('emits no-action-command comment when method lacks update', () => {
            const config: BuilderConfig = {
                platform: 'linux',
                linuxDistro: 'universal',
                managers: ['snap'],
                overrides: {},
                fallbackMode: 'preferred-only',
                selectedVersions: {},
            };
            const script = buildCombinedScript([SNAP_ONLY_APP], 'update', config);
            expect(script).toContain('# SnapOnly: no update command — skipped');
        });

        it('emits no-version comment for parameterized app without selectedVersions entry', () => {
            const script = buildCombinedScript([CORRETTO], 'install', macosConfig);
            expect(script).toContain('no version selected — skipped');
        });
    });

    describe('three actions × sh and ps1', () => {
        it.each(['install', 'update', 'remove'] as ScriptAction[])(
            'generates valid .sh script for macOS action=%s',
            (action) => {
                const script = buildCombinedScript([FIREFOX], action, macosConfig);
                expect(script).toContain('#!/usr/bin/env bash');
                expect(script).toContain(action.toUpperCase());
            },
        );

        it.each(['install', 'update', 'remove'] as ScriptAction[])(
            'generates valid .ps1 script for Windows action=%s',
            (action) => {
                const script = buildCombinedScript([FIREFOX], action, windowsConfig);
                expect(script).not.toContain('#!/usr/bin/env bash');
                expect(script).toContain(action.toUpperCase());
            },
        );
    });

    describe('parameterized version substitution', () => {
        it('substitutes version in combined .sh script', () => {
            const config: BuilderConfig = { ...macosConfig, selectedVersions: { corretto: '17' } };
            const script = buildCombinedScript([CORRETTO], 'install', config);
            expect(script).toContain('brew install --cask corretto@17');
            expect(script).not.toContain('{version}');
        });

        it('substitutes version in combined .ps1 script', () => {
            const config: BuilderConfig = { ...windowsConfig, selectedVersions: { corretto: '21' } };
            const script = buildCombinedScript([CORRETTO], 'install', config);
            expect(script).toContain('winget install --id Amazon.Corretto.21.JDK -e');
            expect(script).not.toContain('{version}');
        });
    });

    describe('mixed apps', () => {
        it('includes command for available app and skip comment for unavailable', () => {
            const script = buildCombinedScript([FIREFOX, MACOS_ONLY_APP], 'install', windowsConfig);
            expect(script).toContain('winget install --id Mozilla.Firefox -e');
            expect(script).toContain('# IINA: no platform build — skipped');
        });
    });
});

// ─── buildPerAppScripts ───────────────────────────────────────────────────────

describe('buildPerAppScripts', () => {
    describe('output record keys', () => {
        it('includes key for successfully resolved app', () => {
            const result = buildPerAppScripts([FIREFOX], 'install', macosConfig);
            expect(result).toHaveProperty('firefox');
        });

        it('omits key for app not available on platform', () => {
            const result = buildPerAppScripts([MACOS_ONLY_APP], 'install', windowsConfig);
            expect(result).not.toHaveProperty('iina');
        });

        it('omits key when no preferred manager matches (preferred-only)', () => {
            const config: BuilderConfig = { ...macosConfig, managers: ['winget'], fallbackMode: 'preferred-only' };
            const result = buildPerAppScripts([FIREFOX], 'install', config);
            expect(result).not.toHaveProperty('firefox');
        });

        it('omits key for parameterized app with no version', () => {
            const result = buildPerAppScripts([CORRETTO], 'install', macosConfig);
            expect(result).not.toHaveProperty('corretto');
        });

        it('omits key when action command is missing from method', () => {
            const config: BuilderConfig = {
                platform: 'linux',
                linuxDistro: 'universal',
                managers: ['snap'],
                overrides: {},
                fallbackMode: 'preferred-only',
                selectedVersions: {},
            };
            const result = buildPerAppScripts([SNAP_ONLY_APP], 'update', config);
            expect(result).not.toHaveProperty('snap-only');
        });
    });

    describe('.sh script content', () => {
        it('starts with bash shebang', () => {
            const result = buildPerAppScripts([FIREFOX], 'install', macosConfig);
            expect(result['firefox']).toContain('#!/usr/bin/env bash');
        });

        it('includes filename header comment for install', () => {
            const result = buildPerAppScripts([FIREFOX], 'install', macosConfig);
            expect(result['firefox']).toContain('# ===== install-firefox.sh =====');
        });

        it('includes filename header comment for update', () => {
            const result = buildPerAppScripts([FIREFOX], 'update', macosConfig);
            expect(result['firefox']).toContain('# ===== update-firefox.sh =====');
        });

        it('includes filename header comment for remove', () => {
            const result = buildPerAppScripts([FIREFOX], 'remove', macosConfig);
            expect(result['firefox']).toContain('# ===== remove-firefox.sh =====');
        });

        it('includes the install command', () => {
            const result = buildPerAppScripts([FIREFOX], 'install', macosConfig);
            expect(result['firefox']).toContain('brew install --cask firefox');
        });
    });

    describe('.ps1 script content', () => {
        it('does NOT include bash shebang', () => {
            const result = buildPerAppScripts([FIREFOX], 'install', windowsConfig);
            expect(result['firefox']).not.toContain('#!/usr/bin/env bash');
        });

        it('includes filename header comment with .ps1 extension', () => {
            const result = buildPerAppScripts([FIREFOX], 'install', windowsConfig);
            expect(result['firefox']).toContain('# ===== install-firefox.ps1 =====');
        });

        it('includes the winget install command', () => {
            const result = buildPerAppScripts([FIREFOX], 'install', windowsConfig);
            expect(result['firefox']).toContain('winget install --id Mozilla.Firefox -e');
        });
    });

    describe('three actions × both scopes', () => {
        it.each(['install', 'update', 'remove'] as ScriptAction[])(
            'per-app .sh returns expected key for action=%s',
            (action) => {
                const result = buildPerAppScripts([FIREFOX], action, macosConfig);
                expect(result['firefox']).toContain(`# ===== ${action}-firefox.sh =====`);
            },
        );

        it.each(['install', 'update', 'remove'] as ScriptAction[])(
            'per-app .ps1 returns expected key for action=%s',
            (action) => {
                const result = buildPerAppScripts([FIREFOX], action, windowsConfig);
                expect(result['firefox']).toContain(`# ===== ${action}-firefox.ps1 =====`);
            },
        );
    });

    describe('parameterized version substitution', () => {
        it('substitutes {version} in per-app .sh', () => {
            const config: BuilderConfig = { ...macosConfig, selectedVersions: { corretto: '17' } };
            const result = buildPerAppScripts([CORRETTO], 'install', config);
            expect(result['corretto']).toContain('brew install --cask corretto@17');
            expect(result['corretto']).not.toContain('{version}');
        });

        it('uses the exact selected version (not default)', () => {
            const config: BuilderConfig = { ...macosConfig, selectedVersions: { corretto: '21' } };
            const result = buildPerAppScripts([CORRETTO], 'install', config);
            expect(result['corretto']).toContain('corretto@21');
        });

        it('substitutes {version} in per-app .ps1', () => {
            const config: BuilderConfig = { ...windowsConfig, selectedVersions: { corretto: '11' } };
            const result = buildPerAppScripts([CORRETTO], 'install', config);
            expect(result['corretto']).toContain('winget install --id Amazon.Corretto.11.JDK -e');
        });
    });

    describe('multiple apps', () => {
        it('returns only resolved apps (skipped are absent)', () => {
            const result = buildPerAppScripts([FIREFOX, MACOS_ONLY_APP], 'install', windowsConfig);
            expect(Object.keys(result)).toHaveLength(1);
            expect(result).toHaveProperty('firefox');
            expect(result).not.toHaveProperty('iina');
        });
    });
});
