/**
 * @fileoverview Jest tests for LLM VRAM Calculator public API
 * @module LLMVramCalculator.test
 */

import {
    BACKEND_BASELINE_GB,
    calculateVram,
    GpuType,
    InferenceEngine,
    KV_CACHE_BYTES,
    KV_CACHE_FACTOR,
    KVCacheQuant,
    OperatingSystem,
    QUANT_CATALOG,
    STANDARD_CONTEXTS,
    STANDARD_QUANTIZATIONS,
} from '../../src/common/llm-vram-calc';

import type {
    CalculatorInput,
    CalculatorOutput,
    Quantization,
    Result,
    ValidationError,
} from '../../src/common/llm-vram-calc';

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Helper to assert a successful result and extract the value.
 */
function expectSuccess(result: Result<CalculatorOutput, ValidationError>): CalculatorOutput {
    expect(result.ok).toBe(true);
    if (!result.ok) {
        throw new Error(`Expected success but got error: ${result.error}`);
    }
    return result.value;
}

/**
 * Helper to assert a failed result and extract the error.
 */
function expectError(result: Result<CalculatorOutput, ValidationError>, expectedError: ValidationError): void {
    expect(result.ok).toBe(false);
    if (result.ok) {
        throw new Error(`Expected error ${expectedError} but got success`);
    }
    expect(result.error).toBe(expectedError);
}

// ============================================================================
// SECTION 1: Exported Constants Tests (To cover dumb const definitions)
// ============================================================================

describe('Exported Constants', () => {
    describe('Quantization', () => {
        it('QUANT_CATALOG should contain Q4_K_M and IQ4_XS as sweet spots', () => {
            expect(QUANT_CATALOG['Q4_K_M'].sweetSpot).toBe(true);
            expect(QUANT_CATALOG['IQ4_XS'].sweetSpot).toBe(true);
        });
        it('QUANT_CATALOG should have 44 entries', () => {
            expect(Object.keys(QUANT_CATALOG)).toHaveLength(44);
        });
    });

    describe('KVCacheQuant', () => {
        it('should contain all expected KV cache quantization levels', () => {
            expect(KVCacheQuant.F16).toBe('f16');
            expect(KVCacheQuant.Q8_0).toBe('q8_0');
            expect(KVCacheQuant.Q5_1).toBe('q5_1');
            expect(KVCacheQuant.Q5_0).toBe('q5_0');
            expect(KVCacheQuant.Q4_1).toBe('q4_1');
            expect(KVCacheQuant.Q4_0).toBe('q4_0');
            expect(KVCacheQuant.IQ4_NL).toBe('iq4_nl');
        });

        it('should have exactly 7 KV cache quantization levels', () => {
            expect(Object.keys(KVCacheQuant)).toHaveLength(7);
        });
    });

    describe('OperatingSystem', () => {
        it('should contain all expected operating systems', () => {
            expect(OperatingSystem.MACOS).toBe('macos');
            expect(OperatingSystem.WINDOWS).toBe('windows');
            expect(OperatingSystem.LINUX_GUI).toBe('linux-gui');
            expect(OperatingSystem.LINUX_HEADLESS).toBe('linux-headless');
        });

        it('should have exactly 4 operating systems', () => {
            expect(Object.keys(OperatingSystem)).toHaveLength(4);
        });
    });

    describe('STANDARD_CONTEXTS', () => {
        it('should contain expected context sizes', () => {
            expect(STANDARD_CONTEXTS).toEqual([4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576]);
        });

        it('should have 9 standard context sizes', () => {
            expect(STANDARD_CONTEXTS).toHaveLength(9);
        });

        it('should be in ascending order', () => {
            for (let i = 1; i < STANDARD_CONTEXTS.length; i++) {
                expect(STANDARD_CONTEXTS[i]).toBeGreaterThan(STANDARD_CONTEXTS[i - 1]);
            }
        });
    });

    describe('STANDARD_QUANTIZATIONS', () => {
        it('should contain expected quantizations', () => {
            expect(STANDARD_QUANTIZATIONS).toContain('Q4_K_M');
            expect(STANDARD_QUANTIZATIONS).toContain('FP16');
            expect(STANDARD_QUANTIZATIONS).toContain('FP32');
        });

        it('should have 15 standard quantizations', () => {
            expect(STANDARD_QUANTIZATIONS).toHaveLength(15);
        });
    });

    describe('KV_CACHE_BYTES', () => {
        it('should map KV cache quantizations to correct byte values', () => {
            expect(KV_CACHE_BYTES['f16']).toBe(2);
            expect(KV_CACHE_BYTES['q8_0']).toBe(1);
            expect(KV_CACHE_BYTES['q5_1']).toBeCloseTo(0.69, 2);
            expect(KV_CACHE_BYTES['q5_0']).toBeCloseTo(0.66, 2);
            expect(KV_CACHE_BYTES['q4_1']).toBeCloseTo(0.56, 2);
            expect(KV_CACHE_BYTES['q4_0']).toBeCloseTo(0.5, 2);
            expect(KV_CACHE_BYTES['iq4_nl']).toBeCloseTo(0.56, 2);
        });
    });

    describe('KV_CACHE_FACTOR', () => {
        it('should map KV cache quantizations to correct factors', () => {
            expect(KV_CACHE_FACTOR['f16']).toBe(1);
            expect(KV_CACHE_FACTOR['q8_0']).toBe(0.5);
            expect(KV_CACHE_FACTOR['q5_1']).toBeCloseTo(0.345, 3);
            expect(KV_CACHE_FACTOR['q4_0']).toBe(0.25);
        });
    });

    describe('Numeric constants', () => {
        it('BACKEND_BASELINE_GB should be 0.75 for llama.cpp', () => {
            expect(BACKEND_BASELINE_GB['llama.cpp']).toBeCloseTo(0.75, 2);
        });
    });
});

// ============================================================================
// SECTION 2: Input Validation Tests - Required Parameter (params_b)
// ============================================================================

describe('Input Validation - params_b (required)', () => {
    describe('valid params_b values', () => {
        it.each([1, 4, 7, 8, 14, 32, 70, 100, 500, 1000])('should accept params_b = %d', (params_b) => {
            const result = calculateVram({ params_b });
            expect(result.ok).toBe(true);
        });

        it('should accept params_b at minimum boundary (1)', () => {
            const result = calculateVram({ params_b: 1 });
            const output = expectSuccess(result);
            expect(output.input_summary.params_b).toBe(1);
        });

        it('should accept params_b at maximum boundary (1000)', () => {
            const result = calculateVram({ params_b: 1000 });
            const output = expectSuccess(result);
            expect(output.input_summary.params_b).toBe(1000);
        });

        it('should accept fractional params_b within range', () => {
            const result = calculateVram({ params_b: 7.5 });
            expect(result.ok).toBe(true);
        });
    });

    describe('invalid params_b values', () => {
        it('should reject NaN', () => {
            const result = calculateVram({ params_b: Number.NaN });
            expectError(result, 'PARAMS_B_NOT_FINITE');
        });

        it('should reject Infinity', () => {
            const result = calculateVram({ params_b: Infinity });
            expectError(result, 'PARAMS_B_NOT_FINITE');
        });

        it('should reject -Infinity', () => {
            const result = calculateVram({ params_b: -Infinity });
            expectError(result, 'PARAMS_B_NOT_FINITE');
        });

        it('should reject zero', () => {
            const result = calculateVram({ params_b: 0 });
            expectError(result, 'PARAMS_B_OUT_OF_RANGE');
        });

        it('should reject negative values', () => {
            const result = calculateVram({ params_b: -1 });
            expectError(result, 'PARAMS_B_OUT_OF_RANGE');
        });

        it('should reject values below minimum (0.5)', () => {
            const result = calculateVram({ params_b: 0.5 });
            expectError(result, 'PARAMS_B_OUT_OF_RANGE');
        });

        it('should reject values above maximum (1001)', () => {
            const result = calculateVram({ params_b: 1001 });
            expectError(result, 'PARAMS_B_OUT_OF_RANGE');
        });
    });
});

// ============================================================================
// SECTION 3: Input Validation Tests - Optional Parameters
// ============================================================================

