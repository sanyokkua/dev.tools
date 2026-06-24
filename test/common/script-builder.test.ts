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
            debian: [
                {
                    manager: 'snap',
                    id: 'snaponly',
                    install: 'sudo snap install snaponly',
                    // no update, no remove
                },
            ],
            fedora: [{ manager: 'snap', id: 'snaponly', install: 'sudo snap install snaponly' }],
            arch: [{ manager: 'snap', id: 'snaponly', install: 'sudo snap install snaponly' }],
            suse: [{ manager: 'snap', id: 'snaponly', install: 'sudo snap install snaponly' }],
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

const INSTALL_ONLY_PARAMETERIZED: CatalogApp = {
    id: 'install-only-param',
    name: 'InstallOnlyParam',
    category: 'test',
    description: 'Parameterized app with install-only method (no update/remove)',
    parameterized: true,
    versions: ['1', '2'],
    platforms: { macos: true, windows: false, linux: false },
    methods: {
        macos: [
            {
                manager: 'brew',
                id: 'foo@{version}',
                install: 'brew install foo@{version}',
                // deliberately no update or remove
            },
        ],
    },
};

// Fixture with explicit upgrade command (brew cask greedy semantics)
const CHROME_BREW_CASK: CatalogApp = {
    id: 'google-chrome',
    name: 'Google Chrome',
    category: 'browsers',
    description: 'Web browser from Google',
    platforms: { macos: true, windows: false, linux: false },
    methods: {
        macos: [
            {
                manager: 'brew',
                id: 'google-chrome',
                kind: 'cask',
                install: 'brew install --cask google-chrome',
                update: 'brew upgrade --cask google-chrome',
                upgrade: 'brew upgrade --greedy --cask google-chrome',
                remove: 'brew uninstall --cask google-chrome',
            },
        ],
    },
};

// Fixture with explicit upgrade command (apt full-upgrade semantics)
const CURL_APT: CatalogApp = {
    id: 'curl',
    name: 'curl',
    category: 'tools',
    description: 'Command-line HTTP tool',
    platforms: { macos: false, windows: false, linux: true },
    methods: {
        linux: {
            debian: [
                {
                    manager: 'apt',
                    id: 'curl',
                    install: 'sudo apt install -y curl',
                    update: 'sudo apt update && sudo apt upgrade curl',
                    upgrade: 'sudo apt update && sudo apt full-upgrade curl',
                    remove: 'sudo apt remove curl',
                },
            ],
        },
    },
};

// Fixture for manager with no upgrade distinction (winget falls back to update)
const WINGET_APP: CatalogApp = {
    id: 'notepad-plus-plus',
    name: 'Notepad++',
    category: 'editors',
    description: 'Text editor',
    platforms: { macos: false, windows: true, linux: false },
    methods: {
        windows: [
            {
                manager: 'winget',
                id: 'Notepad.Notepad++',
                install: 'winget install --id Notepad.Notepad++ -e',
                update: 'winget upgrade --id Notepad.Notepad++ -e',
                remove: 'winget uninstall --id Notepad.Notepad++ -e',
                // no upgrade key — should fall back to update
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
            const config: BuilderConfig = { ...macosConfig, selectedVersions: { corretto: ['17'] } };
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
        const installOnly = SNAP_ONLY_APP.methods.linux!.debian![0];
        expect(getCommand(installOnly, 'update')).toBeNull();
    });

    it('returns null for remove when method has none', () => {
        const installOnly = SNAP_ONLY_APP.methods.linux!.debian![0];
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
            expect(getCommand(correttoBrewMethod, 'install')).toBe('brew install --cask corretto@{version}');
        });
    });
});

// ─── upgrade action ───────────────────────────────────────────────────────────

