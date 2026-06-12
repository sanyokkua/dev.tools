import { saveTextFile } from '@/common/file-utils';
import {
    DEFAULT_VRAM_PRESET,
    VRAM_PRESETS,
    VramMode,
    VramPresetGb,
    generateVramScript,
} from '@/common/vram-script-generator';
import CodeSnippet from '@/elements/CodeSnippet';
import React, { useMemo, useState } from 'react';

const MODE_OPTIONS: { value: VramMode; label: string }[] = [
    { value: 'apply', label: 'Apply' },
    { value: 'dry-run', label: 'Dry-run' },
    { value: 'reset', label: 'Reset to default' },
    { value: 'show-current', label: 'Show current' },
];

const presetLabel = (p: VramPresetGb): string => (p === DEFAULT_VRAM_PRESET ? `${p} GB (default)` : `${p} GB`);

const VramManager: React.FC = () => {
    const [preset, setPreset] = useState<VramPresetGb>(DEFAULT_VRAM_PRESET);
    const [mode, setMode] = useState<VramMode>('apply');

    const script = useMemo(() => generateVramScript(preset, mode), [preset, mode]);
    const showPresets = mode !== 'reset' && mode !== 'show-current';

    function handleDownload(): void {
        saveTextFile({
            fileName: 'set-vram',
            fileExtension: '.sh',
            fileMimeType: 'text/x-shellscript',
            fileContent: script,
        });
    }

    return (
        <div className="vram-manager">
            <div className="vram-manager__controls">
                {showPresets && (
                    <div className="vram-manager__field">
                        <label className="vram-manager__label">Preset (GB to reserve for GPU)</label>
                        <div className="vram-manager__presets">
                            {VRAM_PRESETS.map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    className={`chip${preset === p ? ' chip-selected' : ''}`}
                                    onClick={() => setPreset(p)}
                                    aria-pressed={preset === p}
                                >
                                    {presetLabel(p)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="vram-manager__field">
                    <label className="vram-manager__label">Mode</label>
                    <div className="vram-manager__modes">
                        {MODE_OPTIONS.map((m) => (
                            <button
                                key={m.value}
                                type="button"
                                className={`chip${mode === m.value ? ' chip-selected' : ''}`}
                                onClick={() => setMode(m.value)}
                                aria-pressed={mode === m.value}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="vram-manager__safety">
                    Safety: keeps ≥ 4 GB for macOS; warns if the requested limit exceeds total RAM. Apple Silicon only.
                </p>
            </div>

            <div className="vram-manager__preview">
                <CodeSnippet headerText="set-vram.sh" content={script} language="bash" onDownload={handleDownload} />
            </div>
        </div>
    );
};

export default VramManager;
