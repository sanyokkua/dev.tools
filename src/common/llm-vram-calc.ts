/**
 * @fileoverview LLM VRAM Calculator - Calculate memory requirements for running
 * Large Language Models in GGUF format. Estimates VRAM/RAM consumption and
 * provides recommendations based on hardware constraints.
 * @module LLMVramCalculator
 */

// ============================================================================
// SECTION 1: Types & Interfaces
// ============================================================================

/**
 * Model weight quantization levels.
 * Values represent common GGUF quantization formats.
 */
const Quantization = {
    Q1: 'Q1',
    Q2: 'Q2',
    Q3: 'Q3',
    Q4: 'Q4',
    Q5: 'Q5',
    Q6: 'Q6',
    Q8: 'Q8',
    FP4: 'FP4',
    FP8: 'FP8',
    FP16: 'FP16',
    FP32: 'FP32',
} as const;

type Quantization = (typeof Quantization)[keyof typeof Quantization];

/**
 * KV cache quantization options.
 */
const KVCacheQuant = { Q4: 'q4', Q8: 'q8', FP4: 'fp4', FP8: 'fp8', FP16: 'fp16', FP32: 'fp32' } as const;

type KVCacheQuant = (typeof KVCacheQuant)[keyof typeof KVCacheQuant];

/**
 * Supported operating systems with distinct memory overhead profiles.
 */
const OperatingSystem = {
    MACOS: 'macos',
    WINDOWS: 'windows',
    LINUX_GUI: 'linux-gui',
    LINUX_HEADLESS: 'linux-headless',
} as const;

type OperatingSystem = (typeof OperatingSystem)[keyof typeof OperatingSystem];

/**
 * Input parameters for the VRAM calculator.
 */
interface CalculatorInput {
    /** Model parameters in billions. Range: 1-1000. Required. */
    readonly params_b: number;

    /** GGUF file size in GB. Range: 0.1-500. If null, estimated from params_b. */
    readonly model_size_gb?: number | null;

    /** Model weight quantization. If null, calculates for all standard quantizations. */
    readonly quantization?: Quantization | null;

    /** Context window in tokens. Range: 1024-10,000,000. If null, calculates standard sizes. */
    readonly context_size?: number | null;

    /** Enable KV cache calculation. Default: true. */
    readonly kv_cache_enabled?: boolean;

    /** KV cache quantization level. Default: Q8. */
    readonly kv_cache_quant?: KVCacheQuant;

    /** Operating system for overhead calculation. If null, no overhead applied. */
    readonly os?: OperatingSystem | null;

    /** Available VRAM/Unified Memory in GB. Range: 1-256. */
    readonly vram_gb?: number | null;

    /** Number of transformer layers. Range: 1-200. If null, uses estimation. */
    readonly layers?: number | null;

    /** Key head dimension from GGUF metadata. Default: 128. */
    readonly key_dim?: number;

    /** Value head dimension from GGUF metadata. Default: 128. */
    readonly value_dim?: number;

    /** Number of KV heads from GGUF metadata. Default: 8. */
    readonly kv_heads?: number;

    /** Sliding window size for KV cache cap. If null, no cap applied. */
    readonly sliding_window?: number | null;

    /** Model's maximum supported context length. */
    readonly max_context?: number | null;

    /** Total MoE experts count. */
    readonly expert_count?: number | null;

    /** Active experts per token for MoE models. */
    readonly active_experts?: number | null;
}

/**
 * Summary of resolved input parameters.
 */
interface InputSummary {
    readonly params_b: number;
    readonly model_size_gb: number | 'estimated';
    readonly quantization: Quantization | 'all';
    readonly context_size: number | 'all';
    readonly kv_cache_enabled: boolean;
    readonly kv_cache_quant: KVCacheQuant;
    readonly os: OperatingSystem | null;
    readonly vram_gb: number | null;
    readonly layers: number | 'estimated';
    readonly sliding_window: number | null;
    readonly is_moe: boolean;
    readonly expert_info: string | null;
}

/**
 * OS memory overhead calculation details.
 */
interface OSOverhead {
    readonly os: OperatingSystem | null;
    readonly total_vram_gb: number | null;
    readonly reserved_gb: number;
    readonly available_gb: number | null;
    readonly reservation_percent: number | null;
}

/**
 * VRAM analysis for a specific context size.
 */