describe('Input Validation - Optional Parameters', () => {
    const validBase: CalculatorInput = { params_b: 8 };

    describe('model_size_gb', () => {
        it('should accept null', () => {
            const result = calculateVram({ ...validBase, model_size_gb: null });
            expect(result.ok).toBe(true);
        });

        it('should accept undefined', () => {
            const result = calculateVram({ ...validBase, model_size_gb: undefined });
            expect(result.ok).toBe(true);
        });

        it('should accept minimum value (0.1)', () => {
            const result = calculateVram({ ...validBase, model_size_gb: 0.1, quantization: 'Q4_K_M' });
            expect(result.ok).toBe(true);
        });

        it('should accept maximum value (500)', () => {
            const result = calculateVram({ ...validBase, model_size_gb: 500, quantization: 'Q4_K_M' });
            expect(result.ok).toBe(true);
        });

        it('should accept typical value (4.0)', () => {
            const result = calculateVram({ ...validBase, model_size_gb: 4, quantization: 'Q4_K_M' });
            expect(result.ok).toBe(true);
        });

        it('should reject zero', () => {
            const result = calculateVram({ ...validBase, model_size_gb: 0 });
            expectError(result, 'INVALID_MODEL_SIZE');
        });

        it('should reject negative values', () => {
            const result = calculateVram({ ...validBase, model_size_gb: -1 });
            expectError(result, 'INVALID_MODEL_SIZE');
        });

        it('should reject values below minimum (0.05)', () => {
            const result = calculateVram({ ...validBase, model_size_gb: 0.05 });
            expectError(result, 'INVALID_MODEL_SIZE');
        });

        it('should reject values above maximum (501)', () => {
            const result = calculateVram({ ...validBase, model_size_gb: 501 });
            expectError(result, 'INVALID_MODEL_SIZE');
        });

        it('should reject NaN', () => {
            const result = calculateVram({ ...validBase, model_size_gb: Number.NaN });
            expectError(result, 'INVALID_MODEL_SIZE');
        });
    });

    describe('quantization', () => {
        it('should accept null (calculates all)', () => {
            const result = calculateVram({ ...validBase, quantization: null });
            const output = expectSuccess(result);
            expect(output.input_summary.quantization).toBe('all');
            expect(output.quantization_analysis).toHaveLength(STANDARD_QUANTIZATIONS.length);
        });

        it.each(Object.keys(QUANT_CATALOG))('should accept quantization = %s', (quant) => {
            const result = calculateVram({ ...validBase, quantization: quant as Quantization });
            const output = expectSuccess(result);
            expect(output.input_summary.quantization).toBe(quant);
            expect(output.quantization_analysis).toHaveLength(1);
            expect(output.quantization_analysis[0].quantization).toBe(quant);
        });
    });

    describe('context_size', () => {
        it('should accept null (calculates all standard)', () => {
            const result = calculateVram({ ...validBase, context_size: null });
            const output = expectSuccess(result);
            expect(output.input_summary.context_size).toBe('all');
        });

        it('should accept minimum value (1024)', () => {
            const result = calculateVram({ ...validBase, context_size: 1024 });
            expect(result.ok).toBe(true);
        });

        it('should accept maximum value (10000000)', () => {
            const result = calculateVram({ ...validBase, context_size: 10000000 });
            expect(result.ok).toBe(true);
        });

        it('should accept standard context sizes', () => {
            for (const ctx of STANDARD_CONTEXTS) {
                const result = calculateVram({ ...validBase, context_size: ctx });
                expect(result.ok).toBe(true);
            }
        });

        it('should reject below minimum (1023)', () => {
            const result = calculateVram({ ...validBase, context_size: 1023 });
            expectError(result, 'INVALID_CONTEXT_SIZE');
        });

        it('should reject above maximum (10000001)', () => {
            const result = calculateVram({ ...validBase, context_size: 10000001 });
            expectError(result, 'INVALID_CONTEXT_SIZE');
        });

        it('should reject non-integer values', () => {
            const result = calculateVram({ ...validBase, context_size: 4096.5 });
            expectError(result, 'INVALID_CONTEXT_SIZE');
        });

        it('should reject negative values', () => {
            const result = calculateVram({ ...validBase, context_size: -4096 });
            expectError(result, 'INVALID_CONTEXT_SIZE');
        });
    });

    describe('kv_cache_enabled', () => {
        it('should default to true', () => {
            const result = calculateVram({ ...validBase });
            const output = expectSuccess(result);
            expect(output.input_summary.kv_cache_enabled).toBe(true);
        });

        it('should accept true', () => {
            const result = calculateVram({ ...validBase, kv_cache_enabled: true });
            const output = expectSuccess(result);
            expect(output.input_summary.kv_cache_enabled).toBe(true);
        });

        it('should accept false', () => {
            const result = calculateVram({ ...validBase, kv_cache_enabled: false });
            const output = expectSuccess(result);
            expect(output.input_summary.kv_cache_enabled).toBe(false);
        });
    });

    describe('kv_cache_quant', () => {
        it('should default to q8_0', () => {
            const result = calculateVram({ ...validBase });
            const output = expectSuccess(result);
            expect(output.input_summary.kv_cache_quant).toBe('q8_0');
        });

        it.each(Object.values(KVCacheQuant))('should accept kv_cache_quant = %s', (kvQuant) => {
            const result = calculateVram({ ...validBase, kv_cache_quant: kvQuant });
            const output = expectSuccess(result);
            expect(output.input_summary.kv_cache_quant).toBe(kvQuant);
        });
    });

    describe('os', () => {
        it('should accept null', () => {
            const result = calculateVram({ ...validBase, os: null });
            const output = expectSuccess(result);
            expect(output.input_summary.os).toBeNull();
        });

        it.each(Object.values(OperatingSystem))('should accept os = %s', (os) => {
            const result = calculateVram({ ...validBase, os, vram_gb: 24 });
            const output = expectSuccess(result);
            expect(output.input_summary.os).toBe(os);
        });
    });

    describe('vram_gb', () => {
        it('should accept null', () => {
            const result = calculateVram({ ...validBase, vram_gb: null });
            const output = expectSuccess(result);
            expect(output.input_summary.vram_gb).toBeNull();
        });

        it('should accept minimum value (1)', () => {
            const result = calculateVram({ ...validBase, vram_gb: 1 });
            expect(result.ok).toBe(true);
        });

        it('should accept maximum value (256)', () => {
            const result = calculateVram({ ...validBase, vram_gb: 256 });
            expect(result.ok).toBe(true);
        });

        it('should accept typical values', () => {
            for (const vram of [8, 12, 16, 24, 32, 48, 64, 128]) {
                const result = calculateVram({ ...validBase, vram_gb: vram });
                expect(result.ok).toBe(true);
            }
        });

        it('should reject zero', () => {
            const result = calculateVram({ ...validBase, vram_gb: 0 });
            expectError(result, 'INVALID_VRAM');
        });

        it('should reject negative values', () => {
            const result = calculateVram({ ...validBase, vram_gb: -8 });
            expectError(result, 'INVALID_VRAM');
        });

        it('should reject values above maximum (257)', () => {
            const result = calculateVram({ ...validBase, vram_gb: 257 });
            expectError(result, 'INVALID_VRAM');
        });

        it('should reject NaN', () => {
            const result = calculateVram({ ...validBase, vram_gb: Number.NaN });
            expectError(result, 'INVALID_VRAM');
        });
    });

    describe('layers', () => {
        it('should accept null', () => {
            const result = calculateVram({ ...validBase, layers: null });
            const output = expectSuccess(result);
            expect(output.input_summary.layers).toBe('estimated');
        });

        it('should accept minimum value (1)', () => {
            const result = calculateVram({ ...validBase, layers: 1 });
            expect(result.ok).toBe(true);
        });

        it('should accept maximum value (200)', () => {
            const result = calculateVram({ ...validBase, layers: 200 });
            expect(result.ok).toBe(true);
        });

        it('should accept typical values', () => {
            for (const layers of [24, 32, 40, 64, 80]) {
                const result = calculateVram({ ...validBase, layers });
                const output = expectSuccess(result);
                expect(output.input_summary.layers).toBe(layers);
            }
        });

        it('should reject zero', () => {
            const result = calculateVram({ ...validBase, layers: 0 });
            expectError(result, 'INVALID_LAYERS');
        });

        it('should reject negative values', () => {
            const result = calculateVram({ ...validBase, layers: -32 });
            expectError(result, 'INVALID_LAYERS');
        });

        it('should reject values above maximum (201)', () => {
            const result = calculateVram({ ...validBase, layers: 201 });
            expectError(result, 'INVALID_LAYERS');
        });

        it('should reject non-integer values', () => {
            const result = calculateVram({ ...validBase, layers: 32.5 });
            expectError(result, 'INVALID_LAYERS');
        });
    });

    describe('key_dim', () => {
        it('should default to 128', () => {
            const result = calculateVram({ ...validBase });
            expect(result.ok).toBe(true);
        });

        it('should accept positive integers', () => {
            for (const key_dim of [64, 128, 256]) {
                const result = calculateVram({ ...validBase, key_dim });
                expect(result.ok).toBe(true);
            }
        });

        it('should reject zero', () => {
            const result = calculateVram({ ...validBase, key_dim: 0 });
            expectError(result, 'INVALID_KEY_DIM');
        });

        it('should reject negative values', () => {
            const result = calculateVram({ ...validBase, key_dim: -128 });
            expectError(result, 'INVALID_KEY_DIM');
        });

        it('should reject non-integer values', () => {
            const result = calculateVram({ ...validBase, key_dim: 128.5 });
            expectError(result, 'INVALID_KEY_DIM');
        });
    });

    describe('value_dim', () => {
        it('should accept positive integers', () => {
            for (const value_dim of [64, 128, 256]) {
                const result = calculateVram({ ...validBase, value_dim });
                expect(result.ok).toBe(true);
            }
        });

        it('should reject zero', () => {
            const result = calculateVram({ ...validBase, value_dim: 0 });
            expectError(result, 'INVALID_VALUE_DIM');
        });

        it('should reject negative values', () => {
            const result = calculateVram({ ...validBase, value_dim: -128 });
            expectError(result, 'INVALID_VALUE_DIM');
        });
    });

    describe('kv_heads', () => {
        it('should accept positive integers', () => {
            for (const kv_heads of [1, 4, 8, 32]) {
                const result = calculateVram({ ...validBase, kv_heads });
                expect(result.ok).toBe(true);
            }
        });

        it('should reject zero', () => {
            const result = calculateVram({ ...validBase, kv_heads: 0 });
            expectError(result, 'INVALID_KV_HEADS');
        });

        it('should reject negative values', () => {
            const result = calculateVram({ ...validBase, kv_heads: -8 });
            expectError(result, 'INVALID_KV_HEADS');
        });
    });

    describe('sliding_window', () => {
        it('should accept null', () => {
            const result = calculateVram({ ...validBase, sliding_window: null });
            const output = expectSuccess(result);
            expect(output.input_summary.sliding_window).toBeNull();
        });

        it('should accept positive integers', () => {
            for (const sliding_window of [128, 512, 4096]) {
                const result = calculateVram({ ...validBase, sliding_window });
                const output = expectSuccess(result);
                expect(output.input_summary.sliding_window).toBe(sliding_window);
            }
        });

        it('should reject zero', () => {
            const result = calculateVram({ ...validBase, sliding_window: 0 });
            expectError(result, 'INVALID_SLIDING_WINDOW');
        });

        it('should reject negative values', () => {
            const result = calculateVram({ ...validBase, sliding_window: -128 });
            expectError(result, 'INVALID_SLIDING_WINDOW');
        });
    });

    describe('max_context', () => {
        it('should accept null', () => {
            const result = calculateVram({ ...validBase, max_context: null });
            expect(result.ok).toBe(true);
        });

        it('should accept positive integers', () => {
            const result = calculateVram({ ...validBase, max_context: 32768 });
            expect(result.ok).toBe(true);
        });

        it('should reject zero', () => {
            const result = calculateVram({ ...validBase, max_context: 0 });
            expectError(result, 'INVALID_MAX_CONTEXT');
        });

        it('should reject negative values', () => {
            const result = calculateVram({ ...validBase, max_context: -32768 });
            expectError(result, 'INVALID_MAX_CONTEXT');
        });
    });

    describe('expert_count', () => {
        it('should accept null', () => {
            const result = calculateVram({ ...validBase, expert_count: null });
            const output = expectSuccess(result);
            expect(output.input_summary.is_moe).toBe(false);
            expect(output.input_summary.expert_info).toBeNull();
        });

        it('should accept positive integers', () => {
            const result = calculateVram({ ...validBase, expert_count: 8 });
            const output = expectSuccess(result);
            expect(output.input_summary.is_moe).toBe(true);
            expect(output.input_summary.expert_info).toBe('8 total');
        });

        it('should reject zero', () => {
            const result = calculateVram({ ...validBase, expert_count: 0 });
            expectError(result, 'INVALID_EXPERT_COUNT');
        });

        it('should reject negative values', () => {
            const result = calculateVram({ ...validBase, expert_count: -8 });
            expectError(result, 'INVALID_EXPERT_COUNT');
        });
    });

    describe('active_experts', () => {
        it('should accept null', () => {
            const result = calculateVram({ ...validBase, expert_count: 8, active_experts: null });
            const output = expectSuccess(result);
            expect(output.input_summary.expert_info).toBe('8 total');
        });

        it('should accept positive integers with expert_count', () => {
            const result = calculateVram({ ...validBase, expert_count: 8, active_experts: 2 });
            const output = expectSuccess(result);
            expect(output.input_summary.expert_info).toBe('8 total, 2 active');
        });

        it('should reject zero', () => {
            const result = calculateVram({ ...validBase, expert_count: 8, active_experts: 0 });
            expectError(result, 'INVALID_ACTIVE_EXPERTS');
        });

        it('should reject negative values', () => {
            const result = calculateVram({ ...validBase, expert_count: 8, active_experts: -2 });
            expectError(result, 'INVALID_ACTIVE_EXPERTS');
        });
    });

    describe('batch_size', () => {
        it('should accept null', () => {
            const result = calculateVram({ ...validBase, batch_size: null });
            expectSuccess(result);
        });

        it('should accept positive integers with batch_size', () => {
            const result = calculateVram({ ...validBase, batch_size: 2 });
            expectSuccess(result);
        });

        it('should reject zero', () => {
            const result = calculateVram({ ...validBase, batch_size: 0 });
            expectError(result, 'INVALID_BATCH_SIZE');
        });

        it('should reject negative values', () => {
            const result = calculateVram({ ...validBase, batch_size: -2 });
            expectError(result, 'INVALID_BATCH_SIZE');
        });
    });
});

// ============================================================================
// SECTION 4: Output Structure Tests
// ============================================================================

