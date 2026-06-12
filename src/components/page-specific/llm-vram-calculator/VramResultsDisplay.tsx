'use client';
import type { CalculatorOutput, Result, ValidationError } from '@/common/llm-vram-calc';
import React from 'react';
import InputSummarySection from './InputSummarySection';
import QuantizationTable from './QuantizationTable';
import RecommendationsSection from './RecommendationsSection';
import SummarySection from './SummarySection';

interface VramResultsDisplayProps {
    result: Result<CalculatorOutput, ValidationError> | null;
}

const VALIDATION_ERROR_MESSAGES: Record<ValidationError, string> = {
    PARAMS_B_NOT_FINITE: 'Model parameters must be a finite number.',
    PARAMS_B_OUT_OF_RANGE: 'Model parameters must be between 1 and 1000 billion.',
    INVALID_MODEL_SIZE: 'Model size must be between 0.1 and 500 GB.',
    INVALID_CONTEXT_SIZE: 'Context size must be between 1,024 and 10,000,000 tokens.',
    INVALID_VRAM: 'VRAM must be between 1 and 256 GB.',
    INVALID_LAYERS: 'Layer count must be between 1 and 200.',
    INVALID_KEY_DIM: 'Key dimension must be a positive integer.',
    INVALID_VALUE_DIM: 'Value dimension must be a positive integer.',
    INVALID_KV_HEADS: 'KV heads must be a positive integer.',
    INVALID_SLIDING_WINDOW: 'Sliding window must be a positive integer.',
    INVALID_MAX_CONTEXT: 'Max context must be a positive integer.',
    INVALID_EXPERT_COUNT: 'Expert count must be a positive integer.',
    INVALID_ACTIVE_EXPERTS: 'Active experts must be a positive integer.',
    INVALID_BATCH_SIZE: 'Batch size must be a positive integer.',
};

const VramResultsDisplay: React.FC<VramResultsDisplayProps> = ({ result }) => {
    if (result === null) {
        return (
            <div className="vram-empty-state">
                <span>Fill in the form and click</span>
                <strong>Calculate</strong>
                <span>to see results here.</span>
            </div>
        );
    }

    if (!result.ok) {
        return (
            <div className="vram-results">
                <div className="vram-error-message">{VALIDATION_ERROR_MESSAGES[result.error] ?? result.error}</div>
            </div>
        );
    }

    const output = result.value;
    const primaryQuant = output.quantization_analysis[0];

    const weightsGb = primaryQuant?.min_vram_no_cache_gb ?? 0;
    const kvCacheGb = primaryQuant ? primaryQuant.min_vram_with_cache_gb - primaryQuant.min_vram_no_cache_gb : 0;
    const osReservedGb = output.os_overhead.reserved_gb;
    const totalGb = (primaryQuant?.min_vram_with_cache_gb ?? 0) + osReservedGb;
    const quantLabel = primaryQuant?.quantization ?? '';
    const contextLabel = primaryQuant?.context_table[0]?.context_label ?? '';

    const firstFittingIndex = output.quantization_analysis.findIndex((qa) =>
        qa.context_table.some((entry) => entry.fits_in_vram === true),
    );

    return (
        <div className="vram-results">
            <div className="vram-kpi-row">
                <div className="vram-kpi-card">
                    <div className="vram-kpi-value">{weightsGb.toFixed(1)} GB</div>
                    <div className="vram-kpi-label">Model weights ({quantLabel})</div>
                </div>
                <div className="vram-kpi-card">
                    <div className="vram-kpi-value">{kvCacheGb.toFixed(1)} GB</div>
                    <div className="vram-kpi-label">KV cache{contextLabel ? ` @ ${contextLabel}` : ''}</div>
                </div>
                <div className="vram-kpi-card">
                    <div className="vram-kpi-value">{totalGb.toFixed(1)} GB</div>
                    <div className="vram-kpi-label">Total (incl. OS)</div>
                </div>
            </div>

            <InputSummarySection inputSummary={output.input_summary} osOverhead={output.os_overhead} />

            {output.recommendations !== null && output.recommendations.length > 0 && (
                <RecommendationsSection recommendations={output.recommendations} />
            )}

            <SummarySection summary={output.summary} />

            <h2>Quantization Analysis</h2>
            {output.quantization_analysis.map((qa, index) => (
                <QuantizationTable
                    key={qa.quantization}
                    analysis={qa}
                    defaultOpen={firstFittingIndex >= 0 ? index === firstFittingIndex : index === 0}
                />
            ))}
        </div>
    );
};

export default VramResultsDisplay;
