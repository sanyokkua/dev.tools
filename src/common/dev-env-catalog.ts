import { WINDOWS_ENV_SET_VARIABLE, WINDOWS_ENV_VIEW_VARIABLE, WINDOWS_SCOOP_INSTALL } from './windows-utils';

export type DevEnvCategory = 'java' | 'maven' | 'gradle' | 'python' | 'go' | 'rust' | 'nodejs' | 'bun';
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
    installTool:
        'sdk install java   # installs the default vendor build — run "sdk list java" to see every vendor/version identifier',
    verify: 'sdk version',
    update: 'sdk selfupdate   # updates SDKMAN itself; sdk upgrade updates installed candidates',
    remove: 'rm -rf ~/.sdkman   # then remove the SDKMAN init line from your shell profile',
    versionSwitch:
        'sdk list java                       # find an identifier, e.g. 25.0.1-tem (suffixes: -tem / -amzn / -zulu / -ms / -oracle / -graalce)\n' +
        'sdk use java <identifier>           # shell-local\n' +
        'sdk default java <identifier>       # permanent\n' +
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

const PIPX_ENTRY: DevEnvManagerBootstrap = {
    managerId: 'pipx',
    managerLabel: 'pipx',
    builtIntoOS: false,
    availableOn: ['macos', 'windows', 'linux'],
    installTool: 'pipx install <package>   # e.g. pipx install httpie',
    verify: 'pipx --version',
    update: 'pipx upgrade-all',
    remove: 'pipx uninstall <package>',
    notes:
        'Installs each CLI app into its own isolated virtualenv while linking just the entry-point script onto ' +
        'PATH — the recommended way to install Python-packaged CLI tools without the PEP 668 ' +
        '"externally-managed-environment" friction pip hits (see the pip entry above). Install pipx itself via ' +
        'brew install pipx (macOS), apt/dnf install pipx or pacman -S python-pipx / zypper install python3-pipx ' +
        '(Linux — package name varies by distro), or python -m pip install --user pipx; python -m pipx ' +
        'ensurepath (Windows, no official winget/Chocolatey package).',
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
                    'brew install --cask temurin@25   # swap vendor: corretto / microsoft-openjdk / zulu; version: @8 / @11 / @17 / @21 / @25',
                configure: `echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 25)' >> ~/.zshrc`,
                verify: '/usr/libexec/java_home -V\njava -version',
                update: 'brew upgrade --cask temurin@25',
                remove: 'brew uninstall --cask temurin@25',
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
                    'jenv add /Library/Java/JavaVirtualMachines/temurin-25.jdk/Contents/Home   # install a JDK first (see the Homebrew cask entry above)\n' +
                    'jenv versions',
                verify: 'jenv doctor   # expect: [OK] Jenv is correctly loaded',
                update: 'brew upgrade jenv',
                remove: 'brew uninstall jenv   # then remove the two shell-init lines above',
                versionSwitch:
                    'jenv global 25.0   # default everywhere\n' +
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
                    'winget install -e --id EclipseAdoptium.Temurin.25.JDK   # note: Microsoft.OpenJDK.25 has no ".JDK" suffix, unlike other vendors',
                configure: `${WINDOWS_ENV_SET_VARIABLE}\n[Environment]::SetEnvironmentVariable("PATH", "$([Environment]::GetEnvironmentVariable('PATH','User'));$([Environment]::GetEnvironmentVariable('JAVA_HOME','User'))\\bin", "User")`,
                verify: 'java -version',
                update: 'winget upgrade --id EclipseAdoptium.Temurin.25.JDK -e',
                remove: 'winget uninstall --id EclipseAdoptium.Temurin.25.JDK -e',
                versionSwitch:
                    'Install another versioned winget package (e.g. EclipseAdoptium.Temurin.17.JDK) side by ' +
                    'side, then repeat the JAVA_HOME step above for whichever version should be active — ' +
                    'Windows has no jenv equivalent, see the manual JAVA_HOME entry below for an alternative.',
                notes: 'Alternates: choco install temurin25 -y, or scoop bucket add java; scoop install java/temurin25-jdk.',
            },
            {
                managerId: 'manual-javahome',
                managerLabel: 'Manual JAVA_HOME (PowerShell)',
                builtIntoOS: true,
                availableOn: ['windows'],
                installTool: WINDOWS_ENV_SET_VARIABLE,
                configure: `$current = [Environment]::GetEnvironmentVariable("PATH", "User")\n[Environment]::SetEnvironmentVariable("PATH", "$current;$([Environment]::GetEnvironmentVariable('JAVA_HOME','User'))\\bin", "User")`,
                verify: `${WINDOWS_ENV_VIEW_VARIABLE}\njava -version`,
                update: 'Re-run the SetEnvironmentVariable command above with the new JDK path after installing it via winget/choco/scoop.',
                remove: '[Environment]::SetEnvironmentVariable("JAVA_HOME", $null, "User")',
                versionSwitch:
                    'No jenv on Windows. In order of reliability: SDKMAN! inside WSL, then Scoop ' +
                    '(scoop install temurin17-jdk temurin25-jdk + scoop reset <pkg>), then this manual ' +
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
                    'jenv add /usr/lib/jvm/temurin-25-jdk   # install a JDK first via your distro package manager below\n' +
                    'jenv versions',
                verify: 'jenv doctor   # expect: [OK] Jenv is correctly loaded',
                update: 'git -C ~/.jenv pull',
                remove: 'rm -rf ~/.jenv   # then remove the two shell-init lines above',
                versionSwitch:
                    'jenv global 25.0   # default everywhere\n' +
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
                installTool: 'sudo apt install -y temurin-25-jdk   # package name varies by vendor',
                verify: 'java -version',
                update: 'sudo apt update && sudo apt install --only-upgrade -y temurin-25-jdk',
                remove: 'sudo apt remove -y temurin-25-jdk',
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
                installTool: 'sudo pacman -S jdk25-openjdk',
                verify: 'java -version',
                update: 'sudo pacman -Syu',
                remove: 'sudo pacman -Rns jdk25-openjdk',
                versionSwitch:
                    'sudo archlinux-java set java-25-openjdk   # Arch does not use update-alternatives for Java',
                notes:
                    "This is Arch's officially-supported Java path. Vendor builds (Temurin/Corretto/MS-OpenJDK/" +
                    'Zulu) are AUR-only on Arch and occasionally break — prefer this native package unless you ' +
                    'specifically need a vendor build.',
            },
        ],
    },
};