interface ContextEntry {
    readonly context_size: number;
    readonly context_label: string;
    readonly kv_cache_gb: number;
    readonly vram_with_cache_gb: number;
    readonly vram_without_cache_gb: number;
    readonly fits_in_vram: boolean | null;
}

/**
 * Complete analysis for a specific quantization level.
 */
interface QuantizationAnalysis {
    readonly quantization: Quantization;
    readonly bits_per_param: number;
    readonly estimated_gguf_gb: number | null;
    readonly min_vram_no_cache_gb: number;
    readonly min_vram_with_cache_gb: number;
    readonly context_table: readonly ContextEntry[];
}

/**
 * Recommendation tier types.
 */
type RecommendationTier = 'optimal' | 'minimum' | 'maximum_quality';

/**
 * Configuration recommendation based on VRAM constraints.
 */
interface Recommendation {
    readonly tier: RecommendationTier;
    readonly quantization: Quantization;
    readonly context_size: number;
    readonly context_label: string;
    readonly kv_cache_quant: KVCacheQuant;
    readonly estimated_gguf_gb: number;
    readonly total_vram_gb: number;
    readonly headroom_gb: number;
    readonly description: string;
}

/**
 * Aggregate statistics across all analyzed configurations.
 */
interface SummaryStatistics {
    readonly smallest_config_gb: number;
    readonly largest_config_gb: number;
    readonly total_configurations: number;
    readonly fitting_configurations: number | null;
}

/**
 * Complete calculator output structure.
 */
interface CalculatorOutput {
    readonly input_summary: InputSummary;
    readonly os_overhead: OSOverhead;
    readonly quantization_analysis: readonly QuantizationAnalysis[];
    readonly recommendations: readonly Recommendation[] | null;
    readonly summary: SummaryStatistics;
}

/**
 * Result type for operations that can fail.
 * Use `ok` property to discriminate between success and error.
 */
type Result<T, E extends string = string> =
    | { readonly ok: true; readonly value: T }
    | { readonly ok: false; readonly error: E };

/**
 * Validation error types for input parameter validation.
 */
type ValidationError =
    | 'PARAMS_B_NOT_FINITE'
    | 'PARAMS_B_OUT_OF_RANGE'
    | 'INVALID_MODEL_SIZE'
    | 'INVALID_CONTEXT_SIZE'
    | 'INVALID_VRAM'
    | 'INVALID_LAYERS'
    | 'INVALID_KEY_DIM'
    | 'INVALID_VALUE_DIM'
    | 'INVALID_KV_HEADS'
    | 'INVALID_SLIDING_WINDOW'
    | 'INVALID_MAX_CONTEXT'
    | 'INVALID_EXPERT_COUNT'
    | 'INVALID_ACTIVE_EXPERTS';

// ============================================================================
// SECTION 2: Constants
// ============================================================================

/**
 * Bits per parameter for each quantization level.
 */
const QUANTIZATION_BITS = {
    Q1: 1,
    Q2: 2,
    Q3: 3,
    Q4: 4,
    Q5: 5,
    Q6: 6,
    Q8: 8,
    FP4: 4,
    FP8: 8,
    FP16: 16,
    FP32: 32,
} as const satisfies Record<Quantization, number>;

/**
 * Bytes per value for each KV cache quantization level.
 * Used in exact KV cache calculation when layer count is known.
 */
const KV_CACHE_BYTES = { q4: 0.5, q8: 1, fp4: 0.5, fp8: 1, fp16: 2, fp32: 4 } as const satisfies Record<
    KVCacheQuant,
    number
>;

/**
 * Scaling factor for KV cache estimation when architecture is unknown.
 * Relative to FP16 baseline (factor 1.0).
 */
const KV_CACHE_FACTOR = { q4: 0.25, q8: 0.5, fp4: 0.25, fp8: 0.5, fp16: 1, fp32: 2 } as const satisfies Record<
    KVCacheQuant,
    number
>;

/**
 * OS-specific memory overhead configuration.
 */
const OS_OVERHEAD_CONFIG = {
    'macos': { type: 'percent', value: 0.25 },
    'windows': { type: 'fixed', value: 0.8 },
    'linux-gui': { type: 'fixed', value: 0.5 },
    'linux-headless': { type: 'fixed', value: 0.05 },
} as const satisfies Record<OperatingSystem, { readonly type: 'percent' | 'fixed'; readonly value: number }>;

/** GGUF metadata overhead factor (5%). */
const METADATA_OVERHEAD = 0.05;

/** Fixed working buffer for inference computations in GB. */
const WORKING_BUFFER_GB = 0.4;

