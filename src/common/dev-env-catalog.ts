import { WINDOWS_ENV_SET_VARIABLE, WINDOWS_ENV_VIEW_VARIABLE, WINDOWS_SCOOP_INSTALL } from './windows-utils';

export type DevEnvCategory = 'java' | 'python' | 'go' | 'nodejs' | 'bun';
export type DevEnvOS = 'macos' | 'windows' | 'linux';
export type DevEnvLinuxDistro = 'debian' | 'fedora' | 'arch' | 'suse';

export interface DevEnvManagerBootstrap {
    managerId: string;
    managerLabel: string;
    builtIntoOS?: boolean;
    availableOn: DevEnvOS[];
    installManager?: string;
    repoSetup?: string;
    installTool: string;
    configure?: string;
    verify: string;
    update?: string;
    remove?: string;
    versionSwitch?: string;
    notes?: string;
}

export interface DevEnvCategoryData {
    category: DevEnvCategory;
    label: string;
    description: string;
    managersByOS: Record<DevEnvOS, DevEnvManagerBootstrap[]>;
    linuxDistroOverrides?: Partial<Record<DevEnvLinuxDistro, DevEnvManagerBootstrap[]>>;
}

// Data-modeling note for whoever wires this into the UI (Task 9 of the implementation plan):
// `managersByOS.linux` always holds a complete, valid, distro-agnostic list on its own (tools whose
// install command doesn't vary by distro). `linuxDistroOverrides[distro]` only ADDS distro-specific
// package-manager entries on top of that generic list — it is not a replacement for it. A distro with
// no override key simply falls back to the generic `managersByOS.linux` array.

const SDKMAN_ENTRY: DevEnvManagerBootstrap = {
    managerId: 'sdkman',
    managerLabel: 'SDKMAN!',
    builtIntoOS: false,
    availableOn: ['macos', 'linux'],
    installManager:
        'curl -s "https://get.sdkman.io" | bash   # source ~/.sdkman/bin/sdkman-init.sh at the END of your shell rc — SDKMAN requires this position',
    installTool: 'sdk install java 21.0.4-tem   # suffixes: -tem / -amzn / -zulu / -ms / -oracle / -graalce',
    verify: 'sdk version',
    update: 'sdk selfupdate   # updates SDKMAN itself; sdk upgrade updates installed candidates',
    remove: 'rm -rf ~/.sdkman   # then remove the SDKMAN init line from your shell profile',
    versionSwitch:
        'sdk use java 21.0.4-tem     # shell-local\n' +
        'sdk default java 21.0.4-tem # permanent\n' +
        '# SDKMAN manages Maven/Gradle/Kotlin the same way',
    notes:
        'Windows only via WSL — this catalog does not model WSL as a distinct OS, so no separate Windows ' +
        'entry is listed; run the same commands inside a WSL shell.',
};

const PIP_ENTRY: DevEnvManagerBootstrap = {
    managerId: 'pip',
    managerLabel: 'pip (stdlib)',
    builtIntoOS: true,
    availableOn: ['macos', 'windows', 'linux'],
    installTool: 'python -m pip install --upgrade pip   # ships with the interpreter — this just self-updates',
    verify: 'pip --version',
    update: 'python -m pip install --upgrade pip',
    notes:
        'PEP 668 "externally-managed-environment" blocks system-wide pip install by default on Debian 12+ / ' +
        'Ubuntu 23.04+ / Fedora 38+ / Arch / openSUSE / Homebrew Python. Prefer a venv, pipx, or uv over ' +
        'pip install directly — `--break-system-packages` is a last resort, never the default suggestion.',
};

const COREPACK_ENTRY: DevEnvManagerBootstrap = {
    managerId: 'corepack',
    managerLabel: 'Corepack',
    builtIntoOS: false,
    availableOn: ['macos', 'windows', 'linux'],
    installTool: 'npm install -g corepack   # bundled experimentally with Node 16–24; removed from Node.js 25+',
    configure: 'corepack enable',
    verify: 'corepack --version',
    update: 'npm install -g corepack@latest',
    remove: 'npm uninstall -g corepack',
    versionSwitch: 'corepack use pnpm@9   # pins/writes the "packageManager" field in package.json',
};

const BUN_NPM_ENTRY: DevEnvManagerBootstrap = {
    managerId: 'npm',
    managerLabel: 'npm (npm install -g bun)',
    builtIntoOS: false,
    availableOn: ['macos', 'windows', 'linux'],
    installTool: 'npm install -g bun',
    verify: 'bun --version',
    update: 'bun upgrade   # self-upgrading — works fine for npm-sourced installs too',
    remove: 'npm uninstall -g bun',
    notes: 'Requires Node.js/npm already installed first.',
};