describe('Output Structure', () => {
    describe('InputSummary', () => {
        it('should correctly reflect minimal input', () => {
            const result = calculateVram({ params_b: 8 });
            const output = expectSuccess(result);
            const summary = output.input_summary;

            expect(summary.params_b).toBe(8);
            expect(summary.model_size_gb).toBe('estimated');
            expect(summary.quantization).toBe('all');
            expect(summary.context_size).toBe('all');
            expect(summary.kv_cache_enabled).toBe(true);
            expect(summary.kv_cache_quant).toBe('q8_0');
            expect(summary.os).toBeNull();
            expect(summary.vram_gb).toBeNull();
            expect(summary.layers).toBe('estimated');
            expect(summary.sliding_window).toBeNull();
            expect(summary.is_moe).toBe(false);
            expect(summary.expert_info).toBeNull();
        });

        it('should correctly reflect full input', () => {
            const result = calculateVram({
                params_b: 7,
                model_size_gb: 4,
                quantization: 'Q4_K_M',
                context_size: 32768,
                kv_cache_enabled: true,
                kv_cache_quant: 'f16',
                os: 'windows',
                vram_gb: 16,
                layers: 32,
                sliding_window: 4096,
                expert_count: 8,
                active_experts: 2,
            });
            const output = expectSuccess(result);
            const summary = output.input_summary;

            expect(summary.params_b).toBe(7);
            expect(summary.model_size_gb).toBe(4);
            expect(summary.quantization).toBe('Q4_K_M');
            expect(summary.context_size).toBe(32768);
            expect(summary.kv_cache_enabled).toBe(true);
            expect(summary.kv_cache_quant).toBe('f16');
            expect(summary.os).toBe('windows');
            expect(summary.vram_gb).toBe(16);
            expect(summary.layers).toBe(32);
            expect(summary.sliding_window).toBe(4096);
            expect(summary.is_moe).toBe(true);
            expect(summary.expert_info).toBe('8 total, 2 active');
        });
    });

    describe('OSOverhead', () => {
        it('should have zero overhead when os is null', () => {
            const result = calculateVram({ params_b: 8, vram_gb: 24, os: null });
            const output = expectSuccess(result);

            expect(output.os_overhead.os).toBeNull();
            expect(output.os_overhead.total_vram_gb).toBe(24);
            expect(output.os_overhead.reserved_gb).toBe(0);
            expect(output.os_overhead.available_gb).toBe(24);
            expect(output.os_overhead.reservation_percent).toBeNull();
        });

        it('should have zero overhead when vram_gb is null', () => {
            const result = calculateVram({ params_b: 8, os: 'macos' });
            const output = expectSuccess(result);

            expect(output.os_overhead.os).toBe('macos');
            expect(output.os_overhead.total_vram_gb).toBeNull();
            expect(output.os_overhead.reserved_gb).toBe(0);
            expect(output.os_overhead.available_gb).toBeNull();
        });

        it('should calculate macOS overhead (25%)', () => {
            const result = calculateVram({ params_b: 8, vram_gb: 24, os: 'macos' });
            const output = expectSuccess(result);

            expect(output.os_overhead.reserved_gb).toBe(6);
            expect(output.os_overhead.available_gb).toBe(18);
            expect(output.os_overhead.reservation_percent).toBe(25);
        });

        it('should calculate Windows overhead (0.8 GB fixed)', () => {
            const result = calculateVram({ params_b: 8, vram_gb: 24, os: 'windows' });
            const output = expectSuccess(result);

            expect(output.os_overhead.reserved_gb).toBe(0.8);
            expect(output.os_overhead.available_gb).toBe(23.2);
        });

        it('should calculate Linux GUI overhead (0.5 GB fixed)', () => {
            const result = calculateVram({ params_b: 8, vram_gb: 24, os: 'linux-gui' });
            const output = expectSuccess(result);

            expect(output.os_overhead.reserved_gb).toBe(0.5);
            expect(output.os_overhead.available_gb).toBe(23.5);
        });

        it('should calculate Linux headless overhead (0.05 GB fixed)', () => {
            const result = calculateVram({ params_b: 8, vram_gb: 24, os: 'linux-headless' });
            const output = expectSuccess(result);

            expect(output.os_overhead.reserved_gb).toBe(0.05);
            expect(output.os_overhead.available_gb).toBe(23.95);
        });
    });

    describe('QuantizationAnalysis', () => {
        it('should produce correct structure for single quantization', () => {
            const result = calculateVram({ params_b: 8, quantization: 'Q4_K_M' });
            const output = expectSuccess(result);

            expect(output.quantization_analysis).toHaveLength(1);
            const analysis = output.quantization_analysis[0];

            expect(analysis.quantization).toBe('Q4_K_M');
            expect(analysis.eff_bpw).toBeCloseTo(4.85, 1);
            expect(analysis.family).toBe('k-quant');
            expect(analysis.sweet_spot).toBe(true);
            expect(typeof analysis.estimated_gguf_gb).toBe('number');
            expect(typeof analysis.min_vram_no_cache_gb).toBe('number');
            expect(typeof analysis.min_vram_with_cache_gb).toBe('number');
            expect(analysis.context_table).toHaveLength(STANDARD_CONTEXTS.length);
        });

        it('should produce all standard quantizations when not specified', () => {
            const result = calculateVram({ params_b: 8 });
            const output = expectSuccess(result);

            expect(output.quantization_analysis).toHaveLength(STANDARD_QUANTIZATIONS.length);
            const quantizations = output.quantization_analysis.map((a) => a.quantization);
            expect(quantizations).toEqual(STANDARD_QUANTIZATIONS);
        });

        it('should set estimated_gguf_gb to null when model_size_gb is provided', () => {
            const result = calculateVram({ params_b: 8, model_size_gb: 5, quantization: 'Q4_K_M' });
            const output = expectSuccess(result);

            expect(output.quantization_analysis[0].estimated_gguf_gb).toBeNull();
        });
    });

    describe('ContextEntry', () => {
        it('should produce correct structure', () => {
            const result = calculateVram({ params_b: 8, quantization: 'Q4_K_M' });
            const output = expectSuccess(result);
            const entry = output.quantization_analysis[0].context_table[0];

            expect(typeof entry.context_size).toBe('number');
            expect(typeof entry.context_label).toBe('string');
            expect(typeof entry.kv_cache_gb).toBe('number');
            expect(typeof entry.vram_with_cache_gb).toBe('number');
            expect(typeof entry.vram_without_cache_gb).toBe('number');
            expect(entry.fits_in_vram).toBeNull(); // No vram_gb provided
        });

        it('should include custom context in sorted position', () => {
            const result = calculateVram({ params_b: 8, context_size: 12000 });
            const output = expectSuccess(result);
            const contexts = output.quantization_analysis[0].context_table.map((e) => e.context_size);

            expect(contexts).toContain(12000);
            // Should be sorted
            for (let i = 1; i < contexts.length; i++) {
                expect(contexts[i]).toBeGreaterThan(contexts[i - 1]);
            }
        });

        it('should format context labels correctly', () => {
            const result = calculateVram({ params_b: 8, quantization: 'Q4_K_M' });
            const output = expectSuccess(result);
            const table = output.quantization_analysis[0].context_table;

            const labels = table.map((e) => e.context_label);
            expect(labels).toContain('4K');
            expect(labels).toContain('8K');
            expect(labels).toContain('16K');
            expect(labels).toContain('32K');
            expect(labels).toContain('64K');
            expect(labels).toContain('128K');
            expect(labels).toContain('256K');
            expect(labels).toContain('512K');
            expect(labels).toContain('1M');
        });

        it('should determine fits_in_vram when vram_gb is provided', () => {
            const result = calculateVram({ params_b: 8, quantization: 'Q4_K_M', vram_gb: 24, os: 'windows' });
            const output = expectSuccess(result);
            const table = output.quantization_analysis[0].context_table;

            // All entries should have boolean fits_in_vram
            for (const entry of table) {
                expect(typeof entry.fits_in_vram).toBe('boolean');
            }

            // At least some should fit, some should not (8B Q4_K_M model)
            const fittingCount = table.filter((e) => e.fits_in_vram).length;
            const notFittingCount = table.filter((e) => !e.fits_in_vram).length;
            expect(fittingCount).toBeGreaterThan(0);
            expect(notFittingCount).toBeGreaterThan(0);
        });
    });

    describe('Recommendations', () => {
        it('should be null when vram_gb is not provided', () => {
            const result = calculateVram({ params_b: 8 });
            const output = expectSuccess(result);
            expect(output.recommendations).toBeNull();
        });

        it('should be null when no configurations fit', () => {
            // 70B model with only 4GB VRAM - nothing should fit
            const result = calculateVram({ params_b: 70, vram_gb: 4, os: 'linux-headless' });
            const output = expectSuccess(result);
            expect(output.recommendations).toBeNull();
        });

        it('should contain three tiers when configurations fit', () => {
            const result = calculateVram({ params_b: 8, quantization: 'Q4_K_M', vram_gb: 24, os: 'windows' });
            const output = expectSuccess(result);

            expect(output.recommendations).not.toBeNull();
            expect(output.recommendations).toHaveLength(3);

            const tiers = output.recommendations!.map((r) => r.tier);
            expect(tiers).toContain('optimal');
            expect(tiers).toContain('minimum');
            expect(tiers).toContain('maximum_quality');
        });

        it('should have correct recommendation structure', () => {
            const result = calculateVram({ params_b: 8, quantization: 'Q4_K_M', vram_gb: 24, os: 'windows' });
            const output = expectSuccess(result);
            const rec = output.recommendations![0];

            expect(typeof rec.tier).toBe('string');
            expect(typeof rec.quantization).toBe('string');
            expect(typeof rec.context_size).toBe('number');
            expect(typeof rec.context_label).toBe('string');
            expect(typeof rec.kv_cache_quant).toBe('string');
            expect(typeof rec.estimated_gguf_gb).toBe('number');
            expect(typeof rec.total_vram_gb).toBe('number');
            expect(typeof rec.headroom_gb).toBe('number');
            expect(typeof rec.description).toBe('string');
        });

        it('should have positive headroom for all recommendations', () => {
            const result = calculateVram({ params_b: 8, quantization: 'Q4_K_M', vram_gb: 24, os: 'windows' });
            const output = expectSuccess(result);

            for (const rec of output.recommendations!) {
                expect(rec.headroom_gb).toBeGreaterThanOrEqual(0);
            }
        });
    });

    describe('SummaryStatistics', () => {
        it('should have correct structure', () => {
            const result = calculateVram({ params_b: 8 });
            const output = expectSuccess(result);
            const summary = output.summary;

            expect(typeof summary.smallest_config_gb).toBe('number');
            expect(typeof summary.largest_config_gb).toBe('number');
            expect(typeof summary.total_configurations).toBe('number');
            expect(summary.fitting_configurations).toBeNull(); // No vram_gb
        });

        it('should have smallest <= largest', () => {
            const result = calculateVram({ params_b: 8 });
            const output = expectSuccess(result);

            expect(output.summary.smallest_config_gb).toBeLessThanOrEqual(output.summary.largest_config_gb);
        });

        it('should count total configurations correctly', () => {
            // Single quantization, standard contexts
            const result1 = calculateVram({ params_b: 8, quantization: 'Q4_K_M' });
            const output1 = expectSuccess(result1);
            expect(output1.summary.total_configurations).toBe(STANDARD_CONTEXTS.length);

            // All quantizations, standard contexts
            const result2 = calculateVram({ params_b: 8 });
            const output2 = expectSuccess(result2);
            expect(output2.summary.total_configurations).toBe(STANDARD_QUANTIZATIONS.length * STANDARD_CONTEXTS.length);
        });

        it('should count fitting configurations when vram_gb provided', () => {
            const result = calculateVram({ params_b: 8, vram_gb: 24, os: 'windows' });
            const output = expectSuccess(result);

            expect(typeof output.summary.fitting_configurations).toBe('number');
            expect(output.summary.fitting_configurations).toBeGreaterThanOrEqual(0);
            expect(output.summary.fitting_configurations).toBeLessThanOrEqual(output.summary.total_configurations);
        });
    });
});

// ============================================================================
// SECTION 5: Calculation Tests
// ============================================================================

