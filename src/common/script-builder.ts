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

export interface MaintenanceTask {
    kind: 'batch' | 'app' | 'cleanup';
    manager: CatalogManager;
    label: string;
    steps: readonly string[];
    appId?: string;
    version?: string;
}

export interface MaintenancePlan {
    action: MaintenanceAction;
    strategy: UpdateStrategy;
    tasks: readonly MaintenanceTask[];
    skipped: readonly { appId: string; reason: string }[];
}

export interface MaintenancePlanOptions {
    strategy?: UpdateStrategy;
    batchManagers?: readonly CatalogManager[];
    includeCleanup?: boolean;
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
 *  6. null → app is skipped
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

    return null;
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

function getMaintenanceAppCommand(
    method: CatalogMethod,
    manager: CatalogManager,
    action: MaintenanceAction,
    version?: string,
): string | null {
    const command = getCommand(method, action, version);
    if (!command) return null;
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
            lines.push(
                `try { Write-Host "▶ repo setup: ${entry.appName} (${entry.manager})"; ${entry.repoSetup}; if ($LASTEXITCODE -ne 0) { throw "exit $LASTEXITCODE" }; $ok++ } catch { Write-Host "✖ repo setup: ${entry.appName} failed: $_"; $fail++ }`,
            );
        } else {
            const fnName = `_repo_setup_${i + 1}`;
            lines.push(
                `${fnName}() {`,
                entry.repoSetup,
                '}',
                `run_task "repo setup: ${entry.appName} (${entry.manager})" ${fnName}`,
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
        lines.push(`# ${label} — combined (PowerShell)`, '$ok=0;$fail=0');
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
                isWindows ? `Write-Host "${warning}" -ForegroundColor Red` : `echo -e "\\033[0;31m${warning}\\033[0m"`,
            );
            continue;
        }

        const method = resolveMethod(app, config)!;

