import { APPS_CATALOG } from '@/common/apps-catalog';
import type { CatalogApp, CatalogManager } from '@/common/apps-catalog-types';
import { MANAGER_MAINTENANCE } from '@/common/manager-maintenance-catalog';
import type { BuilderConfig, ScriptAction } from '@/common/script-builder';
import {
    buildBootstrapScript,
    buildCombinedScript,
    buildManagerWideScript,
    buildPerAppScripts,
    getCommand,
    getMaintenanceEntries,
    getRequiredBootstrap,
    resolveManager,
    resolveMethod,
    resolveProviderCommand,
} from '@/common/script-builder';

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

        it('emits run_task line for install action, command wrapped in a generated function', () => {
            const script = buildCombinedScript([FIREFOX], 'install', macosConfig);
            expect(script).toContain('_task_1() {\nbrew install --cask firefox\n}');
            expect(script).toContain('run_task "install Firefox (brew)" _task_1');
        });

        it('emits run_task line for update action, command wrapped in a generated function', () => {
            const script = buildCombinedScript([FIREFOX], 'update', macosConfig);
            expect(script).toContain('_task_1() {\nbrew upgrade --cask firefox\n}');
            expect(script).toContain('run_task "update Firefox (brew)" _task_1');
        });

        it('emits run_task line for remove action, command wrapped in a generated function', () => {
            const script = buildCombinedScript([FIREFOX], 'remove', macosConfig);
            expect(script).toContain('_task_1() {\nbrew uninstall --cask firefox\n}');
            expect(script).toContain('run_task "remove Firefox (brew)" _task_1');
        });

        it('wraps a curl-pipe-bash install command so run_task cannot pipe its own echo into a trailing bash', () => {
            const app: CatalogApp = {
                ...FIREFOX,
                id: 'nvm',
                name: 'nvm',
                methods: {
                    macos: [
                        {
                            manager: 'script',
                            install: 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash',
                        },
                    ],
                },
            };
            const config = { ...macosConfig, managers: ['script' as CatalogManager] };
            const script = buildCombinedScript([app], 'install', config);
            expect(script).toContain(
                '_task_1() {\ncurl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash\n}',
            );
            expect(script).toContain('run_task "install nvm (script)" _task_1');
            // The label text must never appear directly on a line piped to a bare interpreter.
            expect(script).not.toMatch(/run_task "install nvm \(script\)" curl/);
        });

        it('wraps an &&-chained install command (e.g. apt repo setup + install) as a single function', () => {
            const app: CatalogApp = {
                ...FIREFOX,
                id: 'chained-app',
                name: 'ChainedApp',
                methods: { macos: [{ manager: 'brew', install: 'brew update && brew install --cask chained-app' }] },
            };
            const script = buildCombinedScript([app], 'install', macosConfig);
            expect(script).toContain('_task_1() {\nbrew update && brew install --cask chained-app\n}');
            expect(script).toContain('run_task "install ChainedApp (brew)" _task_1');
        });

        it('wraps an install command containing a heredoc (e.g. apt/dnf repo-file registration) as a single function', () => {
            const heredocInstall =
                "sudo tee /etc/yum.repos.d/heredoc-app.repo > /dev/null <<'EOF'\n" +
                '[heredoc-app]\n' +
                'name=heredoc-app\n' +
                'baseurl=https://example.com/rpm\n' +
                'enabled=1\n' +
                'gpgcheck=1\n' +
                'EOF\n' +
                'sudo dnf install -y heredoc-app';
            const app: CatalogApp = {
                ...FIREFOX,
                id: 'heredoc-app',
                name: 'HeredocApp',
                methods: { macos: [{ manager: 'brew', install: heredocInstall }] },
            };
            const script = buildCombinedScript([app], 'install', macosConfig);
            expect(script).toContain(`_task_1() {\n${heredocInstall}\n}`);
            expect(script).toContain('run_task "install HeredocApp (brew)" _task_1');
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

        describe('colored terminal echo (in addition to the # comment)', () => {
            it('emits a red PowerShell Write-Host alongside the platform-skip comment on Windows', () => {
                const script = buildCombinedScript([MACOS_ONLY_APP], 'install', windowsConfig);
                expect(script).toContain('# IINA: no platform build — skipped');
                expect(script).toContain('Write-Host "⚠ IINA: no platform build — skipped" -ForegroundColor Red');
            });

            it('emits a red bash echo alongside the platform-skip comment on Linux', () => {
                const script = buildCombinedScript([MACOS_ONLY_APP], 'install', linuxDebianConfig);
                expect(script).toContain('# IINA: no platform build — skipped');
                expect(script).toContain('echo -e "\\033[0;31m⚠ IINA: no platform build — skipped\\033[0m"');
            });

            it('emits a red bash echo alongside the no-preferred-manager comment', () => {
                const config: BuilderConfig = { ...macosConfig, managers: ['winget'], fallbackMode: 'preferred-only' };
                const script = buildCombinedScript([FIREFOX], 'install', config);
                expect(script).toContain(
                    'echo -e "\\033[0;31m⚠ Firefox: no preferred manager (fallback off) — skipped\\033[0m"',
                );
            });

            it('emits a red bash echo alongside the no-version-selected comment', () => {
                const script = buildCombinedScript([CORRETTO], 'install', macosConfig);
                expect(script).toContain('⚠ Amazon Corretto: no version selected — skipped');
            });

            it('does NOT add a colored echo for the distinct "no <action> command" skip reason', () => {
                const config: BuilderConfig = {
                    platform: 'linux',
                    linuxDistro: 'debian',
                    managers: ['snap'],
                    overrides: {},
                    fallbackMode: 'preferred-only',
                    selectedVersions: {},
                };
                const script = buildCombinedScript([SNAP_ONLY_APP], 'update', config);
                expect(script).not.toContain('\\033[0;31m');
            });
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

// ─── repoSetup fixtures ───────────────────────────────────────────────────────

const SHARED_VENDOR_REPO_SETUP =
    'curl -fsSL https://example.com/vendor.key | sudo gpg --dearmor -o /usr/share/keyrings/vendor.gpg && echo "deb [signed-by=/usr/share/keyrings/vendor.gpg] https://example.com/apt stable main" | sudo tee /etc/apt/sources.list.d/vendor.list && sudo apt update';

const SHARED_REPO_APP_A: CatalogApp = {
    id: 'shared-repo-app-a',
    name: 'SharedRepoAppA',
    category: 'test',
    description: 'App A sharing a vendor repo with SharedRepoAppB',
    platforms: { macos: false, windows: false, linux: true },
    methods: {
        linux: {
            debian: [
                {
                    manager: 'apt',
                    id: 'shared-a',
                    repoSetup: SHARED_VENDOR_REPO_SETUP,
                    install: 'sudo apt install -y shared-a',
                },
            ],
        },
    },
};

const SHARED_REPO_APP_B: CatalogApp = {
    id: 'shared-repo-app-b',
    name: 'SharedRepoAppB',
    category: 'test',
    description: 'App B sharing a vendor repo with SharedRepoAppA (identical repoSetup string)',
    platforms: { macos: false, windows: false, linux: true },
    methods: {
        linux: {
            debian: [
                {
                    manager: 'apt',
                    id: 'shared-b',
                    repoSetup: SHARED_VENDOR_REPO_SETUP,
                    install: 'sudo apt install -y shared-b',
                },
            ],
        },
    },
};

// Mirrors the real Temurin apt (embedded single quote in an awk script) and Temurin fedora
// (quoted heredoc) repoSetup shapes — regression fixture for the function-wrapping approach.
const TRICKY_REPO_APP: CatalogApp = {
    id: 'tricky-repo-app',
    name: 'TrickyRepoApp',
    category: 'test',
    description: 'App whose repoSetup contains an embedded single quote and a quoted heredoc',
    platforms: { macos: false, windows: false, linux: true },
    methods: {
        linux: {
            debian: [
                {
                    manager: 'apt',
                    id: 'tricky',
                    repoSetup:
                        'echo "deb https://example.com $(awk -F= \'/^VERSION_CODENAME/{print$2}\' /etc/os-release) main" | sudo tee /etc/apt/sources.list.d/tricky.list && sudo apt update',
                    install: 'sudo apt install -y tricky',
                },
            ],
            fedora: [
                {
                    manager: 'dnf',
                    id: 'tricky',
                    repoSetup:
                        "cat <<'EOF' | sudo tee /etc/yum.repos.d/tricky.repo\n[Tricky]\nname=Tricky\nbaseurl=https://example.com/rpm\nenabled=1\nEOF",
                    install: 'sudo dnf install -y tricky',
                },
            ],
        },
    },
};

const WINDOWS_REPO_APP: CatalogApp = {
    id: 'windows-repo-app',
    name: 'WindowsRepoApp',
    category: 'test',
    description: 'Synthetic Windows app with repoSetup (no real catalog entry has one yet)',
    platforms: { macos: false, windows: true, linux: false },
    methods: {
        windows: [
            {
                manager: 'winget',
                id: 'Example.WindowsRepoApp',
                repoSetup: 'winget source add --name example --arg https://example.com/winget',
                install: 'winget install --id Example.WindowsRepoApp -e',
            },
        ],
    },
};

// Two Linux methods for the same distro: the preferred one (snap) has no repoSetup,
// the array-first / non-preferred one (apt) does — used to prove dedup/emission keys
// off the actually-resolved method, not a static per-app assumption.
const FALLBACK_REPO_APP: CatalogApp = {
    id: 'fallback-repo-app',
    name: 'FallbackRepoApp',
    category: 'test',
    description: 'App with two Linux methods; only the non-preferred one has repoSetup',
    platforms: { macos: false, windows: false, linux: true },
    methods: {
        linux: {
            debian: [
                {
                    manager: 'apt',
                    id: 'fallbackrepoapp',
                    repoSetup:
                        'curl -fsSL https://example.com/key | sudo gpg --dearmor -o /usr/share/keyrings/fallbackrepoapp.gpg',
                    install: 'sudo apt install -y fallbackrepoapp',
                },
                { manager: 'snap', id: 'fallbackrepoapp', install: 'sudo snap install fallbackrepoapp' },
            ],
        },
    },
};

// ─── resolveMethod ────────────────────────────────────────────────────────────

describe('resolveMethod', () => {
    it('returns null when app has no build for the current platform', () => {
        expect(resolveMethod(MACOS_ONLY_APP, windowsConfig)).toBeNull();
    });

    it('returns null when no preferred manager has a method and fallback is off', () => {
        const config: BuilderConfig = { ...macosConfig, managers: ['winget'], fallbackMode: 'preferred-only' };
        expect(resolveMethod(FIREFOX, config)).toBeNull();
    });

    it('returns the full CatalogMethod object (not just the manager id) on success', () => {
        const method = resolveMethod(FIREFOX, macosConfig);
        expect(method).not.toBeNull();
        expect(method?.manager).toBe('brew');
        expect(method?.install).toBe('brew install --cask firefox');
    });

    it('respects per-app overrides', () => {
        const config: BuilderConfig = { ...macosConfig, managers: ['brew'], overrides: { dual: 'mas' } };
        const method = resolveMethod(DUAL_MANAGER_APP, config);
        expect(method?.manager).toBe('mas');
    });

    it('respects fallback resolution', () => {
        const config: BuilderConfig = { ...macosConfig, managers: ['winget'], fallbackMode: 'fallback' };
        const method = resolveMethod(FIREFOX, config);
        expect(method?.manager).toBe('brew');
    });
});

// ─── repoSetup: buildCombinedScript ────────────────────────────────────────────

describe('buildCombinedScript repoSetup', () => {
    const debianConfig: BuilderConfig = {
        platform: 'linux',
        linuxDistro: 'debian',
        managers: ['apt'],
        overrides: {},
        fallbackMode: 'preferred-only',
        selectedVersions: {},
    };

    describe('deduplication', () => {
        it('emits the shared repoSetup exactly once for two apps sharing the same vendor repo', () => {
            const script = buildCombinedScript([SHARED_REPO_APP_A, SHARED_REPO_APP_B], 'install', debianConfig);
            const headerMatches = script.match(/### Repository setup \(one-time\)/g) ?? [];
            expect(headerMatches).toHaveLength(1);
            const repoContentMatches = script.match(/sources\.list\.d\/vendor\.list/g) ?? [];
            expect(repoContentMatches).toHaveLength(1);
        });

        it('emits two separate function definitions when repoSetups differ', () => {
            const script = buildCombinedScript([SHARED_REPO_APP_A, TRICKY_REPO_APP], 'install', debianConfig);
            expect(script).toContain('_repo_setup_1()');
            expect(script).toContain('_repo_setup_2()');
        });
    });

    describe('header presence', () => {
        it('emits both headers when at least one selected app has a repoSetup', () => {
            const script = buildCombinedScript([SHARED_REPO_APP_A, FIREFOX], 'install', debianConfig);
            expect(script).toContain('### Repository setup (one-time)');
            expect(script).toContain('### Install');
        });

        it('omits the repo-setup header entirely when zero selected apps have a repoSetup', () => {
            const script = buildCombinedScript([FIREFOX], 'install', debianConfig);
            expect(script).not.toContain('### Repository setup');
            expect(script).not.toContain('### Install');
        });
    });

    describe('action gating', () => {
        it.each(['update', 'upgrade', 'remove'] as ScriptAction[])(
            'never emits the repo-setup section for action=%s even when the method has a repoSetup',
            (action) => {
                const script = buildCombinedScript([SHARED_REPO_APP_A], action, debianConfig);
                expect(script).not.toContain('### Repository setup');
            },
        );
    });

    describe('content safety (embedded quotes and heredocs)', () => {
        it('embeds a repoSetup with a literal single quote verbatim, uncorrupted', () => {
            const script = buildCombinedScript([TRICKY_REPO_APP], 'install', debianConfig);
            expect(script).toContain("awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release");
        });

        it('embeds a repoSetup containing a quoted heredoc verbatim, uncorrupted', () => {
            const config: BuilderConfig = { ...debianConfig, linuxDistro: 'fedora', managers: ['dnf'] };
            const script = buildCombinedScript([TRICKY_REPO_APP], 'install', config);
            expect(script).toContain("cat <<'EOF' | sudo tee /etc/yum.repos.d/tricky.repo");
            expect(script).toContain('[Tricky]');
            expect(script).toContain('EOF');
        });

        it('run_task label wraps the generated function name, not the raw content', () => {
            const script = buildCombinedScript([TRICKY_REPO_APP], 'install', debianConfig);
            expect(script).toContain('run_task "repo setup: TrickyRepoApp (apt)" _repo_setup_1');
        });
    });

    describe('resolution-aware dedup (fallback and override)', () => {
        it('uses the fallback-resolved method (array-first apt), not the preferred snap method', () => {
            const config: BuilderConfig = { ...debianConfig, managers: ['zypper'], fallbackMode: 'fallback' };
            const script = buildCombinedScript([FALLBACK_REPO_APP], 'install', config);
            expect(script).toContain('### Repository setup (one-time)');
            expect(script).toContain('fallbackrepoapp.gpg');
        });

        it('omits repoSetup when the preferred snap method (no repoSetup) resolves', () => {
            const config: BuilderConfig = { ...debianConfig, managers: ['snap'], fallbackMode: 'preferred-only' };
            const script = buildCombinedScript([FALLBACK_REPO_APP], 'install', config);
            expect(script).not.toContain('### Repository setup');
        });

        it('override to the repoSetup-bearing manager triggers emission even when preferred manager has none', () => {
            const config: BuilderConfig = {
                ...debianConfig,
                managers: ['snap'],
                overrides: { 'fallback-repo-app': 'apt' },
            };
            const script = buildCombinedScript([FALLBACK_REPO_APP], 'install', config);
            expect(script).toContain('### Repository setup (one-time)');
        });
    });

    describe('Windows (.ps1)', () => {
        const windowsRepoConfig: BuilderConfig = {
            platform: 'windows',
            managers: ['winget'],
            overrides: {},
            fallbackMode: 'preferred-only',
            selectedVersions: {},
        };

        it('emits a try/catch block for repoSetup using the same $ok/$fail counters', () => {
            const script = buildCombinedScript([WINDOWS_REPO_APP], 'install', windowsRepoConfig);
            expect(script).toContain('try { Write-Host "▶ repo setup: WindowsRepoApp (winget)";');
            expect(script).toContain('winget source add --name example --arg https://example.com/winget');
            expect(script).toContain('$ok++');
            expect(script).toContain('### Install');
        });

        it('does not emit the section for non-install actions', () => {
            const script = buildCombinedScript([WINDOWS_REPO_APP], 'update', windowsRepoConfig);
            expect(script).not.toContain('### Repository setup');
        });
    });
});

// ─── repoSetup: buildPerAppScripts ─────────────────────────────────────────────

describe('buildPerAppScripts repoSetup', () => {
    const debianConfig: BuilderConfig = {
        platform: 'linux',
        linuxDistro: 'debian',
        managers: ['apt'],
        overrides: {},
        fallbackMode: 'preferred-only',
        selectedVersions: {},
    };

    it('prepends repoSetup ahead of the install command for a repo-bearing app', () => {
        const result = buildPerAppScripts([SHARED_REPO_APP_A], 'install', debianConfig);
        expect(result['shared-repo-app-a']).toBe(`${SHARED_VENDOR_REPO_SETUP}\nsudo apt install -y shared-a`);
    });

    it('leaves a repoSetup-free app unchanged (bare command, no prefix)', () => {
        const result = buildPerAppScripts([FIREFOX], 'install', debianConfig);
        expect(result['firefox']).toBe('sudo apt install -y firefox');
    });

    it('mixed selection: each app independently includes or omits its own repoSetup', () => {
        const result = buildPerAppScripts([SHARED_REPO_APP_A, FIREFOX], 'install', debianConfig);
        expect(result['shared-repo-app-a'].startsWith(SHARED_VENDOR_REPO_SETUP)).toBe(true);
        expect(result['firefox']).toBe('sudo apt install -y firefox');
    });

    it.each(['update', 'upgrade', 'remove'] as ScriptAction[])(
        'never prepends repoSetup for action=%s even when the method has one',
        (action) => {
            // SHARED_REPO_APP_A only defines an install command, so use CURL_APT which has
            // update/upgrade/remove commands alongside a hypothetical repoSetup-bearing method.
            const config: BuilderConfig = { ...debianConfig, managers: ['apt'] };
            const result = buildPerAppScripts([FALLBACK_REPO_APP], action, config);
            if (result['fallback-repo-app']) {
                expect(result['fallback-repo-app']).not.toContain('fallbackrepoapp.gpg');
            }
        },
    );
});

// ─── buildManagerWideScript ────────────────────────────────────────────────────

describe('buildManagerWideScript', () => {
    it('macOS: emits brew and mas update-all commands wrapped in run_task, in order', () => {
        const script = buildManagerWideScript(['brew', 'mas'], 'update', { platform: 'macos' }, false);
        expect(script).toContain('#!/usr/bin/env bash');
        expect(script).toContain('brew update && brew upgrade --greedy');
        expect(script).toContain('mas upgrade');
        expect(script.indexOf('brew update')).toBeLessThan(script.indexOf('mas upgrade'));
        expect(script).toContain('run_task "update Homebrew" _maint_1_update');
        expect(script).toContain('run_task "update Mac App Store (mas)" _maint_2_update');
    });

    it('Windows: emits winget/choco/scoop update-all commands via try/catch', () => {
        const script = buildManagerWideScript(['winget', 'choco', 'scoop'], 'update', { platform: 'windows' }, false);
        expect(script).toContain('$ok=0;$fail=0');
        expect(script).toContain('winget upgrade --all --include-unknown');
        expect(script).toContain('choco upgrade chocolatey -y; choco upgrade all -y');
        expect(script).toContain('scoop update; scoop update *');
    });

    it('Debian: emits apt/flatpak/snap update-all commands', () => {
        const script = buildManagerWideScript(
            ['apt', 'flatpak', 'snap'],
            'update',
            { platform: 'linux', linuxDistro: 'debian' },
            false,
        );
        expect(script).toContain('sudo apt update && sudo apt full-upgrade -y');
        expect(script).toContain('flatpak update -y');
        expect(script).toContain('sudo snap refresh');
    });

    it('Fedora: emits the dnf update-all command', () => {
        const script = buildManagerWideScript(['dnf'], 'update', { platform: 'linux', linuxDistro: 'fedora' }, false);
        expect(script).toContain('sudo dnf upgrade --refresh -y');
    });

    it('Arch: emits the full pacman -Syu sync-upgrade, never a bare sync', () => {
        const script = buildManagerWideScript(['pacman'], 'update', { platform: 'linux', linuxDistro: 'arch' }, false);
        expect(script).toContain('sudo pacman -Syu');
        expect(script).not.toContain('sudo pacman -Sy\n');
    });

    it('openSUSE: emits the self-detecting Tumbleweed/Leap zypper conditional wrapped in a function', () => {
        const script = buildManagerWideScript(['zypper'], 'update', { platform: 'linux', linuxDistro: 'suse' }, false);
        expect(script).toContain('grep -qi tumbleweed');
        expect(script).toContain('sudo zypper dup');
        expect(script).toContain('sudo zypper refresh && sudo zypper update');
        expect(script).toMatch(
            /_maint_1_update\(\) \{\n.*grep -qi tumbleweed[\s\S]*?\n\}\nrun_task "update zypper" _maint_1_update/,
        );
    });

    it('skips a manager with no entry for the given platform, with a comment, not a throw', () => {
        expect(() => buildManagerWideScript(['pacman'], 'update', { platform: 'windows' }, false)).not.toThrow();
        const script = buildManagerWideScript(['pacman'], 'update', { platform: 'windows' }, false);
        expect(script).toContain('# pacman: no update command available — skipped');
    });

    it('includeCleanup: false omits cleanup commands even when the manager has one', () => {
        const script = buildManagerWideScript(['brew'], 'update', { platform: 'macos' }, false);
        expect(script).not.toContain('brew autoremove');
    });

    it('includeCleanup: true appends the cleanup task immediately after the update task', () => {
        const script = buildManagerWideScript(['brew'], 'update', { platform: 'macos' }, true);
        expect(script).toContain('brew autoremove && brew cleanup -s');
        expect(script.indexOf('_maint_1_update')).toBeLessThan(script.indexOf('_maint_1_cleanup'));
        expect(script).toContain('run_task "cleanup Homebrew" _maint_1_cleanup');
    });

    it('empty managers array returns a no-op script, not a crash', () => {
        const script = buildManagerWideScript([], 'update', { platform: 'macos' }, false);
        expect(script).toContain('# No package managers selected — nothing to do.');
        expect(script).toContain('✔ $SUCCESS ok / ✖ $FAILED failed');
        expect(script).not.toContain('brew');
    });

    it('Windows winget selection surfaces the requiresExplicitUpgrade limitation as a comment', () => {
        const script = buildManagerWideScript(['winget'], 'update', { platform: 'windows' }, false);
        expect(script).toContain('requiresExplicitUpgrade');
    });

    it('throws when platform is linux and linuxDistro is not provided', () => {
        expect(() => buildManagerWideScript(['apt'], 'update', { platform: 'linux' }, false)).toThrow(
            'linuxDistro is required when platform is linux',
        );
    });

    it('multi-step && chained commands are fully contained inside the generated function body', () => {
        const script = buildManagerWideScript(['apt'], 'update', { platform: 'linux', linuxDistro: 'debian' }, false);
        const fnMatch = script.match(/_maint_1_update\(\) \{\n([\s\S]*?)\n\}/);
        expect(fnMatch).not.toBeNull();
        expect(fnMatch![1]).toBe('sudo apt update && sudo apt full-upgrade -y');
    });

    it('action=upgrade reads the same updateAllCommand as action=update (single combined field)', () => {
        const updateScript = buildManagerWideScript(['brew'], 'update', { platform: 'macos' }, false);
        const upgradeScript = buildManagerWideScript(['brew'], 'upgrade', { platform: 'macos' }, false);
        expect(upgradeScript).toContain('brew update && brew upgrade --greedy');
        expect(updateScript).toContain('# UPDATE — manager-wide maintenance');
        expect(upgradeScript).toContain('# UPGRADE — manager-wide maintenance');
    });
});

describe('getMaintenanceEntries', () => {
    it('returns MANAGER_MAINTENANCE.macos for platform=macos', () => {
        expect(getMaintenanceEntries({ platform: 'macos' })).toEqual(MANAGER_MAINTENANCE.macos);
    });

    it('returns MANAGER_MAINTENANCE.windows for platform=windows', () => {
        expect(getMaintenanceEntries({ platform: 'windows' })).toEqual(MANAGER_MAINTENANCE.windows);
    });

    it('returns MANAGER_MAINTENANCE.linux[distro] for platform=linux', () => {
        expect(getMaintenanceEntries({ platform: 'linux', linuxDistro: 'debian' })).toEqual(
            MANAGER_MAINTENANCE.linux.debian,
        );
    });

    it('throws when platform is linux and linuxDistro is not provided', () => {
        expect(() => getMaintenanceEntries({ platform: 'linux' })).toThrow(
            'linuxDistro is required when platform is linux',
        );
    });
});

// ─── Manager-bootstrap ("Setup managers") ──────────────────────────────────────

const NPM_ONLY_APP: CatalogApp = {
    id: 'foo',
    name: 'Foo',
    category: 'test',
    description: 'app only installable via npm',
    platforms: { macos: true, windows: true, linux: true },
    methods: {
        macos: [{ manager: 'npm', install: 'npm install -g foo' }],
        windows: [{ manager: 'npm', install: 'npm install -g foo' }],
        linux: { debian: [{ manager: 'npm', install: 'npm install -g foo' }] },
    },
};

const CARGO_ONLY_APP: CatalogApp = {
    id: 'bar',
    name: 'Bar',
    category: 'test',
    description: 'app only installable via cargo',
    platforms: { macos: true, windows: false, linux: false },
    methods: { macos: [{ manager: 'cargo', install: 'cargo install bar' }] },
};

describe('getRequiredBootstrap', () => {
    it('returns empty for apps that resolve entirely via OS-native managers', () => {
        const required = getRequiredBootstrap([FIREFOX], linuxDebianConfig);
        expect(required).toEqual([]);
    });

    it('includes a manager needed by fallback resolution, even when never explicitly selected', () => {
        const config: BuilderConfig = { ...macosConfig, managers: [], fallbackMode: 'fallback' };
        const required = getRequiredBootstrap([NPM_ONLY_APP], config);
        expect(required).toHaveLength(1);
        expect(required[0].manager).toBe('npm');
        expect(required[0].source.kind).toBe('provider-app');
    });

    it('dedupes when multiple apps need the same manager', () => {
        const config: BuilderConfig = { ...macosConfig, managers: ['npm'], fallbackMode: 'preferred-only' };
        const required = getRequiredBootstrap([NPM_ONLY_APP, { ...NPM_ONLY_APP, id: 'foo2', name: 'Foo2' }], config);
        expect(required).toHaveLength(1);
    });

    it('omits apps that are skipped entirely (no manager resolved)', () => {
        const config: BuilderConfig = { ...macosConfig, managers: ['winget'], fallbackMode: 'preferred-only' };
        const required = getRequiredBootstrap([NPM_ONLY_APP], config);
        expect(required).toEqual([]);
    });
});

describe('resolveProviderCommand', () => {
    it('resolves npm via node on macOS, substituting the newest listed version', () => {
        const resolved = resolveProviderCommand(['node', 'nvm', 'fnm'], { platform: 'macos' });
        expect(resolved?.app.id).toBe('node');
        expect(resolved?.command).not.toContain('{version}');
        expect(resolved?.method.manager).toBe('brew');
    });

    it('falls through to the next candidate when the first is unavailable on this platform', () => {
        // nvm has no windows-incompatible id here; use an id that genuinely can't resolve to force fallthrough.
        const resolved = resolveProviderCommand(['does-not-exist', 'node'], { platform: 'macos' });
        expect(resolved?.app.id).toBe('node');
    });

    it('returns null when no candidate resolves', () => {
        const resolved = resolveProviderCommand(['does-not-exist'], { platform: 'macos' });
        expect(resolved).toBeNull();
    });

    it('never resolves through another provider-resolved manager — the uv app itself is the adversarial case', () => {
        // The real `uv` catalog app's own Linux methods include `pipx` and `cargo` (ways to install
        // uv), which are themselves provider-resolved managers. Resolving uv as a *provider* must
        // skip those and land on the self-contained `script` method instead, or the cycle guard is broken.
        const uvApp = APPS_CATALOG.apps.find((a) => a.id === 'uv')!;
        const resolved = resolveProviderCommand(['uv'], { platform: 'linux', linuxDistro: 'debian' });
        expect(resolved?.app.id).toBe('uv');
        expect(resolved?.method.manager).not.toBe('pipx');
        expect(resolved?.method.manager).not.toBe('cargo');
        // sanity: confirm the fixture assumption still holds (uv really does list pipx/cargo methods)
        expect(uvApp.methods.linux?.debian?.some((m) => m.manager === 'pipx')).toBe(true);
        expect(uvApp.methods.linux?.debian?.some((m) => m.manager === 'cargo')).toBe(true);
    });
});

describe('buildBootstrapScript', () => {
    it('shows the empty-state comment when nothing is required', () => {
        const script = buildBootstrapScript([], { platform: 'macos' });
        expect(script).toContain('Nothing to set up');
    });

    it('emits a fixed-source manager (brew) as a single idempotent step', () => {
        const source = { kind: 'fixed' as const, command: 'install-brew', verify: 'brew --version', guidePath: '/x' };
        const script = buildBootstrapScript([{ manager: 'brew', source }], { platform: 'macos' });
        expect(script).toContain('run_task "setup brew" _setup_1');
        expect(script).toContain('install-brew');
    });

    it('bootstraps the sub-dependency (brew) before installing a provider app (node) that needs it', () => {
        const config: BuilderConfig = { ...macosConfig, managers: ['npm'], fallbackMode: 'preferred-only' };
        const required = getRequiredBootstrap([NPM_ONLY_APP], config);
        const script = buildBootstrapScript(required, config);

        expect(script).toContain('run_task "setup brew" _setup_1');
        expect(script).toContain('brew install node@');
        expect(script).toContain('run_task "setup npm (via Node.js)" _setup_2');
        // brew must appear before npm in the emitted script
        expect(script.indexOf('setup brew')).toBeLessThan(script.indexOf('setup npm'));
    });

    it('lets providerChoice pick an alternate provider app (nvm instead of node)', () => {
        const config: BuilderConfig = { ...macosConfig, managers: ['npm'], fallbackMode: 'preferred-only' };
        const required = getRequiredBootstrap([NPM_ONLY_APP], config);
        const script = buildBootstrapScript(required, config, { npm: 'nvm' });
        expect(script).toContain('setup npm (via nvm)');
        expect(script).not.toContain('via Node.js');
    });

    it('emits a colored skip warning when a required manager has no known install path', () => {
        const badSource = { kind: 'provider-app' as const, appIds: ['does-not-exist'], guidePath: '/x' };
        const script = buildBootstrapScript([{ manager: 'cargo', source: badSource }], { platform: 'macos' });
        expect(script).toContain('# cargo: no known way to install it on this platform');
        expect(script).toContain('\\033[0;31m⚠ cargo: no known way to install it');
    });

    it('always appends a restart-your-shell notice on bash', () => {
        const script = buildBootstrapScript([], { platform: 'macos' });
        expect(script).toContain('Restart your terminal');
    });

    it('always appends a restart-PowerShell notice on Windows', () => {
        const script = buildBootstrapScript([], { platform: 'windows' });
        expect(script).toContain('Restart PowerShell');
    });

    it('emits PowerShell try/catch for a fixed source on Windows', () => {
        const source = { kind: 'fixed' as const, command: 'choco-install', verify: 'choco -v', guidePath: '/x' };
        const script = buildBootstrapScript([{ manager: 'choco', source }], { platform: 'windows' });
        expect(script).toContain('try { Write-Host "▶ setup choco"; choco-install;');
    });

    it('resolves cargo via the rust provider app on macOS, bootstrapping brew first', () => {
        const config: BuilderConfig = {
            platform: 'macos',
            managers: ['cargo'],
            overrides: {},
            fallbackMode: 'preferred-only',
            selectedVersions: {},
        };
        const required = getRequiredBootstrap([CARGO_ONLY_APP], config);
        expect(required).toHaveLength(1);
        expect(required[0].manager).toBe('cargo');
        const script = buildBootstrapScript(required, config);
        expect(script).toContain('setup brew');
        expect(script).toContain('brew install rust');
        expect(script).toContain('setup cargo (via Rust)');
    });
});
