import { APPS_CATALOG } from './apps-catalog';
import type { CatalogApp, CatalogManager, CatalogMethod, CatalogPlatform, LinuxDistro } from './apps-catalog-types';
import { getBootstrapSource, PROVIDER_RESOLVED_MANAGERS, type BootstrapSource } from './manager-bootstrap-catalog';
import {
    MANAGER_MAINTENANCE,
    type MaintenanceAction,
    type ManagerMaintenanceEntry,
} from './manager-maintenance-catalog';
export type { MaintenanceAction } from './manager-maintenance-catalog';

// ─── Public types ─────────────────────────────────────────────────────────────

export type ScriptAction = 'install' | 'update' | 'upgrade' | 'remove';

export type FallbackMode = 'preferred-only' | 'fallback';

export type UpdateStrategy = 'one-by-one' | 'batch';

/**
 * `setup` = one-time repo setup, `batch` = manager-wide maintenance, `group` = one combined command
 * for several plain packages of one manager, `app` = one app's own command, `cleanup` = manager cleanup.
 */
export interface MaintenanceTask {
    kind: 'setup' | 'batch' | 'group' | 'app' | 'cleanup';
    manager: CatalogManager;
    label: string;
    steps: readonly string[];
    appId?: string;
    version?: string;
    /** `group` only: per-package commands run when the combined command fails (e.g. one package missing). */
    fallback?: readonly string[];
}

export interface MaintenancePlan {
    action: ScriptAction;
    strategy: UpdateStrategy;
    tasks: readonly MaintenanceTask[];
    skipped: readonly { appId: string; reason: string }[];
}

export interface MaintenancePlanOptions {
    strategy?: UpdateStrategy;
    batchManagers?: readonly CatalogManager[];
    includeCleanup?: boolean;
}

export interface ActionPlanOptions extends MaintenancePlanOptions {
    /** Merge plain packages into one command per manager and order tasks by manager tier. */
    combine?: boolean;
}

