import { APPS_CATALOG } from '@/common/apps-catalog';
import type { CatalogApp, CatalogManager, CatalogPlatform, LinuxDistro } from '@/common/apps-catalog-types';
import { HIDDEN_MANAGERS, MANAGER_LABEL } from '@/common/catalog-utils';
import type { BuilderConfig, MaintenancePlan, RequiredBootstrap, ScriptAction } from '@/common/script-builder';
import {
    buildBootstrapScript,
    buildCombinedScript,
    buildMaintenancePlan,
    buildMaintenanceScript,
    buildPerAppScripts,
    getMaintenanceEntries,
    getRequiredBootstrap,
} from '@/common/script-builder';
import SegmentedControl, { type SegmentedOption } from '@/controls/SegmentedControl';
import CodeSnippet from '@/elements/CodeSnippet';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';

type PrefMode = 'preferred' | 'fallback';
type Scope = 'combined' | 'per-app';
export type UpdateScope = 'selected-apps' | 'batch';
type OutputTab = 'setup' | ScriptAction;

function providerAppLabel(appId: string): string {
    return APPS_CATALOG.apps.find((a) => a.id === appId)?.name ?? appId;
}

export interface ScriptOutputProps {
    platform: CatalogPlatform;
    linuxDistro: LinuxDistro;
    selectedManagers: CatalogManager[];
    prefMode: PrefMode;
    selectedApps: Record<string, CatalogManager | null>;
    selectedVersions: Record<string, string[]>;
    updateScope: UpdateScope;
    onUpdateScopeChange: (scope: UpdateScope) => void;
}

const ACTION_OPTIONS: SegmentedOption[] = [
    { value: 'setup', label: 'Setup managers' },
    { value: 'install', label: 'Install' },
    { value: 'update', label: 'Update' },
    { value: 'upgrade', label: 'Upgrade' },
    { value: 'remove', label: 'Remove' },
];

const SCOPE_OPTIONS: SegmentedOption[] = [
    { value: 'combined', label: 'Single combined' },
    { value: 'per-app', label: 'One per app' },
];

const UPDATE_SCOPE_OPTIONS: SegmentedOption[] = [
    { value: 'selected-apps', label: 'Selected apps only' },
    { value: 'batch', label: 'Batch maintenance' },
];

function getSkipReason(app: CatalogApp, config: BuilderConfig): string {
    if (!app.platforms[config.platform]) return `no ${config.platform} build`;
    if (app.parameterized && !config.selectedVersions[app.id]?.length) return 'no version selected';
    return 'no preferred manager — fallback off';
}