describe('upgrade action', () => {
    describe('getCommand with upgrade semantics', () => {
        it('returns explicit upgrade command for brew cask (greedy)', () => {
            const method = CHROME_BREW_CASK.methods.macos![0];
            expect(getCommand(method, 'upgrade')).toBe('brew upgrade --greedy --cask google-chrome');
        });

        it('returns explicit upgrade command for apt (full-upgrade)', () => {
            const method = CURL_APT.methods.linux!.debian![0];
            expect(getCommand(method, 'upgrade')).toBe('sudo apt update && sudo apt full-upgrade curl');
        });

        it('falls back to update when no explicit upgrade key (winget/no-distinction manager)', () => {
            const method = WINGET_APP.methods.windows![0];
            expect(getCommand(method, 'upgrade')).toBe('winget upgrade --id Notepad.Notepad++ -e');
        });

        it('returns null when both upgrade and update are absent', () => {
            const installOnly = SNAP_ONLY_APP.methods.linux!.debian![0];
            expect(getCommand(installOnly, 'upgrade')).toBeNull();
        });
    });

    describe('buildCombinedScript with upgrade action', () => {
        it('uses greedy brew upgrade command for cask app', () => {
            const script = buildCombinedScript([CHROME_BREW_CASK], 'upgrade', macosConfig);
            expect(script).toContain('brew upgrade --greedy --cask google-chrome');
        });

        it('uses apt full-upgrade command for apt app', () => {
            const config: BuilderConfig = {
                platform: 'linux',
                linuxDistro: 'debian',
                managers: ['apt'],
                overrides: {},
                fallbackMode: 'preferred-only',
                selectedVersions: {},
            };
            const script = buildCombinedScript([CURL_APT], 'upgrade', config);
            expect(script).toContain('apt full-upgrade curl');
        });

        it('falls back to update command for winget (no upgrade distinction)', () => {
            const config: BuilderConfig = {
                platform: 'windows',
                managers: ['winget'],
                overrides: {},
                fallbackMode: 'preferred-only',
                selectedVersions: {},
            };
            const script = buildCombinedScript([WINGET_APP], 'upgrade', config);
            expect(script).toContain('winget upgrade --id Notepad.Notepad++ -e');
        });

        it('emits skip comment when both upgrade and update are absent', () => {
            const config: BuilderConfig = {
                platform: 'linux',
                linuxDistro: 'debian',
                managers: ['snap'],
                overrides: {},
                fallbackMode: 'preferred-only',
                selectedVersions: {},
            };
            const script = buildCombinedScript([SNAP_ONLY_APP], 'upgrade', config);
            expect(script).toContain('# SnapOnly: no upgrade command — skipped');
        });
    });

    describe('buildPerAppScripts with upgrade action', () => {
        it('includes greedy upgrade command for brew cask', () => {
            const result = buildPerAppScripts([CHROME_BREW_CASK], 'upgrade', macosConfig);
            expect(result).toHaveProperty('google-chrome');
            expect(result['google-chrome']).toContain('brew upgrade --greedy --cask google-chrome');
        });

        it('emits bare command only (no shebang, no header) for upgrade action', () => {
            const result = buildPerAppScripts([CHROME_BREW_CASK], 'upgrade', macosConfig);
            expect(result['google-chrome']).toBe('brew upgrade --greedy --cask google-chrome');
        });

        it('omits key when both upgrade and update are absent', () => {
            const config: BuilderConfig = {
                platform: 'linux',
                linuxDistro: 'debian',
                managers: ['snap'],
                overrides: {},
                fallbackMode: 'preferred-only',
                selectedVersions: {},
            };
            const result = buildPerAppScripts([SNAP_ONLY_APP], 'upgrade', config);
            expect(result).not.toHaveProperty('snap-only');
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

        it('emits try/catch block with Write-Host for install', () => {
            const script = buildCombinedScript([FIREFOX], 'install', windowsConfig);
            expect(script).toContain('try { Write-Host "▶ install Firefox"; winget install --id Mozilla.Firefox -e;');
        });

        it('emits try/catch block with Write-Host for update', () => {
            const script = buildCombinedScript([FIREFOX], 'update', windowsConfig);
            expect(script).toContain('try { Write-Host "▶ update Firefox"; winget upgrade --id Mozilla.Firefox -e;');
        });

        it('emits try/catch block with Write-Host for remove', () => {
            const script = buildCombinedScript([FIREFOX], 'remove', windowsConfig);
            expect(script).toContain('try { Write-Host "▶ remove Firefox"; winget uninstall --id Mozilla.Firefox -e;');
        });

        it('increments $ok on success via try block', () => {
            const script = buildCombinedScript([FIREFOX], 'install', windowsConfig);
            expect(script).toContain('$ok++');
        });

        it('increments $fail on failure via catch block', () => {
            const script = buildCombinedScript([FIREFOX], 'install', windowsConfig);
            expect(script).toContain('$fail++');
        });

        it('includes error message in catch block', () => {
            const script = buildCombinedScript([FIREFOX], 'install', windowsConfig);
            expect(script).toContain('catch { Write-Host "✖ Firefox failed: $_"');
        });

        it('throws on non-zero $LASTEXITCODE', () => {
            const script = buildCombinedScript([FIREFOX], 'install', windowsConfig);
            expect(script).toContain('if ($LASTEXITCODE -ne 0) { throw "exit $LASTEXITCODE" }');
        });

        it('ends with success/failure summary', () => {
            const script = buildCombinedScript([FIREFOX], 'install', windowsConfig);
            expect(script).toContain('Write-Host "✔ $ok ok / ✖ $fail failed"');
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
                linuxDistro: 'debian',
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
            const config: BuilderConfig = { ...macosConfig, selectedVersions: { corretto: ['17'] } };
            const script = buildCombinedScript([CORRETTO], 'install', config);
            expect(script).toContain('brew install --cask corretto@17');
            expect(script).not.toContain('{version}');
        });

        it('substitutes version in combined .ps1 script', () => {
            const config: BuilderConfig = { ...windowsConfig, selectedVersions: { corretto: ['21'] } };
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
                linuxDistro: 'debian',
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
        it('does NOT include bash shebang', () => {
            const result = buildPerAppScripts([FIREFOX], 'install', macosConfig);
            expect(result['firefox']).not.toContain('#!/usr/bin/env bash');
        });

        it('does NOT include filename header comment', () => {
            const result = buildPerAppScripts([FIREFOX], 'install', macosConfig);
            expect(result['firefox']).not.toContain('#');
        });

        it('is exactly the bare install command', () => {
            const result = buildPerAppScripts([FIREFOX], 'install', macosConfig);
            expect(result['firefox']).toBe('brew install --cask firefox');
        });

        it('is exactly the bare update command', () => {
            const result = buildPerAppScripts([FIREFOX], 'update', macosConfig);
            expect(result['firefox']).toBe('brew upgrade --cask firefox');
        });

        it('is exactly the bare remove command', () => {
            const result = buildPerAppScripts([FIREFOX], 'remove', macosConfig);
            expect(result['firefox']).toBe('brew uninstall --cask firefox');
        });
    });

    describe('.ps1 script content', () => {
        it('does NOT include bash shebang', () => {
            const result = buildPerAppScripts([FIREFOX], 'install', windowsConfig);
            expect(result['firefox']).not.toContain('#!/usr/bin/env bash');
        });

        it('does NOT include filename header comment', () => {
            const result = buildPerAppScripts([FIREFOX], 'install', windowsConfig);
            expect(result['firefox']).not.toContain('#');
        });

        it('is exactly the bare winget install command', () => {
            const result = buildPerAppScripts([FIREFOX], 'install', windowsConfig);
            expect(result['firefox']).toBe('winget install --id Mozilla.Firefox -e');
        });
    });

    describe('three actions × both scopes', () => {
        it.each([
            ['install', 'brew install --cask firefox'],
            ['update', 'brew upgrade --cask firefox'],
            ['remove', 'brew uninstall --cask firefox'],
        ] as [ScriptAction, string][])('per-app .sh emits bare command for action=%s', (action, expected) => {
            const result = buildPerAppScripts([FIREFOX], action, macosConfig);
            expect(result['firefox']).toBe(expected);
            expect(result['firefox']).not.toContain('#');
        });

        it.each([
            ['install', 'winget install --id Mozilla.Firefox -e'],
            ['update', 'winget upgrade --id Mozilla.Firefox -e'],
            ['remove', 'winget uninstall --id Mozilla.Firefox -e'],
        ] as [ScriptAction, string][])('per-app .ps1 emits bare command for action=%s', (action, expected) => {
            const result = buildPerAppScripts([FIREFOX], action, windowsConfig);
            expect(result['firefox']).toBe(expected);
            expect(result['firefox']).not.toContain('#');
        });
    });

    describe('parameterized version substitution', () => {
        it('substitutes {version} in per-app .sh', () => {
            const config: BuilderConfig = { ...macosConfig, selectedVersions: { corretto: ['17'] } };
            const result = buildPerAppScripts([CORRETTO], 'install', config);
            expect(result['corretto']).toContain('brew install --cask corretto@17');
            expect(result['corretto']).not.toContain('{version}');
        });

        it('uses the exact selected version (not default)', () => {
            const config: BuilderConfig = { ...macosConfig, selectedVersions: { corretto: ['21'] } };
            const result = buildPerAppScripts([CORRETTO], 'install', config);
            expect(result['corretto']).toContain('corretto@21');
        });

        it('substitutes {version} in per-app .ps1', () => {
            const config: BuilderConfig = { ...windowsConfig, selectedVersions: { corretto: ['11'] } };
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

// ─── Multi-version parameterized apps ────────────────────────────────────────

describe('multi-version parameterized apps', () => {
    describe('resolveManager with version arrays', () => {
        it('returns null when versions array is empty', () => {
            expect(resolveManager(CORRETTO, { ...macosConfig, selectedVersions: { corretto: [] } })).toBeNull();
        });

        it('returns manager when multiple versions are selected', () => {
            const config: BuilderConfig = { ...macosConfig, selectedVersions: { corretto: ['11', '17', '21'] } };
            expect(resolveManager(CORRETTO, config)).toBe('brew');
        });
    });

    describe('buildCombinedScript multi-version', () => {
        it('emits one run_task per selected version', () => {
            const config: BuilderConfig = { ...macosConfig, selectedVersions: { corretto: ['11', '17', '21'] } };
            const script = buildCombinedScript([CORRETTO], 'install', config);
            expect(script).toContain('corretto@11');
            expect(script).toContain('corretto@17');
            expect(script).toContain('corretto@21');
        });

        it('emits exactly N run_task lines for N versions', () => {
            const config: BuilderConfig = { ...macosConfig, selectedVersions: { corretto: ['17', '21'] } };
            const script = buildCombinedScript([CORRETTO], 'install', config);
            const matches = script.match(/run_task "install Amazon Corretto \d+/g) ?? [];
            expect(matches).toHaveLength(2);
        });

        it('emits skip comment when version array is empty', () => {
            const config: BuilderConfig = { ...macosConfig, selectedVersions: { corretto: [] } };
            const script = buildCombinedScript([CORRETTO], 'install', config);
            expect(script).toContain('no version selected — skipped');
            expect(script).not.toContain('run_task "');
        });

        it('substitutes version correctly in each emitted command', () => {
            const config: BuilderConfig = { ...macosConfig, selectedVersions: { corretto: ['8', '11'] } };
            const script = buildCombinedScript([CORRETTO], 'install', config);
            expect(script).toContain('brew install --cask corretto@8');
            expect(script).toContain('brew install --cask corretto@11');
            expect(script).not.toContain('{version}');
        });

        it('update action emits upgrade commands for all versions', () => {
            const config: BuilderConfig = { ...macosConfig, selectedVersions: { corretto: ['17', '21'] } };
            const script = buildCombinedScript([CORRETTO], 'update', config);
            expect(script).toContain('brew upgrade --cask corretto@17');
            expect(script).toContain('brew upgrade --cask corretto@21');
        });

        it('remove action emits uninstall commands for all versions', () => {
            const config: BuilderConfig = { ...macosConfig, selectedVersions: { corretto: ['17', '21'] } };
            const script = buildCombinedScript([CORRETTO], 'remove', config);
            expect(script).toContain('brew uninstall --cask corretto@17');
            expect(script).toContain('brew uninstall --cask corretto@21');
        });

        it('emits per-version skip comment when action command is missing for a version', () => {
            const config: BuilderConfig = { ...macosConfig, selectedVersions: { 'install-only-param': ['1', '2'] } };
            const script = buildCombinedScript([INSTALL_ONLY_PARAMETERIZED], 'update', config);
            expect(script).toContain('# InstallOnlyParam 1: no update command — skipped');
            expect(script).toContain('# InstallOnlyParam 2: no update command — skipped');
            expect(script).not.toContain('run_task "');
        });
    });

    describe('buildPerAppScripts multi-version', () => {
        it('includes all version commands in one per-app script', () => {
            const config: BuilderConfig = { ...macosConfig, selectedVersions: { corretto: ['11', '17'] } };
            const result = buildPerAppScripts([CORRETTO], 'install', config);
            expect(result).toHaveProperty('corretto');
            expect(result['corretto']).toContain('corretto@11');
            expect(result['corretto']).toContain('corretto@17');
        });

        it('omits key when version array is empty', () => {
            const config: BuilderConfig = { ...macosConfig, selectedVersions: { corretto: [] } };
            const result = buildPerAppScripts([CORRETTO], 'install', config);
            expect(result).not.toHaveProperty('corretto');
        });

        it('single-version per-app script still works', () => {
            const config: BuilderConfig = { ...macosConfig, selectedVersions: { corretto: ['21'] } };
            const result = buildPerAppScripts([CORRETTO], 'install', config);
            expect(result['corretto']).toContain('corretto@21');
            expect(result['corretto']).not.toContain('{version}');
        });

        it('multi-version Windows ps1 script contains all commands', () => {
            const config: BuilderConfig = { ...windowsConfig, selectedVersions: { corretto: ['17', '21'] } };
            const result = buildPerAppScripts([CORRETTO], 'install', config);
            expect(result['corretto']).toContain('Amazon.Corretto.17.JDK');
            expect(result['corretto']).toContain('Amazon.Corretto.21.JDK');
        });
    });
});

// ─── Universal-merged flatpak/snap/appimage on distro families ───────────────

const FLATPAK_ONLY_APP: CatalogApp = {
    id: 'flatpak-app',
    name: 'FlatpakApp',
    category: 'test',
    description: 'App available only via Flatpak (was universal-only)',
    platforms: { macos: false, windows: false, linux: true },
    methods: {
        linux: {
            debian: [
                {
                    manager: 'flatpak',
                    id: 'org.example.FlatpakApp',
                    install: 'flatpak install -y flathub org.example.FlatpakApp',
                },
            ],
            fedora: [
                {
                    manager: 'flatpak',
                    id: 'org.example.FlatpakApp',
                    install: 'flatpak install -y flathub org.example.FlatpakApp',
                },
            ],
            arch: [
                {
                    manager: 'flatpak',
                    id: 'org.example.FlatpakApp',
                    install: 'flatpak install -y flathub org.example.FlatpakApp',
                },
            ],
            suse: [
                {
                    manager: 'flatpak',
                    id: 'org.example.FlatpakApp',
                    install: 'flatpak install -y flathub org.example.FlatpakApp',
                },
            ],
        },
    },
};

const APPIMAGE_ONLY_APP: CatalogApp = {
    id: 'appimage-app',
    name: 'AppImageApp',
    category: 'test',
    description: 'App available only via AppImage (install-only, no update/remove)',
    platforms: { macos: false, windows: false, linux: true },
    methods: {
        linux: {
            debian: [
                {
                    manager: 'appimage',
                    id: 'appimageapp',
                    install:
                        'wget -O ~/Apps/appimageapp.AppImage https://example.com/app.AppImage && chmod +x ~/Apps/appimageapp.AppImage',
                },
            ],
            fedora: [
                {
                    manager: 'appimage',
                    id: 'appimageapp',
                    install:
                        'wget -O ~/Apps/appimageapp.AppImage https://example.com/app.AppImage && chmod +x ~/Apps/appimageapp.AppImage',
                },
            ],
            arch: [
                {
                    manager: 'appimage',
                    id: 'appimageapp',
                    install:
                        'wget -O ~/Apps/appimageapp.AppImage https://example.com/app.AppImage && chmod +x ~/Apps/appimageapp.AppImage',
                },
            ],
            suse: [
                {
                    manager: 'appimage',
                    id: 'appimageapp',
                    install:
                        'wget -O ~/Apps/appimageapp.AppImage https://example.com/app.AppImage && chmod +x ~/Apps/appimageapp.AppImage',
                },
            ],
        },
    },
};

describe('universal-merged managers on distro families', () => {
    describe('flatpak on debian (formerly universal-only)', () => {
        it('resolves flatpak on debian when flatpak is in the preferred manager list', () => {
            const config: BuilderConfig = {
                platform: 'linux',
                linuxDistro: 'debian',
                managers: ['apt', 'flatpak'],
                overrides: {},
                fallbackMode: 'preferred-only',
                selectedVersions: {},
            };
            expect(resolveManager(FLATPAK_ONLY_APP, config)).toBe('flatpak');
        });

        it('emits flatpak install command on debian via buildCombinedScript', () => {
            const config: BuilderConfig = {
                platform: 'linux',
                linuxDistro: 'debian',
                managers: ['flatpak'],
                overrides: {},
                fallbackMode: 'preferred-only',
                selectedVersions: {},
            };
            const script = buildCombinedScript([FLATPAK_ONLY_APP], 'install', config);
            expect(script).toContain('flatpak install -y flathub org.example.FlatpakApp');
        });

        it('resolves flatpak on fedora', () => {
            const config: BuilderConfig = {
                platform: 'linux',
                linuxDistro: 'fedora',
                managers: ['dnf', 'flatpak'],
                overrides: {},
                fallbackMode: 'preferred-only',
                selectedVersions: {},
            };
            expect(resolveManager(FLATPAK_ONLY_APP, config)).toBe('flatpak');
        });

        it('resolves flatpak on arch', () => {
            const config: BuilderConfig = {
                platform: 'linux',
                linuxDistro: 'arch',
                managers: ['pacman', 'flatpak'],
                overrides: {},
                fallbackMode: 'preferred-only',
                selectedVersions: {},
            };
            expect(resolveManager(FLATPAK_ONLY_APP, config)).toBe('flatpak');
        });

        it('resolves flatpak on suse', () => {
            const config: BuilderConfig = {
                platform: 'linux',
                linuxDistro: 'suse',
                managers: ['zypper', 'flatpak'],
                overrides: {},
                fallbackMode: 'preferred-only',
                selectedVersions: {},
            };
            expect(resolveManager(FLATPAK_ONLY_APP, config)).toBe('flatpak');
        });
    });

    describe('appimage (install-only) on distro families', () => {
        it('resolves appimage on debian', () => {
            const config: BuilderConfig = {
                platform: 'linux',
                linuxDistro: 'debian',
                managers: ['appimage'],
                overrides: {},
                fallbackMode: 'preferred-only',
                selectedVersions: {},
            };
            expect(resolveManager(APPIMAGE_ONLY_APP, config)).toBe('appimage');
        });

        it('emits install command for appimage', () => {
            const config: BuilderConfig = {
                platform: 'linux',
                linuxDistro: 'debian',
                managers: ['appimage'],
                overrides: {},
                fallbackMode: 'preferred-only',
                selectedVersions: {},
            };
            const script = buildCombinedScript([APPIMAGE_ONLY_APP], 'install', config);
            expect(script).toContain('wget -O ~/Apps/appimageapp.AppImage');
        });

        it('emits skip comment for appimage update (no update key)', () => {
            const config: BuilderConfig = {
                platform: 'linux',
                linuxDistro: 'debian',
                managers: ['appimage'],
                overrides: {},
                fallbackMode: 'preferred-only',
                selectedVersions: {},
            };
            const script = buildCombinedScript([APPIMAGE_ONLY_APP], 'update', config);
            expect(script).toContain('# AppImageApp: no update command — skipped');
        });

        it('emits skip comment for appimage remove (no remove key)', () => {
            const config: BuilderConfig = {
                platform: 'linux',
                linuxDistro: 'debian',
                managers: ['appimage'],
                overrides: {},
                fallbackMode: 'preferred-only',
                selectedVersions: {},
            };
            const script = buildCombinedScript([APPIMAGE_ONLY_APP], 'remove', config);
            expect(script).toContain('# AppImageApp: no remove command — skipped');
        });
    });
});
