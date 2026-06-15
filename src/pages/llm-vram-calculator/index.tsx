import type { CalculatorInput, CalculatorOutput, Result, ValidationError } from '@/common/llm-vram-calc';
import { calculateVram, KVCacheQuant, OperatingSystem, Quantization } from '@/common/llm-vram-calc';
import { usePage } from '@/contexts/PageContext';
import ToolAbout from '@/controls/ToolAbout';
import { FC, useEffect, useState } from 'react';
import PageShell from '../../components/layouts/PageShell';
import VramCalculatorForm, {
    INITIAL_FORM_STATE,
    VramFormState,
} from '../../components/page-specific/llm-vram-calculator/VramCalculatorForm';
import VramResultsDisplay from '../../components/page-specific/llm-vram-calculator/VramResultsDisplay';

/** @description Parses a string to a float, returning null for empty or invalid values. */
function parseOptionalFloat(value: string): number | null {
    if (value.trim() === '') return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
}

/** @description Parses a string to an integer, returning null for empty or invalid values. */
function parseOptionalInt(value: string): number | null {
    if (value.trim() === '') return null;
    const num = parseInt(value, 10);
    return isNaN(num) ? null : num;
}

/** @description Converts form state strings into a typed CalculatorInput for the VRAM calculation engine. */
function buildCalculatorInput(form: VramFormState): CalculatorInput {
    const quantizationValues = Object.values(Quantization) as string[];
    const kvCacheValues = Object.values(KVCacheQuant) as string[];
    const osValues = Object.values(OperatingSystem) as string[];

    return {
        params_b: parseFloat(form.params_b) || 0,
        model_size_gb: parseOptionalFloat(form.model_size_gb),
        quantization: quantizationValues.includes(form.quantization) ? (form.quantization as Quantization) : null,
        context_size: parseOptionalInt(form.context_size),
        kv_cache_enabled: form.kv_cache_enabled,
        kv_cache_quant: kvCacheValues.includes(form.kv_cache_quant)
            ? (form.kv_cache_quant as KVCacheQuant)
            : KVCacheQuant.Q8,
        os: osValues.includes(form.os) ? (form.os as OperatingSystem) : null,
        vram_gb: parseOptionalFloat(form.vram_gb),
        layers: parseOptionalInt(form.layers),
        key_dim: parseOptionalInt(form.key_dim) ?? 128,
        value_dim: parseOptionalInt(form.value_dim) ?? 128,
        kv_heads: parseOptionalInt(form.kv_heads) ?? 8,
        sliding_window: parseOptionalInt(form.sliding_window),
        max_context: parseOptionalInt(form.max_context),
        expert_count: parseOptionalInt(form.expert_count),
        active_experts: parseOptionalInt(form.active_experts),
        batch_size: parseOptionalInt(form.batch_size) ?? 1,
    };
}

/**
 * @description LLM VRAM Calculator page. Provides a form for model parameters and hardware
 * constraints, calculates memory requirements via `calculateVram()`, and displays results
 * with quantization analysis, recommendations, and fit status.
 */
const LlmVramCalculatorPage: FC = () => {
    const { setPageTitle } = usePage();

    useEffect(() => {
        setPageTitle('LLM VRAM Calculator');
    }, [setPageTitle]);

    const [formState, setFormState] = useState<VramFormState>(INITIAL_FORM_STATE);
    const [result, setResult] = useState<Result<CalculatorOutput, ValidationError> | null>(null);

    const handleCalculate = (): void => {
        const input = buildCalculatorInput(formState);
        const calcResult = calculateVram(input);
        setResult(calcResult);
    };

    const handleReset = (): void => {
        setFormState(INITIAL_FORM_STATE);
        setResult(null);
    };

    return (
        <PageShell>
            <ToolAbout routeKey="llm-vram-calculator" title="LLM VRAM Calculator">
                Estimate GPU memory requirements for running large language models locally.
            </ToolAbout>
            <div className="vram-page-header">
                <h1>LLM VRAM Calculator</h1>
                <p>Estimate GPU / unified memory for GGUF-quantized models, with full architecture and MoE controls.</p>
            </div>
            <div className="vram-page-layout">
                <div>
                    <VramCalculatorForm
                        formState={formState}
                        onFormChange={setFormState}
                        onCalculate={handleCalculate}
                        onReset={handleReset}
                    />
                </div>
                <div>
                    <VramResultsDisplay result={result} />
                </div>
            </div>
        </PageShell>
    );
};

export default LlmVramCalculatorPage;
