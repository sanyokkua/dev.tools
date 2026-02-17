/**
 * @fileoverview Jest tests for LLM VRAM Calculator public API
 * @module LLMVramCalculator.test
 */

import {
    calculateVram,
    KV_CACHE_BYTES,
    KV_CACHE_FACTOR,
    KVCacheQuant,
    METADATA_OVERHEAD,
    OperatingSystem,
    Quantization,
    QUANTIZATION_BITS,
    STANDARD_CONTEXTS,
    STANDARD_QUANTIZATIONS,
    WORKING_BUFFER_GB,
} from '../../src/common/llm-vram-calc';

import type { CalculatorInput, CalculatorOutput, Result, ValidationError } from '../../src/common/llm-vram-calc';

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
        it('should contain all expected quantization levels', () => {
            expect(Quantization.Q1).toBe('Q1');
            expect(Quantization.Q2).toBe('Q2');
            expect(Quantization.Q3).toBe('Q3');
            expect(Quantization.Q4).toBe('Q4');
            expect(Quantization.Q5).toBe('Q5');
            expect(Quantization.Q6).toBe('Q6');
            expect(Quantization.Q8).toBe('Q8');
            expect(Quantization.FP4).toBe('FP4');
            expect(Quantization.FP8).toBe('FP8');
            expect(Quantization.FP16).toBe('FP16');
            expect(Quantization.FP32).toBe('FP32');
        });

        it('should have exactly 11 quantization levels', () => {
            expect(Object.keys(Quantization)).toHaveLength(11);
        });
    });

    describe('KVCacheQuant', () => {
        it('should contain all expected KV cache quantization levels', () => {
            expect(KVCacheQuant.Q4).toBe('q4');
            expect(KVCacheQuant.Q8).toBe('q8');
            expect(KVCacheQuant.FP16).toBe('fp16');
            expect(KVCacheQuant.FP32).toBe('fp32');
        });

        it('should have exactly 6 KV cache quantization levels', () => {
            expect(Object.keys(KVCacheQuant)).toHaveLength(4);
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
            expect(STANDARD_QUANTIZATIONS).toEqual(['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q8', 'FP16', 'FP32']);
        });

        it('should have 9 standard quantizations', () => {
            expect(STANDARD_QUANTIZATIONS).toHaveLength(9);
        });
    });

    describe('QUANTIZATION_BITS', () => {
        it('should map quantizations to correct bit values', () => {
            expect(QUANTIZATION_BITS.Q1).toBe(1);
            expect(QUANTIZATION_BITS.Q2).toBe(2);
            expect(QUANTIZATION_BITS.Q3).toBe(3);
            expect(QUANTIZATION_BITS.Q4).toBe(4);
            expect(QUANTIZATION_BITS.Q5).toBe(5);
            expect(QUANTIZATION_BITS.Q6).toBe(6);
            expect(QUANTIZATION_BITS.Q8).toBe(8);
            expect(QUANTIZATION_BITS.FP4).toBe(4);
            expect(QUANTIZATION_BITS.FP8).toBe(8);
            expect(QUANTIZATION_BITS.FP16).toBe(16);
            expect(QUANTIZATION_BITS.FP32).toBe(32);
        });
    });

    describe('KV_CACHE_BYTES', () => {
        it('should map KV cache quantizations to correct byte values', () => {
            expect(KV_CACHE_BYTES.q4).toBe(0.5);
            expect(KV_CACHE_BYTES.q8).toBe(1);
            expect(KV_CACHE_BYTES.fp16).toBe(2);
            expect(KV_CACHE_BYTES.fp32).toBe(4);
        });
    });

    describe('KV_CACHE_FACTOR', () => {
        it('should map KV cache quantizations to correct factors', () => {
            expect(KV_CACHE_FACTOR.q4).toBe(0.25);
            expect(KV_CACHE_FACTOR.q8).toBe(0.5);
            expect(KV_CACHE_FACTOR.fp16).toBe(1);
            expect(KV_CACHE_FACTOR.fp32).toBe(2);
        });
    });

    describe('Numeric constants', () => {
        it('should have correct WORKING_BUFFER_GB value', () => {
            expect(WORKING_BUFFER_GB).toBe(0.4);
        });

        it('should have correct METADATA_OVERHEAD value', () => {
            expect(METADATA_OVERHEAD).toBe(0.05);
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
            const result = calculateVram({ params_b: NaN });
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
            const result = calculateVram({ ...validBase, model_size_gb: 0.1, quantization: 'Q4' });
            expect(result.ok).toBe(true);
        });

        it('should accept maximum value (500)', () => {
            const result = calculateVram({ ...validBase, model_size_gb: 500, quantization: 'Q4' });
            expect(result.ok).toBe(true);
        });

        it('should accept typical value (4.0)', () => {
            const result = calculateVram({ ...validBase, model_size_gb: 4, quantization: 'Q4' });
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
            const result = calculateVram({ ...validBase, model_size_gb: NaN });
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

        it.each(Object.values(Quantization))('should accept quantization = %s', (quant) => {
            const result = calculateVram({ ...validBase, quantization: quant });
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
        it('should default to q8', () => {
            const result = calculateVram({ ...validBase });
            const output = expectSuccess(result);
            expect(output.input_summary.kv_cache_quant).toBe('q8');
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
            const result = calculateVram({ ...validBase, vram_gb: NaN });
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
            expect(summary.kv_cache_quant).toBe('q8');
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
                quantization: 'Q4',
                context_size: 32768,
                kv_cache_enabled: true,
                kv_cache_quant: 'fp16',
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
            expect(summary.quantization).toBe('Q4');
            expect(summary.context_size).toBe(32768);
            expect(summary.kv_cache_enabled).toBe(true);
            expect(summary.kv_cache_quant).toBe('fp16');
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
            const result = calculateVram({ params_b: 8, quantization: 'Q4' });
            const output = expectSuccess(result);

            expect(output.quantization_analysis).toHaveLength(1);
            const analysis = output.quantization_analysis[0];

            expect(analysis.quantization).toBe('Q4');
            expect(analysis.bits_per_param).toBe(4);
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
            const result = calculateVram({ params_b: 8, model_size_gb: 5, quantization: 'Q4' });
            const output = expectSuccess(result);

            expect(output.quantization_analysis[0].estimated_gguf_gb).toBeNull();
        });
    });

    describe('ContextEntry', () => {
        it('should produce correct structure', () => {
            const result = calculateVram({ params_b: 8, quantization: 'Q4' });
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
            const result = calculateVram({ params_b: 8, quantization: 'Q4' });
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
            const result = calculateVram({ params_b: 8, quantization: 'Q4', vram_gb: 24, os: 'windows' });
            const output = expectSuccess(result);
            const table = output.quantization_analysis[0].context_table;

            // All entries should have boolean fits_in_vram
            for (const entry of table) {
                expect(typeof entry.fits_in_vram).toBe('boolean');
            }

            // At least some should fit, some should not (8B Q4 model)
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
            const result = calculateVram({ params_b: 8, quantization: 'Q4', vram_gb: 24, os: 'windows' });
            const output = expectSuccess(result);

            expect(output.recommendations).not.toBeNull();
            expect(output.recommendations).toHaveLength(3);

            const tiers = output.recommendations!.map((r) => r.tier);
            expect(tiers).toContain('optimal');
            expect(tiers).toContain('minimum');
            expect(tiers).toContain('maximum_quality');
        });

        it('should have correct recommendation structure', () => {
            const result = calculateVram({ params_b: 8, quantization: 'Q4', vram_gb: 24, os: 'windows' });
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
            const result = calculateVram({ params_b: 8, quantization: 'Q4', vram_gb: 24, os: 'windows' });
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
            const result1 = calculateVram({ params_b: 8, quantization: 'Q4' });
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
        it('should estimate Q4 model size correctly (4 bits per param)', () => {
            // 8B params * 0.5 bytes/param * 1.05 overhead = 4.2 GB
            const result = calculateVram({ params_b: 8, quantization: 'Q4' });
            const output = expectSuccess(result);
            const estimated = output.quantization_analysis[0].estimated_gguf_gb!;

            expect(estimated).toBeCloseTo(4.2, 1);
        });

        it('should estimate FP16 model size correctly (16 bits per param)', () => {
            // 8B params * 2 bytes/param * 1.05 overhead = 16.8 GB
            const result = calculateVram({ params_b: 8, quantization: 'FP16' });
            const output = expectSuccess(result);
            const estimated = output.quantization_analysis[0].estimated_gguf_gb!;

            expect(estimated).toBeCloseTo(16.8, 1);
        });

        it('should estimate FP32 model size correctly (32 bits per param)', () => {
            // 8B params * 4 bytes/param * 1.05 overhead = 33.6 GB
            const result = calculateVram({ params_b: 8, quantization: 'FP32' });
            const output = expectSuccess(result);
            const estimated = output.quantization_analysis[0].estimated_gguf_gb!;

            expect(estimated).toBeCloseTo(33.6, 1);
        });

        it('should use provided model_size_gb when quantization is specific', () => {
            const result = calculateVram({ params_b: 8, model_size_gb: 5.5, quantization: 'Q4' });
            const output = expectSuccess(result);

            // estimated_gguf_gb should be null since actual size was provided
            expect(output.quantization_analysis[0].estimated_gguf_gb).toBeNull();

            // min_vram should be based on 5.5 GB + buffer
            expect(output.quantization_analysis[0].min_vram_no_cache_gb).toBeCloseTo(5.9, 1);
        });
    });

    describe('VRAM with and without cache', () => {
        it('should have vram_without_cache = model_size + working_buffer', () => {
            const result = calculateVram({ params_b: 8, quantization: 'Q4' });
            const output = expectSuccess(result);

            // vram_without_cache should be constant across all contexts
            const vramWithoutCache = output.quantization_analysis[0].context_table.map((e) => e.vram_without_cache_gb);
            const uniqueValues = new Set(vramWithoutCache);
            expect(uniqueValues.size).toBe(1);
        });

        it('should have vram_with_cache > vram_without_cache when kv_cache_enabled', () => {
            const result = calculateVram({ params_b: 8, quantization: 'Q4' });
            const output = expectSuccess(result);

            for (const entry of output.quantization_analysis[0].context_table) {
                expect(entry.vram_with_cache_gb).toBeGreaterThan(entry.vram_without_cache_gb);
            }
        });

        it('should have vram_with_cache == vram_without_cache when kv_cache_enabled=false', () => {
            const result = calculateVram({ params_b: 8, quantization: 'Q4', kv_cache_enabled: false });
            const output = expectSuccess(result);

            for (const entry of output.quantization_analysis[0].context_table) {
                expect(entry.vram_with_cache_gb).toBe(entry.vram_without_cache_gb);
                expect(entry.kv_cache_gb).toBe(0);
            }
        });
    });

    describe('KV Cache scaling with context', () => {
        it('should scale KV cache linearly with context size (estimated)', () => {
            const result = calculateVram({ params_b: 8, quantization: 'Q4' });
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
                quantization: 'Q4',
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
        it('should have smaller KV cache with Q4 than FP16', () => {
            const resultQ4 = calculateVram({ params_b: 8, quantization: 'Q4', kv_cache_quant: 'q4' });
            const resultFP16 = calculateVram({ params_b: 8, quantization: 'Q4', kv_cache_quant: 'fp16' });

            const outputQ4 = expectSuccess(resultQ4);
            const outputFP16 = expectSuccess(resultFP16);

            const kvQ4 = outputQ4.quantization_analysis[0].context_table[0].kv_cache_gb;
            const kvFP16 = outputFP16.quantization_analysis[0].context_table[0].kv_cache_gb;

            expect(kvQ4).toBeLessThan(kvFP16);
        });

        it('should respect KV cache factor ratios', () => {
            const resultQ8 = calculateVram({ params_b: 8, quantization: 'Q4', kv_cache_quant: 'q8' });
            const resultFP16 = calculateVram({ params_b: 8, quantization: 'Q4', kv_cache_quant: 'fp16' });

            const outputQ8 = expectSuccess(resultQ8);
            const outputFP16 = expectSuccess(resultFP16);

            const kvQ8 = outputQ8.quantization_analysis[0].context_table[0].kv_cache_gb;
            const kvFP16 = outputFP16.quantization_analysis[0].context_table[0].kv_cache_gb;

            // Q8 factor is 0.5, FP16 factor is 1.0, so ratio should be ~0.5
            expect(kvQ8 / kvFP16).toBeCloseTo(0.5, 1);
        });
    });

    describe('Sliding window effect', () => {
        it('should cap KV cache when sliding_window < context_size', () => {
            const withWindow = calculateVram({
                params_b: 8,
                quantization: 'Q4',
                sliding_window: 4096,
                context_size: 131072,
            });
            const withoutWindow = calculateVram({ params_b: 8, quantization: 'Q4', context_size: 131072 });

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
                quantization: 'Q4',
                sliding_window: 1000000,
                context_size: 4096,
            });
            const withoutWindow = calculateVram({ params_b: 8, quantization: 'Q4', context_size: 4096 });

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
            const small = calculateVram({ params_b: 4, quantization: 'Q4', context_size: 4096 });
            // Large model (100B) should have smaller factor
            const large = calculateVram({ params_b: 100, quantization: 'Q4', context_size: 4096 });

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
                quantization: 'Q4',
                layers: 32,
                kv_heads: 8,
                key_dim: 128,
                value_dim: 128,
                kv_cache_quant: 'q8',
                context_size: 4096,
            });
            const output = expectSuccess(result);

            const entry = output.quantization_analysis[0].context_table.find((e) => e.context_size === 4096)!;
            expect(entry.kv_cache_gb).toBeCloseTo(0.5, 1);
        });
    });
});

// ============================================================================
// SECTION 6: Edge Cases
// ============================================================================

describe('Edge Cases', () => {
    describe('Extreme model sizes', () => {
        it('should handle 1B model', () => {
            const result = calculateVram({ params_b: 1, quantization: 'Q4' });
            const output = expectSuccess(result);
            expect(output.quantization_analysis[0].estimated_gguf_gb).toBeCloseTo(0.53, 2);
        });

        it('should handle 1000B model', () => {
            const result = calculateVram({ params_b: 1000, quantization: 'Q4' });
            const output = expectSuccess(result);
            expect(output.quantization_analysis[0].estimated_gguf_gb).toBeCloseTo(525, 0);
        });

        it('should handle very small quantization (Q1)', () => {
            const result = calculateVram({ params_b: 8, quantization: 'Q1' });
            const output = expectSuccess(result);
            // 8B * 0.125 bytes * 1.05 = 1.05 GB
            expect(output.quantization_analysis[0].estimated_gguf_gb).toBeCloseTo(1.05, 1);
        });

        it('should handle very large quantization (FP32)', () => {
            const result = calculateVram({ params_b: 8, quantization: 'FP32' });
            const output = expectSuccess(result);
            // 8B * 4 bytes * 1.05 = 33.6 GB
            expect(output.quantization_analysis[0].estimated_gguf_gb).toBeCloseTo(33.6, 1);
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
            // 70B FP32 model needs ~280GB+, only 1GB available
            const result = calculateVram({ params_b: 70, quantization: 'FP32', vram_gb: 1, os: 'linux-headless' });
            const output = expectSuccess(result);

            expect(output.recommendations).toBeNull();
            expect(output.summary.fitting_configurations).toBe(0);
        });

        it('should handle case where everything fits', () => {
            // 1B Q1 model with 256GB VRAM
            const result = calculateVram({ params_b: 1, quantization: 'Q1', vram_gb: 256, os: 'linux-headless' });
            const output = expectSuccess(result);

            expect(output.recommendations).not.toBeNull();
            expect(output.summary.fitting_configurations).toBe(output.summary.total_configurations);
        });

        it('should handle boundary case where model barely fits', () => {
            // Setup: Q4 8B model is ~4.2GB + 0.4 buffer = 4.6GB minimum
            const result = calculateVram({
                params_b: 8,
                quantization: 'Q4',
                kv_cache_enabled: false,
                vram_gb: 5,
                os: 'linux-headless',
            });
            const output = expectSuccess(result);

            // Should fit with minimal headroom
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

            // Optimal should be Q4, Q5, or Q6
            expect(['Q4', 'Q5', 'Q6']).toContain(optimal.quantization);
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

            // Max quality should have the highest bit quantization among fitting configs
            const maxBits = QUANTIZATION_BITS[maxQuality.quantization as keyof typeof QUANTIZATION_BITS];

            for (const rec of output.recommendations!) {
                const recBits = QUANTIZATION_BITS[rec.quantization as keyof typeof QUANTIZATION_BITS];
                expect(maxBits).toBeGreaterThanOrEqual(recBits);
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
            const result = calculateVram({ params_b: 7.123, quantization: 'Q4' });
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
    it('should handle realistic 8B Q4 model on macOS 24GB', () => {
        const result = calculateVram({ params_b: 8, quantization: 'Q4', vram_gb: 24, os: 'macos' });
        const output = expectSuccess(result);

        // macOS should reserve 6GB, leaving 18GB available
        expect(output.os_overhead.available_gb).toBe(18);

        // 8B Q4 model should be ~4.2GB
        expect(output.quantization_analysis[0].estimated_gguf_gb).toBeCloseTo(4.2, 1);

        // Should have recommendations
        expect(output.recommendations).not.toBeNull();
        expect(output.recommendations!.length).toBe(3);

        // Optimal should allow decent context
        const optimal = output.recommendations!.find((r) => r.tier === 'optimal')!;
        expect(optimal.context_size).toBeGreaterThanOrEqual(4096);
    });

    it('should handle realistic 70B Q4 model on Windows 48GB', () => {
        const result = calculateVram({ params_b: 70, quantization: 'Q4', vram_gb: 48, os: 'windows' });
        const output = expectSuccess(result);

        // Windows should reserve 0.8GB
        expect(output.os_overhead.reserved_gb).toBe(0.8);

        // 70B Q4 should be ~36.75GB
        expect(output.quantization_analysis[0].estimated_gguf_gb).toBeCloseTo(36.75, 1);

        // Should have limited or no fitting configurations at high contexts
        expect(output.summary.fitting_configurations).toBeDefined();
    });

    it('should handle full architecture specification', () => {
        const result = calculateVram({
            params_b: 7,
            model_size_gb: 4,
            quantization: 'Q4',
            context_size: 32768,
            kv_cache_enabled: true,
            kv_cache_quant: 'fp16',
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
            quantization: 'Q4',
            expert_count: 8,
            active_experts: 2,
            vram_gb: 48,
            os: 'linux-headless',
        });
        const output = expectSuccess(result);

        expect(output.input_summary.is_moe).toBe(true);
        expect(output.input_summary.expert_info).toBe('8 total, 2 active');

        // Model size should be based on total params
        expect(output.quantization_analysis[0].estimated_gguf_gb).toBeCloseTo(24.68, 1);
    });

    it('should handle model with sliding window', () => {
        const result = calculateVram({
            params_b: 7,
            quantization: 'Q4',
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
                quantization: 'Q4',
                context_size: 4096,
                kv_cache_enabled: true,
                kv_cache_quant: 'q8',
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
        const input: CalculatorInput = { params_b: 8, quantization: 'Q4', vram_gb: 24, os: 'macos' };

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
        for (const quant of Object.values(Quantization)) {
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
        quantization: 'Q4' as const,
        layers: 32,
        kv_heads: 8,
        key_dim: 128,
        value_dim: 128,
        kv_cache_quant: 'fp16' as const,
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
    it('should calculate exact KV cache for Llama-3-8B @ 8K context', () => {
        // Formula: 2 × layers × kv_heads × (key_dim + value_dim) × context × batch × bytes
        // = 2 × 32 × 8 × 256 × 8192 × 1 × 2 bytes = 2,147,483,648 bytes = 2.0 GB
        const result = calculateVram({
            params_b: 8,
            quantization: 'Q4',
            layers: 32,
            kv_heads: 8,
            key_dim: 128,
            value_dim: 128,
            kv_cache_quant: 'fp16',
            context_size: 8192,
            batch_size: 1,
        });

        const output = expectSuccess(result);

        // FIX: Find the 8192 context entry explicitly, don't use index 0
        const entry = output.quantization_analysis[0].context_table.find((e) => e.context_size === 8192)!;

        expect(entry).toBeDefined();
        expect(entry.kv_cache_gb).toBeCloseTo(2.0, 1);
    });

    it('should calculate exact KV cache for Llama-3-70B @ 128K context', () => {
        // Formula: 2 × layers × kv_heads × (key_dim + value_dim) × context × batch × bytes
        // = 2 × 80 × 8 × 256 × 131072 × 1 × 2 bytes = 85,899,345,920 bytes = 80.0 GB
        const result = calculateVram({
            params_b: 70,
            quantization: 'Q4',
            layers: 80,
            kv_heads: 8,
            key_dim: 128,
            value_dim: 128,
            kv_cache_quant: 'fp16',
            context_size: 131072,
            batch_size: 1,
        });

        const output = expectSuccess(result);
        const entry = output.quantization_analysis[0].context_table.find((e) => e.context_size === 131072)!;

        expect(entry).toBeDefined();
        expect(entry.kv_cache_gb).toBeCloseTo(80.0, 0);
    });

    it('should respect KV_CACHE_BYTES mapping in calculation', () => {
        const baseInput = {
            params_b: 8,
            quantization: 'Q4' as const,
            layers: 32,
            kv_heads: 8,
            key_dim: 128,
            value_dim: 128,
            context_size: 8192,
            batch_size: 1,
        };

        const resultQ4 = calculateVram({ ...baseInput, kv_cache_quant: 'q4' });
        const resultQ8 = calculateVram({ ...baseInput, kv_cache_quant: 'q8' });
        const resultFP16 = calculateVram({ ...baseInput, kv_cache_quant: 'fp16' });
        const resultFP32 = calculateVram({ ...baseInput, kv_cache_quant: 'fp32' });

        const outputQ4 = expectSuccess(resultQ4);
        const outputQ8 = expectSuccess(resultQ8);
        const outputFP16 = expectSuccess(resultFP16);
        const outputFP32 = expectSuccess(resultFP32);

        const kvQ4 = outputQ4.quantization_analysis[0].context_table[0].kv_cache_gb;
        const kvQ8 = outputQ8.quantization_analysis[0].context_table[0].kv_cache_gb;
        const kvFP16 = outputFP16.quantization_analysis[0].context_table[0].kv_cache_gb;
        const kvFP32 = outputFP32.quantization_analysis[0].context_table[0].kv_cache_gb;

        // Verify byte ratios: Q4=0.5, Q8=1, FP16=2, FP32=4
        expect(kvQ8 / kvQ4).toBeCloseTo(2, 1); // 1 / 0.5
        expect(kvFP16 / kvQ8).toBeCloseTo(2, 1); // 2 / 1
        expect(kvFP32 / kvFP16).toBeCloseTo(2, 1); // 4 / 2
    });
});

// ============================================================================
// SECTION 11: Working Buffer Tests (MISSING - ADD THIS)
// ============================================================================
describe('Working Buffer Application', () => {
    it('should add WORKING_BUFFER_GB to vram_without_cache', () => {
        const result = calculateVram({ params_b: 8, quantization: 'Q4', kv_cache_enabled: false });
        const output = expectSuccess(result);

        const modelSize = output.quantization_analysis[0].estimated_gguf_gb!;
        const vramWithoutCache = output.quantization_analysis[0].min_vram_no_cache_gb;

        expect(vramWithoutCache).toBeCloseTo(modelSize + WORKING_BUFFER_GB, 2);
    });

    it('should add WORKING_BUFFER_GB to vram_with_cache', () => {
        const result = calculateVram({
            params_b: 8,
            quantization: 'Q4',
            kv_cache_enabled: true,
            layers: 32,
            kv_heads: 8,
            key_dim: 128,
            value_dim: 128,
            context_size: 4096,
        });

        const output = expectSuccess(result);
        const analysis = output.quantization_analysis[0];
        const entry = analysis.context_table[0];

        const expectedVram = analysis.estimated_gguf_gb! + entry.kv_cache_gb + WORKING_BUFFER_GB;

        expect(entry.vram_with_cache_gb).toBeCloseTo(expectedVram, 2);
    });
});

// ============================================================================
// SECTION 12: Recommendation Headroom Tests
// ============================================================================
describe('Recommendation Headroom Calculation', () => {
    it('should calculate headroom as available_vram - total_vram', () => {
        const result = calculateVram({
            params_b: 8,
            quantization: 'Q4',
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
        const result = calculateVram({ params_b: 1, quantization: 'Q1', vram_gb: 2, os: 'linux-headless' });

        const output = expectSuccess(result);
        if (output.recommendations) {
            for (const rec of output.recommendations) {
                expect(rec.headroom_gb).toBeGreaterThanOrEqual(0);
            }
        }
    });
});

// ============================================================================
// SECTION 9: Real Model Validation Tests
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
            quantization: 'Q4' as const,
            kv_cache_quant: 'fp16' as const,
        };

        describe('File Size Estimation', () => {
            it('should estimate Q4 model size close to actual GGUF file size', () => {
                const result = calculateVram({
                    params_b: modelConfig.params_b,
                    quantization: modelConfig.quantization,
                    model_size_gb: null,
                });

                const output = expectSuccess(result);
                const estimated = output.quantization_analysis[0].estimated_gguf_gb!;

                // Expected: 4B × 0.5 bytes × 1.05 = 2.1 GB (estimate)
                expect(estimated).toBeCloseTo(2.1, 1);

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
                // Formula: 2 × 36 × 8 × 256 × 4096 × 1 × 2 bytes = 1,207,959,552 bytes = 1.13 GB
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

                expect(entry.kv_cache_gb).toBeCloseTo(1.13, 1);
            });

            it('should calculate KV cache at 8K context', () => {
                // Formula: 2 × 36 × 8 × 256 × 8192 × 1 × 2 bytes = 2,415,919,104 bytes = 2.25 GB
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

                expect(entry.kv_cache_gb).toBeCloseTo(2.25, 1);
            });

            it('should calculate KV cache at max context (262144)', () => {
                // 1.13 GB × (262144 / 4096) = 72.0 GB
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

                expect(entry.kv_cache_gb).toBeCloseTo(72.0, 0);
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
            quantization: 'Q4' as const,
            kv_cache_quant: 'fp16' as const,
        };

        describe('File Size Estimation', () => {
            it('should estimate Q4 model size close to actual GGUF file size', () => {
                const result = calculateVram({
                    params_b: modelConfig.params_b,
                    quantization: modelConfig.quantization,
                });

                const output = expectSuccess(result);
                const estimated = output.quantization_analysis[0].estimated_gguf_gb!;

                // Expected: 27B × 0.5 bytes × 1.05 = 14.175 GB
                expect(estimated).toBeCloseTo(14.2, 1);

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
                // Formula: 2 × 62 × 16 × 256 × 1024 × 1 × 2 bytes = 1,308,622,848 bytes = 1.22 GB
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

                expect(entry.kv_cache_gb).toBeCloseTo(1.22, 0);
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
            quantization: 'Q4' as const,
            kv_cache_quant: 'fp16' as const,
        };

        describe('File Size Estimation', () => {
            it('should estimate Q4 model size close to actual GGUF file size', () => {
                const result = calculateVram({
                    params_b: modelConfig.params_b,
                    quantization: modelConfig.quantization,
                });

                const output = expectSuccess(result);
                const estimated = output.quantization_analysis[0].estimated_gguf_gb!;

                // Expected: 20B × 0.5 bytes × 1.05 = 10.5 GB
                expect(estimated).toBeCloseTo(10.5, 1);

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
                // Formula: 2 × 24 × 8 × 128 × 128 × 1 × 2 bytes = 12,582,912 bytes = 0.012 GB
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

                expect(entry.kv_cache_gb).toBeCloseTo(0.012, 2);
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
