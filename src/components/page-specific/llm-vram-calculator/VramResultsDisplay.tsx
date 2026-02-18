'use client';
import type { CalculatorOutput, Result, ValidationError } from '@/common/llm-vram-calc';
import React from 'react';
import InputSummarySection from './InputSummarySection';
import QuantizationTable from './QuantizationTable';
import RecommendationsSection from './RecommendationsSection';
import SummarySection from './SummarySection';

/** @description Props for the VramResultsDisplay component. */
interface VramResultsDisplayProps {
    result: Result<CalculatorOutput, ValidationError>;
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

/**
 * @description Orchestrates the display of VRAM calculation results. Shows validation errors
 * for failed calculations, or delegates to InputSummarySection, RecommendationsSection,
 * SummarySection, and QuantizationTable sub-components for successful results.
 */
const VramResultsDisplay: React.FC<VramResultsDisplayProps> = ({ result }) => {
    if (!result.ok) {
        return (
            <div className="vram-results">
                <div className="vram-error-message">{VALIDATION_ERROR_MESSAGES[result.error] ?? result.error}</div>
            </div>
        );
    }

    const output = result.value;

    // Find the first quantization that has any fitting context entry
    const firstFittingIndex = output.quantization_analysis.findIndex((qa) =>
        qa.context_table.some((entry) => entry.fits_in_vram === true),
    );

    return (
        <div className="vram-results">
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