const JAVA: DevEnvCategoryData = {
    category: 'java',
    label: 'Java (JDK)',
    description:
        'Install and manage Java Development Kits from Temurin, Corretto, Microsoft Build of OpenJDK, and ' +
        'Zulu, plus the version managers (jenv, SDKMAN!) that switch between them.',
    managersByOS: {
        macos: [
            {
                managerId: 'brew-cask',
                managerLabel: 'Homebrew (JDK vendor casks)',
                builtIntoOS: true,
                availableOn: ['macos'],
                installTool:
                    'brew install --cask temurin@21   # swap vendor: corretto / microsoft-openjdk / zulu; version: @8 / @11 / @17 / @21 / @25',
                configure: `echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 21)' >> ~/.zshrc`,
                verify: '/usr/libexec/java_home -V\njava -version',
                update: 'brew upgrade --cask temurin@21',
                remove: 'brew uninstall --cask temurin@21',
                versionSwitch:
                    'Install additional versioned casks (e.g. temurin@17) side by side, then switch JAVA_HOME ' +
                    'manually — or use jenv/SDKMAN! below to manage multiple JDKs without hand-editing JAVA_HOME.',
                notes:
                    'Cask/package name varies by vendor (temurin, corretto, microsoft-openjdk, zulu) — see the ' +
                    'Software Installer for the full per-vendor script generator.',
            },
            {
                managerId: 'jenv',
                managerLabel: 'jenv',
                builtIntoOS: false,
                availableOn: ['macos'],
                installManager:
                    'brew install jenv\n' +
                    `echo 'export PATH="$HOME/.jenv/bin:$PATH"' >> ~/.zshrc\n` +
                    `echo 'eval "$(jenv init -)"' >> ~/.zshrc\n` +
                    'exec $SHELL -l',
                installTool:
                    'jenv add /Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home   # install a JDK first (see the Homebrew cask entry above)\n' +
                    'jenv versions',
                verify: 'jenv doctor   # expect: [OK] Jenv is correctly loaded',
                update: 'brew upgrade jenv',
                remove: 'brew uninstall jenv   # then remove the two shell-init lines above',
                versionSwitch:
                    'jenv global 21.0   # default everywhere\n' +
                    'jenv local 17.0    # per-project, writes .java-version\n' +
                    'jenv shell 11.0    # current shell only\n' +
                    'jenv enable-plugin export\n' +
                    'jenv doctor',
                notes:
                    'jenv does not install JDKs itself — install one first via the Homebrew cask entry above. ' +
                    'If you enable the export plugin, do not also set JAVA_HOME manually — the two will conflict.',
            },
            SDKMAN_ENTRY,
        ],
        windows: [
            {
                managerId: 'winget',
                managerLabel: 'winget',
                builtIntoOS: true,
                availableOn: ['windows'],
                installTool:
                    'winget install -e --id EclipseAdoptium.Temurin.21.JDK   # note: Microsoft.OpenJDK.21 has no ".JDK" suffix, unlike other vendors',
                configure: `${WINDOWS_ENV_SET_VARIABLE}\n[Environment]::SetEnvironmentVariable("PATH", "$([Environment]::GetEnvironmentVariable('PATH','User'));C:\\Program Files\\Eclipse Adoptium\\jdk-21\\bin", "User")`,
                verify: 'java -version',
                update: 'winget upgrade --id EclipseAdoptium.Temurin.21.JDK -e',
                remove: 'winget uninstall --id EclipseAdoptium.Temurin.21.JDK -e',
                versionSwitch:
                    'Install another versioned winget package (e.g. EclipseAdoptium.Temurin.17.JDK) side by ' +
                    'side, then repeat the JAVA_HOME step above for whichever version should be active — ' +
                    'Windows has no jenv equivalent, see the manual JAVA_HOME entry below for an alternative.',
                notes: 'Alternates: choco install temurin21 -y, or scoop bucket add java; scoop install java/temurin21-jdk.',
            },
            {
                managerId: 'manual-javahome',
                managerLabel: 'Manual JAVA_HOME (PowerShell)',
                builtIntoOS: true,
                availableOn: ['windows'],
                installTool: WINDOWS_ENV_SET_VARIABLE,
                configure: `$current = [Environment]::GetEnvironmentVariable("PATH", "User")\n[Environment]::SetEnvironmentVariable("PATH", "$current;C:\\Program Files\\Eclipse Adoptium\\jdk-21\\bin", "User")`,
                verify: `${WINDOWS_ENV_VIEW_VARIABLE}\njava -version`,
                update: 'Re-run the SetEnvironmentVariable command above with the new JDK path after installing it via winget/choco/scoop.',
                remove: '[Environment]::SetEnvironmentVariable("JAVA_HOME", $null, "User")',
                versionSwitch:
                    'No jenv on Windows. In order of reliability: SDKMAN! inside WSL, then Scoop ' +
                    '(scoop install temurin17-jdk temurin21-jdk + scoop reset <pkg>), then this manual ' +
                    'JAVA_HOME/PATH approach, then IDE-level JDK binding.',
                notes: 'This is the fallback path when no version manager is available on Windows — prefer SDKMAN!-in-WSL or Scoop above when possible.',
            },
        ],
        linux: [
            {
                managerId: 'jenv',
                managerLabel: 'jenv',
                builtIntoOS: false,
                availableOn: ['linux'],
                installManager:
                    'git clone https://github.com/jenv/jenv.git ~/.jenv\n' +
                    `echo 'export PATH="$HOME/.jenv/bin:$PATH"' >> ~/.bashrc\n` +
                    `echo 'eval "$(jenv init -)"' >> ~/.bashrc\n` +
                    'exec $SHELL -l',
                installTool:
                    'jenv add /usr/lib/jvm/temurin-21-jdk   # install a JDK first via your distro package manager below\n' +
                    'jenv versions',
                verify: 'jenv doctor   # expect: [OK] Jenv is correctly loaded',
                update: 'git -C ~/.jenv pull',
                remove: 'rm -rf ~/.jenv   # then remove the two shell-init lines above',
                versionSwitch:
                    'jenv global 21.0   # default everywhere\n' +
                    'jenv local 17.0    # per-project, writes .java-version\n' +
                    'jenv shell 11.0    # current shell only\n' +
                    'jenv enable-plugin export\n' +
                    'jenv doctor',
                notes:
                    'jenv does not install JDKs itself — install one first via apt/dnf/pacman/zypper below. ' +
                    'No native Windows build exists.',
            },
            SDKMAN_ENTRY,
        ],
    },
    linuxDistroOverrides: {
        debian: [
            {
                managerId: 'apt-vendor',
                managerLabel: 'apt (Temurin / Corretto / Microsoft-OpenJDK / Zulu)',
                builtIntoOS: true,
                availableOn: ['linux'],
                repoSetup: `sudo apt install -y wget apt-transport-https gpg && wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/adoptium.gpg > /dev/null && echo "deb https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | sudo tee /etc/apt/sources.list.d/adoptium.list && sudo apt update`,
                installTool: 'sudo apt install -y temurin-21-jdk   # package name varies by vendor',
                verify: 'java -version',
                update: 'sudo apt update && sudo apt install --only-upgrade -y temurin-21-jdk',
                remove: 'sudo apt remove -y temurin-21-jdk',
                versionSwitch: 'sudo update-alternatives --config java   # also run for javac',
                notes:
                    'Each vendor needs its own GPG key + repo file — this shows Temurin as the representative ' +
                    'example; see the Software Installer for the exact per-vendor repoSetup commands (Corretto/' +
                    'Microsoft-OpenJDK/Zulu differ).',
            },
        ],
        arch: [
            {
                managerId: 'pacman-openjdk',
                managerLabel: 'pacman (distro-native OpenJDK)',
                builtIntoOS: true,
                availableOn: ['linux'],
                installTool: 'sudo pacman -S jdk21-openjdk',
                verify: 'java -version',
                update: 'sudo pacman -Syu',
                remove: 'sudo pacman -Rns jdk21-openjdk',
                versionSwitch:
                    'sudo archlinux-java set java-21-openjdk   # Arch does not use update-alternatives for Java',
                notes:
                    "This is Arch's officially-supported Java path. Vendor builds (Temurin/Corretto/MS-OpenJDK/" +
                    'Zulu) are AUR-only on Arch and occasionally break — prefer this native package unless you ' +
                    'specifically need a vendor build.',
            },
        ],
    },
};

