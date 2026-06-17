import { render } from '@testing-library/react';
import type { CalculatorOutput } from '../../../src/common/llm-vram-calc';
import VramResultsDisplay from '../../../src/components/page-specific/llm-vram-calculator/VramResultsDisplay';

jest.mock('../../../src/components/page-specific/llm-vram-calculator/InputSummarySection', () => ({
    __esModule: true,
    default: () => <div data-testid="input-summary" />,
}));

jest.mock('../../../src/components/page-specific/llm-vram-calculator/QuantizationTable', () => ({
    __esModule: true,
    default: () => <div data-testid="quantization-table" />,
}));

jest.mock('../../../src/components/page-specific/llm-vram-calculator/RecommendationsSection', () => ({
    __esModule: true,
    default: () => <div data-testid="recommendations-section" />,
}));

jest.mock('../../../src/components/page-specific/llm-vram-calculator/SummarySection', () => ({
    __esModule: true,
    default: () => <div data-testid="summary-section" />,
}));

function makeOutput(overrides: Partial<CalculatorOutput> = {}): CalculatorOutput {
    const defaultQuant = {
        quantization: 'Q4_K_M' as const,
        eff_bpw: 4.85,
        family: 'k-quant',
        sweet_spot: true,
        estimated_gguf_gb: 4.0,
        min_vram_no_cache_gb: 4.0,
        min_vram_with_cache_gb: 6.0,
        context_table: [
            {
                context_size: 4096,
                context_label: '4K',
                kv_cache_gb: 2.0,
                vram_with_cache_gb: 6.0,
                vram_without_cache_gb: 4.0,
                fits_in_vram: true,
            },
        ],
    };
    return {
        input_summary: {
            params_b: 7,
            model_size_gb: 4.0,
            quantization: 'Q4_K_M',
            context_size: 4096,
            kv_cache_enabled: true,
            kv_cache_quant: 'q8_0',
            os: null,
            vram_gb: null,
            layers: 'estimated',
            sliding_window: null,
            is_moe: false,
            expert_info: null,
            gpu_type: null,
            engine: null,
            active_ratio: 1.0,
        },
        os_overhead: { os: null, total_vram_gb: null, reserved_gb: 0, available_gb: null, reservation_percent: null },
        quantization_analysis: [defaultQuant],
        recommendations: null,
        summary: {
            smallest_config_gb: 4.0,
            largest_config_gb: 6.0,
            total_configurations: 1,
            fitting_configurations: null,
        },
        offload_result: null,
        ...overrides,
    };
}

describe('VramResultsDisplay', () => {
    it('null prop → renders empty state with "Calculate" text', () => {
        const { container } = render(<VramResultsDisplay result={null} />);
        expect(container.querySelector('.vram-empty-state')).toBeTruthy();
        expect(container.textContent).toContain('Calculate');
    });

    it('error PARAMS_B_NOT_FINITE → renders error message', () => {
        const { container } = render(<VramResultsDisplay result={{ ok: false, error: 'PARAMS_B_NOT_FINITE' }} />);
        const errorEl = container.querySelector('.vram-error-message');
        expect(errorEl).toBeTruthy();
        expect(errorEl?.textContent).toContain('Model parameters must be a finite number.');
    });

    it('error INVALID_VRAM → renders VRAM error message', () => {
        const { container } = render(<VramResultsDisplay result={{ ok: false, error: 'INVALID_VRAM' }} />);
        const errorEl = container.querySelector('.vram-error-message');
        expect(errorEl).toBeTruthy();
        expect(errorEl?.textContent).toContain('VRAM must be between 1 and 256 GB.');
    });

    it('success → renders at least 3 KPI value cards', () => {
        const { container } = render(<VramResultsDisplay result={{ ok: true, value: makeOutput() }} />);
        const kpiValues = container.querySelectorAll('.vram-kpi-value');
        expect(kpiValues.length).toBeGreaterThanOrEqual(3);
    });

    it('offload verdict "fits" → renders .vram-offload-fits with "Fits fully in VRAM"', () => {
        const offload_result = {
            verdict: 'fits' as const,
            model_gb: 4.0,
            kv_cache_gb: 2.0,
            backend_gb: 0.75,
            compute_gb: 0.3,
            total_needed_gb: 7.05,
            available_gb: 16.0,
            layers_on_gpu: 32,
            total_layers: 32,
            gpu_resident_gb: 4.0,
            ram_spill_gb: 0,
            note: null,
        };
        const { container } = render(
            <VramResultsDisplay result={{ ok: true, value: makeOutput({ offload_result }) }} />,
        );
        expect(container.querySelector('.vram-offload-fits')).toBeTruthy();
        expect(container.textContent).toContain('Fits fully in VRAM');
    });

    it('offload verdict "partial" → renders .vram-offload-partial with layer counts', () => {
        const offload_result = {
            verdict: 'partial' as const,
            model_gb: 4.0,
            kv_cache_gb: 2.0,
            backend_gb: 0.75,
            compute_gb: 0.3,
            total_needed_gb: 7.05,
            available_gb: 6.0,
            layers_on_gpu: 20,
            total_layers: 32,
            gpu_resident_gb: 3.5,
            ram_spill_gb: 0.5,
            note: null,
        };
        const { container } = render(
            <VramResultsDisplay result={{ ok: true, value: makeOutput({ offload_result }) }} />,
        );
        expect(container.querySelector('.vram-offload-partial')).toBeTruthy();
        expect(container.textContent).toContain('Partial offload');
        expect(container.textContent).toContain('20');
        expect(container.textContent).toContain('32');
    });

    it('offload verdict "no_fit" → renders .vram-offload-no_fit with "Will not fit"', () => {
        const offload_result = {
            verdict: 'no_fit' as const,
            model_gb: 4.0,
            kv_cache_gb: 2.0,
            backend_gb: 0.75,
            compute_gb: 0.3,
            total_needed_gb: 7.05,
            available_gb: 3.0,
            layers_on_gpu: 0,
            total_layers: 32,
            gpu_resident_gb: 1.05,
            ram_spill_gb: 4.0,
            note: null,
        };
        const { container } = render(
            <VramResultsDisplay result={{ ok: true, value: makeOutput({ offload_result }) }} />,
        );
        expect(container.querySelector('.vram-offload-no_fit')).toBeTruthy();
        expect(container.textContent).toContain('Will not fit');
    });
});