// Maven and Gradle are deliberately manual-install-only in this catalog (no brew/choco/scoop/apt/dnf/pacman/
// zypper entries) — see SDKMAN! above (already installs both: `sdk install maven` / `sdk install gradle`) for
// a version-manager alternative instead.
//
// Their scripts contain the VERSION_PLACEHOLDER token, replaced with the user-chosen version by applyVersion().
// Downloads are intentionally not checksum-verified.

export const DEFAULT_MAVEN_VERSION = '3.10.0';
export const DEFAULT_GRADLE_VERSION = '9.9.1';
export const VERSION_PLACEHOLDER = '{{VERSION}}';
export const VERSION_PATTERN = /^\d+\.\d+(\.\d+)?(-[\w.-]+)?$/;

/** Categories whose scripts carry VERSION_PLACEHOLDER, mapped to their default version. */
export const VERSIONED_CATEGORY_DEFAULTS: Partial<Record<DevEnvCategory, string>> = {
    maven: DEFAULT_MAVEN_VERSION,
    gradle: DEFAULT_GRADLE_VERSION,
};

/** Returns the trimmed input when it is a valid version, otherwise the fallback. */
export function resolveVersion(input: string, fallback: string): string {
    const trimmed = input.trim();
    return VERSION_PATTERN.test(trimmed) ? trimmed : fallback;
}

/** Substitutes VERSION_PLACEHOLDER in a script with the given version. */
export function applyVersion(text: string, version: string): string {
    return text.split(VERSION_PLACEHOLDER).join(version);
}

const MAVEN_URL_BASH =
    'https://archive.apache.org/dist/maven/maven-${MAVEN_VERSION%%.*}/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz';
const MAVEN_URL_POWERSHELL =
    "https://archive.apache.org/dist/maven/maven-$($Version.Split('.')[0])/$Version/binaries/apache-maven-$Version-bin.zip";

const MAVEN_MANUAL_MACOS: DevEnvManagerBootstrap = {
    managerId: 'manual',
    managerLabel: 'Manual (binary download)',
    builtIntoOS: false,
    availableOn: ['macos'],
    installTool:
        `MAVEN_VERSION="${VERSION_PLACEHOLDER}"\n` +
        `curl -fLO "${MAVEN_URL_BASH}"\n` +
        'sudo mkdir -p /opt/apache-maven   # or mkdir -p ~/.dev_tools/apache-maven for a single-user, no-sudo install\n' +
        'sudo tar -xzf "apache-maven-${MAVEN_VERSION}-bin.tar.gz" -C /opt/apache-maven\n' +
        'sudo ln -sfn "/opt/apache-maven/apache-maven-${MAVEN_VERSION}" /opt/apache-maven/latest   # "latest" symlink — repoint it on future upgrades instead of editing MAVEN_HOME',
    configure:
        `echo 'export MAVEN_HOME=/opt/apache-maven/latest' >> ~/.zprofile\n` +
        `echo 'export PATH="$PATH:$MAVEN_HOME/bin"' >> ~/.zprofile   # ~/.zprofile, not ~/.zshenv — /etc/zprofile's path_helper reorders PATH set there\n` +
        'source ~/.zprofile',
    verify: 'mvn -v',
    update:
        'Download the newer version tarball, extract it next to the old one under /opt/apache-maven, then repoint ' +
        'the symlink: sudo ln -sfn /opt/apache-maven/apache-maven-<new-version> /opt/apache-maven/latest — ' +
        'MAVEN_HOME never needs to change.',
    remove: 'sudo rm -rf /opt/apache-maven   # then remove the MAVEN_HOME/PATH lines from ~/.zprofile',
    notes:
        'Needs JDK 8+. Only bin needs to be on PATH — MAVEN_HOME itself is optional, kept here only as a ' +
        'convenience for IDEs/scripts that read it. Never set M2_HOME: it was deprecated in Maven 3.5.0 and is ' +
        'unsupported today. For automatic multi-version management instead of a pinned manual install, see ' +
        'SDKMAN! above (sdk install maven).',
};

const MAVEN_MANUAL_LINUX: DevEnvManagerBootstrap = {
    managerId: 'manual',
    managerLabel: 'Manual (binary download)',
    builtIntoOS: false,
    availableOn: ['linux'],
    installTool:
        `MAVEN_VERSION="${VERSION_PLACEHOLDER}"\n` +
        `curl -fLO "${MAVEN_URL_BASH}"\n` +
        'sudo mkdir -p /opt/apache-maven   # or mkdir -p ~/.local/opt/apache-maven for a single-user, no-sudo install\n' +
        'sudo tar -xzf "apache-maven-${MAVEN_VERSION}-bin.tar.gz" -C /opt/apache-maven\n' +
        'sudo ln -sfn "/opt/apache-maven/apache-maven-${MAVEN_VERSION}" /opt/apache-maven/latest   # "latest" symlink',
    configure:
        `echo 'export MAVEN_HOME=/opt/apache-maven/latest' >> ~/.bashrc   # per-terminal; single-user: use $HOME/.local/opt/apache-maven/latest instead\n` +
        `echo 'export PATH="$PATH:$MAVEN_HOME/bin"' >> ~/.bashrc\n` +
        'source ~/.bashrc\n' +
        '# For login shells, also add the same two lines to ~/.profile (Debian/Ubuntu) or ~/.bash_profile (Fedora/RHEL)\n' +
        '# For all users, drop them in /etc/profile.d/maven.sh instead',
    verify: 'mvn -v',
    update:
        'Download the newer version tarball, extract it next to the old one under /opt/apache-maven (or ' +
        '~/.local/opt/apache-maven), then repoint the symlink: sudo ln -sfn /opt/apache-maven/apache-maven-<new-version> ' +
        '/opt/apache-maven/latest — MAVEN_HOME never needs to change.',
    remove:
        'sudo rm -rf /opt/apache-maven   # then remove the MAVEN_HOME/PATH lines from ~/.bashrc (and ' +
        '~/.profile / ~/.bash_profile / /etc/profile.d if added there too)',
    notes:
        'Needs JDK 8+. Only bin needs to be on PATH — MAVEN_HOME itself is optional, kept here only as a ' +
        'convenience for IDEs/scripts that read it. Never set M2_HOME: it was deprecated in Maven 3.5.0 and is ' +
        'unsupported today. For automatic multi-version management instead of a pinned manual install, see ' +
        'SDKMAN! above (sdk install maven).',
};