const PYTHON: DevEnvCategoryData = {
    category: 'python',
    label: 'Python',
    description: 'Install Python interpreters and manage versions/virtual environments with uv, pyenv, and pip.',
    managersByOS: {
        macos: [
            {
                managerId: 'uv',
                managerLabel: 'uv',
                builtIntoOS: false,
                availableOn: ['macos'],
                installTool: 'curl -LsSf https://astral.sh/uv/install.sh | sh',
                configure: 'uv python install 3.13\nuv python pin 3.13   # writes .python-version',
                verify: 'uv --version',
                update: 'uv self update   # standalone installs only — use "brew upgrade uv" if installed via Homebrew',
                remove: 'rm ~/.local/bin/uv ~/.local/bin/uvx   # or: brew uninstall uv',
                versionSwitch:
                    'uv python list   # multiple versions coexist naturally per-project via .python-version / uv venv --python X.Y',
                notes: 'Also installable via brew install uv.',
            },
            {
                managerId: 'pyenv',
                managerLabel: 'pyenv',
                builtIntoOS: false,
                availableOn: ['macos'],
                installManager: 'brew install pyenv',
                installTool: 'pyenv install 3.13.2',
                configure: "Add pyenv's shell init lines to ~/.zshrc — the installer prints the exact block to append.",
                verify: 'pyenv --version',
                update: 'brew upgrade pyenv',
                remove: 'brew uninstall pyenv   # then remove the shell init lines it added',
                versionSwitch: 'pyenv global 3.13.2\npyenv local 3.13.2\npyenv shell 3.13.2',
            },
            PIP_ENTRY,
        ],
        windows: [
            {
                managerId: 'uv',
                managerLabel: 'uv',
                builtIntoOS: false,
                availableOn: ['windows'],
                installTool: 'powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"',
                configure: 'uv python install 3.13\nuv python pin 3.13   # writes .python-version',
                verify: 'uv --version',
                update: 'uv self update   # standalone installs only',
                remove: "Re-run the manager you installed it with in reverse (winget uninstall / scoop uninstall), or delete the installer's own install directory.",
                versionSwitch: 'uv python list',
                notes: 'Alternates: winget install --id=astral-sh.uv -e, scoop install main/uv.',
            },
            {
                managerId: 'pyenv-win',
                managerLabel: 'pyenv-win',
                builtIntoOS: false,
                availableOn: ['windows'],
                installManager:
                    'choco install pyenv-win -y   # or the install-pyenv-win.ps1 PowerShell script, or: scoop install main/pyenv',
                installTool: 'pyenv install 3.13.2',
                configure:
                    'Set PYENV, PYENV_HOME, PYENV_ROOT environment variables and add \\bin and \\shims to PATH ' +
                    '(the installer does this automatically).',
                verify: 'pyenv --version',
                update: 'pyenv update',
                remove: 'Remove ~/.pyenv and the PYENV* environment variables.',
                versionSwitch: 'pyenv global 3.13.2\npyenv local 3.13.2\npyenv shell 3.13.2',
                notes:
                    'Separate VBScript/batch codebase from Unix pyenv — .bat shims, not executable shims, and ' +
                    'no pyenv virtualenv support.',
            },
            PIP_ENTRY,
        ],
        linux: [
            {
                managerId: 'uv',
                managerLabel: 'uv',
                builtIntoOS: false,
                availableOn: ['linux'],
                installTool: 'curl -LsSf https://astral.sh/uv/install.sh | sh',
                configure: 'uv python install 3.13\nuv python pin 3.13   # writes .python-version',
                verify: 'uv --version',
                update: 'uv self update   # standalone installs only',
                remove: 'rm ~/.local/bin/uv ~/.local/bin/uvx',
                versionSwitch: 'uv python list',
                notes:
                    'Also installable natively via sudo dnf install uv (Fedora), sudo pacman -S uv (Arch), or ' +
                    'sudo zypper install uv (openSUSE) — not available via apt on Debian/Ubuntu, use this ' +
                    'script there instead.',
            },
            {
                managerId: 'pyenv',
                managerLabel: 'pyenv',
                builtIntoOS: false,
                availableOn: ['linux'],
                installManager: 'curl -fsSL https://pyenv.run | bash',
                installTool: 'pyenv install 3.13.2   # builds from source',
                configure:
                    'Install OS build dependencies first, e.g. Debian/Ubuntu: sudo apt install build-essential ' +
                    "libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev — then add pyenv's shell " +
                    'init lines to ~/.bashrc.',
                verify: 'pyenv --version',
                update: 'git -C ~/.pyenv pull',
                remove: 'rm -rf ~/.pyenv   # then remove the shell init lines it added',
                versionSwitch: 'pyenv global 3.13.2\npyenv local 3.13.2\npyenv shell 3.13.2',
            },
            PIP_ENTRY,
        ],
    },
};