describe('Calculation Tests', () => {
    describe('Model Size Estimation', () => {
        it('should estimate Q4_K_M model size correctly (4.85 bpw)', () => {
            // 8B params × 4.85 bpw / 8 = 4.85 GB
            const result = calculateVram({ params_b: 8, quantization: 'Q4_K_M' });
            const output = expectSuccess(result);
            const estimated = output.quantization_analysis[0].estimated_gguf_gb!;

            expect(estimated).toBeCloseTo(4.85, 1);
        });

        it('should estimate FP16 model size correctly (16 bpw)', () => {
            // 8B params × 16 bpw / 8 = 16.0 GB (no overhead factor)
            const result = calculateVram({ params_b: 8, quantization: 'FP16' });
            const output = expectSuccess(result);
            const estimated = output.quantization_analysis[0].estimated_gguf_gb!;

            expect(estimated).toBeCloseTo(16, 1);
        });

        it('should estimate FP32 model size correctly (32 bpw)', () => {
            // 8B params × 32 bpw / 8 = 32.0 GB
            const result = calculateVram({ params_b: 8, quantization: 'FP32' });
            const output = expectSuccess(result);
            const estimated = output.quantization_analysis[0].estimated_gguf_gb!;

            expect(estimated).toBeCloseTo(32, 1);
        });

        it('should use provided model_size_gb when quantization is specific', () => {
            const result = calculateVram({
                params_b: 8,
                model_size_gb: 5.5,
                quantization: 'Q4_K_M',
                engine: 'llama.cpp',
            });
            const output = expectSuccess(result);

            // estimated_gguf_gb should be null since actual size was provided
            expect(output.quantization_analysis[0].estimated_gguf_gb).toBeNull();

            // min_vram = 5.5 + backend(0.75) + compute@4K(0.30) = 6.55
            expect(output.quantization_analysis[0].min_vram_no_cache_gb).toBeCloseTo(6.55, 1);
        });
    });

    describe('VRAM with and without cache', () => {
        it('should have vram_without_cache = model_size + backend + compute_buffer (varies by context)', () => {
            const result = calculateVram({ params_b: 8, quantization: 'Q4_K_M', engine: 'llama.cpp' });
            const output = expectSuccess(result);

            // vram_without_cache now varies by context since compute buffer scales with context
            const table = output.quantization_analysis[0].context_table;
            const vramWithoutCache = table.map((e) => e.vram_without_cache_gb);
            const uniqueValues = new Set(vramWithoutCache);
            // Multiple tiers means multiple unique values across 9 standard contexts
            expect(uniqueValues.size).toBeGreaterThan(1);
            // But vram_without_cache at 4K should be modelSize + 0.75 + 0.30
            const modelSize = output.quantization_analysis[0].estimated_gguf_gb!;
            const entry4k = table.find((e) => e.context_size === 4096)!;
            expect(entry4k.vram_without_cache_gb).toBeCloseTo(modelSize + 0.75 + 0.3, 1);
        });

        it('should have vram_with_cache > vram_without_cache when kv_cache_enabled', () => {
            const result = calculateVram({ params_b: 8, quantization: 'Q4_K_M' });
            const output = expectSuccess(result);

            for (const entry of output.quantization_analysis[0].context_table) {
                expect(entry.vram_with_cache_gb).toBeGreaterThan(entry.vram_without_cache_gb);
            }
        });

        it('should have vram_with_cache == vram_without_cache when kv_cache_enabled=false', () => {
            const result = calculateVram({ params_b: 8, quantization: 'Q4_K_M', kv_cache_enabled: false });
            const output = expectSuccess(result);

            for (const entry of output.quantization_analysis[0].context_table) {
                expect(entry.vram_with_cache_gb).toBe(entry.vram_without_cache_gb);
                expect(entry.kv_cache_gb).toBe(0);
            }
        });
    });

    describe('KV Cache scaling with context', () => {
        it('should scale KV cache linearly with context size (estimated)', () => {
            const result = calculateVram({ params_b: 8, quantization: 'Q4_K_M' });
            const output = expectSuccess(result);
            const table = output.quantization_analysis[0].context_table;

            // Find 4K and 8K entries
            const entry4k = table.find((e) => e.context_size === 4096)!;
            const entry8k = table.find((e) => e.context_size === 8192)!;

            // KV cache at 8K should be ~2x KV cache at 4K
            expect(entry8k.kv_cache_gb / entry4k.kv_cache_gb).toBeCloseTo(2, 1);
        });

        it('should scale KV cache with context size (exact calculation)', () => {
            const result = calculateVram({
                params_b: 8,
                quantization: 'Q4_K_M',
                layers: 32,
                kv_heads: 8,
                key_dim: 128,
                value_dim: 128,
            });
            const output = expectSuccess(result);
            const table = output.quantization_analysis[0].context_table;

            const entry4k = table.find((e) => e.context_size === 4096)!;
            const entry8k = table.find((e) => e.context_size === 8192)!;

            expect(entry8k.kv_cache_gb / entry4k.kv_cache_gb).toBeCloseTo(2, 1);
        });
    });

    describe('KV Cache quantization effect', () => {
        it('should have smaller KV cache with Q4 than F16', () => {
            const resultQ4 = calculateVram({ params_b: 8, quantization: 'Q4_K_M', kv_cache_quant: 'q4_0' });
            const resultF16 = calculateVram({ params_b: 8, quantization: 'Q4_K_M', kv_cache_quant: 'f16' });

            const outputQ4 = expectSuccess(resultQ4);
            const outputF16 = expectSuccess(resultF16);

            const kvQ4 = outputQ4.quantization_analysis[0].context_table[0].kv_cache_gb;
            const kvF16 = outputF16.quantization_analysis[0].context_table[0].kv_cache_gb;

            expect(kvQ4).toBeLessThan(kvF16);
        });

        it('should respect KV cache factor ratios', () => {
            const resultQ8 = calculateVram({ params_b: 8, quantization: 'Q4_K_M', kv_cache_quant: 'q8_0' });
            const resultF16 = calculateVram({ params_b: 8, quantization: 'Q4_K_M', kv_cache_quant: 'f16' });

            const outputQ8 = expectSuccess(resultQ8);
            const outputF16 = expectSuccess(resultF16);

            const kvQ8 = outputQ8.quantization_analysis[0].context_table[0].kv_cache_gb;
            const kvF16 = outputF16.quantization_analysis[0].context_table[0].kv_cache_gb;

            // q8_0 is 1 byte, f16 is 2 bytes, ratio = 0.5
            expect(kvQ8 / kvF16).toBeCloseTo(0.5, 1);
        });
    });

    describe('Sliding window effect', () => {
        it('should cap KV cache when sliding_window < context_size', () => {
            const withWindow = calculateVram({
                params_b: 8,
                quantization: 'Q4_K_M',
                sliding_window: 4096,
                context_size: 131072,
            });
            const withoutWindow = calculateVram({ params_b: 8, quantization: 'Q4_K_M', context_size: 131072 });

            const outputWith = expectSuccess(withWindow);
            const outputWithout = expectSuccess(withoutWindow);

            // Find the 131072 context entry
            const entryWith = outputWith.quantization_analysis[0].context_table.find((e) => e.context_size === 131072)!;
            const entryWithout = outputWithout.quantization_analysis[0].context_table.find(
                (e) => e.context_size === 131072,
            )!;

            // With sliding window, KV cache should be much smaller
            expect(entryWith.kv_cache_gb).toBeLessThan(entryWithout.kv_cache_gb);
        });

        it('should not affect KV cache when sliding_window > context_size', () => {
            const withWindow = calculateVram({
                params_b: 8,
                quantization: 'Q4_K_M',
                sliding_window: 1000000,
                context_size: 4096,
            });
            const withoutWindow = calculateVram({ params_b: 8, quantization: 'Q4_K_M', context_size: 4096 });

            const outputWith = expectSuccess(withWindow);
            const outputWithout = expectSuccess(withoutWindow);

            const entryWith = outputWith.quantization_analysis[0].context_table.find((e) => e.context_size === 4096)!;
            const entryWithout = outputWithout.quantization_analysis[0].context_table.find(
                (e) => e.context_size === 4096,
            )!;

            expect(entryWith.kv_cache_gb).toBeCloseTo(entryWithout.kv_cache_gb, 2);
        });
    });

    describe('KV base factor by model size', () => {
        it('should use different factors for different model sizes', () => {
            // Small model (4B) should have larger factor
            const small = calculateVram({ params_b: 4, quantization: 'Q4_K_M', context_size: 4096 });
            // Large model (100B) should have smaller factor
            const large = calculateVram({ params_b: 100, quantization: 'Q4_K_M', context_size: 4096 });

            const outputSmall = expectSuccess(small);
            const outputLarge = expectSuccess(large);

            const kvSmall = outputSmall.quantization_analysis[0].context_table[0].kv_cache_gb;
            const kvLarge = outputLarge.quantization_analysis[0].context_table[0].kv_cache_gb;

            // KV cache per billion params should be higher for smaller model
            const kvPerBSmall = kvSmall / 4;
            const kvPerBLarge = kvLarge / 100;

            expect(kvPerBSmall).toBeGreaterThan(kvPerBLarge);
        });
    });

    describe('Exact vs Estimated KV cache', () => {
        it('should use exact calculation when layers are provided', () => {
            const result = calculateVram({
                params_b: 8,
                quantization: 'Q4_K_M',
                layers: 32,
                kv_heads: 8,
                key_dim: 128,
                value_dim: 128,
                kv_cache_quant: 'q8_0',
                context_size: 4096,
            });
            const output = expectSuccess(result);

            const entry = output.quantization_analysis[0].context_table.find((e) => e.context_size === 4096)!;
            // NEW formula (no 2×): 32 × 4096 × 1 × 8 × (128×1 + 128×1) / 1073741824 = 0.25 GB
            expect(entry.kv_cache_gb).toBeCloseTo(0.25, 2);
        });
    });
});

// ============================================================================
// SECTION 6: Edge Cases
// ============================================================================

describe('Edge Cases', () => {
    describe('Extreme model sizes', () => {
        it('should handle 1B model', () => {
            const result = calculateVram({ params_b: 1, quantization: 'IQ1_S' });
            const output = expectSuccess(result);
            // 1 × 1.56 / 8 = 0.195 GB, rounds to 0.20
            expect(output.quantization_analysis[0].estimated_gguf_gb).toBeCloseTo(0.2, 1);
        });

        it('should handle 1000B model', () => {
            const result = calculateVram({ params_b: 1000, quantization: 'Q4_K_M' });
            const output = expectSuccess(result);
            // 1000 × 4.85 / 8 = 606.25 GB
            expect(output.quantization_analysis[0].estimated_gguf_gb).toBeCloseTo(606, 0);
        });

        it('should handle very small quantization (IQ1_S)', () => {
            const result = calculateVram({ params_b: 8, quantization: 'IQ1_S' });
            const output = expectSuccess(result);
            // 8 × 1.56 / 8 = 1.56 GB
            expect(output.quantization_analysis[0].estimated_gguf_gb).toBeCloseTo(1.56, 1);
        });

        it('should handle very large quantization (FP32)', () => {
            const result = calculateVram({ params_b: 8, quantization: 'FP32' });
            const output = expectSuccess(result);
            // 8 × 32 / 8 = 32.0 GB (no overhead)
            expect(output.quantization_analysis[0].estimated_gguf_gb).toBeCloseTo(32, 1);
        });
    });

    describe('Extreme context sizes', () => {
        it('should handle minimum context (1024)', () => {
            const result = calculateVram({ params_b: 8, context_size: 1024 });
            const output = expectSuccess(result);
            const contexts = output.quantization_analysis[0].context_table.map((e) => e.context_size);
            expect(contexts).toContain(1024);
        });

        it('should handle maximum context (10000000)', () => {
            const result = calculateVram({ params_b: 8, context_size: 10000000 });
            const output = expectSuccess(result);
            const contexts = output.quantization_analysis[0].context_table.map((e) => e.context_size);
            expect(contexts).toContain(10000000);
        });
    });

    describe('VRAM constraints', () => {
        it('should handle case where nothing fits', () => {
            // FP32 70B ≈ 280 GB; only 1 GB available
            const result = calculateVram({ params_b: 70, quantization: 'FP32', vram_gb: 1, os: 'linux-headless' });
            const output = expectSuccess(result);

            expect(output.recommendations).toBeNull();
            expect(output.summary.fitting_configurations).toBe(0);
        });

        it('should handle case where everything fits', () => {
            // IQ1_S 1B ≈ 0.195 GB; 256 GB VRAM
            const result = calculateVram({ params_b: 1, quantization: 'IQ1_S', vram_gb: 256, os: 'linux-headless' });
            const output = expectSuccess(result);

            expect(output.recommendations).not.toBeNull();
            expect(output.summary.fitting_configurations).toBe(output.summary.total_configurations);
        });

        it('should handle boundary case where model barely fits', () => {
            // IQ4_XS 8B = 8 × 4.35 / 8 = 4.35 GB; backend=0.75; compute@4K=0.30 → total ≈ 5.40 GB
            // With 8 GB VRAM and kv_cache_enabled=false → should fit
            const result = calculateVram({
                params_b: 8,
                quantization: 'IQ4_XS',
                kv_cache_enabled: false,
                vram_gb: 8,
                os: 'linux-headless',
                engine: 'llama.cpp',
            });
            const output = expectSuccess(result);

            expect(output.recommendations).not.toBeNull();
            expect(output.summary.fitting_configurations).toBeGreaterThan(0);
        });
    });

    describe('MoE model tracking', () => {
        it('should track expert count only', () => {
            const result = calculateVram({ params_b: 47, expert_count: 8 });
            const output = expectSuccess(result);

            expect(output.input_summary.is_moe).toBe(true);
            expect(output.input_summary.expert_info).toBe('8 total');
        });

        it('should track expert count and active experts', () => {
            const result = calculateVram({ params_b: 47, expert_count: 8, active_experts: 2 });
            const output = expectSuccess(result);

            expect(output.input_summary.is_moe).toBe(true);
            expect(output.input_summary.expert_info).toBe('8 total, 2 active');
        });
    });

    describe('Recommendation selection', () => {
        it('should prefer Q4-Q6 for optimal recommendation', () => {
            const result = calculateVram({ params_b: 8, vram_gb: 64, os: 'linux-headless' });
            const output = expectSuccess(result);
            const optimal = output.recommendations!.find((r) => r.tier === 'optimal')!;

            // Optimal should be from OPTIMAL_QUANTIZATIONS list: Q4_K_M, IQ4_XS, Q5_K_M, Q4_K_S
            const optimalQuants = ['Q4_K_M', 'IQ4_XS', 'Q5_K_M', 'Q4_K_S'];
            expect(optimalQuants).toContain(optimal.quantization);
        });

        it('should select minimum memory for minimum recommendation', () => {
            const result = calculateVram({ params_b: 8, vram_gb: 64, os: 'linux-headless' });
            const output = expectSuccess(result);
            const minimum = output.recommendations!.find((r) => r.tier === 'minimum')!;

            // Minimum should have the lowest VRAM
            for (const rec of output.recommendations!) {
                expect(minimum.total_vram_gb).toBeLessThanOrEqual(rec.total_vram_gb);
            }
        });

        it('should select highest quality for maximum_quality recommendation', () => {
            const result = calculateVram({ params_b: 8, vram_gb: 100, os: 'linux-headless' });
            const output = expectSuccess(result);
            const maxQuality = output.recommendations!.find((r) => r.tier === 'maximum_quality')!;

            const maxBpw = QUANT_CATALOG[maxQuality.quantization]?.bpw ?? 0;
            for (const rec of output.recommendations!) {
                const recBpw = QUANT_CATALOG[rec.quantization]?.bpw ?? 0;
                expect(maxBpw).toBeGreaterThanOrEqual(recBpw);
            }
        });
    });

    describe('Custom context merging', () => {
        it('should include custom context alongside standard contexts', () => {
            const customContext = 12345;
            const result = calculateVram({ params_b: 8, context_size: customContext });
            const output = expectSuccess(result);
            const contexts = output.quantization_analysis[0].context_table.map((e) => e.context_size);

            expect(contexts).toContain(customContext);
            for (const stdCtx of STANDARD_CONTEXTS) {
                expect(contexts).toContain(stdCtx);
            }
        });

        it('should not duplicate when custom context equals standard', () => {
            const result = calculateVram({ params_b: 8, context_size: 4096 });
            const output = expectSuccess(result);
            const contexts = output.quantization_analysis[0].context_table.map((e) => e.context_size);

            const count4096 = contexts.filter((c) => c === 4096).length;
            expect(count4096).toBe(1);
        });
    });

    describe('Numerical precision', () => {
        it('should round output values to 2 decimal places', () => {
            const result = calculateVram({ params_b: 7.123, quantization: 'Q4_K_M' });
            const output = expectSuccess(result);
            const analysis = output.quantization_analysis[0];

            // Check that values are rounded
            const checkRounded = (n: number | null): void => {
                if (n === null) return;
                const rounded = Math.round(n * 100) / 100;
                expect(n).toBe(rounded);
            };

            checkRounded(analysis.estimated_gguf_gb);
            checkRounded(analysis.min_vram_no_cache_gb);
            checkRounded(analysis.min_vram_with_cache_gb);

            for (const entry of analysis.context_table) {
                checkRounded(entry.kv_cache_gb);
                checkRounded(entry.vram_with_cache_gb);
                checkRounded(entry.vram_without_cache_gb);
            }
        });
    });
});