const MAVEN_AUTOMATED_UNIX: DevEnvManagerBootstrap = {
    managerId: 'automated-script',
    managerLabel: 'Automated install script (bash/zsh)',
    builtIntoOS: false,
    availableOn: ['macos', 'linux'],
    installTool:
        '#!/usr/bin/env bash\n' +
        'set -euo pipefail\n' +
        '\n' +
        `MAVEN_VERSION="${VERSION_PLACEHOLDER}"\n` +
        'INSTALL_ROOT="/opt/apache-maven"                 # or "$HOME/.local/opt/apache-maven" for single user\n' +
        'TAR="apache-maven-${MAVEN_VERSION}-bin.tar.gz"\n' +
        `URL="${MAVEN_URL_BASH.replace('apache-maven-${MAVEN_VERSION}-bin.tar.gz', '${TAR}')}"\n` +
        '\n' +
        'tmp="$(mktemp -d)"; trap \'rm -rf "$tmp"\' EXIT\n' +
        'echo "Downloading $URL ..."\n' +
        'curl -fL "$URL" -o "$tmp/$TAR"\n' +
        '\n' +
        'echo "Installing to ${INSTALL_ROOT}/apache-maven-${MAVEN_VERSION} ..."\n' +
        'SUDO=""; [ -w "$(dirname "$INSTALL_ROOT")" ] || SUDO="sudo"\n' +
        '$SUDO mkdir -p "$INSTALL_ROOT"\n' +
        '$SUDO tar -xzf "$tmp/$TAR" -C "$INSTALL_ROOT"\n' +
        '$SUDO ln -sfn "$INSTALL_ROOT/apache-maven-${MAVEN_VERSION}" "$INSTALL_ROOT/latest"\n' +
        '\n' +
        'RC="$HOME/.bashrc"; [ "$(uname)" = "Darwin" ] && RC="$HOME/.zprofile"\n' +
        'MARK="# >>> maven install >>>"\n' +
        'if ! grep -qF "$MARK" "$RC" 2>/dev/null; then\n' +
        '  {\n' +
        '    echo "$MARK"\n' +
        '    echo "export MAVEN_HOME=\\"$INSTALL_ROOT/latest\\""\n' +
        '    echo \'export PATH="$MAVEN_HOME/bin:$PATH"\'\n' +
        '    echo "# <<< maven install <<<"\n' +
        '  } >> "$RC"\n' +
        '  echo "Updated $RC"\n' +
        'fi\n' +
        '\n' +
        'export MAVEN_HOME="$INSTALL_ROOT/latest"; export PATH="$MAVEN_HOME/bin:$PATH"\n' +
        'mvn -v && echo "Maven ${MAVEN_VERSION} installed. Open a new shell or \'source $RC\'."',
    verify: 'mvn -v',
    update:
        'Change MAVEN_VERSION at the top of the script and re-run it — it installs into a new versioned folder and ' +
        'repoints the "latest" symlink; MAVEN_HOME (which points at "latest") never needs to change. ' +
        'Safe/idempotent to re-run.',
    remove:
        'sudo rm -rf /opt/apache-maven   # or rm -rf ~/.local/opt/apache-maven for a single-user install; then ' +
        'remove the "# >>> maven install >>>" ... "# <<< maven install <<<" block from ~/.zprofile or ~/.bashrc',
    notes:
        'Does everything the manual entry does in one step: download, extract, and MAVEN_HOME/PATH wiring via a ' +
        'versioned-dir + "latest" symlink — never sets M2_HOME (deprecated/unsupported since Maven 3.5.0). Prefer ' +
        'SDKMAN! above instead if you want easy multi-version switching rather than a single pinned install.',
};

const MAVEN_MANUAL_WINDOWS: DevEnvManagerBootstrap = {
    managerId: 'manual',
    managerLabel: 'Manual (binary download, PowerShell)',
    builtIntoOS: false,
    availableOn: ['windows'],
    installTool:
        `$Version = "${VERSION_PLACEHOLDER}"\n` +
        `Invoke-WebRequest -Uri "${MAVEN_URL_POWERSHELL}" -OutFile "$env:TEMP\\apache-maven-$Version-bin.zip"\n` +
        'Expand-Archive -Path "$env:TEMP\\apache-maven-$Version-bin.zip" -DestinationPath "$env:TEMP\\apache-maven-$Version" -Force\n' +
        'New-Item -ItemType Directory -Force -Path C:\\Tools | Out-Null\n' +
        'if (Test-Path C:\\Tools\\apache-maven) { Remove-Item -Recurse -Force C:\\Tools\\apache-maven }   # stable folder, replaced on every install\n' +
        'Move-Item "$env:TEMP\\apache-maven-$Version\\apache-maven-$Version" C:\\Tools\\apache-maven',
    configure:
        '[Environment]::SetEnvironmentVariable("MAVEN_HOME", "C:\\Tools\\apache-maven", "User")\n' +
        '$current = [Environment]::GetEnvironmentVariable("PATH", "User")\n' +
        '[Environment]::SetEnvironmentVariable("PATH", "$current;C:\\Tools\\apache-maven\\bin", "User")',
    verify: 'mvn -v',
    update:
        'Re-run the install step with the newer version — it replaces C:\\Tools\\apache-maven in place, so ' +
        'MAVEN_HOME and PATH never need to change.',
    remove:
        '[Environment]::SetEnvironmentVariable("MAVEN_HOME", $null, "User")\n' +
        'Remove-Item -Recurse -Force C:\\Tools\\apache-maven',
    notes:
        'Needs JDK 8+. MAVEN_HOME is optional (kept here for IDEs/scripts) — only %MAVEN_HOME%\\bin needs to be ' +
        'on PATH. Never set M2_HOME; it is deprecated/unsupported since Maven 3.5.0. Avoid installing under ' +
        '"C:\\Program Files\\..." — the space in that path breaks some build tools/scripts; C:\\Tools avoids that ' +
        'entirely. For automatic multi-version management, see SDKMAN! above — Windows only via WSL.',
};