const GO: DevEnvCategoryData = {
    category: 'go',
    label: 'Go',
    description:
        'Install the Go toolchain via the official installer or a package manager, and manage versions with goenv.',
    managersByOS: {
        macos: [
            {
                managerId: 'official-installer',
                managerLabel: 'Official installer (.pkg)',
                builtIntoOS: false,
                availableOn: ['macos'],
                installTool:
                    'Download the macOS .pkg from https://go.dev/dl/ and run it — installs to /usr/local/go and updates PATH automatically.',
                verify: 'go version',
                update: 'Download and run the newer .pkg — it replaces the previous install in place.',
                remove: 'sudo rm -rf /usr/local/go "$HOME/go"',
                versionSwitch:
                    'GOTOOLCHAIN=auto (Go 1.21+, the default) automatically downloads whatever toolchain a ' +
                    "project's go.mod requests — manual version switching is rarely needed.",
            },
            {
                managerId: 'brew',
                managerLabel: 'Homebrew',
                builtIntoOS: true,
                availableOn: ['macos'],
                installTool: 'brew install go',
                verify: 'go version',
                update: 'brew upgrade go',
                remove: 'brew uninstall go',
                notes: 'Pinned formulae exist for older majors, e.g. go@1.25, if you need to hold back a version.',
            },
            {
                managerId: 'goenv',
                managerLabel: 'goenv',
                builtIntoOS: false,
                availableOn: ['macos'],
                installManager: 'brew install goenv',
                installTool: 'goenv install 1.26.4',
                configure:
                    `echo 'export GOENV_ROOT="$HOME/.goenv"' >> ~/.zshrc\n` +
                    `echo 'export PATH="$GOENV_ROOT/bin:$PATH"' >> ~/.zshrc\n` +
                    `echo 'eval "$(goenv init -)"' >> ~/.zshrc   # place near the end, it manipulates PATH`,
                verify: 'goenv --version',
                update: 'brew upgrade goenv',
                remove: 'brew uninstall goenv   # then remove the three profile lines above',
                versionSwitch:
                    'goenv install 1.26.4 then goenv global 1.26.4 (system-wide) or goenv local 1.26.4 ' +
                    '(per-directory, writes a .go-version file).',
                notes: "macOS/Linux only — no Windows support, confirmed against the project's own README/INSTALL.md.",
            },
        ],
        windows: [
            {
                managerId: 'official-installer',
                managerLabel: 'Official installer (.msi)',
                builtIntoOS: false,
                availableOn: ['windows'],
                installTool:
                    'Download the .msi from https://go.dev/dl/ and run it — installs to C:\\Program Files\\Go and updates PATH automatically.',
                verify: 'go version',
                update: 'Download and run the newer .msi.',
                remove: 'Uninstall via "Add or Remove Programs", or delete C:\\Program Files\\Go manually.',
                versionSwitch:
                    "GOTOOLCHAIN=auto (Go 1.21+, the default) auto-downloads whatever toolchain a project's go.mod requests.",
            },
            {
                managerId: 'winget',
                managerLabel: 'winget',
                builtIntoOS: true,
                availableOn: ['windows'],
                installTool: 'winget install --id GoLang.Go -e',
                verify: 'go version',
                update: 'winget upgrade --id GoLang.Go -e',
                remove: 'winget uninstall --id GoLang.Go -e',
                notes:
                    'Alternates: choco install golang -y, scoop install go. No goenv on Windows — ' +
                    'GOTOOLCHAIN=auto (per-project go.mod) is the closest equivalent to automatic version switching.',
            },
        ],
        linux: [
            {
                managerId: 'official-installer',
                managerLabel: 'Official installer (tarball)',
                builtIntoOS: false,
                availableOn: ['linux'],
                installTool:
                    'sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf goX.Y.Z.linux-amd64.tar.gz   # download the tarball from https://go.dev/dl/ first',
                configure: 'export PATH=$PATH:/usr/local/go/bin   # add to ~/.bashrc or ~/.zshrc',
                verify: 'go version',
                update: 'Repeat the rm+tar steps above with a newer tarball.',
                remove: 'sudo rm -rf /usr/local/go',
                versionSwitch:
                    "GOTOOLCHAIN=auto (Go 1.21+, the default) auto-downloads whatever toolchain a project's go.mod requests.",
            },
            {
                managerId: 'goenv',
                managerLabel: 'goenv',
                builtIntoOS: false,
                availableOn: ['linux'],
                installManager: 'git clone https://github.com/go-nv/goenv.git ~/.goenv',
                installTool: 'goenv install 1.26.4',
                configure:
                    `echo 'export GOENV_ROOT="$HOME/.goenv"' >> ~/.bashrc\n` +
                    `echo 'export PATH="$GOENV_ROOT/bin:$PATH"' >> ~/.bashrc\n` +
                    `echo 'eval "$(goenv init -)"' >> ~/.bashrc   # place near the end, it manipulates PATH`,
                verify: 'goenv --version',
                update: 'cd ~/.goenv && git pull',
                remove: 'rm -rf ~/.goenv   # then remove the three profile lines above',
                versionSwitch:
                    'goenv install 1.26.4 then goenv global 1.26.4 (system-wide) or goenv local 1.26.4 ' +
                    '(per-directory, writes a .go-version file).',
                notes: "macOS/Linux only — no Windows support, confirmed against the project's own README/INSTALL.md.",
            },
        ],
    },
    linuxDistroOverrides: {
        debian: [
            {
                managerId: 'apt',
                managerLabel: 'apt',
                builtIntoOS: true,
                availableOn: ['linux'],
                installTool: 'sudo apt install -y golang-go',
                verify: 'go version',
                update: 'sudo apt upgrade',
                remove: 'sudo apt remove -y golang-go',
                notes:
                    'Lags upstream badly — e.g. Ubuntu 24.04 ships go1.22 against a much newer upstream. ' +
                    'Prefer the official tarball above, or the PPA below for a current apt-managed release.',
            },
            {
                managerId: 'ppa-longsleep',
                managerLabel: 'PPA (longsleep/golang-backports, Ubuntu)',
                builtIntoOS: false,
                availableOn: ['linux'],
                repoSetup: 'sudo add-apt-repository -y ppa:longsleep/golang-backports && sudo apt update',
                installTool: 'sudo apt install -y golang-go',
                verify: 'go version',
                update: 'sudo apt update && sudo apt install --only-upgrade -y golang-go',
                remove: 'sudo add-apt-repository --remove ppa:longsleep/golang-backports',
                notes: 'Ubuntu-only PPA that tracks a current Go release, unlike the distro-shipped golang-go package above.',
            },
        ],
        fedora: [
            {
                managerId: 'dnf',
                managerLabel: 'dnf',
                builtIntoOS: true,
                availableOn: ['linux'],
                installTool: 'sudo dnf install -y golang',
                verify: 'go version',
                update: 'sudo dnf upgrade -y golang',
                remove: 'sudo dnf remove -y golang',
            },
        ],
        arch: [
            {
                managerId: 'pacman',
                managerLabel: 'pacman',
                builtIntoOS: true,
                availableOn: ['linux'],
                installTool: 'sudo pacman -S go',
                verify: 'go version',
                update: 'sudo pacman -Syu',
                remove: 'sudo pacman -Rs go',
                notes: 'Official [extra] repo, not AUR — fully current, rolling. Preferred over snap.',
            },
        ],
        suse: [
            {
                managerId: 'zypper-tumbleweed',
                managerLabel: 'zypper (Tumbleweed)',
                builtIntoOS: true,
                availableOn: ['linux'],
                installTool: 'sudo zypper install go',
                verify: 'go version',
                update: 'sudo zypper dup',
                remove: 'sudo zypper remove go',
                notes: 'Tumbleweed only — the official OSS repo carries a current go package. Leap needs the version-pinned OBS repo below instead.',
            },
            {
                managerId: 'zypper-leap-obs',
                managerLabel: 'zypper (Leap, via OBS repo)',
                builtIntoOS: false,
                availableOn: ['linux'],
                repoSetup:
                    'sudo zypper addrepo https://download.opensuse.org/repositories/devel:languages:go/16.0/devel:languages:go.repo && sudo zypper refresh',
                installTool: 'sudo zypper install go',
                verify: 'go version',
                update: 'sudo zypper update go',
                remove: 'sudo zypper remove go',
                notes:
                    'Leap 16.0 has no official go package in its default repos — this OBS repo path is ' +
                    'version-pinned to 16.0 and must be revisited when the catalog is next updated for a newer ' +
                    'Leap release. Never run a bare "zypper dup" on Leap — that command is for Tumbleweed only.',
            },
        ],
    },
};