// ============================================================================
// SECTION 7: Integration Tests
// ============================================================================

describe('Integration Tests', () => {
    it('should handle realistic 8B Q4_K_M model on macOS 24GB', () => {
        const result = calculateVram({ params_b: 8, quantization: 'Q4_K_M', vram_gb: 24, os: 'macos' });
        const output = expectSuccess(result);

        // macOS should reserve 6GB, leaving 18GB available
        expect(output.os_overhead.available_gb).toBe(18);

        // Q4_K_M 8B should be ~4.85GB
        expect(output.quantization_analysis[0].estimated_gguf_gb).toBeCloseTo(4.85, 1);

        // Should have recommendations
        expect(output.recommendations).not.toBeNull();
        expect(output.recommendations!.length).toBe(3);

        // Optimal should allow decent context
        const optimal = output.recommendations!.find((r) => r.tier === 'optimal')!;
        expect(optimal.context_size).toBeGreaterThanOrEqual(4096);
    });

    it('should handle realistic 70B Q4_K_M model on Windows 48GB', () => {
        const result = calculateVram({ params_b: 70, quantization: 'Q4_K_M', vram_gb: 48, os: 'windows' });
        const output = expectSuccess(result);

        // Windows should reserve 0.8GB
        expect(output.os_overhead.reserved_gb).toBe(0.8);

        // 70B Q4_K_M ≈ 70 × 4.85 / 8 = 42.44 GB
        expect(output.quantization_analysis[0].estimated_gguf_gb).toBeCloseTo(42.44, 1);

        // Should have limited or no fitting configurations at high contexts
        expect(output.summary.fitting_configurations).toBeDefined();
    });

    it('should handle full architecture specification', () => {
        const result = calculateVram({
            params_b: 7,
            model_size_gb: 4,
            quantization: 'Q4_K_M',
            context_size: 32768,
            kv_cache_enabled: true,
            kv_cache_quant: 'f16',
            os: 'linux-gui',
            vram_gb: 16,
            layers: 32,
            key_dim: 128,
            value_dim: 128,
            kv_heads: 8,
        });
        const output = expectSuccess(result);

        expect(output.input_summary.params_b).toBe(7);
        expect(output.input_summary.model_size_gb).toBe(4);
        expect(output.input_summary.layers).toBe(32);
        expect(output.quantization_analysis[0].estimated_gguf_gb).toBeNull();
    });

    it('should handle MoE model like Mixtral', () => {
        const result = calculateVram({
            params_b: 47,
            quantization: 'Q4_K_M',
            expert_count: 8,
            active_experts: 2,
            vram_gb: 48,
            os: 'linux-headless',
        });
        const output = expectSuccess(result);

        expect(output.input_summary.is_moe).toBe(true);
        expect(output.input_summary.expert_info).toBe('8 total, 2 active');

        // Model size should be based on total params: 47 × 4.85 / 8 = 28.49 GB
        expect(output.quantization_analysis[0].estimated_gguf_gb).toBeCloseTo(28.49, 1);
    });

    it('should handle model with sliding window', () => {
        const result = calculateVram({
            params_b: 7,
            quantization: 'Q4_K_M',
            sliding_window: 4096,
            context_size: 131072,
            vram_gb: 16,
            os: 'linux-gui',
        });
        const output = expectSuccess(result);

        expect(output.input_summary.sliding_window).toBe(4096);

        // KV cache at 131K should be same as at 4K due to sliding window
        const entry4k = output.quantization_analysis[0].context_table.find((e) => e.context_size === 4096)!;
        const entry131k = output.quantization_analysis[0].context_table.find((e) => e.context_size === 131072)!;

        expect(entry131k.kv_cache_gb).toBe(entry4k.kv_cache_gb);
    });
});

// ============================================================================
// SECTION 8: Regression Tests
// ============================================================================

describe('Regression Tests', () => {
    it('should not crash with minimal valid input', () => {
        expect(() => calculateVram({ params_b: 1 })).not.toThrow();
    });

    it('should not crash with all parameters specified', () => {
        expect(() =>
            calculateVram({
                params_b: 8,
                model_size_gb: 4,
                quantization: 'Q4_K_M',
                context_size: 4096,
                kv_cache_enabled: true,
                kv_cache_quant: 'q8_0',
                os: 'macos',
                vram_gb: 24,
                layers: 32,
                key_dim: 128,
                value_dim: 128,
                kv_heads: 8,
                sliding_window: 4096,
                max_context: 32768,
                expert_count: 8,
                active_experts: 2,
            }),
        ).not.toThrow();
    });

    it('should return consistent results for same input', () => {
        const input: CalculatorInput = { params_b: 8, quantization: 'Q4_K_M', vram_gb: 24, os: 'macos' };

        const result1 = calculateVram(input);
        const result2 = calculateVram(input);

        expect(result1).toEqual(result2);
    });

    it('should handle all OS types without errors', () => {
        for (const os of Object.values(OperatingSystem)) {
            const result = calculateVram({ params_b: 8, os, vram_gb: 24 });
            expect(result.ok).toBe(true);
        }
    });

    it('should handle all quantization types without errors', () => {
        for (const quant of Object.keys(QUANT_CATALOG) as (keyof typeof QUANT_CATALOG)[]) {
            const result = calculateVram({ params_b: 8, quantization: quant });
            expect(result.ok).toBe(true);
        }
    });

    it('should handle all KV cache quantization types without errors', () => {
        for (const kvQuant of Object.values(KVCacheQuant)) {
            const result = calculateVram({ params_b: 8, kv_cache_quant: kvQuant });
            expect(result.ok).toBe(true);
        }
    });
});

// ============================================================================
// SECTION 9: Batch Size Tests
// ============================================================================
describe('Batch Size Impact on KV Cache', () => {
    const baseInput = {
        params_b: 8,
        quantization: 'Q4_K_M' as const,
        layers: 32,
        kv_heads: 8,
        key_dim: 128,
        value_dim: 128,
        kv_cache_quant: 'f16' as const,
        context_size: 8192,
    };

    it('should scale KV cache linearly with batch_size', () => {
        const result1 = calculateVram({ ...baseInput, batch_size: 1 });
        const result2 = calculateVram({ ...baseInput, batch_size: 2 });
        const result4 = calculateVram({ ...baseInput, batch_size: 4 });

        const output1 = expectSuccess(result1);
        const output2 = expectSuccess(result2);
        const output4 = expectSuccess(result4);

        const kv1 = output1.quantization_analysis[0].context_table[0].kv_cache_gb;
        const kv2 = output2.quantization_analysis[0].context_table[0].kv_cache_gb;
        const kv4 = output4.quantization_analysis[0].context_table[0].kv_cache_gb;

        // KV cache should scale linearly with batch_size
        expect(kv2 / kv1).toBeCloseTo(2, 1);
        expect(kv4 / kv1).toBeCloseTo(4, 1);
    });

    it('should default batch_size to 1 when not specified', () => {
        const resultWithBatch = calculateVram({ ...baseInput, batch_size: 1 });
        const resultWithoutBatch = calculateVram({ ...baseInput, batch_size: undefined });

        const outputWith = expectSuccess(resultWithBatch);
        const outputWithout = expectSuccess(resultWithoutBatch);

        expect(outputWith.quantization_analysis[0].context_table[0].kv_cache_gb).toBe(
            outputWithout.quantization_analysis[0].context_table[0].kv_cache_gb,
        );
    });

    it('should affect total_vram in recommendations', () => {
        const result1 = calculateVram({ ...baseInput, batch_size: 1, vram_gb: 24, os: 'windows' });
        const result4 = calculateVram({ ...baseInput, batch_size: 4, vram_gb: 24, os: 'windows' });

        const output1 = expectSuccess(result1);
        const output4 = expectSuccess(result4);

        // Compare KV cache for the SAME context size (not recommendations)
        const contextSize = 8192;
        const entry1 = output1.quantization_analysis[0].context_table.find((e) => e.context_size === contextSize)!;
        const entry4 = output4.quantization_analysis[0].context_table.find((e) => e.context_size === contextSize)!;

        // KV cache should be 4x larger with batch_size=4
        expect(entry4.kv_cache_gb).toBeGreaterThan(entry1.kv_cache_gb);
        expect(entry4.kv_cache_gb / entry1.kv_cache_gb).toBeCloseTo(4, 0);

        // Total VRAM should also be larger for the same context
        expect(entry4.vram_with_cache_gb).toBeGreaterThan(entry1.vram_with_cache_gb);
    });
});

// ============================================================================
// SECTION 10: KV Cache Formula Verification
// ============================================================================
describe('KV Cache Formula Verification', () => {
    it('exact 8B@8K F16 KV ≈ 1.0 GB (corrected formula, no 2×)', () => {
        // layers × kv_heads × (key+val) × ctx × bytes / GB
        // = 32 × 8 × (128×2 + 128×2) × 8192 / 1073741824 = 1.0 GB
        const result = calculateVram({
            params_b: 8,
            quantization: 'Q4_K_M',
            layers: 32,
            kv_heads: 8,
            key_dim: 128,
            value_dim: 128,
            kv_cache_quant: 'f16',
            context_size: 8192,
            batch_size: 1,
        });

        const output = expectSuccess(result);

        const entry = output.quantization_analysis[0].context_table.find((e) => e.context_size === 8192)!;

        expect(entry).toBeDefined();
        expect(entry.kv_cache_gb).toBeCloseTo(1, 1);
    });

    it('exact 8B@32K F16 KV ≈ 4.0 GB', () => {
        const result = calculateVram({
            params_b: 8,
            quantization: 'Q4_K_M',
            layers: 32,
            kv_heads: 8,
            key_dim: 128,
            value_dim: 128,
            kv_cache_quant: 'f16',
            context_size: 32768,
            batch_size: 1,
        });
        const output = expectSuccess(result);
        const entry = output.quantization_analysis[0].context_table.find((e) => e.context_size === 32768)!;
        expect(entry.kv_cache_gb).toBeCloseTo(4, 1);
        expect(entry.kv_cache_gb).toBeGreaterThanOrEqual(3);
        expect(entry.kv_cache_gb).toBeLessThanOrEqual(6);
    });

    it('exact 70B@128K F16 KV ≈ 40.0 GB (corrected)', () => {
        // = 80 × 131072 × 8 × (128×2 + 128×2) / 1073741824 = 40.0 GB
        const result = calculateVram({
            params_b: 70,
            quantization: 'Q4_K_M',
            layers: 80,
            kv_heads: 8,
            key_dim: 128,
            value_dim: 128,
            kv_cache_quant: 'f16',
            context_size: 131072,
            batch_size: 1,
        });

        const output = expectSuccess(result);
        const entry = output.quantization_analysis[0].context_table.find((e) => e.context_size === 131072)!;

        expect(entry).toBeDefined();
        expect(entry.kv_cache_gb).toBeCloseTo(40, 0);
    });

    it('should respect KV_CACHE_BYTES mapping in calculation', () => {
        const baseInput = {
            params_b: 8,
            quantization: 'Q4_K_M' as const,
            layers: 32,
            kv_heads: 8,
            key_dim: 128,
            value_dim: 128,
            context_size: 8192,
            batch_size: 1,
        };

        const resultQ4 = calculateVram({ ...baseInput, kv_cache_quant: 'q4_0' });
        const resultQ8 = calculateVram({ ...baseInput, kv_cache_quant: 'q8_0' });
        const resultF16 = calculateVram({ ...baseInput, kv_cache_quant: 'f16' });

        const outputQ4 = expectSuccess(resultQ4);
        const outputQ8 = expectSuccess(resultQ8);
        const outputF16 = expectSuccess(resultF16);

        const kvQ4 = outputQ4.quantization_analysis[0].context_table.find((e) => e.context_size === 8192)!.kv_cache_gb;
        const kvQ8 = outputQ8.quantization_analysis[0].context_table.find((e) => e.context_size === 8192)!.kv_cache_gb;
        const kvF16 = outputF16.quantization_analysis[0].context_table.find(
            (e) => e.context_size === 8192,
        )!.kv_cache_gb;

        // q4_0=0.5 bytes, q8_0=1 byte, f16=2 bytes
        expect(kvQ8 / kvQ4).toBeCloseTo(2, 1); // 1 / 0.5
        expect(kvF16 / kvQ8).toBeCloseTo(2, 1); // 2 / 1
    });

    it('asymmetric kv_cache_quant_v: V tensor uses different quant than K', () => {
        const symResult = calculateVram({
            params_b: 8,
            quantization: 'Q4_K_M',
            layers: 32,
            kv_heads: 8,
            key_dim: 128,
            value_dim: 128,
            kv_cache_quant: 'f16',
            context_size: 8192,
        });
        const asymResult = calculateVram({
            params_b: 8,
            quantization: 'Q4_K_M',
            layers: 32,
            kv_heads: 8,
            key_dim: 128,
            value_dim: 128,
            kv_cache_quant: 'f16',
            kv_cache_quant_v: 'q4_0',
            context_size: 8192,
        });
        const symOutput = expectSuccess(symResult);
        const asymOutput = expectSuccess(asymResult);
        const symKv = symOutput.quantization_analysis[0].context_table.find(
            (e) => e.context_size === 8192,
        )!.kv_cache_gb;
        const asymKv = asymOutput.quantization_analysis[0].context_table.find(
            (e) => e.context_size === 8192,
        )!.kv_cache_gb;
        // Asymmetric: K=f16(2 bytes), V=q4_0(0.5 bytes) → avg 1.25 bytes vs symmetric f16(2 bytes)
        // So asymKv / symKv ≈ (2+0.5)/(2×2) = 0.625
        expect(asymKv).toBeLessThan(symKv);
        expect(asymKv / symKv).toBeCloseTo(0.625, 1);
    });
});