const MAVEN_AUTOMATED_WINDOWS: DevEnvManagerBootstrap = {
    managerId: 'automated-script',
    managerLabel: 'Automated install script (PowerShell)',
    builtIntoOS: false,
    availableOn: ['windows'],
    installTool:
        '#Requires -Version 5.1\n' +
        '$ErrorActionPreference = "Stop"\n' +
        `$Version   = "${VERSION_PLACEHOLDER}"\n` +
        "$Major     = $Version.Split('.')[0]\n" +
        '$Root      = "C:\\Tools"\n' +
        '$MavenHome = "$Root\\apache-maven"   # stable folder, replaced on every install\n' +
        '$Zip       = "$env:TEMP\\apache-maven-$Version-bin.zip"\n' +
        '$Tmp       = "$env:TEMP\\apache-maven-$Version"\n' +
        '$Url       = "https://archive.apache.org/dist/maven/maven-$Major/$Version/binaries/apache-maven-$Version-bin.zip"\n' +
        '\n' +
        'Write-Host "Downloading $Url ..."\n' +
        'Invoke-WebRequest -Uri $Url -OutFile $Zip\n' +
        '\n' +
        'Write-Host "Extracting ..."\n' +
        'if (Test-Path $Tmp) { Remove-Item -Recurse -Force $Tmp }\n' +
        'Expand-Archive -Path $Zip -DestinationPath $Tmp -Force\n' +
        'New-Item -ItemType Directory -Force -Path $Root | Out-Null\n' +
        'if (Test-Path $MavenHome) { Remove-Item -Recurse -Force $MavenHome }\n' +
        'Move-Item "$Tmp\\apache-maven-$Version" $MavenHome\n' +
        'Remove-Item -Recurse -Force $Tmp, $Zip\n' +
        '\n' +
        'Write-Host "Setting environment variables (User scope) ..."\n' +
        '[Environment]::SetEnvironmentVariable("MAVEN_HOME", $MavenHome, "User")\n' +
        '$p = [Environment]::GetEnvironmentVariable("Path","User")\n' +
        '$bin = "$MavenHome\\bin"\n' +
        'if ($p -notlike "*$bin*") {\n' +
        '  [Environment]::SetEnvironmentVariable("Path", ($p.TrimEnd(\';\') + ";" + $bin), "User")\n' +
        '}\n' +
        'Write-Host "Done. Open a NEW terminal and run: mvn -v"',
    verify: 'mvn -v',
    update:
        'Change $Version at the top of the script and re-run it — it replaces C:\\Tools\\apache-maven with the new ' +
        'version, so MAVEN_HOME/PATH never need to change.',
    remove:
        '[Environment]::SetEnvironmentVariable("MAVEN_HOME", $null, "User")\n' +
        'Remove-Item -Recurse -Force C:\\Tools\\apache-maven',
    notes:
        'Does everything the manual entry does in one step, PowerShell 5.1+ compatible. Never sets M2_HOME. ' +
        'Prefer SDKMAN! inside WSL above instead if you want easy multi-version switching.',
};

const MAVEN: DevEnvCategoryData = {
    category: 'maven',
    label: 'Maven',
    description:
        'Manually install Apache Maven from the official Apache binary distribution — download, extract to a ' +
        'recommended folder, and wire MAVEN_HOME/PATH by hand. Package-manager installs ' +
        '(brew/choco/scoop/apt/dnf/pacman/zypper) are intentionally out of scope here — see SDKMAN! in the Java ' +
        'category for automatic multi-version management instead.',
    managersByOS: {
        macos: [MAVEN_MANUAL_MACOS, MAVEN_AUTOMATED_UNIX],
        windows: [MAVEN_MANUAL_WINDOWS, MAVEN_AUTOMATED_WINDOWS],
        linux: [MAVEN_MANUAL_LINUX, MAVEN_AUTOMATED_UNIX],
    },
};

const GRADLE_MANUAL_MACOS: DevEnvManagerBootstrap = {
    managerId: 'manual',
    managerLabel: 'Manual (binary download)',
    builtIntoOS: false,
    availableOn: ['macos'],
    installTool:
        `GRADLE_VERSION="${VERSION_PLACEHOLDER}"\n` +
        'curl -fLO "https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip"\n' +
        'sudo mkdir -p /opt/gradle\n' +
        'sudo unzip -q "gradle-${GRADLE_VERSION}-bin.zip" -d /opt/gradle       # or ~/.dev_tools/gradle for a single-user, no-sudo install\n' +
        'sudo ln -sfn "/opt/gradle/gradle-${GRADLE_VERSION}" /opt/gradle/latest   # optional "latest" symlink — repoint it on future upgrades instead of editing GRADLE_HOME',
    configure:
        `echo 'export GRADLE_HOME=/opt/gradle/latest' >> ~/.zprofile\n` +
        `echo 'export PATH="$PATH:$GRADLE_HOME/bin"' >> ~/.zprofile   # ~/.zprofile, not ~/.zshenv — /etc/zprofile's path_helper reorders PATH set there\n` +
        'source ~/.zprofile',
    verify: 'gradle -v',
    update:
        'Download the newer bin.zip, unzip it next to the old version, then repoint the symlink: sudo ln -sfn ' +
        '/opt/gradle/gradle-<new-version> /opt/gradle/latest — GRADLE_HOME never needs to change.',
    remove: 'sudo rm -rf /opt/gradle   # then remove the GRADLE_HOME/PATH lines from ~/.zprofile',
    notes:
        'Needs JDK 17+. Unlike Maven, GRADLE_HOME is the documented/recommended indirection here — pairing it ' +
        'with a versioned install dir and a "latest" symlink makes upgrades a one-line symlink repoint instead of ' +
        'editing your shell profile every time. For automatic multi-version management instead, see SDKMAN! in ' +
        'the Java category (sdk install gradle).',
};

