import { APPS_CATALOG } from '@/common/apps-catalog';
import { validateCatalog } from '@/common/catalog-utils';
import { getPlainPackageToken } from '@/common/script-builder';

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
            expect(findMethod('go', 'arch', 'pacman')?.install).toBe('sudo pacman -S --noconfirm go');
        });

        it("go's openSUSE methods lead with a native zypper entry, not snap-only", () => {
            const app = apps.find((a) => a.id === 'go');
            const suseMethods = app?.methods.linux?.suse ?? [];
            expect(suseMethods[0]?.manager).toBe('zypper');
            expect(findMethod('go', 'suse', 'zypper')?.install).toBe('sudo zypper install -y go');
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

        it('bun installs from homebrew-core on macOS, not the oven-sh tap', () => {
            const app = APPS_CATALOG.apps.find((a) => a.id === 'bun');
            const brewMethod = app?.methods.macos?.find((m) => m.manager === 'brew');
            expect(brewMethod?.install).toBe('brew install bun');
        });

        it('bun has winget and official script methods on Windows', () => {
            const app = APPS_CATALOG.apps.find((a) => a.id === 'bun');
            expect(app?.methods.windows?.find((m) => m.manager === 'winget')?.id).toBe('Oven-sh.Bun');
            expect(app?.methods.windows?.find((m) => m.manager === 'script')?.install).toContain('bun.sh/install.ps1');
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

        it('keeps Antigravity CLI methods intact', () => {
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
            expect(JSON.stringify(player)).not.toContain('com.github.iwalton3.jellyfin-media-player');
            expect(JSON.stringify(player)).toContain('org.jellyfin.JellyfinDesktop');
        });
    });

    describe('catalog refresh', () => {
        const apps = APPS_CATALOG.apps;
        const find = (id: string) => apps.find((app) => app.id === id);
        const commandSegments = () =>
            allMethods().flatMap((method) =>
                (['repoSetup', 'install', 'update', 'upgrade', 'remove'] as const).flatMap((field) =>
                    (method[field] ?? '').split(' && ').map((segment) => ({ manager: method.manager, segment })),
                ),
            );

        it('does not carry deprecated or removed apps', () => {
            for (const id of ['gemini-cli', 'openoffice', 'android-file-transfer']) {
                expect(find(id)).toBeUndefined();
            }
        });

        it('does not carry stale package ids', () => {
            const serialized = JSON.stringify(APPS_CATALOG);
            for (const stale of [
                'handbrake-jz',
                'WhatsApp.WhatsApp',
                'JetBrains.PyCharm.Professional',
                'JetBrains.IntelliJIDEA.Ultimate',
                'VivaldiTechnologies.Vivaldi',
                'dbeaver.dbeaver',
                'PCSX2.PCSX2',
                'mpv.net',
                'org.apache.netbeans.NetBeans',
                'dnf-plugins-core',
                '--add-repo',
                'ppa:lazygit-team',
            ]) {
                expect(serialized).not.toContain(stale);
            }
            expect(find('awscli')?.methods.linux?.debian?.map((m) => m.manager)).not.toContain('apt');
            expect(allMethods().some((m) => m.manager === 'pipx' && m.id === 'awscli')).toBe(false);
            expect(find('maven')?.methods.windows?.map((m) => m.manager)).not.toContain('winget');
        });

        it('keeps apt, dnf, zypper and pacman commands non-interactive', () => {
            for (const { manager, segment } of commandSegments()) {
                if (manager === 'apt' && /^sudo apt(-get)? (install|remove|upgrade|full-upgrade)\b/.test(segment)) {
                    expect(segment).toMatch(/\s-y\b/);
                }
                if (manager === 'dnf' && /^sudo dnf (install|upgrade|update|remove)\b/.test(segment)) {
                    expect(segment).toMatch(/\s-y\b/);
                }
                if (manager === 'zypper' && /^sudo zypper (install|update|remove)\b/.test(segment)) {
                    expect(segment).toMatch(/\s-y\b/);
                }
                if (manager === 'pacman' && /^sudo pacman -[SR]/.test(segment)) {
                    expect(segment).toContain('--noconfirm');
                }
                if (/\badd-apt-repository\b/.test(segment)) {
                    expect(segment).toMatch(/add-apt-repository -y\b/);
                }
            }
        });

        it('gives every plain single-package method the id it installs, so it can be combined', () => {
            for (const method of allMethods()) {
                const token = getPlainPackageToken(method);
                if (token)
                    expect({ install: method.install, id: method.id }).toEqual({ install: method.install, id: token });
            }
        });

        it('keeps Windows commands parseable by Windows PowerShell 5.1 (no && or ||)', () => {
            for (const app of apps) {
                for (const method of app.methods.windows ?? []) {
                    for (const field of ['repoSetup', 'install', 'update', 'upgrade', 'remove'] as const) {
                        expect(method[field] ?? '').not.toMatch(/&&|\|\|/);
                    }
                }
            }
        });

        it('accepts winget source and package agreements on every install and upgrade', () => {
            for (const method of allMethods().filter((m) => m.manager === 'winget')) {
                for (const field of ['install', 'update', 'upgrade'] as const) {
                    const command = method[field];
                    if (!command?.startsWith('winget ')) continue;
                    expect(command).toContain('--accept-source-agreements');
                    expect(command).toContain('--accept-package-agreements');
                }
            }
        });

        it('loads the SDKMAN shell function before calling sdk', () => {
            for (const method of allMethods()) {
                for (const field of ['install', 'update', 'upgrade', 'remove'] as const) {
                    const command = method[field] ?? '';
                    if (/(^|[;&|]\s*)sdk /.test(command)) expect(command).toContain('sdkman-init.sh');
                }
            }
            expect(find('sdkman')?.methods.macos?.[0]?.update).toBe(
                'source "$HOME/.sdkman/bin/sdkman-init.sh" && sdk selfupdate',
            );
        });

        it('gives package-manager methods a real update command (install does not upgrade)', () => {
            for (const method of allMethods()) {
                if (method.manager === 'script' || method.manager === 'installer') continue;
                expect({ install: method.install, update: method.update ?? method.upgrade }).toEqual({
                    install: method.install,
                    update: expect.any(String),
                });
            }
        });

        it('uses the dnf5 repository syntax and the Debian or Ubuntu Docker apt repo', () => {
            const docker = find('docker');
            const apt = docker?.methods.linux?.debian?.find((m) => m.manager === 'apt');
            const dnf = docker?.methods.linux?.fedora?.find((m) => m.manager === 'dnf');
            expect(apt?.repoSetup).toContain('/etc/os-release');
            // Ubuntu derivatives (Mint, Pop!_OS, …) report their own $ID, which download.docker.com does not serve.
            expect(apt?.repoSetup).not.toContain('echo "$ID"');
            expect(apt?.repoSetup).toContain('if [ "$ID" = debian ]; then echo debian; else echo ubuntu; fi');
            expect(apt?.repoSetup).toContain('${UBUNTU_CODENAME:-$VERSION_CODENAME}');
            expect(dnf?.repoSetup).toContain('addrepo --from-repofile=');
            expect(dnf?.repoSetup).toContain('dnf5-plugins');
            const compose = find('docker-compose');
            expect(compose?.methods.linux?.debian?.[0]?.repoSetup).toBe(apt?.repoSetup);
            expect(compose?.methods.linux?.fedora?.[0]?.repoSetup).toBe(dnf?.repoSetup);
        });

        it('fixes the renamed package ids', () => {
            const brewOf = (id: string) => find(id)?.methods.macos?.find((m) => m.manager === 'brew');
            expect(brewOf('handbrake')).toMatchObject({ id: 'handbrake-app', kind: 'cask' });
            const winget = (id: string) => find(id)?.methods.windows?.find((m) => m.manager === 'winget')?.id;
            expect(winget('whatsapp')).toBe('9NKSQGP7F2NH');
            expect(winget('pycharm')).toBe('JetBrains.PyCharm');
            expect(winget('intellij-idea')).toBe('JetBrains.IntelliJIDEA');
            expect(winget('vivaldi')).toBe('Vivaldi.Vivaldi');
            expect(winget('dbeaver-community')).toBe('DBeaver.DBeaver.Community');
            expect(winget('pcsx2')).toBe('PCSX2Team.PCSX2');
            expect(winget('mpv')).toBe('shinchiro.mpv');
            expect(winget('bun')).toBe('Oven-sh.Bun');
        });

        it('adds Python 3.15 and the pinned nvm release', () => {
            expect(find('python')?.versions).toContain('3.15');
            expect(JSON.stringify(find('nvm'))).toContain('v0.41.0');
        });

        it('contains the newly added apps with their expected methods', () => {
            const ids = [
                'krokiet',
                'colima',
                'zizmor',
                'actionlint',
                'just',
                'shellcheck',
                'sonar-scanner',
                'porting-kit',
                'fbreader',
                'font-monaspace',
                'font-jetbrains-mono',
            ];
            for (const id of ids) expect(find(id)).toBeDefined();

            const wingetOf = (id: string) => find(id)?.methods.windows?.find((m) => m.manager === 'winget')?.id;
            expect(wingetOf('shellcheck')).toBe('koalaman.shellcheck');
            expect(wingetOf('just')).toBe('Casey.Just');
            expect(wingetOf('actionlint')).toBe('rhysd.actionlint');
            expect(wingetOf('zizmor')).toBe('zizmor.zizmor');
            expect(wingetOf('krokiet')).toBe('qarmin.krokiet');

            expect(find('porting-kit')?.platforms).toEqual({ macos: true, windows: false, linux: false });
            expect(find('colima')?.platforms.windows).toBe(false);
            expect(find('shellcheck')?.methods.linux?.fedora?.[0]?.install).toBe('sudo dnf install -y ShellCheck');
        });

        it('groups the two fonts in a Fonts category', () => {
            expect(find('font-monaspace')?.category).toBe('Fonts');
            expect(find('font-jetbrains-mono')?.category).toBe('Fonts');
        });

        it('keeps the Ollama winget package on the desktop app only', () => {
            expect(find('ollama')?.methods.windows ?? []).toHaveLength(0);
            expect(find('ollama-app')?.methods.windows?.[0]?.id).toBe('Ollama.Ollama');
        });
    });
});