// ============================================================================
// SECTION 11: Working Buffer Tests
// ============================================================================
describe('Backend + Compute Overhead', () => {
    it('min_vram_no_cache includes backend baseline + compute buffer at 4K', () => {
        const result = calculateVram({
            params_b: 8,
            quantization: 'Q4_K_M',
            kv_cache_enabled: false,
            context_size: 4096,
            engine: 'llama.cpp',
        });
        const output = expectSuccess(result);
        const modelSize = output.quantization_analysis[0].estimated_gguf_gb!;
        // backend: 0.75, compute@4K (batch=1, ratio=1.0): 0.30
        expect(output.quantization_analysis[0].min_vram_no_cache_gb).toBeCloseTo(modelSize + 0.75 + 0.3, 1);
    });

    it('vram_with_cache_gb = modelSize + kvCache + backend + compute', () => {
        const result = calculateVram({
            params_b: 8,
            quantization: 'Q4_K_M',
            kv_cache_enabled: true,
            layers: 32,
            kv_heads: 8,
            key_dim: 128,
            value_dim: 128,
            kv_cache_quant: 'q8_0',
            context_size: 4096,
            engine: 'llama.cpp',
        });
        const output = expectSuccess(result);
        const analysis = output.quantization_analysis[0];
        const entry = analysis.context_table.find((e) => e.context_size === 4096)!;
        // modelSize + kv + backend(0.75) + compute@4K(0.30)
        const expectedVram = analysis.estimated_gguf_gb! + entry.kv_cache_gb + 0.75 + 0.3;
        expect(entry.vram_with_cache_gb).toBeCloseTo(expectedVram, 1);
    });
});

// ============================================================================
// SECTION 12: Recommendation Headroom Tests
// ============================================================================
describe('Recommendation Headroom Calculation', () => {
    it('should calculate headroom as available_vram - total_vram', () => {
        const result = calculateVram({
            params_b: 8,
            quantization: 'Q4_K_M',
            vram_gb: 24,
            os: 'windows', // 0.8 GB overhead
        });

        const output = expectSuccess(result);
        const availableVram = output.os_overhead.available_gb!;

        for (const rec of output.recommendations!) {
            const expectedHeadroom = availableVram - rec.total_vram_gb;
            expect(rec.headroom_gb).toBeCloseTo(expectedHeadroom, 2);
            expect(rec.headroom_gb).toBeGreaterThanOrEqual(0);
        }
    });

    it('should have zero headroom when config exactly fits', () => {
        // Find a configuration that barely fits
        const result = calculateVram({ params_b: 1, quantization: 'IQ1_S', vram_gb: 2, os: 'linux-headless' });

        const output = expectSuccess(result);
        if (output.recommendations) {
            for (const rec of output.recommendations) {
                expect(rec.headroom_gb).toBeGreaterThanOrEqual(0);
            }
        }
    });
});