const GRADLE_MANUAL_LINUX: DevEnvManagerBootstrap = {
    managerId: 'manual',
    managerLabel: 'Manual (binary download)',
    builtIntoOS: false,
    availableOn: ['linux'],
    installTool:
        `GRADLE_VERSION="${VERSION_PLACEHOLDER}"\n` +
        'curl -fLO "https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip"\n' +
        'sudo mkdir -p /opt/gradle\n' +
        'sudo unzip -q "gradle-${GRADLE_VERSION}-bin.zip" -d /opt/gradle       # or ~/.local/opt/gradle (mkdir -p first) for a single-user, no-sudo install\n' +
        'sudo ln -sfn "/opt/gradle/gradle-${GRADLE_VERSION}" /opt/gradle/latest   # optional "latest" symlink',
    configure:
        `echo 'export GRADLE_HOME=/opt/gradle/latest' >> ~/.bashrc   # per-terminal; single-user: use $HOME/.local/opt/gradle/latest instead\n` +
        `echo 'export PATH="$PATH:$GRADLE_HOME/bin"' >> ~/.bashrc\n` +
        'source ~/.bashrc\n' +
        '# For login shells, also add the same two lines to ~/.profile (Debian/Ubuntu) or ~/.bash_profile (Fedora/RHEL)\n' +
        '# For all users, drop them in /etc/profile.d/gradle.sh instead',
    verify: 'gradle -v',
    update:
        'Download the newer bin.zip, unzip it next to the old version, then repoint the symlink: sudo ln -sfn ' +
        '/opt/gradle/gradle-<new-version> /opt/gradle/latest — GRADLE_HOME never needs to change.',
    remove:
        'sudo rm -rf /opt/gradle   # then remove the GRADLE_HOME/PATH lines from ~/.bashrc (and ~/.profile / ' +
        '~/.bash_profile / /etc/profile.d if added there too)',
    notes:
        'Needs JDK 17+. Unlike Maven, GRADLE_HOME is the documented/recommended indirection here — pairing it ' +
        'with a versioned install dir and a "latest" symlink makes upgrades a one-line symlink repoint instead of ' +
        'editing shell rc files every time. For automatic multi-version management instead, see SDKMAN! in the ' +
        'Java category (sdk install gradle).',
};

const GRADLE_AUTOMATED_UNIX: DevEnvManagerBootstrap = {
    managerId: 'automated-script',
    managerLabel: 'Automated install script (bash/zsh)',
    builtIntoOS: false,
    availableOn: ['macos', 'linux'],
    installTool:
        '#!/usr/bin/env bash\n' +
        'set -euo pipefail\n' +
        '\n' +
        `GRADLE_VERSION="${VERSION_PLACEHOLDER}"\n` +
        'INSTALL_ROOT="/opt/gradle"                 # or "$HOME/.local/opt/gradle" for single user\n' +
        'ZIP="gradle-${GRADLE_VERSION}-bin.zip"\n' +
        'URL="https://services.gradle.org/distributions/${ZIP}"\n' +
        '\n' +
        'command -v unzip >/dev/null || { echo "unzip required"; exit 1; }\n' +
        '\n' +
        'tmp="$(mktemp -d)"; trap \'rm -rf "$tmp"\' EXIT\n' +
        'echo "Downloading $URL ..."\n' +
        'curl -fL "$URL" -o "$tmp/$ZIP"\n' +
        '\n' +
        'echo "Installing to ${INSTALL_ROOT}/gradle-${GRADLE_VERSION} ..."\n' +
        'SUDO=""; [ -w "$(dirname "$INSTALL_ROOT")" ] || SUDO="sudo"\n' +
        '$SUDO mkdir -p "$INSTALL_ROOT"\n' +
        '$SUDO unzip -q -o "$tmp/$ZIP" -d "$INSTALL_ROOT"\n' +
        '$SUDO ln -sfn "$INSTALL_ROOT/gradle-${GRADLE_VERSION}" "$INSTALL_ROOT/latest"\n' +
        '\n' +
        'RC="$HOME/.bashrc"; [ "$(uname)" = "Darwin" ] && RC="$HOME/.zprofile"\n' +
        'MARK="# >>> gradle install >>>"\n' +
        'if ! grep -qF "$MARK" "$RC" 2>/dev/null; then\n' +
        '  {\n' +
        '    echo "$MARK"\n' +
        '    echo "export GRADLE_HOME=\\"$INSTALL_ROOT/latest\\""\n' +
        '    echo \'export PATH="$GRADLE_HOME/bin:$PATH"\'\n' +
        '    echo "# <<< gradle install <<<"\n' +
        '  } >> "$RC"\n' +
        '  echo "Updated $RC"\n' +
        'fi\n' +
        '\n' +
        'export GRADLE_HOME="$INSTALL_ROOT/latest"; export PATH="$GRADLE_HOME/bin:$PATH"\n' +
        'gradle -v && echo "Gradle ${GRADLE_VERSION} installed. Open a new shell or \'source $RC\'."',
    verify: 'gradle -v',
    update:
        'Change GRADLE_VERSION at the top of the script and re-run it — it installs into a new ' +
        'versioned folder and repoints the "latest" symlink; GRADLE_HOME (which points at "latest") never needs ' +
        'to change. Safe/idempotent to re-run.',
    remove:
        'sudo rm -rf /opt/gradle   # or rm -rf ~/.local/opt/gradle for a single-user install; then remove the ' +
        '"# >>> gradle install >>>" ... "# <<< gradle install <<<" block from ~/.zprofile or ~/.bashrc',
    notes:
        'Does everything the manual entry does in one step, including the versioned-dir + "latest" symlink ' +
        'pattern for GRADLE_HOME. Prefer SDKMAN! (Java category) instead if you want easy multi-version switching ' +
        'rather than a single pinned install.',
};

