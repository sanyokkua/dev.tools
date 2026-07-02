import type { CatalogApp, CatalogManager, CatalogMethod, CatalogPlatform, LinuxDistro } from './apps-catalog-types';
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

function getMethodsForPlatform(app: CatalogApp, config: BuilderConfig): CatalogMethod[] | undefined {
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

    for (const app of apps) {
        const manager = resolveManager(app, config);
        if (!manager) {
            lines.push(skipReason(app, config));
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
                    lines.push(`run_task "${action} ${app.name} ${v} (${manager})" ${cmd}`);
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
                lines.push(`run_task "${action} ${app.name} (${manager})" ${cmd}`);
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