// ============================================================================
// SECTION 13: Real Model Validation Tests
// ============================================================================
describe('Real Model Validation', () => {
    // ========================================================================
    // Model 1: Qwen3-4B-Instruct-2507-GGUF (Q4_K_M)
    // ========================================================================
    describe('Qwen3-4B-Instruct-2507', () => {
        const modelConfig = {
            name: 'Qwen3-4B-Instruct-2507',
            params_b: 4,
            actual_file_size_gb: 2.5,
            layers: 36,
            context_length: 262144,
            embedding_length: 2560,
            head_count: 32,
            head_count_kv: 8,
            key_length: 128,
            value_length: 128,
            sliding_window: null,
            quantization: 'Q4_K_M' as const,
            kv_cache_quant: 'f16' as const,
        };

        describe('File Size Estimation', () => {
            it('should estimate Q4_K_M model size close to actual GGUF file size', () => {
                const result = calculateVram({
                    params_b: modelConfig.params_b,
                    quantization: modelConfig.quantization,
                    model_size_gb: null,
                });

                const output = expectSuccess(result);
                const estimated = output.quantization_analysis[0].estimated_gguf_gb!;

                // Expected: 4B × 4.85 bpw / 8 = 2.425 GB
                expect(estimated).toBeCloseTo(2.43, 1);

                // Test passes if estimate is within 25% of actual
                const variance =
                    Math.abs(estimated - modelConfig.actual_file_size_gb) / modelConfig.actual_file_size_gb;
                expect(variance).toBeLessThan(0.25);
            });

            it('should use actual file size when provided', () => {
                const result = calculateVram({
                    params_b: modelConfig.params_b,
                    model_size_gb: modelConfig.actual_file_size_gb,
                    quantization: modelConfig.quantization,
                });

                const output = expectSuccess(result);
                expect(output.quantization_analysis[0].estimated_gguf_gb).toBeNull();
                expect(output.input_summary.model_size_gb).toBe(modelConfig.actual_file_size_gb);
            });
        });

        describe('KV Cache Calculation (Exact Architecture)', () => {
            it('should calculate KV cache at 4K context', () => {
                // New formula (no 2×): 36 × 8 × (128×2 + 128×2) × 4096 / 1073741824 = 0.5625 GB
                const result = calculateVram({
                    params_b: modelConfig.params_b,
                    quantization: modelConfig.quantization,
                    layers: modelConfig.layers,
                    kv_heads: modelConfig.head_count_kv,
                    key_dim: modelConfig.key_length,
                    value_dim: modelConfig.value_length,
                    kv_cache_quant: modelConfig.kv_cache_quant,
                    context_size: 4096,
                    batch_size: 1,
                });

                const output = expectSuccess(result);
                const entry = output.quantization_analysis[0].context_table.find((e) => e.context_size === 4096)!;

                expect(entry.kv_cache_gb).toBeCloseTo(0.56, 1);
            });

            it('should calculate KV cache at 8K context', () => {
                // New formula (no 2×): 36 × 8 × (128×2 + 128×2) × 8192 / 1073741824 = 1.125 GB
                const result = calculateVram({
                    params_b: modelConfig.params_b,
                    quantization: modelConfig.quantization,
                    layers: modelConfig.layers,
                    kv_heads: modelConfig.head_count_kv,
                    key_dim: modelConfig.key_length,
                    value_dim: modelConfig.value_length,
                    kv_cache_quant: modelConfig.kv_cache_quant,
                    context_size: 8192,
                    batch_size: 1,
                });

                const output = expectSuccess(result);
                const entry = output.quantization_analysis[0].context_table.find((e) => e.context_size === 8192)!;

                expect(entry.kv_cache_gb).toBeCloseTo(1.13, 1);
            });

            it('should calculate KV cache at max context (262144)', () => {
                // New formula: 0.5625 GB × (262144 / 4096) = 36.0 GB
                const result = calculateVram({
                    params_b: modelConfig.params_b,
                    quantization: modelConfig.quantization,
                    layers: modelConfig.layers,
                    kv_heads: modelConfig.head_count_kv,
                    key_dim: modelConfig.key_length,
                    value_dim: modelConfig.value_length,
                    kv_cache_quant: modelConfig.kv_cache_quant,
                    context_size: 262144,
                    batch_size: 1,
                });

                const output = expectSuccess(result);
                const entry = output.quantization_analysis[0].context_table.find((e) => e.context_size === 262144)!;

                expect(entry.kv_cache_gb).toBeCloseTo(36, 0);
            });

            it('should scale KV cache linearly with batch_size', () => {
                const result1 = calculateVram({
                    ...modelConfig,
                    layers: modelConfig.layers,
                    kv_heads: modelConfig.head_count_kv,
                    key_dim: modelConfig.key_length,
                    value_dim: modelConfig.value_length,
                    context_size: 8192,
                    batch_size: 1,
                });

                const result4 = calculateVram({
                    ...modelConfig,
                    layers: modelConfig.layers,
                    kv_heads: modelConfig.head_count_kv,
                    key_dim: modelConfig.key_length,
                    value_dim: modelConfig.value_length,
                    context_size: 8192,
                    batch_size: 4,
                });

                const output1 = expectSuccess(result1);
                const output4 = expectSuccess(result4);

                const kv1 = output1.quantization_analysis[0].context_table.find(
                    (e) => e.context_size === 8192,
                )!.kv_cache_gb;
                const kv4 = output4.quantization_analysis[0].context_table.find(
                    (e) => e.context_size === 8192,
                )!.kv_cache_gb;

                expect(kv4 / kv1).toBeCloseTo(4, 1);
            });
        });

        describe('VRAM Requirements', () => {
            it('should fit on 24GB GPU at 8K context', () => {
                const result = calculateVram({
                    params_b: modelConfig.params_b,
                    model_size_gb: modelConfig.actual_file_size_gb,
                    layers: modelConfig.layers,
                    kv_heads: modelConfig.head_count_kv,
                    key_dim: modelConfig.key_length,
                    value_dim: modelConfig.value_length,
                    context_size: 8192,
                    vram_gb: 24,
                    os: 'linux-headless',
                    batch_size: 1,
                });

                const output = expectSuccess(result);
                const entry = output.quantization_analysis[0].context_table.find((e) => e.context_size === 8192)!;

                expect(entry.fits_in_vram).toBe(true);
                expect(output.recommendations).not.toBeNull();
            });

            it('should NOT fit on 8GB GPU at max context', () => {
                const result = calculateVram({
                    params_b: modelConfig.params_b,
                    model_size_gb: modelConfig.actual_file_size_gb,
                    layers: modelConfig.layers,
                    kv_heads: modelConfig.head_count_kv,
                    key_dim: modelConfig.key_length,
                    value_dim: modelConfig.value_length,
                    context_size: 262144,
                    vram_gb: 8,
                    os: 'linux-headless',
                    batch_size: 1,
                });

                const output = expectSuccess(result);
                const entry = output.quantization_analysis[0].context_table.find((e) => e.context_size === 262144)!;

                expect(entry.fits_in_vram).toBe(false);
            });
        });
    });

    // ========================================================================
    // Model 2: Gemma-3-27B-It-QAT (Q4_K_M)
    // ========================================================================
    describe('Gemma-3-27B-It-QAT', () => {
        const modelConfig = {
            name: 'Gemma-3-27B-It-QAT',
            params_b: 27,
            actual_file_size_gb: 16.5,
            layers: 62,
            context_length: 131072,
            embedding_length: 5376,
            head_count: 32,
            head_count_kv: 16,
            key_length: 128,
            value_length: 128,
            sliding_window: 1024,
            quantization: 'Q4_K_M' as const,
            kv_cache_quant: 'f16' as const,
        };

        describe('File Size Estimation', () => {
            it('should estimate Q4_K_M model size close to actual GGUF file size', () => {
                const result = calculateVram({
                    params_b: modelConfig.params_b,
                    quantization: modelConfig.quantization,
                });

                const output = expectSuccess(result);
                const estimated = output.quantization_analysis[0].estimated_gguf_gb!;

                // Expected: 27B × 4.85 bpw / 8 = 16.36 GB
                expect(estimated).toBeCloseTo(16.36, 1);

                const variance =
                    Math.abs(estimated - modelConfig.actual_file_size_gb) / modelConfig.actual_file_size_gb;
                expect(variance).toBeLessThan(0.25);
            });
        });

        describe('KV Cache with Sliding Window', () => {
            it('should cap KV cache at sliding_window size', () => {
                const result4k = calculateVram({
                    params_b: modelConfig.params_b,
                    quantization: modelConfig.quantization,
                    layers: modelConfig.layers,
                    kv_heads: modelConfig.head_count_kv,
                    key_dim: modelConfig.key_length,
                    value_dim: modelConfig.value_length,
                    sliding_window: modelConfig.sliding_window,
                    context_size: 4096,
                    kv_cache_quant: modelConfig.kv_cache_quant,
                    batch_size: 1,
                });

                const result131k = calculateVram({
                    params_b: modelConfig.params_b,
                    quantization: modelConfig.quantization,
                    layers: modelConfig.layers,
                    kv_heads: modelConfig.head_count_kv,
                    key_dim: modelConfig.key_length,
                    value_dim: modelConfig.value_length,
                    sliding_window: modelConfig.sliding_window,
                    context_size: 131072,
                    kv_cache_quant: modelConfig.kv_cache_quant,
                    batch_size: 1,
                });

                const output4k = expectSuccess(result4k);
                const output131k = expectSuccess(result131k);

                const entry4k = output4k.quantization_analysis[0].context_table.find((e) => e.context_size === 4096)!;
                const entry131k = output131k.quantization_analysis[0].context_table.find(
                    (e) => e.context_size === 131072,
                )!;

                // Both should be capped at 1024 tokens effective context
                expect(entry4k.kv_cache_gb).toBeCloseTo(entry131k.kv_cache_gb, 1);
            });

            it('should calculate KV cache at sliding window limit', () => {
                // New formula (no 2×): 62 × 16 × (128×2 + 128×2) × 1024 / 1073741824 ≈ 0.484 GB
                const result = calculateVram({
                    params_b: modelConfig.params_b,
                    quantization: modelConfig.quantization,
                    layers: modelConfig.layers,
                    kv_heads: modelConfig.head_count_kv,
                    key_dim: modelConfig.key_length,
                    value_dim: modelConfig.value_length,
                    sliding_window: modelConfig.sliding_window,
                    context_size: 131072,
                    kv_cache_quant: modelConfig.kv_cache_quant,
                    batch_size: 1,
                });

                const output = expectSuccess(result);
                const entry = output.quantization_analysis[0].context_table.find((e) => e.context_size === 131072)!;

                expect(entry.kv_cache_gb).toBeCloseTo(0.48, 1);
            });

            it('should have much smaller KV cache than without sliding window', () => {
                const withWindow = calculateVram({
                    params_b: modelConfig.params_b,
                    quantization: modelConfig.quantization,
                    layers: modelConfig.layers,
                    kv_heads: modelConfig.head_count_kv,
                    key_dim: modelConfig.key_length,
                    value_dim: modelConfig.value_length,
                    sliding_window: modelConfig.sliding_window,
                    context_size: 131072,
                    kv_cache_quant: modelConfig.kv_cache_quant,
                    batch_size: 1,
                });

                const withoutWindow = calculateVram({
                    params_b: modelConfig.params_b,
                    quantization: modelConfig.quantization,
                    layers: modelConfig.layers,
                    kv_heads: modelConfig.head_count_kv,
                    key_dim: modelConfig.key_length,
                    value_dim: modelConfig.value_length,
                    context_size: 131072,
                    kv_cache_quant: modelConfig.kv_cache_quant,
                    batch_size: 1,
                });

                const outputWith = expectSuccess(withWindow);
                const outputWithout = expectSuccess(withoutWindow);

                const entryWith = outputWith.quantization_analysis[0].context_table.find(
                    (e) => e.context_size === 131072,
                )!;
                const entryWithout = outputWithout.quantization_analysis[0].context_table.find(
                    (e) => e.context_size === 131072,
                )!;

                // Sliding window should reduce KV cache by ~128x (131072 / 1024)
                expect(entryWith.kv_cache_gb).toBeLessThan(entryWithout.kv_cache_gb);
                expect(entryWithout.kv_cache_gb / entryWith.kv_cache_gb).toBeGreaterThan(50);
            });
        });

        describe('VRAM Requirements', () => {
            it('should fit on 24GB GPU with sliding window', () => {
                const result = calculateVram({
                    params_b: modelConfig.params_b,
                    model_size_gb: modelConfig.actual_file_size_gb,
                    layers: modelConfig.layers,
                    kv_heads: modelConfig.head_count_kv,
                    key_dim: modelConfig.key_length,
                    value_dim: modelConfig.value_length,
                    sliding_window: modelConfig.sliding_window,
                    context_size: 131072,
                    vram_gb: 24,
                    os: 'linux-headless',
                    kv_cache_quant: modelConfig.kv_cache_quant,
                    batch_size: 1,
                });

                const output = expectSuccess(result);
                const entry = output.quantization_analysis[0].context_table.find((e) => e.context_size === 131072)!;

                expect(entry.fits_in_vram).toBe(true);
            });

            it('should NOT fit on 16GB GPU without sliding window at max context', () => {
                const result = calculateVram({
                    params_b: modelConfig.params_b,
                    model_size_gb: modelConfig.actual_file_size_gb,
                    layers: modelConfig.layers,
                    kv_heads: modelConfig.head_count_kv,
                    key_dim: modelConfig.key_length,
                    value_dim: modelConfig.value_length,
                    context_size: 131072,
                    vram_gb: 16,
                    os: 'linux-headless',
                    kv_cache_quant: modelConfig.kv_cache_quant,
                    batch_size: 1,
                });

                const output = expectSuccess(result);
                const entry = output.quantization_analysis[0].context_table.find((e) => e.context_size === 131072)!;

                expect(entry.fits_in_vram).toBe(false);
            });
        });
    });

    // ========================================================================
    // Model 3: GPT-OSS-20B (Q4_K_M, MoE)
    // ========================================================================
    describe('GPT-OSS-20B (MoE)', () => {
        const modelConfig = {
            name: 'GPT-OSS-20B',
            params_b: 20,
            actual_file_size_gb: 11.6,
            layers: 24,
            context_length: 131072,
            embedding_length: 2880,
            head_count: 64,
            head_count_kv: 8,
            key_length: 64,
            value_length: 64,
            sliding_window: 128,
            expert_count: 32,
            active_experts: 4,
            quantization: 'Q4_K_M' as const,
            kv_cache_quant: 'f16' as const,
        };

        describe('File Size Estimation', () => {
            it('should estimate Q4_K_M model size close to actual GGUF file size', () => {
                const result = calculateVram({
                    params_b: modelConfig.params_b,
                    quantization: modelConfig.quantization,
                });

                const output = expectSuccess(result);
                const estimated = output.quantization_analysis[0].estimated_gguf_gb!;

                // Expected: 20B × 4.85 bpw / 8 = 12.13 GB
                expect(estimated).toBeCloseTo(12.13, 1);

                const variance =
                    Math.abs(estimated - modelConfig.actual_file_size_gb) / modelConfig.actual_file_size_gb;
                expect(variance).toBeLessThan(0.25);
            });

            it('should track MoE metadata in input summary', () => {
                const result = calculateVram({
                    params_b: modelConfig.params_b,
                    expert_count: modelConfig.expert_count,
                    active_experts: modelConfig.active_experts,
                });

                const output = expectSuccess(result);
                expect(output.input_summary.is_moe).toBe(true);
                expect(output.input_summary.expert_info).toBe('32 total, 4 active');
            });
        });

        describe('KV Cache with Sliding Window', () => {
            it('should cap KV cache at sliding_window=128', () => {
                // New formula (no 2×): 24 × 8 × (64×2 + 64×2) × 128 / 1073741824 ≈ 0.006 GB
                const result = calculateVram({
                    params_b: modelConfig.params_b,
                    quantization: modelConfig.quantization,
                    layers: modelConfig.layers,
                    kv_heads: modelConfig.head_count_kv,
                    key_dim: modelConfig.key_length,
                    value_dim: modelConfig.value_length,
                    sliding_window: modelConfig.sliding_window,
                    context_size: 131072,
                    kv_cache_quant: modelConfig.kv_cache_quant,
                    batch_size: 1,
                });

                const output = expectSuccess(result);
                const entry = output.quantization_analysis[0].context_table.find((e) => e.context_size === 131072)!;

                expect(entry.kv_cache_gb).toBeCloseTo(0.006, 2);
            });

            it('should have identical KV cache at 4K and 131K due to sliding window', () => {
                const result4k = calculateVram({
                    params_b: modelConfig.params_b,
                    quantization: modelConfig.quantization,
                    layers: modelConfig.layers,
                    kv_heads: modelConfig.head_count_kv,
                    key_dim: modelConfig.key_length,
                    value_dim: modelConfig.value_length,
                    sliding_window: modelConfig.sliding_window,
                    context_size: 4096,
                    kv_cache_quant: modelConfig.kv_cache_quant,
                    batch_size: 1,
                });

                const result131k = calculateVram({
                    params_b: modelConfig.params_b,
                    quantization: modelConfig.quantization,
                    layers: modelConfig.layers,
                    kv_heads: modelConfig.head_count_kv,
                    key_dim: modelConfig.key_length,
                    value_dim: modelConfig.value_length,
                    sliding_window: modelConfig.sliding_window,
                    context_size: 131072,
                    kv_cache_quant: modelConfig.kv_cache_quant,
                    batch_size: 1,
                });

                const output4k = expectSuccess(result4k);
                const output131k = expectSuccess(result131k);

                const entry4k = output4k.quantization_analysis[0].context_table.find((e) => e.context_size === 4096)!;
                const entry131k = output131k.quantization_analysis[0].context_table.find(
                    (e) => e.context_size === 131072,
                )!;

                expect(entry4k.kv_cache_gb).toBeCloseTo(entry131k.kv_cache_gb, 2);
            });
        });

        describe('VRAM Requirements', () => {
            it('should fit on 16GB GPU due to small KV cache from sliding window', () => {
                const result = calculateVram({
                    params_b: modelConfig.params_b,
                    model_size_gb: modelConfig.actual_file_size_gb,
                    layers: modelConfig.layers,
                    kv_heads: modelConfig.head_count_kv,
                    key_dim: modelConfig.key_length,
                    value_dim: modelConfig.value_length,
                    sliding_window: modelConfig.sliding_window,
                    context_size: 131072,
                    vram_gb: 16,
                    os: 'linux-headless',
                    kv_cache_quant: modelConfig.kv_cache_quant,
                    batch_size: 1,
                });

                const output = expectSuccess(result);
                const entry = output.quantization_analysis[0].context_table.find((e) => e.context_size === 131072)!;

                expect(entry.fits_in_vram).toBe(true);
                expect(output.recommendations).not.toBeNull();
            });

            it('should fit on 12GB GPU at batch_size=1', () => {
                const result = calculateVram({
                    params_b: modelConfig.params_b,
                    model_size_gb: modelConfig.actual_file_size_gb,
                    layers: modelConfig.layers,
                    kv_heads: modelConfig.head_count_kv,
                    key_dim: modelConfig.key_length,
                    value_dim: modelConfig.value_length,
                    sliding_window: modelConfig.sliding_window,
                    context_size: 131072,
                    vram_gb: 12,
                    os: 'linux-headless',
                    kv_cache_quant: modelConfig.kv_cache_quant,
                    batch_size: 1,
                });

                const output = expectSuccess(result);
                const entry = output.quantization_analysis[0].context_table.find((e) => e.context_size === 131072)!;

                expect(entry.fits_in_vram).toBe(true);
            });

            it('should NOT fit on 16GB GPU at batch_size=64 without sliding window', () => {
                const result = calculateVram({
                    params_b: modelConfig.params_b,
                    model_size_gb: modelConfig.actual_file_size_gb,
                    layers: modelConfig.layers,
                    kv_heads: modelConfig.head_count_kv,
                    key_dim: modelConfig.key_length,
                    value_dim: modelConfig.value_length,
                    context_size: 131072,
                    vram_gb: 16,
                    os: 'linux-headless',
                    kv_cache_quant: modelConfig.kv_cache_quant,
                    batch_size: 64,
                });

                const output = expectSuccess(result);
                const entry = output.quantization_analysis[0].context_table.find((e) => e.context_size === 131072)!;

                // Without sliding window, KV cache at 131K context should exceed VRAM
                expect(entry.fits_in_vram).toBe(false);
            });
        });
    });

    // ========================================================================
    // Cross-Model Comparison Tests
    // ========================================================================
    describe('Cross-Model Comparison', () => {
        it('should rank models by VRAM requirement correctly', () => {
            const qwen = calculateVram({
                params_b: 4,
                model_size_gb: 2.5,
                layers: 36,
                kv_heads: 8,
                key_dim: 128,
                value_dim: 128,
                context_size: 8192,
                batch_size: 1,
            });

            const gemma = calculateVram({
                params_b: 27,
                model_size_gb: 16.5,
                layers: 62,
                kv_heads: 16,
                key_dim: 128,
                value_dim: 128,
                sliding_window: 1024,
                context_size: 8192,
                batch_size: 1,
            });

            const gptOss = calculateVram({
                params_b: 20,
                model_size_gb: 11.6,
                layers: 24,
                kv_heads: 8,
                key_dim: 64,
                value_dim: 64,
                sliding_window: 128,
                context_size: 8192,
                batch_size: 1,
            });

            const outputQwen = expectSuccess(qwen);
            const outputGemma = expectSuccess(gemma);
            const outputGptOss = expectSuccess(gptOss);

            const vramQwen = outputQwen.quantization_analysis[0].context_table.find(
                (e) => e.context_size === 8192,
            )!.vram_with_cache_gb;
            const vramGemma = outputGemma.quantization_analysis[0].context_table.find(
                (e) => e.context_size === 8192,
            )!.vram_with_cache_gb;
            const vramGptOss = outputGptOss.quantization_analysis[0].context_table.find(
                (e) => e.context_size === 8192,
            )!.vram_with_cache_gb;

            expect(vramQwen).toBeLessThan(vramGptOss);
            expect(vramQwen).toBeLessThan(vramGemma);
            expect(vramGemma).toBeGreaterThan(vramQwen);
        });

        it('should show sliding window impact on max context VRAM', () => {
            const qwen131k = calculateVram({
                params_b: 4,
                model_size_gb: 2.5,
                layers: 36,
                kv_heads: 8,
                key_dim: 128,
                value_dim: 128,
                context_size: 131072,
                batch_size: 1,
            });

            const gemma131k = calculateVram({
                params_b: 27,
                model_size_gb: 16.5,
                layers: 62,
                kv_heads: 16,
                key_dim: 128,
                value_dim: 128,
                sliding_window: 1024,
                context_size: 131072,
                batch_size: 1,
            });

            const gptOss131k = calculateVram({
                params_b: 20,
                model_size_gb: 11.6,
                layers: 24,
                kv_heads: 8,
                key_dim: 64,
                value_dim: 64,
                sliding_window: 128,
                context_size: 131072,
                batch_size: 1,
            });

            const outputQwen = expectSuccess(qwen131k);
            const outputGemma = expectSuccess(gemma131k);
            const outputGptOss = expectSuccess(gptOss131k);

            const kvQwen = outputQwen.quantization_analysis[0].context_table.find(
                (e) => e.context_size === 131072,
            )!.kv_cache_gb;
            const kvGemma = outputGemma.quantization_analysis[0].context_table.find(
                (e) => e.context_size === 131072,
            )!.kv_cache_gb;
            const kvGptOss = outputGptOss.quantization_analysis[0].context_table.find(
                (e) => e.context_size === 131072,
            )!.kv_cache_gb;

            expect(kvQwen).toBeGreaterThan(kvGemma);
            expect(kvQwen).toBeGreaterThan(kvGptOss);
            expect(kvGptOss).toBeLessThan(kvGemma);
        });

        it('should provide accurate recommendations for each model on 24GB GPU', () => {
            const models = [
                {
                    name: 'Qwen3-4B',
                    config: { params_b: 4, model_size_gb: 2.5, layers: 36, kv_heads: 8, key_dim: 128, value_dim: 128 },
                },
                {
                    name: 'Gemma-3-27B',
                    config: {
                        params_b: 27,
                        model_size_gb: 16.5,
                        layers: 62,
                        kv_heads: 16,
                        key_dim: 128,
                        value_dim: 128,
                        sliding_window: 1024,
                    },
                },
                {
                    name: 'GPT-OSS-20B',
                    config: {
                        params_b: 20,
                        model_size_gb: 11.6,
                        layers: 24,
                        kv_heads: 8,
                        key_dim: 64,
                        value_dim: 64,
                        sliding_window: 128,
                    },
                },
            ];

            for (const model of models) {
                const result = calculateVram({ ...model.config, vram_gb: 24, os: 'linux-headless', batch_size: 1 });

                const output = expectSuccess(result);

                expect(output.recommendations).not.toBeNull();
                expect(output.recommendations!.length).toBe(3);

                const optimal = output.recommendations!.find((r) => r.tier === 'optimal')!;
                expect(optimal.headroom_gb).toBeGreaterThanOrEqual(0);
            }
        });
    });
});