const GRADLE_MANUAL_WINDOWS: DevEnvManagerBootstrap = {
    managerId: 'manual',
    managerLabel: 'Manual (binary download, PowerShell)',
    builtIntoOS: false,
    availableOn: ['windows'],
    installTool:
        `$Version = "${VERSION_PLACEHOLDER}"\n` +
        'Invoke-WebRequest -Uri "https://services.gradle.org/distributions/gradle-$Version-bin.zip" -OutFile "$env:TEMP\\gradle-$Version-bin.zip"\n' +
        'Expand-Archive -Path "$env:TEMP\\gradle-$Version-bin.zip" -DestinationPath "$env:TEMP\\gradle-$Version" -Force\n' +
        'New-Item -ItemType Directory -Force -Path C:\\Tools\\gradle | Out-Null\n' +
        'if (Test-Path C:\\Tools\\gradle\\latest) { Remove-Item -Recurse -Force C:\\Tools\\gradle\\latest }   # stable folder, replaced on every install\n' +
        'Move-Item "$env:TEMP\\gradle-$Version\\gradle-$Version" C:\\Tools\\gradle\\latest',
    configure:
        '[Environment]::SetEnvironmentVariable("GRADLE_HOME", "C:\\Tools\\gradle\\latest", "User")\n' +
        '$current = [Environment]::GetEnvironmentVariable("PATH", "User")\n' +
        '[Environment]::SetEnvironmentVariable("PATH", "$current;C:\\Tools\\gradle\\latest\\bin", "User")',
    verify: 'gradle -v',
    update:
        'Re-run the install step with the newer version — it replaces C:\\Tools\\gradle\\latest in place, so ' +
        'GRADLE_HOME and PATH never need to change.',
    remove:
        '[Environment]::SetEnvironmentVariable("GRADLE_HOME", $null, "User")\n' +
        'Remove-Item -Recurse -Force C:\\Tools\\gradle',
    notes:
        'Needs JDK 17+. Avoid installing under "C:\\Program Files\\..." — the space in that path breaks some ' +
        'build tools/scripts; C:\\Tools is space-free. For automatic multi-version management, see SDKMAN! (Java ' +
        'category) — Windows only via WSL.',
};

const GRADLE_AUTOMATED_WINDOWS: DevEnvManagerBootstrap = {
    managerId: 'automated-script',
    managerLabel: 'Automated install script (PowerShell)',
    builtIntoOS: false,
    availableOn: ['windows'],
    installTool:
        '#Requires -Version 5.1\n' +
        '$ErrorActionPreference = "Stop"\n' +
        `$Version    = "${VERSION_PLACEHOLDER}"\n` +
        '$Root       = "C:\\Tools\\gradle"\n' +
        '$GradleHome = "$Root\\latest"   # stable folder, replaced on every install\n' +
        '$Zip        = "$env:TEMP\\gradle-$Version-bin.zip"\n' +
        '$Tmp        = "$env:TEMP\\gradle-$Version"\n' +
        '$Url        = "https://services.gradle.org/distributions/gradle-$Version-bin.zip"\n' +
        '\n' +
        'Write-Host "Downloading $Url ..."\n' +
        'Invoke-WebRequest -Uri $Url -OutFile $Zip\n' +
        '\n' +
        'Write-Host "Extracting ..."\n' +
        'if (Test-Path $Tmp) { Remove-Item -Recurse -Force $Tmp }\n' +
        'Expand-Archive -Path $Zip -DestinationPath $Tmp -Force\n' +
        'New-Item -ItemType Directory -Force -Path $Root | Out-Null\n' +
        'if (Test-Path $GradleHome) { Remove-Item -Recurse -Force $GradleHome }\n' +
        'Move-Item "$Tmp\\gradle-$Version" $GradleHome\n' +
        'Remove-Item -Recurse -Force $Tmp, $Zip\n' +
        '\n' +
        'Write-Host "Setting environment variables (User scope) ..."\n' +
        '[Environment]::SetEnvironmentVariable("GRADLE_HOME", $GradleHome, "User")\n' +
        '$p = [Environment]::GetEnvironmentVariable("Path","User")\n' +
        '$bin = "$GradleHome\\bin"\n' +
        'if ($p -notlike "*$bin*") {\n' +
        '  [Environment]::SetEnvironmentVariable("Path", ($p.TrimEnd(\';\') + ";" + $bin), "User")\n' +
        '}\n' +
        'Write-Host "Done. Open a NEW terminal and run: gradle -v"',
    verify: 'gradle -v',
    update:
        'Change $Version at the top of the script and re-run it — it replaces C:\\Tools\\gradle\\latest with the ' +
        'new version, so GRADLE_HOME/PATH never need to change.',
    remove:
        '[Environment]::SetEnvironmentVariable("GRADLE_HOME", $null, "User")\n' +
        'Remove-Item -Recurse -Force C:\\Tools\\gradle',
    notes:
        'Does everything the manual entry does in one step, PowerShell 5.1+ compatible. Prefer SDKMAN! inside WSL ' +
        '(Java category) instead if you want easy multi-version switching.',
};

