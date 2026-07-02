import { APPS_CATALOG } from '@/common/apps-catalog';
import type { CatalogApp, CatalogManager, CatalogPlatform, LinuxDistro } from '@/common/apps-catalog-types';
import { HIDDEN_MANAGERS } from '@/common/catalog-utils';
import type { BuilderConfig, ScriptAction } from '@/common/script-builder';
import {
    buildCombinedScript,
    buildManagerWideScript,
    buildPerAppScripts,
    getMaintenanceEntries,
} from '@/common/script-builder';
import SegmentedControl, { type SegmentedOption } from '@/controls/SegmentedControl';
import CodeSnippet from '@/elements/CodeSnippet';
import React, { useEffect, useMemo, useState } from 'react';

type PrefMode = 'preferred' | 'fallback';
type Scope = 'combined' | 'per-app' | 'system-wide';
export type UpdateScope = 'selected-apps' | 'all-installed';

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
    { value: 'install', label: 'Install' },
    { value: 'update', label: 'Update' },
    { value: 'upgrade', label: 'Upgrade' },
    { value: 'remove', label: 'Remove' },
];

const SCOPE_OPTIONS: SegmentedOption[] = [
    { value: 'combined', label: 'Single combined' },
    { value: 'per-app', label: 'One per app' },
    { value: 'system-wide', label: 'System-wide maintenance' },
];

const UPDATE_SCOPE_OPTIONS: SegmentedOption[] = [
    { value: 'selected-apps', label: 'Selected apps only' },
    { value: 'all-installed', label: 'Everything this manager manages' },
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
    const [action, setAction] = useState<ScriptAction>('install');
    const [scope, setScope] = useState<Scope>('combined');
    const [includeCleanup, setIncludeCleanup] = useState<boolean>(true);
    const [maintenanceManagers, setMaintenanceManagers] = useState<CatalogManager[]>([]);

    useEffect(() => {
        setMaintenanceManagers([]);
    }, [platform, linuxDistro]);

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

    const maintenanceEntries = useMemo(
        () => getMaintenanceEntries(config).filter((e) => !HIDDEN_MANAGERS.includes(e.manager)),
        [config],
    );

    function toggleMaintenanceManager(mgr: CatalogManager): void {
        setMaintenanceManagers((prev) => (prev.includes(mgr) ? prev.filter((m) => m !== mgr) : [...prev, mgr]));
    }

    const showUpdateScope = (action === 'update' || action === 'upgrade') && scope !== 'system-wide';
    const managerWideActionValid = action === 'update' || action === 'upgrade';
    const isManagerWideMode = scope === 'system-wide' || (updateScope === 'all-installed' && managerWideActionValid);
    const managerWideManagers = scope === 'system-wide' ? maintenanceManagers : selectedManagers;
    const showCleanupCheckbox = scope === 'system-wide' || updateScope === 'all-installed';

    const isEmpty = isManagerWideMode ? managerWideManagers.length === 0 : selectedList.length === 0;
    const ext = platform === 'windows' ? 'ps1' : 'sh';

    const filename = useMemo(() => {
        if (isManagerWideMode) return `${action}-maintenance.${ext}`;
        return scope === 'per-app' ? `${action}-scripts.${ext}` : `${action}.${ext}`;
    }, [isManagerWideMode, action, scope, ext]);

    const scriptContent = useMemo(() => {
        if (isManagerWideMode) {
            if (!managerWideActionValid || managerWideManagers.length === 0) return '';
            return buildManagerWideScript(managerWideManagers, action, config, includeCleanup);
        }
        if (selectedList.length === 0 || scope === 'per-app') return '';
        return buildCombinedScript(selectedList, action, config);
    }, [
        isManagerWideMode,
        managerWideActionValid,
        managerWideManagers,
        action,
        config,
        includeCleanup,
        selectedList,
        scope,
    ]);

    const perAppScripts = useMemo(() => {
        if (isManagerWideMode || scope !== 'per-app' || selectedList.length === 0) return null;
        return buildPerAppScripts(selectedList, action, config);
    }, [isManagerWideMode, scope, selectedList, action, config]);

    const language = platform === 'windows' ? 'powershell' : 'bash';

    const emptyMessage = useMemo(() => {
        if (scope === 'system-wide' && !managerWideActionValid) {
            return 'System-wide maintenance only supports Update and Upgrade — select one of those actions above.';
        }
        if (isManagerWideMode) {
            return 'Select at least one package manager above to generate a maintenance script.';
        }
        return 'Select at least one app in Step 3 to generate a script.';
    }, [scope, managerWideActionValid, isManagerWideMode]);

    return (
        <div className="installer-output">
            <div className="installer-output-controls">
                <div className="installer-output-control-group">
                    <span className="installer-mgr-subheading">Action</span>
                    <SegmentedControl
                        options={ACTION_OPTIONS}
                        value={action}
                        onChange={(v) => setAction(v as ScriptAction)}
                        aria-label="Script action"
                    />
                </div>
                <div className="installer-output-control-group">
                    <span className="installer-mgr-subheading">Scope</span>
                    <SegmentedControl
                        options={SCOPE_OPTIONS}
                        value={scope}
                        onChange={(v) => setScope(v as Scope)}
                        aria-label="Script scope"
                    />
                </div>
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
                {scope === 'system-wide' && (
                    <div className="installer-output-control-group">
                        <span className="installer-mgr-subheading">Package managers</span>
                        <div
                            className="installer-chip-row"
                            data-testid="maintenance-mgr-chips"
                            role="group"
                            aria-label="System-wide maintenance managers"
                        >
                            {maintenanceEntries.map((entry) => (
                                <button
                                    key={entry.manager}
                                    type="button"
                                    className={`chip${maintenanceManagers.includes(entry.manager) ? ' on' : ''}`}
                                    aria-pressed={maintenanceManagers.includes(entry.manager)}
                                    onClick={() => toggleMaintenanceManager(entry.manager)}
                                >
                                    {entry.label}
                                </button>
                            ))}
                        </div>
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
            </div>

            {isEmpty ? (
                <p className="installer-output-empty" data-testid="output-empty">
                    {emptyMessage}
                </p>
            ) : (
                <div data-testid="output-code">
                    <span data-testid="output-filename" style={{ display: 'none' }}>
                        {filename}
                    </span>
                    {!isManagerWideMode && scope === 'per-app' && perAppScripts ? (
                        <div data-testid="output-per-app">
                            {selectedList.map((app) => {
                                const script = perAppScripts[app.id];
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
                                        {app.name}: {getSkipReason(app, config)} — skipped
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