const NODEJS: DevEnvCategoryData = {
    category: 'nodejs',
    label: 'Node.js',
    description: 'Install Node.js via a package manager or version manager (nvm/fnm), plus Corepack for pnpm/Yarn.',
    managersByOS: {
        macos: [
            {
                managerId: 'brew',
                managerLabel: 'Homebrew',
                builtIntoOS: true,
                availableOn: ['macos'],
                installTool: 'brew install node@24   # LTS; use "brew install node" for Current (non-LTS)',
                verify: 'node -v && npm -v',
                update: 'brew upgrade node@24',
                remove: 'brew uninstall node@24',
                versionSwitch:
                    'Use nvm or fnm below to run multiple Node versions side by side — plain Homebrew only tracks one linked version at a time.',
            },
            {
                managerId: 'nvm',
                managerLabel: 'nvm',
                builtIntoOS: false,
                availableOn: ['macos'],
                installManager: 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash',
                installTool: '# the installer auto-detects and appends its loader lines to ~/.zshrc',
                verify: 'nvm --version',
                update: 'Re-run the install script with a newer nvm release tag.',
                remove: 'rm -rf ~/.nvm   # then remove the loader lines from ~/.zshrc',
                versionSwitch: "nvm install --lts && nvm alias default 'lts/*'   # per-project: .nvmrc + nvm use",
                notes: 'fish shell is not natively supported by nvm.',
            },
            {
                managerId: 'fnm',
                managerLabel: 'fnm',
                builtIntoOS: false,
                availableOn: ['macos'],
                installManager: 'brew install fnm',
                installTool: `echo 'eval "$(fnm env --use-on-cd)"' >> ~/.zshrc`,
                verify: 'fnm --version',
                update: 'brew upgrade fnm',
                remove: 'brew uninstall fnm',
                versionSwitch:
                    'fnm install --lts && fnm default 24   # --use-on-cd auto-switches on .node-version/.nvmrc',
                notes: 'Cross-platform (macOS/Windows/Linux) including native Windows — generally the recommended default over nvm/nvm-windows today.',
            },
            COREPACK_ENTRY,
        ],
        windows: [
            {
                managerId: 'winget',
                managerLabel: 'winget',
                builtIntoOS: true,
                availableOn: ['windows'],
                installTool: 'winget install -e --id OpenJS.NodeJS.LTS',
                verify: 'node -v',
                update: 'winget upgrade --id OpenJS.NodeJS.LTS -e',
                remove: 'winget uninstall --id OpenJS.NodeJS.LTS -e',
                notes: 'Alternates: choco install nodejs-lts, scoop install nodejs-lts.',
            },
            {
                managerId: 'nvm-windows',
                managerLabel: 'nvm-windows',
                builtIntoOS: false,
                availableOn: ['windows'],
                installManager: 'winget install -e --id CoreyButler.NVMforWindows',
                installTool: 'nvm install lts',
                verify: 'nvm version   # note: no "--" prefix, unlike Unix nvm',
                update: 'Re-run the winget install command for a newer release.',
                remove: 'Run the NVM for Windows uninstaller, or: winget uninstall --id CoreyButler.NVMforWindows -e',
                versionSwitch: 'nvm install lts && nvm use <version>',
                notes:
                    'Unrelated Go-based reimplementation of nvm (not API-compatible) — no .nvmrc support and ' +
                    'currently in feature freeze. fnm below is the better recommendation today.',
            },
            {
                managerId: 'fnm',
                managerLabel: 'fnm',
                builtIntoOS: false,
                availableOn: ['windows'],
                installManager: 'winget install -e --id Schniz.fnm',
                installTool:
                    'fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression   # add to $PROFILE',
                verify: 'fnm --version',
                update: 'winget upgrade --id Schniz.fnm -e',
                remove: 'winget uninstall --id Schniz.fnm -e',
                versionSwitch: 'fnm install --lts && fnm default 24',
                notes: 'Alternates: choco install fnm, scoop install fnm.',
            },
            COREPACK_ENTRY,
        ],
        linux: [
            {
                managerId: 'nvm',
                managerLabel: 'nvm',
                builtIntoOS: false,
                availableOn: ['linux'],
                installManager: 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash',
                installTool: '# the installer auto-detects and appends its loader lines to ~/.bashrc',
                verify: 'nvm --version',
                update: 'Re-run the install script with a newer nvm release tag.',
                remove: 'rm -rf ~/.nvm   # then remove the loader lines from ~/.bashrc',
                versionSwitch: "nvm install --lts && nvm alias default 'lts/*'   # per-project: .nvmrc + nvm use",
            },
            {
                managerId: 'fnm',
                managerLabel: 'fnm',
                builtIntoOS: false,
                availableOn: ['linux'],
                installManager: 'curl -fsSL https://fnm.vercel.app/install | bash',
                installTool: `echo 'eval "$(fnm env --use-on-cd)"' >> ~/.bashrc`,
                verify: 'fnm --version',
                update: 'Re-run the install script for a newer fnm release.',
                remove: "Remove fnm's install directory and the eval line above manually.",
                versionSwitch:
                    'fnm install --lts && fnm default 24   # --use-on-cd auto-switches on .node-version/.nvmrc',
            },
            COREPACK_ENTRY,
        ],
    },
    linuxDistroOverrides: {
        debian: [
            {
                managerId: 'apt',
                managerLabel: 'apt',
                builtIntoOS: true,
                availableOn: ['linux'],
                installTool: 'sudo apt install nodejs npm',
                verify: 'node -v',
                update: 'sudo apt upgrade',
                remove: 'sudo apt remove nodejs npm',
                notes: 'Ships an EOL Node line on current LTS releases — do not use for development. Use nvm or fnm above instead for a current version.',
            },
        ],
    },
};