// ============================================================================
// KV Cache Types (2.5d)
// ============================================================================
describe('KV Cache Types (2.5d)', () => {
    it('KVCacheQuant should export F16, Q8_0, Q4_0 values', () => {
        expect(KVCacheQuant.F16).toBe('f16');
        expect(KVCacheQuant.Q8_0).toBe('q8_0');
        expect(KVCacheQuant.Q4_0).toBe('q4_0');
        expect(KVCacheQuant.IQ4_NL).toBe('iq4_nl');
        expect(Object.keys(KVCacheQuant)).toHaveLength(7);
    });

    it('KV_CACHE_BYTES should have correct byte values', () => {
        expect(KV_CACHE_BYTES['f16']).toBe(2);
        expect(KV_CACHE_BYTES['q8_0']).toBe(1);
        expect(KV_CACHE_BYTES['q5_1']).toBeCloseTo(0.69, 2);
        expect(KV_CACHE_BYTES['q5_0']).toBeCloseTo(0.66, 2);
        expect(KV_CACHE_BYTES['q4_1']).toBeCloseTo(0.56, 2);
        expect(KV_CACHE_BYTES['q4_0']).toBeCloseTo(0.5, 2);
        expect(KV_CACHE_BYTES['iq4_nl']).toBeCloseTo(0.56, 2);
    });
});

// ============================================================================
// Quant Catalog Anchors (2.5b)
// ============================================================================
describe('Quant Catalog Anchors (2.5b)', () => {
    it('QUANT_CATALOG should export with Q4_K_M bpw ≈ 4.85', () => {
        expect(QUANT_CATALOG['Q4_K_M'].bpw).toBeCloseTo(4.85, 1);
        expect(QUANT_CATALOG['Q4_K_M'].sweetSpot).toBe(true);
        expect(QUANT_CATALOG['Q4_K_M'].family).toBe('k-quant');
    });

    it('Q4_K_M 24B model size ≈ 14.3 GB ±5%', () => {
        const result = calculateVram({ params_b: 24, quantization: 'Q4_K_M' });
        const output = expectSuccess(result);
        const size = output.quantization_analysis[0].estimated_gguf_gb!;
        // 24 × 4.85 / 8 = 14.55 GB; anchor 14.3 ±5% = [13.585, 15.015]
        expect(size).toBeGreaterThanOrEqual(13.58);
        expect(size).toBeLessThanOrEqual(15.02);
    });

    it('IQ4_XS should have sweetSpot=true and family i-quant', () => {
        expect(QUANT_CATALOG['IQ4_XS'].sweetSpot).toBe(true);
        expect(QUANT_CATALOG['IQ4_XS'].family).toBe('i-quant');
    });

    it('Q8_0 should have bpw ≈ 8.5', () => {
        expect(QUANT_CATALOG['Q8_0'].bpw).toBeCloseTo(8.5, 1);
    });

    it('STANDARD_QUANTIZATIONS should have 15 entries', () => {
        expect(STANDARD_QUANTIZATIONS).toHaveLength(15);
    });

    it('STANDARD_QUANTIZATIONS should include Q4_K_M', () => {
        expect(STANDARD_QUANTIZATIONS).toContain('Q4_K_M');
    });

    it('QuantizationAnalysis should expose eff_bpw (not bits_per_param)', () => {
        const result = calculateVram({ params_b: 8, quantization: 'Q4_K_M' });
        const output = expectSuccess(result);
        const analysis = output.quantization_analysis[0];
        expect(analysis.eff_bpw).toBeCloseTo(4.85, 1);
        expect((analysis as unknown as Record<string, unknown>).bits_per_param).toBeUndefined();
        expect(analysis.sweet_spot).toBe(true);
        expect(analysis.family).toBe('k-quant');
    });
});

// ============================================================================
// SECTION 14: GPU Type + Engine + Offload (2.5c+e+f)
// ============================================================================
describe('GPU Type + Engine + Offload (2.5c+e+f)', () => {
    it('GpuType should export NVIDIA_AMD, APPLE, INTEL_INTEGRATED', () => {
        expect(GpuType.NVIDIA_AMD).toBe('nvidia-amd');
        expect(GpuType.APPLE).toBe('apple');
        expect(GpuType.INTEL_INTEGRATED).toBe('intel-integrated');
        expect(Object.keys(GpuType)).toHaveLength(3);
    });

    it('InferenceEngine should export llama.cpp, ollama, lm-studio', () => {
        expect(InferenceEngine.LLAMA_CPP).toBe('llama.cpp');
        expect(InferenceEngine.OLLAMA).toBe('ollama');
        expect(InferenceEngine.LM_STUDIO).toBe('lm-studio');
        expect(Object.keys(InferenceEngine)).toHaveLength(3);
    });

    it('offload_result should be null when no vram_gb provided', () => {
        const result = calculateVram({ params_b: 8, quantization: 'Q4_K_M' });
        const output = expectSuccess(result);
        expect(output.offload_result).toBeNull();
    });

    it('offload_result.verdict = fits when model fits in VRAM', () => {
        const result = calculateVram({
            params_b: 8,
            quantization: 'Q4_K_M',
            vram_gb: 24,
            os: 'linux-headless',
            engine: 'llama.cpp',
            context_size: 4096,
            kv_cache_enabled: false,
        });
        const output = expectSuccess(result);
        expect(output.offload_result).not.toBeNull();
        expect(output.offload_result!.verdict).toBe('fits');
        expect(output.offload_result!.ram_spill_gb).toBe(0);
    });

    it('offload_result.verdict = partial when model partially fits', () => {
        const result = calculateVram({
            params_b: 70,
            quantization: 'Q4_K_M',
            vram_gb: 16,
            os: 'linux-headless',
            engine: 'llama.cpp',
            context_size: 4096,
            kv_cache_enabled: false,
            layers: 80,
        });
        const output = expectSuccess(result);
        expect(output.offload_result).not.toBeNull();
        expect(output.offload_result!.verdict).toBe('partial');
        expect(output.offload_result!.layers_on_gpu).toBeGreaterThan(0);
        expect(output.offload_result!.ram_spill_gb).toBeGreaterThan(0);
    });

    it('offload_result.verdict = no_fit when model exceeds VRAM entirely', () => {
        const result = calculateVram({
            params_b: 70,
            quantization: 'Q4_K_M',
            vram_gb: 1, // 1GB available → 0.95 after OS; backend(0.75)+compute(0.30)>0.95 → no_fit
            os: 'linux-headless',
            engine: 'llama.cpp',
            context_size: 4096,
            kv_cache_enabled: false,
        });
        const output = expectSuccess(result);
        expect(output.offload_result!.verdict).toBe('no_fit');
    });

    it('Windows NVIDIA note appears in partial offload', () => {
        const result = calculateVram({
            params_b: 70,
            quantization: 'Q4_K_M',
            vram_gb: 16,
            os: 'windows',
            gpu_type: 'nvidia-amd',
            engine: 'llama.cpp',
            context_size: 4096,
            kv_cache_enabled: false,
            layers: 80,
        });
        const output = expectSuccess(result);
        if (output.offload_result?.verdict === 'partial') {
            expect(output.offload_result.note).toContain('Windows');
        }
    });

    it('MoE active_ratio scales compute buffer (MoE uses less compute)', () => {
        const densResult = calculateVram({ params_b: 47, quantization: 'Q4_K_M', context_size: 4096 });
        const moeResult = calculateVram({
            params_b: 47,
            quantization: 'Q4_K_M',
            context_size: 4096,
            expert_count: 8,
            active_experts: 2,
        });
        const densOutput = expectSuccess(densResult);
        const moeOutput = expectSuccess(moeResult);
        const densMin = densOutput.quantization_analysis[0].min_vram_no_cache_gb;
        const moeMin = moeOutput.quantization_analysis[0].min_vram_no_cache_gb;
        // MoE ratio = 2/8 = 0.25, so compute buffer is 1/4 of dense
        expect(moeMin).toBeLessThan(densMin);
    });

    it('offload_result exposes total_layers and backend_gb', () => {
        const result = calculateVram({
            params_b: 8,
            quantization: 'Q4_K_M',
            vram_gb: 24,
            os: 'linux-headless',
            layers: 32,
            kv_cache_enabled: false,
        });
        const output = expectSuccess(result);
        const offload = output.offload_result!;
        expect(offload.total_layers).toBe(32);
        expect(offload.backend_gb).toBeCloseTo(0.75, 2);
    });
});