        if (app.parameterized) {
            const versions = config.selectedVersions[app.id] ?? [];
            for (const v of versions) {
                const cmd = getCommand(method, action, v);
                if (!cmd) {
                    lines.push(`# ${app.name} ${v}: no ${action} command — skipped`);
                    continue;
                }
                if (isWindows) {
                    lines.push(
                        `try { Write-Host "▶ ${action} ${app.name} ${v} (${manager})"; ${cmd}; if ($LASTEXITCODE -ne 0) { throw "exit $LASTEXITCODE" }; $ok++ } catch { Write-Host "✖ ${app.name} ${v} failed: $_"; $fail++ }`,
                    );
                } else {
                    taskIndex += 1;
                    const fnName = `_task_${taskIndex}`;
                    lines.push(
                        `${fnName}() {`,
                        cmd,
                        '}',
                        `run_task "${action} ${app.name} ${v} (${manager})" ${fnName}`,
                    );
                }
            }
        } else {
            const cmd = getCommand(method, action);
            if (!cmd) {
                lines.push(`# ${app.name}: no ${action} command — skipped`);
                continue;
            }
            if (isWindows) {
                // $LASTEXITCODE is only set by external executables; winget/choco are CLIs so this is correct
                lines.push(
                    `try { Write-Host "▶ ${action} ${app.name}"; ${cmd}; if ($LASTEXITCODE -ne 0) { throw "exit $LASTEXITCODE" }; $ok++ } catch { Write-Host "✖ ${app.name} failed: $_"; $fail++ }`,
                );
            } else {
                taskIndex += 1;
                const fnName = `_task_${taskIndex}`;
                lines.push(`${fnName}() {`, cmd, '}', `run_task "${action} ${app.name} (${manager})" ${fnName}`);
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
            result[app.id] = repoSetupPrefix + cmds.join('\n');
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

function maintenanceSkipReason(app: CatalogApp, action: MaintenanceAction, config: BuilderConfig): string {
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

/**
 * Creates the pure maintenance task plan. In batch mode, selected batch managers are emitted
 * once and selected apps are emitted only when their resolved manager is outside that batch set.
 * The planner never starts work or performs network calls.
 */
export function buildMaintenancePlan(
    apps: CatalogApp[],
    action: MaintenanceAction,
    config: BuilderConfig,
    optionsOrStrategy: MaintenancePlanOptions | UpdateStrategy = { strategy: 'one-by-one' },
    legacyBatchManagers?: readonly CatalogManager[],
    legacyIncludeCleanup?: boolean,
): MaintenancePlan {
    const options = normalizeMaintenanceOptions(optionsOrStrategy, legacyBatchManagers, legacyIncludeCleanup);
    const tasks: MaintenanceTask[] = [];
    const skipped: { appId: string; reason: string }[] = [];
    const entries = getMaintenanceEntries(config);
    const batchManagers = uniqueManagers(options.batchManagers);
    const batchedManagers = new Set<CatalogManager>();

    if (options.strategy === 'batch') {
        for (const manager of batchManagers) {
            const entry = entries.find((candidate) => candidate.manager === manager);
            const operation = entry?.operations[action];
            if (!entry || !operation || operation.steps.length === 0) continue;
            tasks.push({ kind: 'batch', manager, label: entry.label, steps: operation.steps });
            batchedManagers.add(manager);
        }
    }

    for (const app of apps) {
        const manager = resolveManager(app, config);
        if (!manager) {
            skipped.push({ appId: app.id, reason: maintenanceSkipReason(app, action, config) });
            continue;
        }

        if (options.strategy === 'batch' && batchedManagers.has(manager)) continue;

        const method = resolveMethod(app, config);
        if (!method) {
            skipped.push({ appId: app.id, reason: 'no executable method' });
            continue;
        }

        const versions: (string | undefined)[] = app.parameterized
            ? (config.selectedVersions[app.id] ?? [])
            : [undefined];
        let emitted = 0;
        let missingCommand = false;
        for (const version of versions) {
            const command = getMaintenanceAppCommand(method, manager, action, version);
            if (!command) {
                missingCommand = true;
                continue;
            }
            tasks.push({
                kind: 'app',
                manager,
                label: version === undefined ? app.name : `${app.name} ${version}`,
                steps: [command],
                appId: app.id,
                ...(version === undefined ? {} : { version }),
            });
            emitted += 1;
        }

        if (emitted === 0) {
            skipped.push({ appId: app.id, reason: `no ${action} command` });
        } else if (missingCommand) {
            skipped.push({ appId: app.id, reason: `no ${action} command for one or more selected versions` });
        }
    }

    if (options.strategy === 'batch' && options.includeCleanup) {
        for (const manager of batchManagers) {
            if (!batchedManagers.has(manager)) continue;
            const entry = entries.find((candidate) => candidate.manager === manager);
            if (!entry?.cleanup || entry.cleanup.steps.length === 0) continue;
            tasks.push({ kind: 'cleanup', manager, label: entry.label, steps: entry.cleanup.steps });
        }
    }

    return { action, strategy: options.strategy, tasks, skipped };
}

function escapePowerShellText(value: string): string {
    return value.replaceAll('`', '``').replaceAll('"', '`"').replaceAll('$', '`$');
}

function escapeBashText(value: string): string {
    return value.replaceAll('"', '\\"');
}

function renderBashSteps(steps: readonly string[]): string {
    return steps.join(' && ');
}

function renderPowerShellSteps(steps: readonly string[]): string {
    // Multi-command operations are represented as separate steps so the generated script stays
    // compatible with Windows PowerShell 5.1; each native command gets an explicit exit check.
    return steps.map((step) => `${step}; if ($LASTEXITCODE -ne 0) { throw "exit $LASTEXITCODE" };`).join(' ');
}

/**
 * Renders a maintenance plan as one executable script. Bash tasks are joined with `&&`; native
 * PowerShell commands are checked after every step and terminating errors are caught per task.
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
    let appIndex = 0;
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
                : task.kind === 'app'
                  ? `${plan.action} ${task.label} (${task.manager})`
                  : `${plan.action} ${task.label}`;

        if (isWindows) {
            const command = renderPowerShellSteps(task.steps);
            const escaped = escapePowerShellText(taskLabel);
            lines.push(
                `try { Write-Host "▶ ${escaped}"; ${command}; $ok++ } catch { Write-Host "✖ ${escaped} failed: $_"; $fail++ }`,
            );
            continue;
        }

        let functionName: string;
        if (task.kind === 'batch') {
            functionName = `_maint_${batchOrdinals.get(task.manager) ?? ++batchIndex}_update`;
        } else if (task.kind === 'cleanup') {
            functionName = `_maint_${batchOrdinals.get(task.manager) ?? ++batchIndex}_cleanup`;
        } else {
            appIndex += 1;
            functionName = `_maint_app_${appIndex}`;
        }
        lines.push(
            `${functionName}() {`,
            renderBashSteps(task.steps),
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
                `try { Write-Host "▶ setup ${manager}"; ${command}; if ($LASTEXITCODE -ne 0) { throw "exit $LASTEXITCODE" }; $ok++ } catch { Write-Host "✖ setup ${manager} failed: $_"; $fail++ }`,
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
                `try { Write-Host "▶ ${label}"; ${resolved.command}; if ($LASTEXITCODE -ne 0) { throw "exit $LASTEXITCODE" }; $ok++ } catch { Write-Host "✖ ${label} failed: $_"; $fail++ }`,
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
