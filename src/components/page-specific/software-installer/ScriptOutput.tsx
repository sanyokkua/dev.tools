import { APPS_CATALOG } from '@/common/apps-catalog';
import type { CatalogApp, CatalogManager, CatalogPlatform, LinuxDistro } from '@/common/apps-catalog-types';
import type { BuilderConfig, ScriptAction } from '@/common/script-builder';
import { buildCombinedScript, buildPerAppScripts } from '@/common/script-builder';
import SegmentedControl, { type SegmentedOption } from '@/controls/SegmentedControl';
import CodeSnippet from '@/elements/CodeSnippet';
import React, { useMemo, useState } from 'react';

type PrefMode = 'preferred' | 'fallback';
type Scope = 'combined' | 'per-app';

export interface ScriptOutputProps {
    platform: CatalogPlatform;
    linuxDistro: LinuxDistro;
    selectedManagers: CatalogManager[];
    prefMode: PrefMode;
    selectedApps: Record<string, CatalogManager | null>;
    selectedVersions: Record<string, string[]>;
}

const ACTION_OPTIONS: SegmentedOption[] = [
    { value: 'install', label: 'Install' },
    { value: 'update', label: 'Update' },
    { value: 'remove', label: 'Remove' },
];

const SCOPE_OPTIONS: SegmentedOption[] = [
    { value: 'combined', label: 'Single combined' },
    { value: 'per-app', label: 'One per app' },
];

function buildPerAppPreview(apps: CatalogApp[], action: ScriptAction, config: BuilderConfig): string {
    const scripts = buildPerAppScripts(apps, action, config);
    const parts: string[] = [
        `# PER-APP MODE — ${apps.length} app${apps.length === 1 ? '' : 's'}; preview of each ${action} script:`,
    ];

    for (const app of apps) {
        parts.push('');
        if (app.id in scripts) {
            parts.push(scripts[app.id]);
        } else {
            const reason = !app.platforms[config.platform]
                ? `no ${config.platform} build`
                : app.parameterized && !config.selectedVersions[app.id]?.length
                  ? 'no version selected'
                  : 'no preferred manager — fallback off';
            parts.push(`# ${app.name}: ${reason} — skipped`);
        }
    }

    return parts.join('\n');
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
}: ScriptOutputProps): React.JSX.Element => {
    const [action, setAction] = useState<ScriptAction>('install');
    const [scope, setScope] = useState<Scope>('combined');

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

    const isEmpty = selectedList.length === 0;
    const ext = platform === 'windows' ? 'ps1' : 'sh';

    const filename = useMemo(
        () => (scope === 'per-app' ? `${action}-scripts.${ext}` : `${action}.${ext}`),
        [action, scope, ext],
    );

    const scriptContent = useMemo(() => {
        if (isEmpty) return '';
        return scope === 'combined'
            ? buildCombinedScript(selectedList, action, config)
            : buildPerAppPreview(selectedList, action, config);
    }, [isEmpty, scope, selectedList, action, config]);

    const perAppScripts = useMemo(() => {
        if (scope !== 'per-app' || isEmpty) return null;
        return buildPerAppScripts(selectedList, action, config);
    }, [scope, isEmpty, selectedList, action, config]);

    const language = platform === 'windows' ? 'powershell' : 'bash';

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
            </div>

            {isEmpty ? (
                <p className="installer-output-empty" data-testid="output-empty">
                    Select at least one app in Step 3 to generate a script.
                </p>
            ) : (
                <div data-testid="output-code">
                    <span data-testid="output-filename" style={{ display: 'none' }}>
                        {filename}
                    </span>
                    {scope === 'per-app' && perAppScripts ? (
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
                                        {app.name}: skipped (no available method)
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
