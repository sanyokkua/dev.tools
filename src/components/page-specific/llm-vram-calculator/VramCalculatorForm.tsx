'use client';
import { KVCacheQuant, OperatingSystem, QUANT_CATALOG } from '@/common/llm-vram-calc';
import Button from '@/controls/Button';
import Input from '@/controls/Input';
import Select, { SelectItem } from '@/controls/Select';
import Switch from '@/controls/Switch';
import React, { useState } from 'react';

/** @description Form state for the VRAM calculator, with all values stored as strings for controlled inputs. */
export interface VramFormState {
    params_b: string;
    model_size_gb: string;
    quantization: string;
    context_size: string;
    kv_cache_enabled: boolean;
    kv_cache_quant: string;
    os: string;
    vram_gb: string;
    layers: string;
    key_dim: string;
    value_dim: string;
    kv_heads: string;
    sliding_window: string;
    max_context: string;
    expert_count: string;
    active_experts: string;
    batch_size: string;
}

export const INITIAL_FORM_STATE: VramFormState = {
    params_b: '',
    model_size_gb: '',
    quantization: 'all',
    context_size: '4096',
    kv_cache_enabled: true,
    kv_cache_quant: KVCacheQuant.Q8,
    os: 'none',
    vram_gb: '',
    layers: '',
    key_dim: '128',
    value_dim: '128',
    kv_heads: '8',
    sliding_window: '',
    max_context: '',
    expert_count: '',
    active_experts: '',
    batch_size: '1',
};

/** @description Props for the VramCalculatorForm component. */
interface VramCalculatorFormProps {
    formState: VramFormState;
    onFormChange: (state: VramFormState) => void;
    onCalculate: () => void;
    onReset: () => void;
}

const quantizationItems: SelectItem[] = [
    { itemId: 'all', displayText: 'All' },
    ...Object.keys(QUANT_CATALOG).map((q) => ({ itemId: q, displayText: q })),
];

const kvCacheQuantItems: SelectItem[] = [
    { itemId: KVCacheQuant.Q4, displayText: 'Q4' },
    { itemId: KVCacheQuant.Q8, displayText: 'Q8' },
    { itemId: KVCacheQuant.FP16, displayText: 'FP16' },
    { itemId: KVCacheQuant.FP32, displayText: 'FP32' },
];

const osItems: SelectItem[] = [
    { itemId: 'none', displayText: 'None' },
    { itemId: OperatingSystem.MACOS, displayText: 'macOS' },
    { itemId: OperatingSystem.WINDOWS, displayText: 'Windows' },
    { itemId: OperatingSystem.LINUX_GUI, displayText: 'Linux GUI' },
    { itemId: OperatingSystem.LINUX_HEADLESS, displayText: 'Linux Headless' },
];

const VRAM_PRESETS = [4, 8, 12, 16, 32, 64, 96, 128];
const CUSTOM_GB_MIN = 4;
const CUSTOM_GB_MAX = 256;
const CUSTOM_GB_DEFAULT = 64;

/**
 * @description Multi-section input form for the LLM VRAM calculator. Includes model parameters,
 * context/KV cache settings, hardware configuration, collapsible advanced architecture and MoE
 * sections, and VRAM preset buttons for common GPU sizes.
 */