const GRADLE: DevEnvCategoryData = {
    category: 'gradle',
    label: 'Gradle',
    description:
        'Manually install Gradle from the official binary-only ("-bin") distribution — download, extract to a ' +
        'recommended folder, and wire GRADLE_HOME/PATH via a versioned-dir + "latest" ' +
        'symlink pattern for easy upgrades. Package-manager installs (brew/choco/scoop/apt/dnf/pacman/zypper) are ' +
        'intentionally out of scope here — see SDKMAN! in the Java category for automatic multi-version management.',
    managersByOS: {
        macos: [GRADLE_MANUAL_MACOS, GRADLE_AUTOMATED_UNIX],
        windows: [GRADLE_MANUAL_WINDOWS, GRADLE_AUTOMATED_WINDOWS],
        linux: [GRADLE_MANUAL_LINUX, GRADLE_AUTOMATED_UNIX],
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
                configure: 'uv python install 3.14\nuv python pin 3.14   # writes .python-version',
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
                installTool: 'pyenv install 3.14.10',
                configure: "Add pyenv's shell init lines to ~/.zshrc — the installer prints the exact block to append.",
                verify: 'pyenv --version',
                update: 'brew upgrade pyenv',
                remove: 'brew uninstall pyenv   # then remove the shell init lines it added',
                versionSwitch: 'pyenv global 3.14.10\npyenv local 3.14.10\npyenv shell 3.14.10',
            },
            PIP_ENTRY,
            PIPX_ENTRY,
        ],
        windows: [
            {
                managerId: 'uv',
                managerLabel: 'uv',
                builtIntoOS: false,
                availableOn: ['windows'],
                installTool: 'powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"',
                configure: 'uv python install 3.14\nuv python pin 3.14   # writes .python-version',
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
                installTool: 'pyenv install 3.14.10',
                configure:
                    'Set PYENV, PYENV_HOME, PYENV_ROOT environment variables and add \\bin and \\shims to PATH ' +
                    '(the installer does this automatically).',
                verify: 'pyenv --version',
                update: 'pyenv update',
                remove: 'Remove ~/.pyenv and the PYENV* environment variables.',
                versionSwitch: 'pyenv global 3.14.10\npyenv local 3.14.10\npyenv shell 3.14.10',
                notes:
                    'Separate VBScript/batch codebase from Unix pyenv — .bat shims, not executable shims, and ' +
                    'no pyenv virtualenv support.',
            },
            PIP_ENTRY,
            PIPX_ENTRY,
        ],
        linux: [
            {
                managerId: 'uv',
                managerLabel: 'uv',
                builtIntoOS: false,
                availableOn: ['linux'],
                installTool: 'curl -LsSf https://astral.sh/uv/install.sh | sh',
                configure: 'uv python install 3.14\nuv python pin 3.14   # writes .python-version',
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
                installTool: 'pyenv install 3.14.10   # builds from source',
                configure:
                    'Install OS build dependencies first, e.g. Debian/Ubuntu: sudo apt install build-essential ' +
                    "libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev — then add pyenv's shell " +
                    'init lines to ~/.bashrc.',
                verify: 'pyenv --version',
                update: 'git -C ~/.pyenv pull',
                remove: 'rm -rf ~/.pyenv   # then remove the shell init lines it added',
                versionSwitch: 'pyenv global 3.14.10\npyenv local 3.14.10\npyenv shell 3.14.10',
            },
            PIP_ENTRY,
            PIPX_ENTRY,
        ],
    },
};

// go install places compiled binaries in $(go env GOPATH)/bin (defaults to ~/go/bin) — never added to PATH
// automatically by any installer/package manager below, yet many tools need it (e.g. Wails' own docs: "Check
// ~/go/bin is in your PATH"). Every Go entry adds one of these.
const GO_BIN_PATH_MACOS =
    'export PATH="$PATH:$(go env GOPATH)/bin"   # defaults to ~/go/bin — required for tools installed via "go install" (wails, air, golangci-lint, ...)';