function downloadScript(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

const ScriptOutput = ({
    platform,
    linuxDistro,
    selectedManagers,
    prefMode,
    selectedApps,
    selectedVersions,
    updateScope,
    onUpdateScopeChange,
}: ScriptOutputProps): React.JSX.Element => {
    const [action, setAction] = useState<OutputTab>('install');
    const [scope, setScope] = useState<Scope>('combined');
    const [includeCleanup, setIncludeCleanup] = useState<boolean>(true);
    const [batchManagers, setBatchManagers] = useState<CatalogManager[]>([]);
    const [providerChoice, setProviderChoice] = useState<Partial<Record<CatalogManager, string>>>({});

    useEffect(() => {
        setBatchManagers([]);
    }, [platform, linuxDistro]);

    const maintenanceEntries = useMemo(
        () =>
            getMaintenanceEntries({ platform, linuxDistro }).filter(
                (entry) => !HIDDEN_MANAGERS.includes(entry.manager),
            ),
        [platform, linuxDistro],
    );

    const maintenanceAction = action === 'update' || action === 'upgrade' ? action : null;
    const batchManagerEntries = useMemo(
        () =>
            maintenanceAction ? maintenanceEntries.filter((entry) => Boolean(entry.operations[maintenanceAction])) : [],
        [maintenanceAction, maintenanceEntries],
    );

    // Batch choices are scoped to the active target and action. The separate platform/distro
    // reset above keeps a user's deselection intact while they edit manager preferences.
    useEffect(() => {
        if (maintenanceAction) setBatchManagers(batchManagerEntries.map((entry) => entry.manager));
    }, [maintenanceAction, batchManagerEntries]);

    const config = useMemo<BuilderConfig>(
        () => ({
            platform,
            linuxDistro: platform === 'linux' ? linuxDistro : undefined,
            managers: selectedManagers,
            overrides: Object.fromEntries(
                Object.entries(selectedApps).filter(([, mgr]) => mgr !== null) as [string, CatalogManager][],
            ),
            fallbackMode: prefMode === 'preferred' ? 'preferred-only' : 'fallback',
            selectedVersions,
        }),
        [platform, linuxDistro, selectedManagers, prefMode, selectedApps, selectedVersions],
    );

    const selectedList = useMemo(() => APPS_CATALOG.apps.filter((a) => a.id in selectedApps), [selectedApps]);

    const hasBatchSelection = updateScope === 'batch';
    const isBatchMode = maintenanceAction !== null && hasBatchSelection;
    const requiredBootstrap: RequiredBootstrap[] = useMemo(
        () => getRequiredBootstrap(selectedList, config, hasBatchSelection ? batchManagers : []),
        [selectedList, config, hasBatchSelection, batchManagers],
    );

    const bootstrapScript = useMemo(
        () => buildBootstrapScript(requiredBootstrap, config, providerChoice),
        [requiredBootstrap, config, providerChoice],
    );

    function toggleBatchManager(mgr: CatalogManager): void {
        setBatchManagers((prev) => (prev.includes(mgr) ? prev.filter((m) => m !== mgr) : [...prev, mgr]));
    }

    const showUpdateScope = maintenanceAction !== null;
    const showScope = !isBatchMode;
    const showCleanupCheckbox = isBatchMode;
    const ext = platform === 'windows' ? 'ps1' : 'sh';

    const maintenancePlan: MaintenancePlan | null = useMemo(() => {
        if (!maintenanceAction) return null;
        return buildMaintenancePlan(selectedList, maintenanceAction, config, {
            strategy: isBatchMode ? 'batch' : 'one-by-one',
            batchManagers: isBatchMode ? batchManagers : [],
            includeCleanup: isBatchMode && includeCleanup,
        });
    }, [selectedList, maintenanceAction, config, isBatchMode, batchManagers, includeCleanup]);

    const actionPerAppScripts = useMemo(() => {
        if (action === 'setup' || (maintenanceAction && maintenancePlan)) return {};
        return buildPerAppScripts(selectedList, action, config);
    }, [action, maintenanceAction, maintenancePlan, selectedList, config]);

    const maintenancePerAppScripts = useMemo(() => {
        if (!maintenancePlan || isBatchMode || scope !== 'per-app') return {};
        const result: Record<string, string> = {};
        for (const task of maintenancePlan.tasks) {
            if (task.kind !== 'app' || !task.appId) continue;
            result[task.appId] = [...(result[task.appId] ? [result[task.appId]] : []), ...task.steps].join('\n');
        }
        return result;
    }, [maintenancePlan, isBatchMode, scope]);

    const perAppScripts = maintenancePlan ? maintenancePerAppScripts : actionPerAppScripts;
    const hasExecutableOutput = maintenancePlan ? maintenancePlan.tasks.length > 0 : selectedList.length > 0;
    const isEmpty = !hasExecutableOutput;

    const filename = useMemo(() => {
        if (action === 'setup') return `setup-managers.${ext}`;
        if (isBatchMode) return `${action}-maintenance.${ext}`;
        return scope === 'per-app' ? `${action}-scripts.${ext}` : `${action}.${ext}`;
    }, [action, isBatchMode, scope, ext]);

    const scriptContent = useMemo(() => {
        if (action === 'setup') return '';
        if (maintenancePlan) {
            return buildMaintenanceScript(
                maintenancePlan,
                config,
                isBatchMode ? 'batch maintenance' : 'selected-app maintenance',
            );
        }
        if (selectedList.length === 0 || scope === 'per-app') return '';
        return buildCombinedScript(selectedList, action, config);
    }, [action, maintenancePlan, isBatchMode, config, selectedList, scope, actionPerAppScripts]);

    const language = platform === 'windows' ? 'powershell' : 'bash';

    const emptyMessage = useMemo(() => {
        if (isBatchMode && batchManagers.length === 0) {
            return 'Select at least one batch package manager to generate a maintenance script.';
        }
        if (selectedList.length > 0) {
            return 'No executable command is available for the current selection.';
        }
        return 'Select at least one app in Step 3 to generate a script.';
    }, [isBatchMode, batchManagers.length, selectedList.length]);

    return (
        <div className="installer-output">
            {isBatchMode && (
                <p className="installer-maintenance-warning" data-testid="batch-maintenance-warning">
                    Batch maintenance updates software outside the selected app basket.
                </p>
            )}
            {action !== 'setup' && requiredBootstrap.length > 0 && (
                <div className="installer-bootstrap-banner" data-testid="bootstrap-banner">
                    <span>
                        ⚠ {requiredBootstrap.length} package manager{requiredBootstrap.length === 1 ? '' : 's'} needed
                        by your selection {requiredBootstrap.length === 1 ? "isn't" : "aren't"} native to this OS:{' '}
                        {requiredBootstrap.map((r) => MANAGER_LABEL[r.manager] ?? r.manager).join(', ')}. Set them up
                        first, then restart your terminal before running Install.
                    </span>
                    <button type="button" className="btn ghost sm" onClick={() => setAction('setup')}>
                        Set up managers →
                    </button>
                </div>
            )}

            <div className="installer-output-controls">
                <div className="installer-output-control-group">
                    <span className="installer-mgr-subheading">Action</span>
                    <SegmentedControl
                        options={ACTION_OPTIONS}
                        value={action}
                        onChange={(v) => setAction(v as OutputTab)}
                        aria-label="Script action"
                    />
                </div>
                {action !== 'setup' && (
                    <>
                        {showScope && (
                            <div className="installer-output-control-group">
                                <span className="installer-mgr-subheading">Scope</span>
                                <SegmentedControl
                                    options={SCOPE_OPTIONS}
                                    value={scope}
                                    onChange={(v) => setScope(v as Scope)}
                                    aria-label="Script scope"
                                />
                            </div>
                        )}
                        {showUpdateScope && (
                            <div className="installer-output-control-group">
                                <span className="installer-mgr-subheading">Update scope</span>
                                <SegmentedControl
                                    options={UPDATE_SCOPE_OPTIONS}
                                    value={updateScope}
                                    onChange={(v) => onUpdateScopeChange(v as UpdateScope)}
                                    aria-label="Update scope"
                                />
                            </div>
                        )}
                        {isBatchMode && (
                            <div className="installer-output-control-group">
                                <span className="installer-mgr-subheading">Batch package managers</span>
                                <div
                                    className="installer-chip-row"
                                    data-testid="batch-maintenance-managers"
                                    role="group"
                                    aria-label="Batch maintenance managers"
                                >
                                    {batchManagerEntries.map((entry) => (
                                        <button
                                            key={entry.manager}
                                            type="button"
                                            className={`chip${batchManagers.includes(entry.manager) ? ' on' : ''}`}
                                            aria-pressed={batchManagers.includes(entry.manager)}
                                            onClick={() => toggleBatchManager(entry.manager)}
                                        >
                                            {entry.label}
                                        </button>
                                    ))}
                                </div>
                                {batchManagerEntries.length === 0 && (
                                    <p className="installer-hint">No batch manager is available for this target.</p>
                                )}
                                {batchManagerEntries.some((entry) => entry.notes) && (
                                    <ul className="installer-maintenance-notes">
                                        {batchManagerEntries
                                            .filter((entry) => entry.notes)
                                            .map((entry) => (
                                                <li key={entry.manager}>
                                                    {entry.label}: {entry.notes}
                                                </li>
                                            ))}
                                    </ul>
                                )}
                            </div>
                        )}
                        {showCleanupCheckbox && (
                            <div className="installer-output-control-group">
                                <label className="installer-checkbox-row">
                                    <input
                                        type="checkbox"
                                        checked={includeCleanup}
                                        onChange={(e) => setIncludeCleanup(e.target.checked)}
                                        aria-label="Include cleanup commands"
                                    />
                                    Include cleanup commands
                                </label>
                            </div>
                        )}
                    </>
                )}
            </div>

            {maintenancePlan && maintenancePlan.skipped.length > 0 && (
                <div className="installer-maintenance-skips" data-testid="maintenance-skips">
                    <span className="installer-mgr-subheading">Skipped apps</span>
                    <ul>
                        {maintenancePlan.skipped.map(({ appId, reason }) => (
                            <li key={appId}>
                                {APPS_CATALOG.apps.find((app) => app.id === appId)?.name ?? appId}: {reason}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {action === 'setup' ? (
                <div data-testid="output-setup">
                    {requiredBootstrap.length === 0 ? (
                        <p className="installer-output-empty" data-testid="output-empty">
                            Nothing to set up — every manager your current selection needs is already native to this OS.
                        </p>
                    ) : (
                        <>
                            <div className="installer-bootstrap-list" data-testid="bootstrap-required-list">
                                {requiredBootstrap.map(({ manager, source }) => (
                                    <div key={manager} className="installer-bootstrap-row">
                                        <span className="installer-bootstrap-row__name">
                                            {MANAGER_LABEL[manager] ?? manager}
                                        </span>
                                        {source.kind === 'provider-app' && source.appIds.length > 1 && (
                                            <div className="installer-basket-card__field">
                                                <label htmlFor={`bootstrap-provider-${manager}`}>Install via</label>
                                                <select
                                                    id={`bootstrap-provider-${manager}`}
                                                    value={providerChoice[manager] ?? source.appIds[0]}
                                                    onChange={(e) =>
                                                        setProviderChoice((prev) => ({
                                                            ...prev,
                                                            [manager]: e.target.value,
                                                        }))
                                                    }
                                                    aria-label={`Provider app for ${manager}`}
                                                >
                                                    {source.appIds.map((id) => (
                                                        <option key={id} value={id}>
                                                            {providerAppLabel(id)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        <Link
                                            href={source.guidePath}
                                            className="app-site-link"
                                            data-testid={`bootstrap-guide-${manager}`}
                                        >
                                            Full guide →
                                        </Link>
                                    </div>
                                ))}
                            </div>
                            <CodeSnippet
                                content={bootstrapScript}
                                headerText={filename}
                                language={language}
                                onDownload={() => downloadScript(bootstrapScript, filename)}
                            />
                        </>
                    )}
                </div>
            ) : isEmpty ? (
                <p className="installer-output-empty" data-testid="output-empty">
                    {emptyMessage}
                </p>
            ) : (
                <div data-testid="output-code">
                    <span data-testid="output-filename" style={{ display: 'none' }}>
                        {filename}
                    </span>
                    {!isBatchMode && scope === 'per-app' && perAppScripts ? (
                        <div data-testid="output-per-app">
                            {selectedList.map((app) => {
                                const script = perAppScripts[app.id];
                                const maintenanceSkip = maintenancePlan?.skipped.find(
                                    (skipped) => skipped.appId === app.id,
                                );
                                return script ? (
                                    <CodeSnippet
                                        key={app.id}
                                        content={script}
                                        headerText={app.name}
                                        language={language}
                                        onDownload={() => downloadScript(script, `${app.id}-${action}.${ext}`)}
                                    />
                                ) : (
                                    <p key={app.id} className="installer-per-app-skip">
                                        {app.name}: {maintenanceSkip?.reason ?? getSkipReason(app, config)} — skipped
                                    </p>
                                );
                            })}
                        </div>
                    ) : (
                        <CodeSnippet
                            content={scriptContent}
                            headerText={filename}
                            language={language}
                            onDownload={() => downloadScript(scriptContent, filename)}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default ScriptOutput;
