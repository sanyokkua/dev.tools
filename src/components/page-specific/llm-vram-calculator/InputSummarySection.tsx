'use client';
import type { GpuType, InputSummary, OSOverhead } from '@/common/llm-vram-calc';
import React from 'react';

/** @description Props for the InputSummarySection component. */
interface InputSummarySectionProps {
    inputSummary: InputSummary;
    osOverhead: OSOverhead;
}

/** @description Formats an OS identifier string into a human-readable label. */
function formatOsLabel(os: string | null): string {
    switch (os) {
        case 'macos':
            return 'macOS';
        case 'windows':
            return 'Windows';
        case 'linux-gui':
            return 'Linux GUI';
        case 'linux-headless':
            return 'Linux Headless';
        default:
            return 'None';
    }
}

/** @description Formats a GPU type identifier into a human-readable label. */
function formatGpuTypeLabel(gpu_type: GpuType | null): string {
    switch (gpu_type) {
        case 'nvidia-amd':
            return 'NVIDIA / AMD';
        case 'apple':
            return 'Apple Silicon';
        case 'intel-integrated':
            return 'Intel / Integrated';
        default:
            return 'Not specified';
    }
}

/** @description Displays the resolved input parameters and OS memory overhead from the calculation result. */
const InputSummarySection: React.FC<InputSummarySectionProps> = ({ inputSummary, osOverhead }) => {
    return (
        <div className="card pad">
            <h2>Input Summary</h2>
            <dl className="vram-kv-grid">
                <dt>Parameters</dt>
                <dd>{inputSummary.params_b}B</dd>
                <dt>Model Size</dt>
                <dd>
                    {inputSummary.model_size_gb === 'estimated' ? 'Auto-estimated' : `${inputSummary.model_size_gb} GB`}
                </dd>
                <dt>Quantization</dt>
                <dd>{inputSummary.quantization === 'all' ? 'All levels' : inputSummary.quantization}</dd>
                <dt>Context Size</dt>
                <dd>
                    {inputSummary.context_size === 'all'
                        ? 'All standard sizes'
                        : inputSummary.context_size.toLocaleString()}
                </dd>
                <dt>KV Cache</dt>
                <dd>
                    {inputSummary.kv_cache_enabled
                        ? `Enabled (${inputSummary.kv_cache_quant.toUpperCase()})`
                        : 'Disabled'}
                </dd>
                <dt>Layers</dt>
                <dd>{inputSummary.layers === 'estimated' ? 'Auto-estimated' : inputSummary.layers}</dd>
                {inputSummary.sliding_window !== null && (
                    <>
                        <dt>Sliding Window</dt>
                        <dd>{inputSummary.sliding_window.toLocaleString()}</dd>
                    </>
                )}
                {inputSummary.is_moe && (
                    <>
                        <dt>MoE</dt>
                        <dd>{inputSummary.expert_info}</dd>
                    </>
                )}
                <dt>GPU Type</dt>
                <dd>{formatGpuTypeLabel(inputSummary.gpu_type)}</dd>
                <dt>Engine</dt>
                <dd>{inputSummary.engine ?? 'llama.cpp'}</dd>
                <dt>VRAM</dt>
                <dd>{inputSummary.vram_gb === null ? 'Not specified' : `${inputSummary.vram_gb} GB`}</dd>
                <dt>OS</dt>
                <dd>{formatOsLabel(inputSummary.os)}</dd>
            </dl>
            {osOverhead.os !== null && osOverhead.total_vram_gb !== null && (
                <>
                    <h3>OS Overhead</h3>
                    <dl className="vram-kv-grid">
                        <dt>Reserved</dt>
                        <dd>
                            {osOverhead.reserved_gb.toFixed(2)} GB
                            {osOverhead.reservation_percent !== null &&
                                ` (${osOverhead.reservation_percent.toFixed(0)}%)`}
                        </dd>
                        <dt>Available VRAM</dt>
                        <dd>{osOverhead.available_gb === null ? 'N/A' : `${osOverhead.available_gb.toFixed(2)} GB`}</dd>
                    </dl>
                </>
            )}
        </div>
    );
};

export default InputSummarySection;