const BUN: DevEnvCategoryData = {
    category: 'bun',
    label: 'Bun',
    description:
        'Install the Bun JavaScript runtime/bundler/test-runner via its official installer, npm, or a platform package manager.',
    managersByOS: {
        macos: [
            {
                managerId: 'official-script',
                managerLabel: 'Official installer script',
                builtIntoOS: false,
                availableOn: ['macos'],
                installTool: 'curl -fsSL https://bun.com/install | bash',
                configure:
                    'export BUN_INSTALL="$HOME/.bun"\nexport PATH="$BUN_INSTALL/bin:$PATH"   # the installer usually adds this to ~/.zshrc automatically',
                verify: 'bun --version && bun --revision',
                update: 'bun upgrade   # self-upgrading binary',
                remove: 'rm -rf ~/.bun',
                notes:
                    'No official first-party multi-version manager — the community tool bum (owenizedd/bum) ' +
                    'offers "bum use <version>", flagged here as third-party, not official.',
            },
            BUN_NPM_ENTRY,
            {
                managerId: 'brew',
                managerLabel: 'Homebrew',
                builtIntoOS: true,
                availableOn: ['macos'],
                installTool:
                    'brew install oven-sh/bun/bun   # tap-qualified — plain "brew install bun" is not the documented command',
                verify: 'bun --version',
                update: 'brew upgrade bun   # use this, not "bun upgrade", to avoid conflicts',
                remove: 'brew uninstall bun',
            },
        ],
        windows: [
            {
                managerId: 'official-script',
                managerLabel: 'Official installer script',
                builtIntoOS: false,
                availableOn: ['windows'],
                installTool: 'powershell -c "irm bun.sh/install.ps1|iex"   # requires Windows 10 version 1809+',
                configure: "If PATH wasn't updated automatically, add %USERPROFILE%\\.bun\\bin to the User PATH.",
                verify: 'bun --version',
                update: 'bun upgrade',
                remove: 'powershell -c ~\\.bun\\uninstall.ps1',
            },
            BUN_NPM_ENTRY,
            {
                managerId: 'scoop',
                managerLabel: 'Scoop',
                builtIntoOS: false,
                availableOn: ['windows'],
                installManager: WINDOWS_SCOOP_INSTALL,
                installTool: 'scoop install bun',
                verify: 'bun --version',
                update: 'scoop update bun   # use this, not "bun upgrade", to avoid conflicts',
                remove: 'scoop uninstall bun',
                notes: 'No official winget package exists for Bun — do not invent one.',
            },
        ],
        linux: [
            {
                managerId: 'official-script',
                managerLabel: 'Official installer script',
                builtIntoOS: false,
                availableOn: ['linux'],
                installTool: 'curl -fsSL https://bun.com/install | bash',
                configure:
                    'export BUN_INSTALL="$HOME/.bun"\nexport PATH="$BUN_INSTALL/bin:$PATH"   # the installer usually adds this to ~/.bashrc automatically',
                verify: 'bun --version && bun --revision',
                update: 'bun upgrade',
                remove: 'rm -rf ~/.bun',
                notes:
                    "Needs unzip available first: sudo apt install unzip (or your distro's equivalent). No " +
                    'official distro-native package (apt/dnf/pacman/zypper) exists — the curl script or npm ' +
                    'are the documented Linux paths.',
            },
            BUN_NPM_ENTRY,
        ],
    },
};

export const DEV_ENV_CATALOG: Record<DevEnvCategory, DevEnvCategoryData> = {
    java: JAVA,
    python: PYTHON,
    go: GO,
    nodejs: NODEJS,
    bun: BUN,
};