export interface BuilderConfig {
    platform: CatalogPlatform;
    linuxDistro?: LinuxDistro;
    managers: CatalogManager[];
    overrides: Record<string, CatalogManager>;
    fallbackMode: FallbackMode;
    selectedVersions: Record<string, string[]>;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function getMethodsForPlatform(
    app: CatalogApp,
    config: Pick<BuilderConfig, 'platform' | 'linuxDistro'>,
): CatalogMethod[] | undefined {
    if (config.platform === 'linux') {
        if (!config.linuxDistro) {
            throw new Error('linuxDistro is required when platform is linux');
        }
        const distroMethods = app.methods.linux?.[config.linuxDistro];
        return distroMethods && distroMethods.length > 0 ? distroMethods : undefined;
    }
    if (config.platform === 'macos') {
        const m = app.methods.macos;
        return m && m.length > 0 ? m : undefined;
    }
    const m = app.methods.windows;
    return m && m.length > 0 ? m : undefined;
}

const ALWAYS_ELIGIBLE_MANAGERS: readonly CatalogManager[] = ['script', 'installer'];

/** Emitted before each PowerShell task so a cmdlet-only command never sees a stale native exit code. */
const PS_RESET_EXIT_CODE = '$global:LASTEXITCODE = 0;';

// winget exits with 0x8A15002B (-1978335189, "no applicable update") when a package is already current.
const PS_FAILED = '($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne -1978335189)';
const PS_EXIT_CHECK = `if ${PS_FAILED} { throw "exit $LASTEXITCODE" }`;

function findMethodByManager(methods: CatalogMethod[], manager: CatalogManager): CatalogMethod | undefined {
    return methods.find((m) => m.manager === manager);
}

// ─── Exported pure functions ──────────────────────────────────────────────────

/**
 * Resolves which manager to use for app + config.
 *
 * Resolution order:
 *  1. Platform guard (app.platforms[platform] must be true)
 *  2. Parameterized guard (selectedVersions[app.id] required when app.parameterized)
 *  3. Per-app override (config.overrides[app.id]) — wins if manager has a method
 *  4. First manager in config.managers (priority list) that has a method
 *  5. If fallbackMode === 'fallback': first available manager for this platform
 *  6. A `script`/`installer` method (always eligible)
 *  7. null → app is skipped
 */
export function resolveManager(app: CatalogApp, config: BuilderConfig): CatalogManager | null {
    if (!app.platforms[config.platform]) return null;

    if (app.parameterized && !config.selectedVersions[app.id]?.length) return null;

    const methods = getMethodsForPlatform(app, config);
    if (!methods) return null;

    const override = config.overrides[app.id];
    if (override && findMethodByManager(methods, override)) return override;

    for (const mgr of config.managers) {
        if (findMethodByManager(methods, mgr)) return mgr;
    }

    if (config.fallbackMode === 'fallback' && methods.length > 0) {
        return methods[0].manager;
    }

    // Vendor scripts and installers need no package manager, so they cannot be "not preferred".
    return methods.find((m) => ALWAYS_ELIGIBLE_MANAGERS.includes(m.manager))?.manager ?? null;
}

/**
 * Resolves the actual CatalogMethod object for the manager resolveManager() would pick.
 * Returns null under the same conditions resolveManager() returns null.
 */
export function resolveMethod(app: CatalogApp, config: BuilderConfig): CatalogMethod | null {
    const manager = resolveManager(app, config);
    if (!manager) return null;
    const methods = getMethodsForPlatform(app, config);
    if (!methods) return null;
    return findMethodByManager(methods, manager) ?? null;
}

/**
 * Extracts and returns the command string for the given action from a method.
 * Applies {version} substitution (all occurrences) when version is provided.
 * Returns null when the method has no command for that action.
 */
export function getCommand(method: CatalogMethod, action: ScriptAction, version?: string): string | null {
    let raw: string | undefined;
    if (action === 'install') {
        raw = method.install;
    } else if (action === 'update') {
        raw = method.update;
    } else if (action === 'upgrade') {
        // Use explicit upgrade command if defined; fall back to update (managers with no greedy distinction)
        raw = method.upgrade ?? method.update;
    } else {
        raw = method.remove;
    }
    if (!raw) return null;
    return version === undefined ? raw : raw.replaceAll('{version}', version);
}

/**
 * Per-app command for the planner. Update falls back update → upgrade and Upgrade falls back
 * upgrade → update; only vendor scripts and installers then fall back to install, because re-running
 * them is how they update — a package manager's install of an installed package does nothing.
 */
function getMaintenanceAppCommand(
    method: CatalogMethod,
    manager: CatalogManager,
    action: ScriptAction,
    version?: string,
): string | null {
    const command =
        action === 'update' || action === 'upgrade'
            ? (getCommand(method, action, version) ??
              getCommand(method, 'upgrade', version) ??
              (ALWAYS_ELIGIBLE_MANAGERS.includes(manager) ? getCommand(method, 'install', version) : null))
            : getCommand(method, action, version);
    if (!command) return null;
    if (action !== 'update' && action !== 'upgrade') return command;
    if (manager !== 'apt' || !method.id) return command;

    const packageId = version === undefined ? method.id : method.id.replaceAll('{version}', version);
    // Direct .deb installers may use apt as their resolver label but must re-run the vendor
    // endpoint; only native apt commands can be normalized to a named package upgrade.
    if (/\b(?:apt|apt-get)\b/.test(command)) {
        return `sudo apt-get install --only-upgrade -y ${packageId}`;
    }
    return command;
}

// ─── Internal skip-reason helper ──────────────────────────────────────────────

function skipReason(app: CatalogApp, config: BuilderConfig): string {
    if (!app.platforms[config.platform]) {
        return `# ${app.name}: no platform build — skipped`;
    }
    if (app.parameterized && !config.selectedVersions[app.id]?.length) {
        return `# ${app.name}: no version selected — skipped`;
    }
    return `# ${app.name}: no preferred manager (fallback off) — skipped`;
}

// ─── Repo-setup section (install action only) ─────────────────────────────────

interface RepoSetupEntry {
    repoSetup: string;
    manager: CatalogManager;
    appName: string;
}

function collectRepoSetupEntries(apps: CatalogApp[], config: BuilderConfig): RepoSetupEntry[] {
    const seen = new Set<string>();
    const entries: RepoSetupEntry[] = [];
    for (const app of apps) {
        const method = resolveMethod(app, config);
        if (method?.repoSetup && !seen.has(method.repoSetup)) {
            seen.add(method.repoSetup);
            entries.push({ repoSetup: method.repoSetup, manager: method.manager, appName: app.name });
        }
    }
    return entries;
}

/**
 * Emits a deduplicated "### Repository setup (one-time)" section followed by "### Install"
 * into `lines`, only when at least one selected app's resolved method has a repoSetup.
 * bash: each unique repoSetup is wrapped in a generated shell function (safe for embedded
 * quotes/heredocs/&&-chains with zero escaping) and invoked via the existing run_task counter.
 * PowerShell: inlined into the same try/catch convention used for every other command.
 */
function emitRepoSetupSection(lines: string[], apps: CatalogApp[], config: BuilderConfig, isWindows: boolean): void {
    const entries = collectRepoSetupEntries(apps, config);
    if (entries.length === 0) return;

    lines.push('### Repository setup (one-time)');
    entries.forEach((entry, i) => {
        if (isWindows) {
            const name = escapePowerShellText(entry.appName);
            lines.push(
                `try { Write-Host "▶ repo setup: ${name} (${entry.manager})"; ${PS_RESET_EXIT_CODE} ${entry.repoSetup}; ${PS_EXIT_CHECK}; $ok++ } catch { Write-Host "✖ repo setup: ${name} failed: $_"; $fail++ }`,
            );
        } else {
            const fnName = `_repo_setup_${i + 1}`;
            lines.push(
                `${fnName}() {`,
                entry.repoSetup,
                '}',
                `run_task "repo setup: ${escapeBashText(entry.appName)} (${entry.manager})" ${fnName}`,
            );
        }
    });
    lines.push('### Install');
}

// ─── Combined script builder ──────────────────────────────────────────────────

/**
 * Builds a single combined script (all apps in one file).
 * macOS/Linux → bash (.sh); Windows → PowerShell (.ps1).
 * Skipped apps and missing-command apps emit inline comment lines.
 * bash: each per-app command is wrapped in a generated shell function (`_task_N`) before being
 * invoked via `run_task`, same convention as emitRepoSetupSection/buildManagerWideScript/
 * buildBootstrapScript — required because catalog commands can contain shell operators (`|`,
 * `&&`, `;`) that would otherwise be parsed at the `run_task` invocation's statement level
 * instead of scoped to the command (e.g. `run_task "label" curl URL | bash` pipes run_task's
 * own echo output into the trailing `bash`, not just curl's).
 */
export function buildCombinedScript(apps: CatalogApp[], action: ScriptAction, config: BuilderConfig): string {
    const lines: string[] = [];
    const isWindows = config.platform === 'windows';
    const label = action.toUpperCase();

    if (isWindows) {
        lines.push(`# ${label} — combined (PowerShell)`, '$ErrorActionPreference = "Stop"', '$ok=0;$fail=0');
    } else {
        lines.push(
            '#!/usr/bin/env bash',
            `# ${label} — combined, generated by dev.tools`,
            'set -uo pipefail; SUCCESS=0; FAILED=0',
            'run_task(){ echo "▶ $1"; shift; if "$@"; then SUCCESS=$((SUCCESS+1)); else FAILED=$((FAILED+1)); fi; }',
        );
    }

    if (action === 'install') {
        emitRepoSetupSection(lines, apps, config, isWindows);
    }

    let taskIndex = 0;
    for (const app of apps) {
        const manager = resolveManager(app, config);
        if (!manager) {
            const reason = skipReason(app, config);
            lines.push(reason);
            const warning = reason.replace(/^#\s*/, '⚠ ');
            lines.push(
                isWindows
                    ? `Write-Host "${escapePowerShellText(warning)}" -ForegroundColor Red`
                    : `echo -e "\\033[0;31m${escapeBashText(warning)}\\033[0m"`,
            );
            continue;
        }

        const method = resolveMethod(app, config)!;
        const psName = escapePowerShellText(app.name);
        const shName = escapeBashText(app.name);

        if (app.parameterized) {
            const versions = config.selectedVersions[app.id] ?? [];
            const seenCommands = new Set<string>();
            for (const v of versions) {
                const cmd = getCommand(method, action, v);
                if (!cmd) {
                    lines.push(`# ${app.name} ${v}: no ${action} command — skipped`);
                    continue;
                }
                // Version-independent commands (e.g. choco `nodejs-lts`) run once, not once per version.
                if (seenCommands.has(cmd)) continue;
                seenCommands.add(cmd);
                if (isWindows) {
                    lines.push(
                        `try { Write-Host "▶ ${action} ${psName} ${v} (${manager})"; ${PS_RESET_EXIT_CODE} ${cmd}; ${PS_EXIT_CHECK}; $ok++ } catch { Write-Host "✖ ${psName} ${v} failed: $_"; $fail++ }`,
                    );
                } else {
                    taskIndex += 1;
                    const fnName = `_task_${taskIndex}`;
                    lines.push(`${fnName}() {`, cmd, '}', `run_task "${action} ${shName} ${v} (${manager})" ${fnName}`);
                }
            }
        } else {
            const cmd = getCommand(method, action);
            if (!cmd) {
                lines.push(`# ${app.name}: no ${action} command — skipped`);
                continue;
            }
            if (isWindows) {
                // $LASTEXITCODE is only set by external executables, so it is reset first: a cmdlet-only
                // command (e.g. `irm … | iex`) must not inherit the previous task's exit code.
                lines.push(
                    `try { Write-Host "▶ ${action} ${psName}"; ${PS_RESET_EXIT_CODE} ${cmd}; ${PS_EXIT_CHECK}; $ok++ } catch { Write-Host "✖ ${psName} failed: $_"; $fail++ }`,
                );
            } else {
                taskIndex += 1;
                const fnName = `_task_${taskIndex}`;
                lines.push(`${fnName}() {`, cmd, '}', `run_task "${action} ${shName} (${manager})" ${fnName}`);
            }
        }
    }

    lines.push('');
    if (isWindows) {
        lines.push('Write-Host "✔ $ok ok / ✖ $fail failed"');
    } else {
        lines.push('echo "✔ $SUCCESS ok / ✖ $FAILED failed"');
    }

    return lines.join('\n');
}

// ─── Per-app script builder ───────────────────────────────────────────────────

/**
 * Builds individual scripts for each app.
 * Returns Record<appId, scriptContent>.
 * Skipped apps (no manager, no command for action) are OMITTED from the record.
 */
export function buildPerAppScripts(
    apps: CatalogApp[],
    action: ScriptAction,
    config: BuilderConfig,
): Record<string, string> {
    const result: Record<string, string> = {};

    for (const app of apps) {
        const manager = resolveManager(app, config);
        if (!manager) continue;

        const method = resolveMethod(app, config)!;
        const repoSetupPrefix = action === 'install' && method.repoSetup ? `${method.repoSetup}\n` : '';

        if (app.parameterized) {
            const versions = config.selectedVersions[app.id] ?? [];
            const cmds = versions.map((v) => getCommand(method, action, v)).filter((c): c is string => c !== null);
            if (cmds.length === 0) continue;
            result[app.id] = repoSetupPrefix + [...new Set(cmds)].join('\n');
        } else {
            const cmd = getCommand(method, action);
            if (!cmd) continue;
            result[app.id] = repoSetupPrefix + cmd;
        }
    }

    return result;
}

// ─── Maintenance planner and script builder ──────────────────────────────────

export function getMaintenanceEntries(
    config: Pick<BuilderConfig, 'platform' | 'linuxDistro'>,
): ManagerMaintenanceEntry[] {
    if (config.platform === 'linux') {
        if (!config.linuxDistro) {
            throw new Error('linuxDistro is required when platform is linux');
        }
        return MANAGER_MAINTENANCE.linux[config.linuxDistro] ?? [];
    }
    if (config.platform === 'macos') {
        return MANAGER_MAINTENANCE.macos;
    }
    return MANAGER_MAINTENANCE.windows;
}

function maintenanceSkipReason(app: CatalogApp, action: ScriptAction, config: BuilderConfig): string {
    if (!app.platforms[config.platform]) return 'unsupported platform';
    if (app.parameterized && !config.selectedVersions[app.id]?.length) return 'no version selected';

    const methods = getMethodsForPlatform(app, config);
    if (!methods || methods.length === 0) return 'unsupported platform or distro';
    if (!resolveManager(app, config)) {
        return config.fallbackMode === 'fallback' ? 'no executable method' : 'no preferred manager';
    }
    return `no ${action} command`;
}

function uniqueManagers(managers: readonly CatalogManager[]): CatalogManager[] {
    return [...new Set(managers)];
}

function normalizeMaintenanceOptions(
    optionsOrStrategy: MaintenancePlanOptions | UpdateStrategy | undefined,
    legacyBatchManagers: readonly CatalogManager[] | undefined,
    legacyIncludeCleanup: boolean | undefined,
): Required<Pick<MaintenancePlanOptions, 'strategy' | 'batchManagers' | 'includeCleanup'>> {
    if (typeof optionsOrStrategy === 'string') {
        return {
            strategy: optionsOrStrategy,
            batchManagers: legacyBatchManagers ?? [],
            includeCleanup: legacyIncludeCleanup ?? true,
        };
    }
    return {
        strategy: optionsOrStrategy?.strategy ?? 'one-by-one',
        batchManagers: optionsOrStrategy?.batchManagers ?? [],
        includeCleanup: optionsOrStrategy?.includeCleanup ?? true,
    };
}

interface BatchTemplate {
    label: string;
    /** Accepted install commands of a plain package, with `{id}` standing for the method id. */
    plain: readonly string[];
    /** Combined command per action. A missing action keeps those apps per app. */
    actions: Partial<Record<ScriptAction, (ids: string[]) => string>>;
}

const ids = (list: string[]): string => list.join(' ');
const latest = (list: string[]): string => list.map((id) => `${id}@latest`).join(' ');

// Batching rule: a method joins a batch only when it has an `id`, no `repoSetup`, and its install
// command is exactly one of the `plain` forms with that id (whitespace-normalised) — a plain package with no extra
// flags or steps. Its combined command for every action then comes from the template. winget stays
// per app: its multi-package install takes bare queries and drops the per-id `--id … -e` matching.
const BATCH_TEMPLATES: Record<string, BatchTemplate> = {
    'brew:formula': {
        label: 'Homebrew formulae',
        plain: ['brew install {id}'],
        actions: {
            install: (l) => `brew install ${ids(l)}`,
            update: (l) => `brew upgrade ${ids(l)}`,
            upgrade: (l) => `brew upgrade ${ids(l)}`,
            remove: (l) => `brew uninstall ${ids(l)}`,
        },
    },
    'brew:cask': {
        label: 'Homebrew casks',
        plain: ['brew install --cask {id}'],
        actions: {
            install: (l) => `brew install --cask ${ids(l)}`,
            update: (l) => `brew upgrade --cask ${ids(l)}`,
            upgrade: (l) => `brew upgrade --cask --greedy ${ids(l)}`,
            remove: (l) => `brew uninstall --cask ${ids(l)}`,
        },
    },
    'apt': {
        label: 'apt packages',
        plain: [
            'sudo apt update && sudo apt install -y {id}',
            'sudo apt install -y {id}',
            'sudo apt-get install -y {id}',
        ],
        actions: {
            install: (l) => `sudo apt-get update && sudo apt-get install -y ${ids(l)}`,
            update: (l) => `sudo apt-get update && sudo apt-get install --only-upgrade -y ${ids(l)}`,
            upgrade: (l) => `sudo apt-get update && sudo apt-get install --only-upgrade -y ${ids(l)}`,
            remove: (l) => `sudo apt-get remove -y ${ids(l)}`,
        },
    },
    'dnf': {
        label: 'dnf packages',
        plain: ['sudo dnf install -y {id}'],
        actions: {
            install: (l) => `sudo dnf install -y ${ids(l)}`,
            update: (l) => `sudo dnf upgrade -y ${ids(l)}`,
            upgrade: (l) => `sudo dnf upgrade -y ${ids(l)}`,
            remove: (l) => `sudo dnf remove -y ${ids(l)}`,
        },
    },
    'zypper': {
        label: 'zypper packages',
        plain: ['sudo zypper install -y {id}'],
        actions: {
            install: (l) => `sudo zypper install -y ${ids(l)}`,
            update: (l) => `sudo zypper update -y ${ids(l)}`,
            upgrade: (l) => `sudo zypper update -y ${ids(l)}`,
            remove: (l) => `sudo zypper remove -y ${ids(l)}`,
        },
    },
    'pacman': {
        label: 'pacman packages',
        plain: ['sudo pacman -S --needed --noconfirm {id}', 'sudo pacman -S --noconfirm {id}'],
        actions: {
            install: (l) => `sudo pacman -S --needed --noconfirm ${ids(l)}`,
            // Arch does not support partial upgrades, so updating any package means a full -Syu.
            update: () => 'sudo pacman -Syu --noconfirm',
            upgrade: () => 'sudo pacman -Syu --noconfirm',
            remove: (l) => `sudo pacman -Rns --noconfirm ${ids(l)}`,
        },
    },
    'flatpak': {
        label: 'Flatpak apps',
        plain: ['flatpak install -y flathub {id}'],
        actions: {
            install: (l) => `flatpak install -y flathub ${ids(l)}`,
            update: (l) => `flatpak update -y ${ids(l)}`,
            upgrade: (l) => `flatpak update -y ${ids(l)}`,
            remove: (l) => `flatpak uninstall -y ${ids(l)}`,
        },
    },
    'snap': {
        label: 'Snap packages',
        plain: ['sudo snap install {id}'],
        actions: {
            install: (l) => `sudo snap install ${ids(l)}`,
            update: (l) => `sudo snap refresh ${ids(l)}`,
            upgrade: (l) => `sudo snap refresh ${ids(l)}`,
            remove: (l) => `sudo snap remove ${ids(l)}`,
        },
    },
    'choco': {
        label: 'Chocolatey packages',
        plain: ['choco install {id} -y'],
        actions: {
            install: (l) => `choco install ${ids(l)} -y`,
            update: (l) => `choco upgrade ${ids(l)} -y`,
            upgrade: (l) => `choco upgrade ${ids(l)} -y`,
            remove: (l) => `choco uninstall ${ids(l)} -y`,
        },
    },
    'scoop': {
        label: 'Scoop apps',
        plain: ['scoop install {id}'],
        actions: {
            install: (l) => `scoop install ${ids(l)}`,
            update: (l) => `scoop update ${ids(l)}`,
            upgrade: (l) => `scoop update ${ids(l)}`,
            remove: (l) => `scoop uninstall ${ids(l)}`,
        },
    },
    'npm': {
        label: 'npm globals',
        plain: ['npm install -g {id}@latest'],
        actions: {
            install: (l) => `npm install -g ${latest(l)}`,
            update: (l) => `npm update -g ${ids(l)}`,
            upgrade: (l) => `npm install -g ${latest(l)}`,
            remove: (l) => `npm uninstall -g ${ids(l)}`,
        },
    },
    'uv': {
        label: 'uv tools',
        plain: ['uv tool install {id}'],
        // `uv tool install` takes one tool per call, so install stays per app.
        actions: {
            update: (l) => `uv tool upgrade ${ids(l)}`,
            upgrade: (l) => `uv tool upgrade --reinstall ${ids(l)}`,
            remove: (l) => `uv tool uninstall ${ids(l)}`,
        },
    },
    'pipx': {
        label: 'pipx packages',
        plain: ['pipx install {id}'],
        // `pipx reinstall` and `pipx uninstall` take one package per call.
        actions: { install: (l) => `pipx install ${ids(l)}`, update: (l) => `pipx upgrade ${ids(l)}` },
    },
    'cargo': {
        label: 'cargo crates',
        plain: ['cargo install {id}'],
        actions: {
            install: (l) => `cargo install ${ids(l)}`,
            update: (l) => `cargo install ${ids(l)}`,
            upgrade: (l) => `cargo install --force ${ids(l)}`,
            remove: (l) => `cargo uninstall ${ids(l)}`,
        },
    },
};

/** Index metadata refresh that must precede a combined brew upgrade (emitted once per plan). */
const BREW_REFRESH = 'brew update';

/** Execution tiers: repo setup runs first, then OS managers, sandboxed formats, vendor installers, dev managers. */
const MANAGER_TIERS: readonly (readonly CatalogManager[])[] = [
    ['brew', 'mas', 'winget', 'choco', 'scoop', 'apt', 'dnf', 'pacman', 'zypper'],
    ['flatpak', 'snap', 'appimage'],
    ['installer', 'script'],
    ['npm', 'uv', 'pipx', 'cargo', 'go'],
];

function managerTier(manager: CatalogManager): number {
    return MANAGER_TIERS.findIndex((tier) => tier.includes(manager));
}

function normalizeWhitespace(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
}

function batchKey(method: CatalogMethod): string {
    return method.manager === 'brew' ? `brew:${method.kind ?? 'formula'}` : method.manager;
}

/**
 * Returns the single package token when `install` is one of the manager's plain forms, else null.
 * Exported so the catalog test can require `id` to equal that token on every plain method.
 */
export function getPlainPackageToken(method: CatalogMethod, install: string = method.install): string | null {
    const normalized = normalizeWhitespace(install);
    for (const form of BATCH_TEMPLATES[batchKey(method)]?.plain ?? []) {
        const [prefix, suffix] = form.split('{id}');
        if (!normalized.startsWith(prefix) || !normalized.endsWith(suffix)) continue;
        const token = normalized.slice(prefix.length, normalized.length - suffix.length);
        if (/^[\w@.+/:{}-]+$/.test(token)) return token;
    }
    return null;
}

/** Returns the batch key and package id when this method/version is a plain package, else null. */
function getBatchMember(
    method: CatalogMethod,
    action: ScriptAction,
    version: string | undefined,
): { key: string; id: string } | null {
    if (!method.id || method.repoSetup) return null;
    const key = batchKey(method);
    if (!BATCH_TEMPLATES[key]?.actions[action]) return null;
    const id = version === undefined ? method.id : method.id.replaceAll('{version}', version);
    const install = getCommand(method, 'install', version);
    return install && getPlainPackageToken(method, install) === id ? { key, id } : null;
}

/**
 * Creates the pure task plan for any action; the planner never starts work or performs network calls.
 * - Install keeps the user's manager preference; update/upgrade/remove fall back to the app's first
 *   method so selected apps are never silently dropped.
 * - `combine` merges plain packages into one command per manager (see BATCH_TEMPLATES) and orders
 *   tasks by MANAGER_TIERS (reversed for remove, so dev packages go before their runtime).
 * - In batch strategy, selected batch managers run their manager-wide command once and selected apps
 *   are emitted only when their resolved manager is outside that batch set.
 * - Cleanup runs last for every manager the plan touched, on update/upgrade only.
 */
export function buildActionPlan(
    apps: CatalogApp[],
    action: ScriptAction,
    config: BuilderConfig,
    options: ActionPlanOptions = {},
): MaintenancePlan {
    const {
        strategy,
        batchManagers: requestedBatch,
        includeCleanup,
    } = normalizeMaintenanceOptions(options, undefined, undefined);
    const combine = options.combine ?? false;
    const maintenanceAction: MaintenanceAction | null = action === 'update' || action === 'upgrade' ? action : null;
    const appConfig: BuilderConfig = action === 'install' ? config : { ...config, fallbackMode: 'fallback' };
    const entries = maintenanceAction ? getMaintenanceEntries(config) : [];
    const skipped: { appId: string; reason: string }[] = [];
    const setupTasks: MaintenanceTask[] =
        action === 'install'
            ? collectRepoSetupEntries(apps, config).map((entry) => ({
                  kind: 'setup',
                  manager: entry.manager,
                  label: `${entry.appName} (${entry.manager})`,
                  steps: [entry.repoSetup],
              }))
            : [];

    const batchTasks: MaintenanceTask[] = [];
    const batchedManagers = new Set<CatalogManager>();
    if (strategy === 'batch' && maintenanceAction) {
        for (const manager of uniqueManagers(requestedBatch)) {
            const entry = entries.find((candidate) => candidate.manager === manager);
            const operation = entry?.operations[maintenanceAction];
            if (!entry || !operation || operation.steps.length === 0) continue;
            batchTasks.push({ kind: 'batch', manager, label: entry.label, steps: operation.steps });
            batchedManagers.add(manager);
        }
    }

    // Groups are materialised after the loop; their slot in `appTasks` keeps first-seen order.
    const appTasks: MaintenanceTask[] = [];
    const groups = new Map<
        string,
        { slot: number; manager: CatalogManager; ids: string[]; names: string[]; fallback: string[] }
    >();

    for (const app of apps) {
        const manager = resolveManager(app, appConfig);
        if (!manager) {
            skipped.push({ appId: app.id, reason: maintenanceSkipReason(app, action, appConfig) });
            continue;
        }
        if (batchedManagers.has(manager)) continue;

        const method = resolveMethod(app, appConfig);
        if (!method) {
            skipped.push({ appId: app.id, reason: 'no executable method' });
            continue;
        }

        const versions: (string | undefined)[] = app.parameterized
            ? (config.selectedVersions[app.id] ?? [])
            : [undefined];
        let emitted = 0;
        let missingCommand = false;
        const appCommands = new Set<string>();
        for (const version of versions) {
            const label = version === undefined ? app.name : `${app.name} ${version}`;
            const command = getMaintenanceAppCommand(method, manager, action, version);
            const member = combine ? getBatchMember(method, action, version) : null;
            if (member) {
                let group = groups.get(member.key);
                if (!group) {
                    group = { slot: appTasks.length, manager, ids: [], names: [], fallback: [] };
                    groups.set(member.key, group);
                    appTasks.push({ kind: 'group', manager, label: member.key, steps: [] });
                }
                group.names.push(label);
                // One id per group: versions sharing a package (choco `nodejs-lts`) are handled once.
                if (!group.ids.includes(member.id)) {
                    group.ids.push(member.id);
                    group.fallback.push(command ?? BATCH_TEMPLATES[member.key].actions[action]!([member.id]));
                }
                emitted += 1;
                continue;
            }
            if (!command) {
                missingCommand = true;
                continue;
            }
            emitted += 1;
            // Version-independent commands run once rather than once per selected version.
            if (appCommands.has(command)) continue;
            appCommands.add(command);
            appTasks.push({
                kind: 'app',
                manager,
                label,
                steps: [command],
                appId: app.id,
                ...(version === undefined ? {} : { version }),
            });
        }

        if (emitted === 0) {
            skipped.push({ appId: app.id, reason: `no ${action} command` });
        } else if (missingCommand) {
            skipped.push({ appId: app.id, reason: `no ${action} command for one or more selected versions` });
        }
    }

    for (const [key, group] of groups) {
        const template = BATCH_TEMPLATES[key];
        appTasks[group.slot] = {
            kind: 'group',
            manager: group.manager,
            label: `${template.label} (${group.names.join(', ')})`,
            steps: [template.actions[action]!(group.ids)],
            // A combined command fails as a whole when one package is missing, so retry package by package.
            ...(group.ids.length > 1 ? { fallback: [...new Set(group.fallback)] } : {}),
        };
    }

    if (combine) {
        const direction = action === 'remove' ? -1 : 1;
        appTasks.sort((a, b) => direction * (managerTier(a.manager) - managerTier(b.manager)));
        const firstBrewGroup = appTasks.find((task) => task.kind === 'group' && task.manager === 'brew');
        if (firstBrewGroup && maintenanceAction) {
            appTasks[appTasks.indexOf(firstBrewGroup)] = {
                ...firstBrewGroup,
                steps: [BREW_REFRESH, ...firstBrewGroup.steps],
            };
        }
    }

    const cleanupTasks: MaintenanceTask[] = [];
    if (maintenanceAction && includeCleanup) {
        const touched = uniqueManagers([...batchTasks, ...appTasks].map((task) => task.manager));
        for (const manager of touched) {
            const entry = entries.find((candidate) => candidate.manager === manager);
            if (!entry?.cleanup || entry.cleanup.steps.length === 0) continue;
            cleanupTasks.push({ kind: 'cleanup', manager, label: entry.label, steps: entry.cleanup.steps });
        }
    }

    return { action, strategy, tasks: [...setupTasks, ...batchTasks, ...appTasks, ...cleanupTasks], skipped };
}

/**
 * Update/upgrade planner with the historical signature: per-app tasks (no combining), delegating
 * to buildActionPlan so fallbacks and cleanup behave the same everywhere.
 */
export function buildMaintenancePlan(
    apps: CatalogApp[],
    action: MaintenanceAction,
    config: BuilderConfig,
    optionsOrStrategy: MaintenancePlanOptions | UpdateStrategy = { strategy: 'one-by-one' },
    legacyBatchManagers?: readonly CatalogManager[],
    legacyIncludeCleanup?: boolean,
): MaintenancePlan {
    return buildActionPlan(
        apps,
        action,
        config,
        normalizeMaintenanceOptions(optionsOrStrategy, legacyBatchManagers, legacyIncludeCleanup),
    );
}

function escapePowerShellText(value: string): string {
    return value.replaceAll('`', '``').replaceAll('"', '`"').replaceAll('$', '`$');
}

function escapeBashText(value: string): string {
    return value.replace(/[\\"$`]/g, '\\$&');
}

const TASK_FUNCTION_PREFIX: Record<'setup' | 'group' | 'app', string> = {
    setup: '_repo_setup_',
    group: '_maint_group_',
    app: '_maint_app_',
};

/** A group with a fallback fails only when a per-package retry fails too. */
function renderBashSteps(task: MaintenanceTask): string {
    if (!task.fallback?.length) return task.steps.join(' && ');
    const retries = task.fallback.map((step) => `{ ${step}; } || rc=1;`).join(' ');
    // Only the combined (last) step falls back; a failed preparatory step such as `brew update` still fails.
    const combined = `${task.steps[task.steps.length - 1]} || { local rc=0; ${retries} return "$rc"; }`;
    return task.steps.length === 1 ? combined : `${task.steps.slice(0, -1).join(' && ')} && { ${combined}; }`;
}

function renderPowerShellSteps(task: MaintenanceTask): string {
    // Multi-command operations are represented as separate steps so the generated script stays
    // compatible with Windows PowerShell 5.1; each native command gets an explicit exit check.
    const checked = task.steps.map((step) => `${step}; ${PS_EXIT_CHECK}`);
    if (!task.fallback?.length) return checked.join('; ');
    const retries = task.fallback.map((step) => `${step}; if ${PS_FAILED} { $rc = 1 }`).join('; ');
    const combined = `${task.steps[task.steps.length - 1]}; if ${PS_FAILED} { $rc = 0; ${retries}; if ($rc -ne 0) { throw "per-package fallback failed" } }`;
    return [...checked.slice(0, -1), combined].join('; ');
}

/**
 * Renders any action plan as one executable script. Bash tasks are joined with `&&`; native
 * PowerShell commands are checked after every step and terminating errors are caught per task.
 * `$LASTEXITCODE` is reset before each task so a cmdlet-only step never sees a stale exit code.
 */
export function buildMaintenanceScript(
    plan: MaintenancePlan,
    config: Pick<BuilderConfig, 'platform' | 'linuxDistro'>,
    title = 'batch maintenance',
): string {
    const lines: string[] = [];
    const isWindows = config.platform === 'windows';
    const label = plan.action.toUpperCase();

    if (isWindows) {
        lines.push(`# ${label} — ${title} (PowerShell)`, '$ErrorActionPreference = "Stop"', '$ok=0;$fail=0');
    } else {
        lines.push(
            '#!/usr/bin/env bash',
            `# ${label} — ${title}, generated by dev.tools`,
            'set -uo pipefail; SUCCESS=0; FAILED=0',
            'run_task(){ echo "▶ $1"; shift; if "$@"; then SUCCESS=$((SUCCESS+1)); else FAILED=$((FAILED+1)); fi; }',
        );
    }

    if (plan.tasks.length === 0) {
        lines.push(
            plan.strategy === 'batch'
                ? '# No package managers selected — nothing to do.'
                : '# No maintenance tasks selected.',
        );
    }

    const batchOrdinals = new Map<CatalogManager, number>();
    let batchIndex = 0;
    let taskIndex = 0;
    for (const task of plan.tasks) {
        if (task.kind === 'batch') {
            batchIndex += 1;
            batchOrdinals.set(task.manager, batchIndex);
        }
    }

    for (const task of plan.tasks) {
        const taskLabel =
            task.kind === 'cleanup'
                ? `cleanup ${task.label}`
                : task.kind === 'setup'
                  ? `repo setup: ${task.label}`
                  : task.kind === 'app'
                    ? `${plan.action} ${task.label} (${task.manager})`
                    : `${plan.action} ${task.label}`;

        if (isWindows) {
            const command = renderPowerShellSteps(task);
            const escaped = escapePowerShellText(taskLabel);
            lines.push(
                `try { Write-Host "▶ ${escaped}"; ${PS_RESET_EXIT_CODE} ${command}; $ok++ } catch { Write-Host "✖ ${escaped} failed: $_"; $fail++ }`,
            );
            continue;
        }

        let functionName: string;
        if (task.kind === 'batch') {
            functionName = `_maint_${batchOrdinals.get(task.manager) ?? ++batchIndex}_${plan.action}`;
        } else if (task.kind === 'cleanup') {
            functionName = `_maint_${batchOrdinals.get(task.manager) ?? ++batchIndex}_cleanup`;
        } else {
            taskIndex += 1;
            functionName = `${TASK_FUNCTION_PREFIX[task.kind]}${taskIndex}`;
        }
        lines.push(
            `${functionName}() {`,
            renderBashSteps(task),
            '}',
            `run_task "${escapeBashText(taskLabel)}" ${functionName}`,
        );
    }

    for (const { appId, reason } of plan.skipped) {
        lines.push(`# skipped ${appId}: ${reason}`);
    }

    lines.push('');
    if (isWindows) {
        lines.push('Write-Host "✔ $ok ok / ✖ $fail failed"');
    } else {
        lines.push('echo "✔ $SUCCESS ok / ✖ $FAILED failed"');
    }

    return lines.join('\n');
}

/**
 * Compatibility wrapper for callers that still request manager-wide maintenance directly.
 * It delegates to the planner, so old callers inherit action-specific operations and cleanup
 * ordering without needing to construct a full selected-app list.
 */
export function buildManagerWideScript(
    managers: CatalogManager[],
    action: MaintenanceAction,
    config: Pick<BuilderConfig, 'platform' | 'linuxDistro'>,
    includeCleanup: boolean,
): string {
    const plannerConfig: BuilderConfig = {
        platform: config.platform,
        linuxDistro: config.linuxDistro,
        managers,
        overrides: {},
        fallbackMode: 'preferred-only',
        selectedVersions: {},
    };
    const plan = buildMaintenancePlan([], action, plannerConfig, {
        strategy: 'batch',
        batchManagers: managers,
        includeCleanup,
    });
    const missingManagers = uniqueManagers(managers).filter(
        (manager) => !plan.tasks.some((task) => task.kind === 'batch' && task.manager === manager),
    );
    const script = buildMaintenanceScript(plan, config, 'manager-wide maintenance');
    if (missingManagers.length === 0) return script;
    const marker = '\n\n';
    const insertion = missingManagers
        .map((manager) => `# ${manager}: no ${action} command available — skipped`)
        .join('\n');
    const index = script.lastIndexOf(marker);
    return index === -1 ? `${script}\n${insertion}` : `${script.slice(0, index)}\n${insertion}${script.slice(index)}`;
}

// ─── Manager-bootstrap ("Setup managers") script builder ──────────────────────

export interface RequiredBootstrap {
    manager: CatalogManager;
    source: BootstrapSource;
}

/**
 * Resolves each app's manager (same rule as install/update/etc — including fallback-picked
 * managers the user never explicitly selected) and keeps the distinct ones that actually need
 * bootstrapping, in first-seen order. Managers with no MANAGER_BOOTSTRAP entry for this
 * platform/distro (OS-native managers, or ones this catalog doesn't model) are omitted. The
 * optional batch manager list is considered after app resolution so global-maintenance choices
 * are bootstrapped even when the selected app basket is empty.
 */
export function getRequiredBootstrap(
    apps: CatalogApp[],
    config: BuilderConfig,
    batchManagers: readonly CatalogManager[] = [],
): RequiredBootstrap[] {
    const seen = new Set<CatalogManager>();
    const result: RequiredBootstrap[] = [];
    const addManager = (manager: CatalogManager | null): void => {
        if (!manager || seen.has(manager)) return;
        const source = getBootstrapSource(manager, config.platform, config.linuxDistro);
        if (!source) return;
        seen.add(manager);
        result.push({ manager, source });
    };

    for (const app of apps) {
        const manager = resolveManager(app, config);
        addManager(manager);
    }
    for (const manager of batchManagers) {
        addManager(manager);
    }

    return result;
}

/**
 * Finds the first method on a provider app that is NOT itself a provider-resolved manager
 * (npm/go/uv/cargo/pipx). This is what caps a bootstrap chain at exactly one level of
 * indirection — a provider app can only be installed via an OS-native or root/self-contained
 * manager, never via another dev-manager that would itself need bootstrapping.
 */
function getProviderInstallMethod(
    app: CatalogApp,
    config: Pick<BuilderConfig, 'platform' | 'linuxDistro'>,
): CatalogMethod | null {
    const methods = getMethodsForPlatform(app, config);
    if (!methods) return null;
    return methods.find((m) => !PROVIDER_RESOLVED_MANAGERS.includes(m.manager)) ?? null;
}

/**
 * Tries each candidate app id in order and returns the first one that both supports the target
 * platform/distro and has a non-provider-resolved install method. Returns null if none do.
 * Exposes the resolved `method` (not just its command string) so callers can check whether the
 * manager that method itself uses (e.g. `brew` for `node`) needs its own bootstrap first.
 */
export function resolveProviderCommand(
    appIds: string[],
    config: Pick<BuilderConfig, 'platform' | 'linuxDistro'>,
): { app: CatalogApp; method: CatalogMethod; command: string } | null {
    for (const id of appIds) {
        const app = APPS_CATALOG.apps.find((a) => a.id === id);
        if (!app || !app.platforms[config.platform]) continue;
        const method = getProviderInstallMethod(app, config);
        if (!method) continue;
        // A provider app can itself be parameterized (e.g. node's `node@{version}` formula) —
        // there's no per-version UI for providers, so default to the newest listed version,
        // same convention the page uses when an app is first added to the basket.
        const version = app.parameterized ? app.versions?.[app.versions.length - 1] : undefined;
        const cmd = getCommand(method, 'install', version);
        if (cmd) return { app, method, command: cmd };
    }
    return null;
}

/**
 * Builds the "Setup managers" script: bootstraps every manager in `required`, either via its
 * fixed (already fact-checked) command or by installing the resolved provider app. Shell-session
 * guidance stays in the UI; generated scripts contain executable steps and skip comments only.
 * macOS/Linux → bash (.sh); Windows → PowerShell (.ps1).
 */
export function buildBootstrapScript(
    required: RequiredBootstrap[],
    config: Pick<BuilderConfig, 'platform' | 'linuxDistro'>,
    providerChoice: Partial<Record<CatalogManager, string>> = {},
): string {
    const lines: string[] = [];
    const isWindows = config.platform === 'windows';

    if (isWindows) {
        lines.push('# SETUP MANAGERS — combined (PowerShell)', '$ok=0;$fail=0');
    } else {
        lines.push(
            '#!/usr/bin/env bash',
            '# SETUP MANAGERS — combined, generated by dev.tools',
            'set -uo pipefail; SUCCESS=0; FAILED=0',
            'run_task(){ echo "▶ $1"; shift; if "$@"; then SUCCESS=$((SUCCESS+1)); else FAILED=$((FAILED+1)); fi; }',
        );
    }

    if (required.length === 0) {
        lines.push('# Nothing to set up — every manager your current selection needs is already native to this OS.');
    }

    let fnIndex = 0;
    const emitted = new Set<CatalogManager>();

    const emitFixed = (manager: CatalogManager, command: string): void => {
        fnIndex += 1;
        if (isWindows) {
            lines.push(
                `try { Write-Host "▶ setup ${manager}"; ${command}; ${PS_EXIT_CHECK}; $ok++ } catch { Write-Host "✖ setup ${manager} failed: $_"; $fail++ }`,
            );
        } else {
            const fnName = `_setup_${fnIndex}`;
            lines.push(`${fnName}() {`, command, '}', `run_task "setup ${manager}" ${fnName}`);
        }
        emitted.add(manager);
    };

    for (const { manager, source } of required) {
        if (emitted.has(manager)) continue;

        if (source.kind === 'fixed') {
            emitFixed(manager, source.command);
            continue;
        }

        const chosenId = providerChoice[manager];
        const orderedIds = chosenId ? [chosenId, ...source.appIds.filter((id) => id !== chosenId)] : source.appIds;
        const resolved = resolveProviderCommand(orderedIds, config);
        if (!resolved) {
            const message = `${manager}: no executable setup route for this platform — skipped`;
            lines.push(`# ${message}`);
            lines.push(
                isWindows
                    ? `Write-Host "⚠ ${message}" -ForegroundColor Red`
                    : `echo -e "\\033[0;31m⚠ ${message}\\033[0m"`,
            );
            continue;
        }

        // The provider app's own resolved manager (e.g. `brew` for `node`) can itself need
        // bootstrapping — getProviderInstallMethod already guarantees it's never another
        // provider-resolved manager, so this is at most one extra, terminal step.
        const subManager = resolved.method.manager;
        if (subManager !== manager && !emitted.has(subManager)) {
            const subSource = getBootstrapSource(subManager, config.platform, config.linuxDistro);
            if (subSource?.kind === 'fixed') {
                emitFixed(subManager, subSource.command);
            }
        }

        fnIndex += 1;
        const label = `setup ${manager} (via ${resolved.app.name})`;
        if (isWindows) {
            lines.push(
                `try { Write-Host "▶ ${label}"; ${resolved.command}; ${PS_EXIT_CHECK}; $ok++ } catch { Write-Host "✖ ${label} failed: $_"; $fail++ }`,
            );
        } else {
            const fnName = `_setup_${fnIndex}`;
            lines.push(`${fnName}() {`, resolved.command, '}', `run_task "${label}" ${fnName}`);
        }
        emitted.add(manager);
    }

    lines.push('');
    if (isWindows) {
        lines.push('Write-Host "✔ $ok ok / ✖ $fail failed"');
    } else {
        lines.push('echo "✔ $SUCCESS ok / ✖ $FAILED failed"');
    }

    return lines.join('\n');
}
