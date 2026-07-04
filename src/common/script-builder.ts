import { APPS_CATALOG } from './apps-catalog';
import type { CatalogApp, CatalogManager, CatalogMethod, CatalogPlatform, LinuxDistro } from './apps-catalog-types';
import { getBootstrapSource, PROVIDER_RESOLVED_MANAGERS, type BootstrapSource } from './manager-bootstrap-catalog';
import { MANAGER_MAINTENANCE, type ManagerMaintenanceEntry } from './manager-maintenance-catalog';

// ─── Public types ─────────────────────────────────────────────────────────────

export type ScriptAction = 'install' | 'update' | 'upgrade' | 'remove';

export type FallbackMode = 'preferred-only' | 'fallback';

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

// ─── Manager-wide maintenance script builder ──────────────────────────────────

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

/**
 * Builds a manager-wide maintenance script ("update everything this manager manages")
 * independent of any specific apps array — looks up each selected manager's update-all
 * (and, if requested, cleanup) command in MANAGER_MAINTENANCE for the given platform/distro.
 * macOS/Linux → bash (.sh); Windows → PowerShell (.ps1).
 * bash: every command is wrapped in a generated shell function before being invoked via
 * run_task — this is required (not merely stylistic) because some entries contain multi-
 * statement control flow (e.g. openSUSE's Tumbleweed/Leap detection), which would break if
 * spliced directly onto the run_task invocation line the way simple per-app commands are.
 */
export function buildManagerWideScript(
    managers: CatalogManager[],
    action: 'update' | 'upgrade',
    config: Pick<BuilderConfig, 'platform' | 'linuxDistro'>,
    includeCleanup: boolean,
): string {
    const lines: string[] = [];
    const isWindows = config.platform === 'windows';
    const label = action.toUpperCase();

    if (isWindows) {
        lines.push(`# ${label} — manager-wide maintenance (PowerShell)`, '$ok=0;$fail=0');
    } else {
        lines.push(
            '#!/usr/bin/env bash',
            `# ${label} — manager-wide maintenance, generated by dev.tools`,
            'set -uo pipefail; SUCCESS=0; FAILED=0',
            'run_task(){ echo "▶ $1"; shift; if "$@"; then SUCCESS=$((SUCCESS+1)); else FAILED=$((FAILED+1)); fi; }',
        );
    }

    const entries = getMaintenanceEntries(config);

    if (managers.length === 0) {
        lines.push('# No package managers selected — nothing to do.');
    }

    let fnIndex = 0;
    for (const manager of managers) {
        const entry = entries.find((e) => e.manager === manager);
        if (!entry?.updateAllCommand) {
            lines.push(`# ${manager}: no ${action} command available — skipped`);
            continue;
        }

        if (entry.notes) {
            lines.push(`# ${manager}: ${entry.notes}`);
        }

        fnIndex += 1;
        if (isWindows) {
            lines.push(
                `try { Write-Host "▶ ${action} ${entry.label}"; ${entry.updateAllCommand}; if ($LASTEXITCODE -ne 0) { throw "exit $LASTEXITCODE" }; $ok++ } catch { Write-Host "✖ ${entry.label} failed: $_"; $fail++ }`,
            );
        } else {
            const fnName = `_maint_${fnIndex}_update`;
            lines.push(`${fnName}() {`, entry.updateAllCommand, '}', `run_task "${action} ${entry.label}" ${fnName}`);
        }

        if (includeCleanup && entry.cleanupCommand) {
            if (isWindows) {
                lines.push(
                    `try { Write-Host "▶ cleanup ${entry.label}"; ${entry.cleanupCommand}; if ($LASTEXITCODE -ne 0) { throw "exit $LASTEXITCODE" }; $ok++ } catch { Write-Host "✖ cleanup ${entry.label} failed: $_"; $fail++ }`,
                );
            } else {
                const fnName = `_maint_${fnIndex}_cleanup`;
                lines.push(`${fnName}() {`, entry.cleanupCommand, '}', `run_task "cleanup ${entry.label}" ${fnName}`);
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

// ─── Manager-bootstrap ("Setup managers") script builder ──────────────────────

export interface RequiredBootstrap {
    manager: CatalogManager;
    source: BootstrapSource;
}

/**
 * Resolves each app's manager (same rule as install/update/etc — including fallback-picked
 * managers the user never explicitly selected) and keeps the distinct ones that actually need
 * bootstrapping, in first-seen order. Managers with no MANAGER_BOOTSTRAP entry for this
 * platform/distro (OS-native managers, or ones this catalog doesn't model) are omitted.
 */
export function getRequiredBootstrap(apps: CatalogApp[], config: BuilderConfig): RequiredBootstrap[] {
    const seen = new Set<CatalogManager>();
    const result: RequiredBootstrap[] = [];
    for (const app of apps) {
        const manager = resolveManager(app, config);
        if (!manager || seen.has(manager)) continue;
        const source = getBootstrapSource(manager, config.platform, config.linuxDistro);
        if (!source) continue;
        seen.add(manager);
        result.push({ manager, source });
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
 * fixed (already fact-checked) command or by installing the resolved provider app, then always
 * ends with a colored notice that a new shell session is needed before running Install — PATH/
 * profile changes made here are not visible in the current one.
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
            const message = `${manager}: no known way to install it on this platform — install it manually first`;
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
        lines.push(
            'Write-Host "`n⚠ Restart PowerShell (open a new window) before running Install — new PATH entries are not visible in this session." -ForegroundColor Red',
        );
    } else {
        lines.push('echo "✔ $SUCCESS ok / ✖ $FAILED failed"');
        lines.push(
            'echo -e "\\n\\033[0;31m⚠ Restart your terminal (or run: source ~/.zshrc / source ~/.bashrc) before running Install — new PATH entries are not visible in this session.\\033[0m"',
        );
    }

    return lines.join('\n');
}