/** Standard context sizes for multi-context analysis. */
const STANDARD_CONTEXTS = [4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576] as const;

/** Standard quantizations for multi-quantization analysis. */
const STANDARD_QUANTIZATIONS: readonly Quantization[] = [
    'Q1',
    'Q2',
    'Q3',
    'Q4',
    'Q5',
    'Q6',
    'Q8',
    'FP16',
    'FP32',
] as const;

/** Preferred quantizations for optimal recommendations (balance of quality and size). */
const OPTIMAL_QUANTIZATIONS: readonly Quantization[] = ['Q4', 'Q5', 'Q6'] as const;

/** Bytes in a gigabyte (1024^3). */
const BYTES_PER_GB = 1073741824;

/** Minimum practical context size for KV cache baseline. */
const MIN_CONTEXT_SIZE = 4096;

/** Valid range for params_b input. */
const PARAMS_B_RANGE = { min: 1, max: 1000 } as const;

/** Valid range for model_size_gb input. */
const MODEL_SIZE_RANGE = { min: 0.1, max: 500 } as const;

/** Valid range for context_size input. */
const CONTEXT_SIZE_RANGE = { min: 1024, max: 10_000_000 } as const;

/** Valid range for vram_gb input. */
const VRAM_RANGE = { min: 1, max: 256 } as const;

/** Valid range for layers input. */
const LAYERS_RANGE = { min: 1, max: 200 } as const;

// ============================================================================
// SECTION 3: Internal Helper Functions (not exported)
// ============================================================================

/**
 * Creates a successful Result.
 */
function ok<T>(value: T): Result<T, never> {
    return { ok: true, value };
}

/**
 * Creates a failed Result.
 */
function err<E extends string>(error: E): Result<never, E> {
    return { ok: false, error };
}

/**
 * Checks if a value is a finite positive number.
 */