const GO_BIN_PATH_LINUX = GO_BIN_PATH_MACOS; // identical line; only the target rc file differs, chosen per entry
const GO_BIN_PATH_WINDOWS =
    '$gobin = "$(go env GOPATH)\\bin"   # defaults to %USERPROFILE%\\go\\bin\n' +
    '$current = [Environment]::GetEnvironmentVariable("PATH", "User")\n' +
    'if ($current -notlike "*$gobin*") { [Environment]::SetEnvironmentVariable("PATH", "$current;$gobin", "User") }';

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
                configure: GO_BIN_PATH_MACOS,
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
                configure: GO_BIN_PATH_MACOS,
                verify: 'go version',
                update: 'brew upgrade go',
                remove: 'brew uninstall go',
                notes: 'Pinned formulae exist for older majors, e.g. go@1.26, if you need to hold back a version.',
            },
            {
                managerId: 'goenv',
                managerLabel: 'goenv',
                builtIntoOS: false,
                availableOn: ['macos'],
                installManager: 'brew install goenv',
                installTool: 'goenv install 1.27.4',
                configure:
                    `echo 'export GOENV_ROOT="$HOME/.goenv"' >> ~/.zshrc\n` +
                    `echo 'export PATH="$GOENV_ROOT/bin:$PATH"' >> ~/.zshrc\n` +
                    `echo 'eval "$(goenv init -)"' >> ~/.zshrc   # place near the end, it manipulates PATH\n` +
                    `echo 'export PATH="$PATH:$(go env GOPATH)/bin"' >> ~/.zshrc   # defaults to ~/go/bin — required for tools installed via "go install" (wails, air, golangci-lint, ...)`,
                verify: 'goenv --version',
                update: 'brew upgrade goenv',
                remove: 'brew uninstall goenv   # then remove the three profile lines above',
                versionSwitch:
                    'goenv install 1.27.4 then goenv global 1.27.4 (system-wide) or goenv local 1.27.4 ' +
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
                configure: GO_BIN_PATH_WINDOWS,
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
                configure: GO_BIN_PATH_WINDOWS,
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
                configure: 'export PATH=$PATH:/usr/local/go/bin   # add to ~/.bashrc or ~/.zshrc\n' + GO_BIN_PATH_LINUX,
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
                installTool: 'goenv install 1.27.4',
                configure:
                    `echo 'export GOENV_ROOT="$HOME/.goenv"' >> ~/.bashrc\n` +
                    `echo 'export PATH="$GOENV_ROOT/bin:$PATH"' >> ~/.bashrc\n` +
                    `echo 'eval "$(goenv init -)"' >> ~/.bashrc   # place near the end, it manipulates PATH\n` +
                    `echo 'export PATH="$PATH:$(go env GOPATH)/bin"' >> ~/.bashrc   # defaults to ~/go/bin — required for tools installed via "go install" (wails, air, golangci-lint, ...)`,
                verify: 'goenv --version',
                update: 'cd ~/.goenv && git pull',
                remove: 'rm -rf ~/.goenv   # then remove the three profile lines above',
                versionSwitch:
                    'goenv install 1.27.4 then goenv global 1.27.4 (system-wide) or goenv local 1.27.4 ' +
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
                configure: GO_BIN_PATH_LINUX,
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
                configure: GO_BIN_PATH_LINUX,
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
                configure: GO_BIN_PATH_LINUX,
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
                configure: GO_BIN_PATH_LINUX,
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
                configure: GO_BIN_PATH_LINUX,
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
                configure: GO_BIN_PATH_LINUX,
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

const RUST: DevEnvCategoryData = {
    category: 'rust',
    label: 'Rust',
    description:
        'Install the Rust toolchain (rustc, cargo) via rustup, the toolchain-official installer and version manager.',
    managersByOS: {
        macos: [
            {
                managerId: 'rustup',
                managerLabel: 'rustup',
                builtIntoOS: false,
                availableOn: ['macos'],
                installManager: "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y",
                installTool: 'cargo install <crate>   # e.g. cargo install ripgrep',
                configure:
                    'source "$HOME/.cargo/env"   # the installer appends this to your shell profile automatically',
                verify: 'rustc --version\ncargo --version',
                update: 'rustup update',
                remove: 'rustup self uninstall',
                versionSwitch:
                    'rustup toolchain install stable   # or a pinned release, e.g. 1.90.0\nrustup default stable   # system-wide\nrustup override set stable   # per-directory',
                notes: 'Also installable via brew install rust, but that path does not include rustup — no toolchain/version switching without it.',
            },
        ],
        windows: [
            {
                managerId: 'rustup',
                managerLabel: 'rustup-init.exe',
                builtIntoOS: false,
                availableOn: ['windows'],
                installManager:
                    'winget install --id Rustlang.Rustup -e   # or download rustup-init.exe from https://rustup.rs directly',
                installTool: 'cargo install <crate>   # e.g. cargo install ripgrep',
                configure:
                    'Requires the Microsoft C++ Build Tools (the installer prompts for these on first run if missing).',
                verify: 'rustc --version\ncargo --version',
                update: 'rustup update',
                remove: 'rustup self uninstall',
                versionSwitch:
                    'rustup toolchain install stable   # or a pinned release, e.g. 1.90.0\nrustup default stable   # system-wide\nrustup override set stable   # per-directory',
                notes: 'Alternates: choco install rust -y, scoop install main/rustup.',
            },
        ],
        linux: [
            {
                managerId: 'rustup',
                managerLabel: 'rustup',
                builtIntoOS: false,
                availableOn: ['linux'],
                installManager: "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y",
                installTool: 'cargo install <crate>   # e.g. cargo install ripgrep',
                configure:
                    'source "$HOME/.cargo/env"   # the installer appends this to your shell profile automatically',
                verify: 'rustc --version\ncargo --version',
                update: 'rustup update',
                remove: 'rustup self uninstall',
                versionSwitch:
                    'rustup toolchain install stable   # or a pinned release, e.g. 1.90.0\nrustup default stable   # system-wide\nrustup override set stable   # per-directory',
                notes:
                    'Distro rustc/cargo packages (apt/dnf/pacman/zypper) typically lag the upstream release and ' +
                    'do not include rustup — prefer this installer when you need a current or pinned version.',
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
                installTool: 'sudo apt-get install -y rustc cargo',
                verify: 'rustc --version\ncargo --version',
                update: 'sudo apt-get update && sudo apt-get install --only-upgrade -y rustc cargo',
                remove: 'sudo apt-get remove -y rustc cargo',
                notes: 'No rustup, no version switching — the rustup entry above is preferred for active development.',
            },
        ],
        fedora: [
            {
                managerId: 'dnf',
                managerLabel: 'dnf',
                builtIntoOS: true,
                availableOn: ['linux'],
                installTool: 'sudo dnf install -y rust cargo',
                verify: 'rustc --version\ncargo --version',
                update: 'sudo dnf upgrade -y rust cargo',
                remove: 'sudo dnf remove -y rust cargo',
            },
        ],
        arch: [
            {
                managerId: 'pacman',
                managerLabel: 'pacman',
                builtIntoOS: true,
                availableOn: ['linux'],
                installTool: 'sudo pacman -S --noconfirm rust',
                verify: 'rustc --version\ncargo --version',
                update: 'sudo pacman -Syu',
                remove: 'sudo pacman -Rs rust',
                notes: 'Official [extra] repo package tracks upstream fairly closely, but still no rustup toolchain switching.',
            },
        ],
        suse: [
            {
                managerId: 'zypper',
                managerLabel: 'zypper',
                builtIntoOS: true,
                availableOn: ['linux'],
                installTool: 'sudo zypper install -y rust cargo',
                verify: 'rustc --version\ncargo --version',
                update: 'sudo zypper update rust cargo',
                remove: 'sudo zypper remove rust cargo',
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
                installTool: 'brew install node   # Node 26 (LTS)',
                verify: 'node -v && npm -v',
                update: 'brew upgrade node',
                remove: 'brew uninstall node',
                versionSwitch:
                    'Use nvm or fnm below to run multiple Node versions side by side — plain Homebrew only tracks one linked version at a time.',
            },
            {
                managerId: 'nvm',
                managerLabel: 'nvm',
                builtIntoOS: false,
                availableOn: ['macos'],
                installManager: 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.41.0/install.sh | bash',
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
                    'fnm install --lts && fnm default 26   # --use-on-cd auto-switches on .node-version/.nvmrc',
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
                versionSwitch: 'fnm install --lts && fnm default 26',
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
                installManager: 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.41.0/install.sh | bash',
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
                    'fnm install --lts && fnm default 26   # --use-on-cd auto-switches on .node-version/.nvmrc',
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
                installTool: 'powershell -c "irm bun.com/install.ps1|iex"   # requires Windows 10 version 1809+',
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
                notes: 'Also installable via winget: winget install -e --id Oven-sh.Bun.',
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
    maven: MAVEN,
    gradle: GRADLE,
    python: PYTHON,
    go: GO,
    rust: RUST,
    nodejs: NODEJS,
    bun: BUN,
};