const VramCalculatorForm: React.FC<VramCalculatorFormProps> = ({ formState, onFormChange, onCalculate, onReset }) => {
    const [customMode, setCustomMode] = useState(false);

    const updateField = (field: keyof VramFormState, value: string | boolean): void => {
        onFormChange({ ...formState, [field]: value });
    };

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        onCalculate();
    };

    const handleCustomChipClick = (): void => {
        setCustomMode(true);
        if (!formState.vram_gb || VRAM_PRESETS.includes(Number(formState.vram_gb))) {
            updateField('vram_gb', String(CUSTOM_GB_DEFAULT));
        }
    };

    const handlePresetChipClick = (gb: number): void => {
        setCustomMode(false);
        updateField('vram_gb', String(gb));
    };

    const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const raw = Number(e.target.value);
        const clamped = Math.max(CUSTOM_GB_MIN, Math.min(CUSTOM_GB_MAX, raw));
        updateField('vram_gb', String(clamped));
    };

    return (
        <div className="card pad">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                    <div className="steplabel">
                        <span className="n">A</span> Model parameters
                    </div>
                    <div className="formgrid">
                        <div className="field">
                            <label htmlFor="params_b">Parameters (Billions)</label>
                            <Input
                                type="number"
                                id="params_b"
                                value={formState.params_b}
                                onChange={(v) => updateField('params_b', v)}
                                min={1}
                                max={1000}
                                step={0.1}
                                required
                                size="small"
                                placeholder="e.g. 8"
                            />
                            <span className="vram-form-hint">
                                Find on HuggingFace model card, e.g. &quot;Llama 3.1 8B&quot; → 8
                            </span>
                        </div>
                        <div className="field">
                            <label htmlFor="model_size_gb">Model Size (GB)</label>
                            <Input
                                type="number"
                                id="model_size_gb"
                                value={formState.model_size_gb}
                                onChange={(v) => updateField('model_size_gb', v)}
                                min={0.1}
                                max={500}
                                step={0.1}
                                size="small"
                                placeholder="Leave blank for auto-estimation"
                            />
                            <span className="vram-form-hint">
                                Exact GGUF file size from HuggingFace. Leave blank for auto-estimation
                            </span>
                        </div>
                        <div className="field">
                            <label htmlFor="quantization">Quantization</label>
                            <Select
                                items={quantizationItems}
                                selectedItem={formState.quantization}
                                onSelect={(item) => updateField('quantization', item.itemId)}
                                size="small"
                            />
                            <span className="vram-form-hint">
                                Select specific GGUF quant level or &quot;All&quot; to analyze every level
                            </span>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="steplabel">
                        <span className="n">B</span> Context &amp; KV cache
                    </div>
                    <div className="formgrid">
                        <div className="field">
                            <label htmlFor="context_size">Context Size (tokens)</label>
                            <Input
                                type="number"
                                id="context_size"
                                value={formState.context_size}
                                onChange={(v) => updateField('context_size', v)}
                                min={1024}
                                max={10000000}
                                step={1024}
                                size="small"
                                placeholder="Leave blank to analyze standard sizes (4K–1M)"
                            />
                            <span className="vram-form-hint">Leave blank to analyze standard sizes (4K–1M)</span>
                        </div>
                        <div className="field">
                            <label htmlFor="kv_cache_quant">KV Cache Quantization</label>
                            <Select
                                items={kvCacheQuantItems}
                                selectedItem={formState.kv_cache_quant}
                                onSelect={(item) => updateField('kv_cache_quant', item.itemId)}
                                size="small"
                                disabled={!formState.kv_cache_enabled}
                            />
                            <span className="vram-form-hint">Q8 is llama.cpp default. Q4 saves memory</span>
                        </div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                        <Switch
                            id="kv_cache_enabled"
                            checked={formState.kv_cache_enabled}
                            onChange={(val) => updateField('kv_cache_enabled', val)}
                            label="KV cache enabled"
                        />
                        <span className="vram-form-hint" style={{ display: 'block', marginTop: 4 }}>
                            Disable for model-weight-only analysis
                        </span>
                    </div>
                </div>

                <div>
                    <div className="steplabel">
                        <span className="n">C</span> Hardware
                    </div>
                    <div className="formgrid">
                        <div className="field">
                            <label htmlFor="os">Operating System</label>
                            <Select
                                items={osItems}
                                selectedItem={formState.os}
                                onSelect={(item) => updateField('os', item.itemId)}
                                size="small"
                            />
                            <span className="vram-form-hint">
                                Estimates OS memory overhead. macOS reserves ~25% unified memory
                            </span>
                        </div>
                        <div className="field">
                            <label htmlFor="vram_gb">VRAM (GB)</label>
                            <Input
                                type="number"
                                id="vram_gb"
                                value={formState.vram_gb}
                                onChange={(v) => updateField('vram_gb', v)}
                                min={1}
                                max={256}
                                step={1}
                                size="small"
                                placeholder="e.g. 24"
                            />
                            <span className="vram-form-hint">
                                GPU VRAM or Apple Silicon unified memory. Enables fit analysis
                            </span>
                        </div>
                    </div>
                    <div className="vram-preset-buttons">
                        {VRAM_PRESETS.map((gb) => (
                            <button
                                key={gb}
                                type="button"
                                className={`chip${!customMode && formState.vram_gb === String(gb) ? ' on' : ''}`}
                                onClick={() => handlePresetChipClick(gb)}
                            >
                                {gb}
                            </button>
                        ))}
                        <button
                            type="button"
                            className={`chip${customMode ? ' on' : ''}`}
                            onClick={handleCustomChipClick}
                        >
                            Custom
                        </button>
                    </div>
                    {customMode && (
                        <div className="field" style={{ marginTop: 8, maxWidth: 160 }}>
                            <label htmlFor="vram_custom">Custom VRAM (GB)</label>
                            <input
                                id="vram_custom"
                                type="number"
                                min={CUSTOM_GB_MIN}
                                max={CUSTOM_GB_MAX}
                                step={4}
                                value={formState.vram_gb}
                                onChange={handleCustomInputChange}
                                className="input"
                            />
                        </div>
                    )}
                </div>

                <details className="detailsbox">
                    <summary>Advanced Architecture</summary>
                    <div className="dc formgrid">
                        <div className="field">
                            <label htmlFor="layers">Layers</label>
                            <Input
                                type="number"
                                id="layers"
                                value={formState.layers}
                                onChange={(v) => updateField('layers', v)}
                                min={1}
                                max={200}
                                step={1}
                                size="small"
                                placeholder="Leave blank for estimation"
                            />
                            <span className="vram-form-hint">
                                From config.json &quot;num_hidden_layers&quot;. Leave blank for estimation
                            </span>
                        </div>
                        <div className="field">
                            <label htmlFor="key_dim">Key Dimension</label>
                            <Input
                                type="number"
                                id="key_dim"
                                value={formState.key_dim}
                                onChange={(v) => updateField('key_dim', v)}
                                min={1}
                                step={1}
                                size="small"
                            />
                            <span className="vram-form-hint">
                                From GGUF metadata or config.json. Common: 64, 128, 256
                            </span>
                        </div>
                        <div className="field">
                            <label htmlFor="value_dim">Value Dimension</label>
                            <Input
                                type="number"
                                id="value_dim"
                                value={formState.value_dim}
                                onChange={(v) => updateField('value_dim', v)}
                                min={1}
                                step={1}
                                size="small"
                            />
                            <span className="vram-form-hint">Usually same as key dimension</span>
                        </div>
                        <div className="field">
                            <label htmlFor="kv_heads">KV Heads</label>
                            <Input
                                type="number"
                                id="kv_heads"
                                value={formState.kv_heads}
                                onChange={(v) => updateField('kv_heads', v)}
                                min={1}
                                step={1}
                                size="small"
                            />
                            <span className="vram-form-hint">Check &quot;num_key_value_heads&quot; in config.json</span>
                        </div>
                        <div className="field">
                            <label htmlFor="sliding_window">Sliding Window</label>
                            <Input
                                type="number"
                                id="sliding_window"
                                value={formState.sliding_window}
                                onChange={(v) => updateField('sliding_window', v)}
                                min={1}
                                step={1}
                                size="small"
                                placeholder="Only for sliding-window models"
                            />
                            <span className="vram-form-hint">Only for sliding-window models like Mistral</span>
                        </div>
                        <div className="field">
                            <label htmlFor="max_context">Max Context</label>
                            <Input
                                type="number"
                                id="max_context"
                                value={formState.max_context}
                                onChange={(v) => updateField('max_context', v)}
                                min={1}
                                step={1}
                                size="small"
                                placeholder="Model's max supported context length"
                            />
                            <span className="vram-form-hint">Model&apos;s max supported context length</span>
                        </div>
                    </div>
                </details>

                <details className="detailsbox">
                    <summary>MoE Parameters</summary>
                    <div className="dc formgrid">
                        <div className="field">
                            <label htmlFor="expert_count">Expert Count</label>
                            <Input
                                type="number"
                                id="expert_count"
                                value={formState.expert_count}
                                onChange={(v) => updateField('expert_count', v)}
                                min={1}
                                step={1}
                                size="small"
                                placeholder="e.g. 8 for Mixtral"
                            />
                            <span className="vram-form-hint">For MoE models (e.g., Mixtral 8x7B → 8)</span>
                        </div>
                        <div className="field">
                            <label htmlFor="active_experts">Active Experts</label>
                            <Input
                                type="number"
                                id="active_experts"
                                value={formState.active_experts}
                                onChange={(v) => updateField('active_experts', v)}
                                min={1}
                                step={1}
                                size="small"
                                placeholder="e.g. 2 for Mixtral"
                            />
                            <span className="vram-form-hint">Active experts per token (e.g., Mixtral → 2)</span>
                        </div>
                    </div>
                </details>

                <div className="formgrid">
                    <div className="field">
                        <label htmlFor="batch_size">Batch Size</label>
                        <Input
                            type="number"
                            id="batch_size"
                            value={formState.batch_size}
                            onChange={(v) => updateField('batch_size', v)}
                            min={1}
                            step={1}
                            size="small"
                        />
                        <span className="vram-form-hint">
                            Concurrent sequences. Keep at 1 for single-user inference
                        </span>
                    </div>
                </div>

                <div className="vram-form-actions">
                    <Button type="submit" text="Calculate" variant="solid" colorStyle="primary-color" size="small" />
                    <Button
                        type="button"
                        text="Reset"
                        variant="text"
                        colorStyle="primary-color"
                        size="small"
                        onClick={onReset}
                    />
                </div>
            </form>
        </div>
    );
};

export default VramCalculatorForm;
