'use client';
import { GpuType, InferenceEngine, KVCacheQuant, OperatingSystem, QUANT_CATALOG } from '@/common/llm-vram-calc';
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
    kv_cache_quant_v: string;
    os: string;
    vram_gb: string;
    gpu_type: string;
    layers: string;
    key_dim: string;
    value_dim: string;
    kv_heads: string;
    sliding_window: string;
    max_context: string;
    expert_count: string;
    active_experts: string;
    engine: string;
    batch_size: string;
}

export const INITIAL_FORM_STATE: VramFormState = {
    params_b: '',
    model_size_gb: '',
    quantization: 'Q4_K_M',
    context_size: '4096',
    kv_cache_enabled: true,
    kv_cache_quant: KVCacheQuant.Q8_0,
    kv_cache_quant_v: '',
    os: 'none',
    vram_gb: '',
    gpu_type: 'none',
    layers: '',
    key_dim: '128',
    value_dim: '128',
    kv_heads: '8',
    sliding_window: '',
    max_context: '',
    expert_count: '',
    active_experts: '',
    engine: InferenceEngine.LLAMA_CPP,
    batch_size: '1',
};

/** @description Props for the VramCalculatorForm component. */
interface VramCalculatorFormProps {
    formState: VramFormState;
    onFormChange: (state: VramFormState) => void;
    onCalculate: () => void;
    onReset: () => void;
}

// Grouped quantization options by bit level
const QUANT_GROUPS: { label: string; keys: string[] }[] = [
    { label: '1-bit', keys: ['IQ1_S', 'IQ1_M', 'UD-IQ1_S', 'UD-IQ1_M'] },
    {
        label: '2-bit',
        keys: ['IQ2_XXS', 'IQ2_XS', 'IQ2_S', 'IQ2_M', 'Q2_K', 'Q2_K_L', 'UD-IQ2_XXS', 'UD-IQ2_M', 'UD-Q2_K_XL'],
    },
    {
        label: '3-bit',
        keys: ['Q3_K_S', 'Q3_K_M', 'Q3_K_L', 'IQ3_XXS', 'IQ3_XS', 'IQ3_S', 'IQ3_M', 'UD-IQ3_XXS', 'UD-Q3_K_XL'],
    },
    { label: '4-bit', keys: ['IQ4_XS', 'IQ4_NL', 'Q4_0', 'Q4_1', 'Q4_K_S', 'Q4_K_M', 'UD-Q4_K_XL', 'MXFP4', 'NVFP4'] },
    { label: '5-bit', keys: ['Q5_0', 'Q5_1', 'Q5_K_S', 'Q5_K_M', 'UD-Q5_K_XL'] },
    { label: '6-bit', keys: ['Q6_K', 'UD-Q6_K_XL'] },
    { label: '8-bit', keys: ['Q8_0', 'UD-Q8_K_XL', 'FP8'] },
    { label: '16-bit / 32-bit', keys: ['FP16', 'BF16', 'FP32'] },
];

const gpuTypeItems: SelectItem[] = [
    { itemId: 'none', displayText: 'Not specified' },
    { itemId: GpuType.NVIDIA_AMD, displayText: 'NVIDIA / AMD (dedicated VRAM)' },
    { itemId: GpuType.APPLE, displayText: 'Apple Silicon (unified memory)' },
    { itemId: GpuType.INTEL_INTEGRATED, displayText: 'Intel / Integrated (shared RAM)' },
];

const engineItems: SelectItem[] = [
    { itemId: InferenceEngine.LLAMA_CPP, displayText: 'llama.cpp (default)' },
    { itemId: InferenceEngine.OLLAMA, displayText: 'Ollama' },
    { itemId: InferenceEngine.LM_STUDIO, displayText: 'LM Studio' },
];

const kvCacheQuantItems: SelectItem[] = [
    { itemId: KVCacheQuant.F16, displayText: 'f16 — 2 bytes (full)' },
    { itemId: KVCacheQuant.Q8_0, displayText: 'q8_0 — 1 byte (default)' },
    { itemId: KVCacheQuant.Q5_1, displayText: 'q5_1 — 0.69 bytes' },
    { itemId: KVCacheQuant.Q5_0, displayText: 'q5_0 — 0.66 bytes' },
    { itemId: KVCacheQuant.Q4_1, displayText: 'q4_1 — 0.56 bytes' },
    { itemId: KVCacheQuant.Q4_0, displayText: 'q4_0 — 0.5 bytes' },
    { itemId: KVCacheQuant.IQ4_NL, displayText: 'iq4_nl — 0.56 bytes' },
];