function isFinitePositive(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

// /**
//  * Checks if a value is a finite non-negative integer.
//  */
// function isFiniteNonNegativeInteger(value: unknown): value is number {
//     return typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value >= 0;
// }

/**
 * Checks if a value is a finite positive integer.
 */
function isFinitePositiveInteger(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value > 0;
}

/**
 * Rounds a number to specified decimal places using standard rounding.
 * Handles floating-point precision issues by using multiplication factor.
 */
function roundTo(value: number, decimals: number): number {
    if (!Number.isFinite(value)) {
        return value;
    }
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

/**
 * Gets the KV base factor based on model size (empirical estimation).
 * Larger models have proportionally smaller KV cache relative to their parameter count.
 *
 * @param params_b - Model parameters in billions.
 * @returns Empirical KV base factor for estimation.
 */
function getKvBaseFactor(params_b: number): number {
    if (params_b <= 4) return 0.025;
    if (params_b <= 14) return 0.015;
    if (params_b <= 32) return 0.012;
    if (params_b <= 70) return 0.008;
    return 0.006;
}

/**
 * Formats a context size as a human-readable label.
 *
 * @param contextSize - Context size in tokens.
 * @returns Formatted label (e.g., "4K", "128K", "1M").
 */
function formatContextLabel(contextSize: number): string {
    if (contextSize >= 1048576) {
        const megaTokens = contextSize / 1048576;
        return Number.isInteger(megaTokens) ? `${megaTokens}M` : `${megaTokens.toFixed(1)}M`;
    }
    if (contextSize >= 1024) {
        const kiloTokens = contextSize / 1024;
        return Number.isInteger(kiloTokens) ? `${kiloTokens}K` : `${kiloTokens.toFixed(1)}K`;
    }
    return String(contextSize);
}

/**
 * Estimates model file size from parameters and quantization.
 *
 * @param params_b - Model parameters in billions.
 * @param quantization - Quantization level.
 * @returns Estimated GGUF file size in GB.
 */
function estimateModelSize(params_b: number, quantization: Quantization): number {
    const bits = QUANTIZATION_BITS[quantization];
    const bytesPerParam = bits / 8;
    return params_b * bytesPerParam * (1 + METADATA_OVERHEAD);
}

/**
 * Calculates OS overhead and available VRAM.
 *
 * @param os - Operating system, or null for no overhead.
 * @param vram_gb - Total VRAM in GB, or null if unknown.
 * @returns OS overhead calculation details.
 */
function calculateOsOverhead(os: OperatingSystem | null, vram_gb: number | null): OSOverhead {
    if (os === null || vram_gb === null) {
        return { os, total_vram_gb: vram_gb, reserved_gb: 0, available_gb: vram_gb, reservation_percent: null };
    }

    const config = OS_OVERHEAD_CONFIG[os];
    let reserved: number;
    let available: number;
    let percent: number;

    if (config.type === 'percent') {
        reserved = vram_gb * config.value;
        available = vram_gb - reserved;
        percent = config.value * 100;
    } else {
        reserved = config.value;
        available = Math.max(0, vram_gb - reserved);
        percent = vram_gb > 0 ? (reserved / vram_gb) * 100 : 0;
    }

    return {
        os,
        total_vram_gb: vram_gb,
        reserved_gb: roundTo(reserved, 2),
        available_gb: roundTo(available, 2),
        reservation_percent: roundTo(percent, 1),
    };
}

/**
 * Calculates KV cache size in GB.
 *
 * @param params_b - Model parameters in billions.
 * @param contextSize - Context window size in tokens.
 * @param kvCacheEnabled - Whether KV cache is enabled.
 * @param kvCacheQuant - KV cache quantization level.
 * @param layers - Number of transformer layers, or null for estimation.
 * @param keyDim - Key head dimension.
 * @param valueDim - Value head dimension.
 * @param kvHeads - Number of KV heads.
 * @param slidingWindow - Sliding window cap, or null for no cap.
 * @returns KV cache size in GB.
 */
function calculateKvCache(
    params_b: number,
    contextSize: number,
    kvCacheEnabled: boolean,
    kvCacheQuant: KVCacheQuant,
    layers: number | null,
    keyDim: number,
    valueDim: number,
    kvHeads: number,
    slidingWindow: number | null,
): number {
    if (!kvCacheEnabled) {
        return 0;
    }

    // Apply sliding window cap if present
    let effectiveContext = contextSize;
    if (slidingWindow !== null && slidingWindow > 0) {
        effectiveContext = Math.min(contextSize, slidingWindow);
    }

    // Exact calculation when layers are known
    if (layers !== null) {
        const bytesPerValue = KV_CACHE_BYTES[kvCacheQuant];
        const bytesPerToken = kvHeads * (keyDim + valueDim) * bytesPerValue;
        const kvBytes = layers * effectiveContext * bytesPerToken;
        return kvBytes / BYTES_PER_GB;
    }

    // Estimated calculation when architecture is unknown
    const kvBase = getKvBaseFactor(params_b);
    const kvFactor = KV_CACHE_FACTOR[kvCacheQuant];
    return (effectiveContext / 1000) * params_b * kvBase * kvFactor;
}

/**
 * Internal type for tracking configurations during analysis.
 */
interface ConfigEntry {
    readonly quant: Quantization;
    readonly context: number;
    readonly contextLabel: string;
    readonly modelSize: number;
    readonly kvCache: number;
    readonly totalVram: number;
    readonly fits: boolean | null;
    readonly quantBits: number;
}

/**
 * Validates an optional positive number within a range.
 */
function validateOptionalPositiveInRange(value: number | null | undefined, min: number, max: number): boolean {
    if (value === null || value === undefined) {
        return true;
    }
    return isFinitePositive(value) && value >= min && value <= max;
}

/**
 * Validates an optional positive integer within a range.
 */
function validateOptionalPositiveIntegerInRange(value: number | null | undefined, min: number, max: number): boolean {
    if (value === null || value === undefined) {
        return true;
    }
    return isFinitePositiveInteger(value) && value >= min && value <= max;
}

/**
 * Validates all input parameters.
 *
 * @param input - Calculator input to validate.
 * @returns Result indicating success or specific validation error.
 */
function validateInput(input: CalculatorInput): Result<void, ValidationError> {
    // Validate params_b (required)
    if (!Number.isFinite(input.params_b)) {
        return err('PARAMS_B_NOT_FINITE');
    }
    if (input.params_b < PARAMS_B_RANGE.min || input.params_b > PARAMS_B_RANGE.max) {
        return err('PARAMS_B_OUT_OF_RANGE');
    }

    // Validate optional model_size_gb
    if (!validateOptionalPositiveInRange(input.model_size_gb, MODEL_SIZE_RANGE.min, MODEL_SIZE_RANGE.max)) {
        return err('INVALID_MODEL_SIZE');
    }

    // Validate optional context_size
    if (!validateOptionalPositiveIntegerInRange(input.context_size, CONTEXT_SIZE_RANGE.min, CONTEXT_SIZE_RANGE.max)) {
        return err('INVALID_CONTEXT_SIZE');
    }

    // Validate optional vram_gb
    if (!validateOptionalPositiveInRange(input.vram_gb, VRAM_RANGE.min, VRAM_RANGE.max)) {
        return err('INVALID_VRAM');
    }

    // Validate optional layers
    if (!validateOptionalPositiveIntegerInRange(input.layers, LAYERS_RANGE.min, LAYERS_RANGE.max)) {
        return err('INVALID_LAYERS');
    }

    // Validate key_dim if provided
    if (input.key_dim !== undefined && !isFinitePositiveInteger(input.key_dim)) {
        return err('INVALID_KEY_DIM');
    }

    // Validate value_dim if provided
    if (input.value_dim !== undefined && !isFinitePositiveInteger(input.value_dim)) {
        return err('INVALID_VALUE_DIM');
    }

    // Validate kv_heads if provided
    if (input.kv_heads !== undefined && !isFinitePositiveInteger(input.kv_heads)) {
        return err('INVALID_KV_HEADS');
    }

    // Validate sliding_window if provided
    if (input.sliding_window !== undefined && input.sliding_window !== null) {
        if (!isFinitePositiveInteger(input.sliding_window)) {
            return err('INVALID_SLIDING_WINDOW');
        }
    }

    // Validate max_context if provided
    if (input.max_context !== undefined && input.max_context !== null) {
        if (!isFinitePositiveInteger(input.max_context)) {
            return err('INVALID_MAX_CONTEXT');
        }
    }

    // Validate expert_count if provided
    if (input.expert_count !== undefined && input.expert_count !== null) {
        if (!isFinitePositiveInteger(input.expert_count)) {
            return err('INVALID_EXPERT_COUNT');
        }
    }

    // Validate active_experts if provided
    if (input.active_experts !== undefined && input.active_experts !== null) {
        if (!isFinitePositiveInteger(input.active_experts)) {
            return err('INVALID_ACTIVE_EXPERTS');
        }
    }

    return ok(undefined);
}

/**
 * Finds the configuration with maximum context from a list.
 */
function findMaxContext(configs: readonly ConfigEntry[]): ConfigEntry {
    return configs.reduce((max, c) => (c.context > max.context ? c : max));
}

/**
 * Finds the configuration with minimum total VRAM from a list.
 */
function findMinVram(configs: readonly ConfigEntry[]): ConfigEntry {
    return configs.reduce((min, c) => (c.totalVram < min.totalVram ? c : min));
}

/**
 * Finds the configuration with maximum quality (bits then context) from a list.
 */
function findMaxQuality(configs: readonly ConfigEntry[]): ConfigEntry {
    return configs.reduce((best, c) => {
        if (c.quantBits > best.quantBits) return c;
        if (c.quantBits === best.quantBits && c.context > best.context) return c;
        return best;
    });
}

/**
 * Checks if a quantization is in the optimal tier.
 */
function isOptimalQuantization(quant: Quantization): boolean {
    return (OPTIMAL_QUANTIZATIONS as readonly string[]).includes(quant);
}

/**
 * Generates recommendations from fitting configurations.
 */
function generateRecommendations(
    fittingConfigs: readonly ConfigEntry[],
    availableVram: number,
    kvCacheQuant: KVCacheQuant,
): readonly Recommendation[] {
    const recommendations: Recommendation[] = [];

    // OPTIMAL: Best balance of quality and context
    // Prefer Q4-Q6, largest context that fits
    const optimalCandidates = fittingConfigs.filter((c) => isOptimalQuantization(c.quant));
    const optimal = optimalCandidates.length > 0 ? findMaxContext(optimalCandidates) : findMaxContext(fittingConfigs);

    recommendations.push({
        tier: 'optimal',
        quantization: optimal.quant,
        context_size: optimal.context,
        context_label: optimal.contextLabel,
        kv_cache_quant: kvCacheQuant,
        estimated_gguf_gb: roundTo(optimal.modelSize, 2),
        total_vram_gb: roundTo(optimal.totalVram, 2),
        headroom_gb: roundTo(availableVram - optimal.totalVram, 2),
        description: 'Best balance of quality and context length',
    });

    // MINIMUM: Smallest memory footprint
    const minimum = findMinVram(fittingConfigs);

    recommendations.push({
        tier: 'minimum',
        quantization: minimum.quant,
        context_size: minimum.context,
        context_label: minimum.contextLabel,
        kv_cache_quant: kvCacheQuant,
        estimated_gguf_gb: roundTo(minimum.modelSize, 2),
        total_vram_gb: roundTo(minimum.totalVram, 2),
        headroom_gb: roundTo(availableVram - minimum.totalVram, 2),
        description: 'Minimum memory usage',
    });

    // MAXIMUM QUALITY: Highest quant that fits with best context
    const maxQuality = findMaxQuality(fittingConfigs);

    recommendations.push({
        tier: 'maximum_quality',
        quantization: maxQuality.quant,
        context_size: maxQuality.context,
        context_label: maxQuality.contextLabel,
        kv_cache_quant: kvCacheQuant,
        estimated_gguf_gb: roundTo(maxQuality.modelSize, 2),
        total_vram_gb: roundTo(maxQuality.totalVram, 2),
        headroom_gb: roundTo(availableVram - maxQuality.totalVram, 2),
        description: 'Highest quality that fits in VRAM',
    });

    return recommendations;
}

// ============================================================================
// SECTION 4: Core Implementation Functions
// ============================================================================

/**
 * Builds the input summary from resolved parameters.
 */
function buildInputSummary(
    params_b: number,
    model_size_gb: number | null,
    quantization: Quantization | null,
    context_size: number | null,
    kv_cache_enabled: boolean,
    kv_cache_quant: KVCacheQuant,
    os: OperatingSystem | null,
    vram_gb: number | null,
    layers: number | null,
    sliding_window: number | null,
    expert_count: number | null,
    active_experts: number | null,
): InputSummary {
    let expertInfo: string | null = null;
    if (expert_count !== null) {
        expertInfo = `${expert_count} total`;
        if (active_experts !== null) {
            expertInfo += `, ${active_experts} active`;
        }
    }

    return {
        params_b,
        model_size_gb: model_size_gb !== null ? model_size_gb : 'estimated',
        quantization: quantization !== null ? quantization : 'all',
        context_size: context_size !== null ? context_size : 'all',
        kv_cache_enabled,
        kv_cache_quant,
        os,
        vram_gb,
        layers: layers !== null ? layers : 'estimated',
        sliding_window,
        is_moe: expert_count !== null,
        expert_info: expertInfo,
    };
}

/**
 * Builds context table and collects configuration entries for a quantization.
 */
function buildContextAnalysis(
    params_b: number,
    modelSize: number,
    contextList: readonly number[],
    kv_cache_enabled: boolean,
    kv_cache_quant: KVCacheQuant,
    layers: number | null,
    key_dim: number,
    value_dim: number,
    kv_heads: number,
    sliding_window: number | null,
    availableVram: number | null,
    quant: Quantization,
): { contextTable: readonly ContextEntry[]; configs: readonly ConfigEntry[] } {
    const contextTable: ContextEntry[] = [];
    const configs: ConfigEntry[] = [];
    const quantBits = QUANTIZATION_BITS[quant];

    for (const ctx of contextList) {
        const kvCache = calculateKvCache(
            params_b,
            ctx,
            kv_cache_enabled,
            kv_cache_quant,
            layers,
            key_dim,
            value_dim,
            kv_heads,
            sliding_window,
        );

        const vramWithCache = modelSize + kvCache + WORKING_BUFFER_GB;
        const vramWithoutCache = modelSize + WORKING_BUFFER_GB;

        let fits: boolean | null = null;
        if (availableVram !== null) {
            fits = vramWithCache <= availableVram;
        }

        contextTable.push({
            context_size: ctx,
            context_label: formatContextLabel(ctx),
            kv_cache_gb: roundTo(kvCache, 2),
            vram_with_cache_gb: roundTo(vramWithCache, 2),
            vram_without_cache_gb: roundTo(vramWithoutCache, 2),
            fits_in_vram: fits,
        });

        configs.push({
            quant,
            context: ctx,
            contextLabel: formatContextLabel(ctx),
            modelSize,
            kvCache,
            totalVram: vramWithCache,
            fits,
            quantBits,
        });
    }

    return { contextTable, configs };
}

/**
 * Core VRAM calculation implementation.
 */
function calculateVramCore(input: CalculatorInput): CalculatorOutput {
    // Extract and apply defaults
    const params_b = input.params_b;
    const model_size_gb = input.model_size_gb ?? null;
    const quantization = input.quantization ?? null;
    const context_size = input.context_size ?? null;
    const kv_cache_enabled = input.kv_cache_enabled ?? true;
    const kv_cache_quant = input.kv_cache_quant ?? 'q8';
    const os = input.os ?? null;
    const vram_gb = input.vram_gb ?? null;
    const layers = input.layers ?? null;
    const key_dim = input.key_dim ?? 128;
    const value_dim = input.value_dim ?? 128;
    const kv_heads = input.kv_heads ?? 8;
    const sliding_window = input.sliding_window ?? null;
    const expert_count = input.expert_count ?? null;
    const active_experts = input.active_experts ?? null;

    // Step 1: Determine quantization list
    const quantList: readonly Quantization[] = quantization !== null ? [quantization] : STANDARD_QUANTIZATIONS;

    // Step 2: Determine context list
    let contextList: readonly number[];
    if (context_size !== null) {
        const contextSet = new Set<number>([context_size]);
        for (const stdCtx of STANDARD_CONTEXTS) {
            contextSet.add(stdCtx);
        }
        contextList = Array.from(contextSet).sort((a, b) => a - b);
    } else {
        contextList = STANDARD_CONTEXTS;
    }

    // Step 3: Calculate OS overhead
    const osOverhead = calculateOsOverhead(os, vram_gb);
    const availableVram = osOverhead.available_gb;

    // Step 4: Build input summary
    const inputSummary = buildInputSummary(
        params_b,
        model_size_gb,
        quantization,
        context_size,
        kv_cache_enabled,
        kv_cache_quant,
        os,
        vram_gb,
        layers,
        sliding_window,
        expert_count,
        active_experts,
    );

    // Step 5: Calculate for each quantization
    const quantizationAnalysis: QuantizationAnalysis[] = [];
    const allConfigs: ConfigEntry[] = [];

    for (const quant of quantList) {
        // Determine model size
        let modelSize: number;
        let estimatedSize: number | null;

        if (model_size_gb !== null && quantList.length === 1) {
            modelSize = model_size_gb;
            estimatedSize = null;
        } else {
            modelSize = estimateModelSize(params_b, quant);
            estimatedSize = modelSize;
        }

        // Calculate minimum VRAM values
        const minVramNoCache = modelSize + WORKING_BUFFER_GB;
        const minKv = calculateKvCache(
            params_b,
            MIN_CONTEXT_SIZE,
            kv_cache_enabled,
            kv_cache_quant,
            layers,
            key_dim,
            value_dim,
            kv_heads,
            sliding_window,
        );
        const minVramWithCache = modelSize + minKv + WORKING_BUFFER_GB;

        // Build context table
        const { contextTable, configs } = buildContextAnalysis(
            params_b,
            modelSize,
            contextList,
            kv_cache_enabled,
            kv_cache_quant,
            layers,
            key_dim,
            value_dim,
            kv_heads,
            sliding_window,
            availableVram,
            quant,
        );

        allConfigs.push(...configs);

        quantizationAnalysis.push({
            quantization: quant,
            bits_per_param: QUANTIZATION_BITS[quant],
            estimated_gguf_gb: estimatedSize !== null ? roundTo(estimatedSize, 2) : null,
            min_vram_no_cache_gb: roundTo(minVramNoCache, 2),
            min_vram_with_cache_gb: roundTo(minVramWithCache, 2),
            context_table: contextTable,
        });
    }

    // Step 6: Generate recommendations
    let recommendations: readonly Recommendation[] | null = null;
    let fittingCount: number | null = null;

    if (availableVram !== null) {
        const fittingConfigs = allConfigs.filter((c) => c.fits === true);
        fittingCount = fittingConfigs.length;

        if (fittingCount > 0) {
            recommendations = generateRecommendations(fittingConfigs, availableVram, kv_cache_quant);
        }
    }

    // Step 7: Build summary statistics
    const allVramValues = allConfigs.map((c) => c.totalVram);
    const summary: SummaryStatistics = {
        smallest_config_gb: roundTo(Math.min(...allVramValues), 2),
        largest_config_gb: roundTo(Math.max(...allVramValues), 2),
        total_configurations: allConfigs.length,
        fitting_configurations: fittingCount,
    };

    return {
        input_summary: inputSummary,
        os_overhead: osOverhead,
        quantization_analysis: quantizationAnalysis,
        recommendations,
        summary,
    };
}

// ============================================================================
// SECTION 5: Public API
// ============================================================================

/**
 * Calculate VRAM requirements for running a Large Language Model.
 *
 * This function analyzes memory requirements across different quantization levels
 * and context sizes, providing detailed breakdowns and recommendations based on
 * available hardware.
 *
 * @param input - Calculator input parameters. Only `params_b` is required.
 * @returns Result containing the calculation output or a validation error.
 *
 * @example
 * ```typescript
 * // Minimal input - calculates for all quantizations and contexts
 * const result = calculateVram({ params_b: 8 });
 * if (result.ok) {
 *   console.log('Smallest config:', result.value.summary.smallest_config_gb, 'GB');
 *   console.log('Largest config:', result.value.summary.largest_config_gb, 'GB');
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With specific configuration and VRAM constraint
 * const result = calculateVram({
 *   params_b: 8,
 *   quantization: 'Q4',
 *   vram_gb: 24,
 *   os: 'macos',
 * });
 * if (result.ok && result.value.recommendations) {
 *   const optimal = result.value.recommendations.find(r => r.tier === 'optimal');
 *   console.log('Optimal config:', optimal?.context_label, 'context');
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With exact architecture from GGUF metadata
 * const result = calculateVram({
 *   params_b: 7,
 *   model_size_gb: 4.0,
 *   layers: 32,
 *   kv_heads: 8,
 *   key_dim: 128,
 *   value_dim: 128,
 *   context_size: 32768,
 *   vram_gb: 16,
 *   os: 'windows',
 * });
 * ```
 *
 * @remarks
 * - When `context_size` is null, calculates for standard sizes: 4K, 8K, 16K, 32K, 64K, 128K, 256K, 512K, 1M.
 * - When `quantization` is null, calculates for: Q1, Q2, Q3, Q4, Q5, Q6, Q8, FP16, FP32.
 * - When `vram_gb` is provided, generates recommendations for configurations that fit.
 * - Recommendations include three tiers: optimal (balanced), minimum (smallest), maximum_quality (best quality).
 * - OS overhead varies: macOS reserves 25%, Windows 0.8GB, Linux GUI 0.5GB, Linux headless 0.05GB.
 * - KV cache calculation is exact when `layers` is provided, otherwise uses empirical estimation.
 */
function calculateVram(input: CalculatorInput): Result<CalculatorOutput, ValidationError> {
    const validation = validateInput(input);
    if (!validation.ok) {
        return validation;
    }

    const output = calculateVramCore(input);
    return ok(output);
}

/**
 * LLM VRAM Calculator Public API
 *
 * Exported Functions:
 * - calculateVram: Main calculation function for VRAM requirements
 *
 * Exported Types:
 * - CalculatorInput: Input parameters interface
 * - CalculatorOutput: Complete output structure
 * - InputSummary: Resolved input parameters summary
 * - OSOverhead: OS memory overhead details
 * - ContextEntry: VRAM analysis for a context size
 * - QuantizationAnalysis: Analysis for a quantization level
 * - Recommendation: Configuration recommendation
 * - SummaryStatistics: Aggregate statistics
 * - ValidationError: Input validation error types
 * - Result: Result type for error handling
 *
 * Exported Constants:
 * - Quantization: Model weight quantization levels
 * - KVCacheQuant: KV cache quantization options
 * - OperatingSystem: Supported operating systems
 * - STANDARD_CONTEXTS: Standard context sizes for analysis
 * - STANDARD_QUANTIZATIONS: Standard quantization levels
 * - QUANTIZATION_BITS: Bits per parameter mapping
 * - KV_CACHE_BYTES: Bytes per KV value mapping
 * - KV_CACHE_FACTOR: KV cache scaling factors
 * - WORKING_BUFFER_GB: Fixed working buffer size
 * - METADATA_OVERHEAD: GGUF metadata overhead factor
 */

export {
    KVCacheQuant,
    KV_CACHE_BYTES,
    KV_CACHE_FACTOR,
    METADATA_OVERHEAD,
    OperatingSystem,
    QUANTIZATION_BITS,
    // Type constants (as const objects)
    Quantization,
    // Configuration constants
    STANDARD_CONTEXTS,
    STANDARD_QUANTIZATIONS,
    WORKING_BUFFER_GB,
    // Main function
    calculateVram,
};

export type {
    // Input/Output types
    CalculatorInput,
    CalculatorOutput,
    ContextEntry,
    InputSummary,
    OSOverhead,
    QuantizationAnalysis,
    Recommendation,
    RecommendationTier,
    Result,
    SummaryStatistics,

    // Error and Result types
    ValidationError,
};