const kvCacheQuantVItems: SelectItem[] = [{ itemId: '', displayText: 'Same as K (symmetric)' }, ...kvCacheQuantItems];

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
 * @description Two-primary-input form for the LLM VRAM calculator. Parameters and quantization
 * are the primary inputs; all other settings live in a single collapsible Advanced panel
 * organized into Hardware, Context & KV Cache, Architecture, MoE, and Inference subsections.
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
            <form onSubmit={handleSubmit}>
                {/* PRIMARY — params_b + quantization only */}
                <div className="vram-primary-inputs">
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
                            <label htmlFor="quantization">Quantization</label>
                            <select
                                id="quantization"
                                value={formState.quantization}
                                onChange={(e) => updateField('quantization', e.target.value)}
                                className="input"
                                style={{ width: '100%' }}
                            >
                                <option value="all">All (analyze all 15 standard)</option>
                                {QUANT_GROUPS.map((group) => (
                                    <optgroup key={group.label} label={group.label}>
                                        {group.keys.map((key) => {
                                            const entry = QUANT_CATALOG[key as keyof typeof QUANT_CATALOG];
                                            if (!entry) return null;
                                            return (
                                                <option key={key} value={key}>
                                                    {key} — {entry.bpw.toFixed(2)} bpw{entry.sweetSpot ? ' ★' : ''}
                                                </option>
                                            );
                                        })}
                                    </optgroup>
                                ))}
                            </select>
                            <span className="vram-form-hint">★ = sweet spot. Default: Q4_K_M</span>
                        </div>
                    </div>
                </div>

                {/* SINGLE Advanced detailsbox */}
                <details className="detailsbox" style={{ marginTop: 12 }}>
                    <summary>Advanced options</summary>
                    <div className="dc">
                        {/* Hardware subsection */}
                        <div className="vram-subsection">
                            <div className="vram-subsection-label">Hardware</div>
                            <div className="formgrid">
                                <div className="field">
                                    <label htmlFor="gpu_type">GPU Type</label>
                                    <Select
                                        id="gpu_type"
                                        items={gpuTypeItems}
                                        selectedItem={formState.gpu_type}
                                        onSelect={(item) => updateField('gpu_type', item.itemId)}
                                        size="small"
                                    />
                                    <span className="vram-form-hint">
                                        GPU architecture affects memory overhead calculations
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
                                <div className="field">
                                    <label htmlFor="os">Operating System</label>
                                    <Select
                                        id="os"
                                        items={osItems}
                                        selectedItem={formState.os}
                                        onSelect={(item) => updateField('os', item.itemId)}
                                        size="small"
                                    />
                                    <span className="vram-form-hint">
                                        Estimates OS memory overhead. macOS reserves ~25% unified memory
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

                        {/* Context & KV Cache subsection */}
                        <div className="vram-subsection">
                            <div className="vram-subsection-label">Context &amp; KV Cache</div>
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
                                    <span className="vram-form-hint">
                                        Leave blank to analyze standard sizes (4K–1M)
                                    </span>
                                </div>
                                <div className="field">
                                    <label htmlFor="kv_cache_quant">KV Cache Quant (K)</label>
                                    <Select
                                        id="kv_cache_quant"
                                        items={kvCacheQuantItems}
                                        selectedItem={formState.kv_cache_quant}
                                        onSelect={(item) => updateField('kv_cache_quant', item.itemId)}
                                        size="small"
                                        disabled={!formState.kv_cache_enabled}
                                    />
                                    <span className="vram-form-hint">q8_0 is llama.cpp default. q4_0 saves memory</span>
                                </div>
                                <div className="field">
                                    <label htmlFor="kv_cache_quant_v">KV Cache Quant (V)</label>
                                    <Select
                                        id="kv_cache_quant_v"
                                        items={kvCacheQuantVItems}
                                        selectedItem={formState.kv_cache_quant_v}
                                        onSelect={(item) => updateField('kv_cache_quant_v', item.itemId)}
                                        size="small"
                                        disabled={!formState.kv_cache_enabled}
                                    />
                                    <span className="vram-form-hint">
                                        Leave as &quot;Same as K&quot; for symmetric quantization
                                    </span>
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
                                    Flash Attention required for quantized KV (q8_0/q4_0 etc.)
                                </span>
                            </div>
                        </div>

                        {/* Architecture subsection */}
                        <div className="vram-subsection">
                            <div className="vram-subsection-label">Architecture (auto-estimated)</div>
                            <div className="formgrid">
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
                                    <span className="vram-form-hint">
                                        Check &quot;num_key_value_heads&quot; in config.json
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
                        </div>

                        {/* MoE subsection */}
                        <div className="vram-subsection">
                            <div className="vram-subsection-label">MoE</div>
                            <div className="formgrid">
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
                            <span className="vram-form-hint" style={{ display: 'block', marginTop: 4 }}>
                                GGUF stores ALL expert weights. Only active experts run per token.
                            </span>
                        </div>

                        {/* Inference subsection */}
                        <div className="vram-subsection">
                            <div className="vram-subsection-label">Inference</div>
                            <div className="formgrid">
                                <div className="field">
                                    <label htmlFor="engine">Inference Engine</label>
                                    <Select
                                        id="engine"
                                        items={engineItems}
                                        selectedItem={formState.engine}
                                        onSelect={(item) => updateField('engine', item.itemId)}
                                        size="small"
                                    />
                                    <span className="vram-form-hint">Engine affects baseline memory overhead</span>
                                </div>
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
                            </div>
                        </div>
                    </div>
                </details>

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
