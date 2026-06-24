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
 * Metadata for a GGUF quantization format.
 */
interface QuantEntry {
    readonly bpw: number;
    readonly family: 'legacy' | 'k-quant' | 'i-quant' | 'unsloth' | 'fp4' | 'full';
    readonly sweetSpot: boolean;
    readonly hint: string;
}

/**
 * Catalog of known GGUF quantization formats with effective bits-per-weight.
 * bpw values are empirical whole-file averages (weights + overhead).
 */
const QUANT_CATALOG = {
    'Q4_0': { bpw: 4.58, family: 'legacy', sweetSpot: false, hint: 'Legacy 4-bit block-scale' },
    'Q4_1': { bpw: 5.05, family: 'legacy', sweetSpot: false, hint: 'Legacy 4-bit + min-offset' },
    'Q5_0': { bpw: 5.5, family: 'legacy', sweetSpot: false, hint: 'Legacy 5-bit block-scale' },
    'Q5_1': { bpw: 6, family: 'legacy', sweetSpot: false, hint: 'Legacy 5-bit + min-offset' },
    'Q8_0': { bpw: 8.5, family: 'legacy', sweetSpot: true, hint: '★ Near-lossless, larger files' },
    'Q2_K': { bpw: 3, family: 'k-quant', sweetSpot: false, hint: 'Very small, noticeable quality loss' },
    'Q2_K_L': { bpw: 3.1, family: 'k-quant', sweetSpot: false, hint: 'Q2_K + higher-precision layers' },
    'Q3_K_S': { bpw: 3.5, family: 'k-quant', sweetSpot: false, hint: 'Small 3-bit mixed-precision' },
    'Q3_K_M': { bpw: 3.91, family: 'k-quant', sweetSpot: false, hint: 'Medium 3-bit mixed-precision' },
    'Q3_K_L': { bpw: 4.27, family: 'k-quant', sweetSpot: false, hint: 'Large 3-bit mixed-precision' },
    'Q4_K_S': { bpw: 4.58, family: 'k-quant', sweetSpot: false, hint: 'Small 4-bit mixed-precision' },
    'Q4_K_M': { bpw: 4.85, family: 'k-quant', sweetSpot: true, hint: '★ Best balance size/quality (default)' },
    'Q5_K_S': { bpw: 5.5, family: 'k-quant', sweetSpot: false, hint: 'Small 5-bit mixed-precision' },
    'Q5_K_M': { bpw: 5.7, family: 'k-quant', sweetSpot: false, hint: 'Medium 5-bit mixed-precision' },
    'Q6_K': { bpw: 6.55, family: 'k-quant', sweetSpot: true, hint: '★ Near-lossless quality pick' },
    'IQ1_S': { bpw: 1.56, family: 'i-quant', sweetSpot: false, hint: 'Extremely small, low quality' },
    'IQ1_M': { bpw: 1.75, family: 'i-quant', sweetSpot: false, hint: 'Small 1-bit imatrix' },
    'IQ2_XXS': { bpw: 2.06, family: 'i-quant', sweetSpot: false, hint: 'Very small 2-bit imatrix' },
    'IQ2_XS': { bpw: 2.31, family: 'i-quant', sweetSpot: false, hint: '2-bit imatrix XS' },
    'IQ2_S': { bpw: 2.5, family: 'i-quant', sweetSpot: false, hint: '2-bit imatrix S' },
    'IQ2_M': { bpw: 2.72, family: 'i-quant', sweetSpot: false, hint: '2-bit imatrix M; punches above weight' },
    'IQ3_XXS': { bpw: 3.06, family: 'i-quant', sweetSpot: false, hint: '3-bit imatrix XXS' },
    'IQ3_XS': { bpw: 3.3, family: 'i-quant', sweetSpot: false, hint: '3-bit imatrix XS' },
    'IQ3_S': { bpw: 3.5, family: 'i-quant', sweetSpot: false, hint: '3-bit imatrix S' },
    'IQ3_M': { bpw: 3.7, family: 'i-quant', sweetSpot: false, hint: '3-bit imatrix M' },
    'IQ4_XS': { bpw: 4.35, family: 'i-quant', sweetSpot: true, hint: '★ Excellent size/quality; smaller than Q4_K_M' },
    'IQ4_NL': { bpw: 4.58, family: 'i-quant', sweetSpot: false, hint: 'Non-linear 4-bit imatrix' },
    'UD-IQ1_S': { bpw: 1.9, family: 'unsloth', sweetSpot: false, hint: 'Dynamic 1-bit; best quality at 1-bit' },
    'UD-IQ1_M': { bpw: 2, family: 'unsloth', sweetSpot: false, hint: 'Dynamic 1-bit M' },
    'UD-IQ2_XXS': { bpw: 2.3, family: 'unsloth', sweetSpot: false, hint: 'Dynamic 2-bit XXS' },
    'UD-IQ2_M': { bpw: 2.8, family: 'unsloth', sweetSpot: false, hint: 'Dynamic 2-bit M' },
    'UD-Q2_K_XL': { bpw: 3.15, family: 'unsloth', sweetSpot: false, hint: 'Dynamic Q2_K XL layers' },
    'UD-IQ3_XXS': { bpw: 3.2, family: 'unsloth', sweetSpot: false, hint: 'Dynamic 3-bit XXS' },
    'UD-Q3_K_XL': { bpw: 4, family: 'unsloth', sweetSpot: false, hint: 'Dynamic Q3_K XL layers' },
    'UD-Q4_K_XL': { bpw: 4.9, family: 'unsloth', sweetSpot: false, hint: 'Dynamic Q4_K XL; best quality/GB at 4-bit' },
    'UD-Q5_K_XL': { bpw: 5.7, family: 'unsloth', sweetSpot: false, hint: 'Dynamic Q5_K XL layers' },
    'UD-Q6_K_XL': { bpw: 7.05, family: 'unsloth', sweetSpot: false, hint: 'Dynamic Q6_K XL layers' },
    'UD-Q8_K_XL': { bpw: 9.8, family: 'unsloth', sweetSpot: false, hint: 'Dynamic Q8_K XL; maximum quality' },
    'MXFP4': { bpw: 4.25, family: 'fp4', sweetSpot: false, hint: 'MX FP4 (OCP standard, in GGUF; Blackwell)' },
    'NVFP4': { bpw: 4.5, family: 'fp4', sweetSpot: false, hint: 'NVIDIA FP4 (vLLM/TensorRT; Blackwell)' },
    'FP8': { bpw: 8, family: 'full', sweetSpot: false, hint: '8-bit float; hardware-dependent support' },
    'FP16': { bpw: 16, family: 'full', sweetSpot: false, hint: 'Half precision; reference quality' },
    'BF16': { bpw: 16, family: 'full', sweetSpot: false, hint: 'BFloat16; training standard' },
    'FP32': { bpw: 32, family: 'full', sweetSpot: false, hint: 'Full precision; rarely practical locally' },
} as const satisfies Record<string, QuantEntry>;

type Quantization = keyof typeof QUANT_CATALOG;

/**
 * KV cache quantization options (llama.cpp names).
 */
const KVCacheQuant = {
    F16: 'f16',
    Q8_0: 'q8_0',
    Q5_1: 'q5_1',
    Q5_0: 'q5_0',
    Q4_1: 'q4_1',
    Q4_0: 'q4_0',
    IQ4_NL: 'iq4_nl',
} as const;

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

const GpuType = { NVIDIA_AMD: 'nvidia-amd', APPLE: 'apple', INTEL_INTEGRATED: 'intel-integrated' } as const;
type GpuType = (typeof GpuType)[keyof typeof GpuType];

const InferenceEngine = { LLAMA_CPP: 'llama.cpp', OLLAMA: 'ollama', LM_STUDIO: 'lm-studio' } as const;
type InferenceEngine = (typeof InferenceEngine)[keyof typeof InferenceEngine];

interface OffloadResult {
    readonly verdict: 'fits' | 'partial' | 'no_fit';
    readonly model_gb: number;
    readonly kv_cache_gb: number;
    readonly backend_gb: number;
    readonly compute_gb: number;
    readonly total_needed_gb: number;
    readonly available_gb: number | null;
    readonly layers_on_gpu: number;
    readonly total_layers: number;
    readonly gpu_resident_gb: number;
    readonly ram_spill_gb: number;
    readonly note: string | null;
}

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

    /** KV cache quantization level. Default: q8_0. */
    readonly kv_cache_quant?: KVCacheQuant;

    /** Optional asymmetric V cache quantization. Defaults to kv_cache_quant if not provided. */
    readonly kv_cache_quant_v?: KVCacheQuant;

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

    /** Batch size for inference. Default: 1 */
    readonly batch_size?: number | null;

    /** GPU architecture for offload analysis. */
    readonly gpu_type?: GpuType | null;

    /** Inference engine for backend overhead. Default: llama.cpp. */
    readonly engine?: InferenceEngine | null;
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
    readonly gpu_type: GpuType | null;
    readonly engine: InferenceEngine | null;
    readonly active_ratio: number;
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
    readonly eff_bpw: number;
    readonly family: string;
    readonly sweet_spot: boolean;
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
    readonly offload_result: OffloadResult | null;
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
    | 'INVALID_ACTIVE_EXPERTS'
    | 'INVALID_BATCH_SIZE';

// ============================================================================
// SECTION 2: Constants
// ============================================================================

/**
 * Bytes per value for each KV cache quantization level.
 * Used in exact KV cache calculation when layer count is known.
 */
const KV_CACHE_BYTES = {
    f16: 2,
    q8_0: 1,
    q5_1: 0.69,
    q5_0: 0.66,
    q4_1: 0.56,
    q4_0: 0.5,
    iq4_nl: 0.56,
} as const satisfies Record<KVCacheQuant, number>;

/**
 * Scaling factor for KV cache estimation when architecture is unknown.
 * Relative to F16 baseline (factor 1.0).
 */
const KV_CACHE_FACTOR = {
    f16: 1,
    q8_0: 0.5,
    q5_1: 0.345,
    q5_0: 0.33,
    q4_1: 0.28,
    q4_0: 0.25,
    iq4_nl: 0.28,
} as const satisfies Record<KVCacheQuant, number>;

/**
 * OS-specific memory overhead configuration.
 */
const OS_OVERHEAD_CONFIG = {
    'macos': { type: 'percent', value: 0.25 },
    'windows': { type: 'fixed', value: 0.8 },
    'linux-gui': { type: 'fixed', value: 0.5 },
    'linux-headless': { type: 'fixed', value: 0.05 },
} as const satisfies Record<OperatingSystem, { readonly type: 'percent' | 'fixed'; readonly value: number }>;

const BACKEND_BASELINE_GB: Record<InferenceEngine, number> = {
    'llama.cpp': 0.75,
    'ollama': 0.75,
    'lm-studio': 0.75,
} as const;

const COMPUTE_BUFFER_TIERS: readonly [number, number][] = [
    [8192, 0.3],
    [16384, 0.4],
    [32768, 0.5],
    [65536, 0.75],
    [131072, 1],
    [262144, 1.5],
    [Infinity, 2.5],
];

/** Standard context sizes for multi-context analysis. */
const STANDARD_CONTEXTS = [4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576] as const;

/** Standard quantizations for multi-quantization analysis. */
const STANDARD_QUANTIZATIONS: readonly Quantization[] = [
    'Q2_K',
    'IQ2_M',
    'Q3_K_S',
    'Q3_K_M',
    'IQ3_M',
    'IQ4_XS',
    'Q4_0',
    'Q4_K_S',
    'Q4_K_M',
    'UD-Q4_K_XL',
    'Q5_K_M',
    'Q6_K',
    'Q8_0',
    'FP16',
    'FP32',
] as const;

/** Preferred quantizations for optimal recommendations (balance of quality and size). */
const OPTIMAL_QUANTIZATIONS: readonly Quantization[] = ['Q4_K_M', 'IQ4_XS', 'Q5_K_M', 'Q4_K_S'] as const;

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
 * Estimates transformer layers from parameter count.
 * Based on common model architectures (Llama, Mistral, Qwen).
 */
function estimateLayers(params_b: number): number {
    if (params_b <= 1) return 16;
    if (params_b <= 4) return 24;
    if (params_b <= 8) return 32;
    if (params_b <= 14) return 40;
    if (params_b <= 32) return 48;
    if (params_b <= 70) return 80;
    return 80 + Math.floor((params_b - 70) * 0.5);
}

/**
 * Estimates head dimension from parameter count.
 * Most modern models use 128 for head dim; small sub-2B models often use 64.
 */
function estimateHeadDim(params_b: number): number {
    return params_b <= 2 ? 64 : 128;
}

/**
 * Estimates KV heads from parameter count.
 * GQA models typically use 8-16 KV heads regardless of size
 */
function estimateKvHeads(params_b: number): number {
    if (params_b <= 8) return 8;
    if (params_b <= 32) return 8;
    return 16;
}

/**
 * Estimates model file size from parameters and quantization.
 * Uses effective bits-per-weight from QUANT_CATALOG (empirical whole-file values).
 *
 * @param params_b - Model parameters in billions.
 * @param quantization - Quantization level.
 * @returns Estimated GGUF file size in GB.
 */
function estimateModelSize(params_b: number, quantization: Quantization): number {
    return (params_b * QUANT_CATALOG[quantization].bpw) / 8;
}

/**
 * Estimates compute buffer in GB based on context size, batch size, and MoE active ratio.
 */
function estimateComputeBuffer(context_size: number, batch_size: number, active_ratio: number = 1): number {
    const base = COMPUTE_BUFFER_TIERS.find(([maxCtx]) => context_size <= maxCtx)?.[1] ?? 2.5;
    return base * batch_size * active_ratio;
}

/**
 * Returns backend baseline GB for the given inference engine.
 */
function getBackendBaseline(engine: InferenceEngine | null): number {
    return engine === null ? 0.75 : BACKEND_BASELINE_GB[engine];
}

/**
 * Calculates the GPU offload result (fits/partial/no_fit verdict).
 */
function calculateOffload(
    modelSize_gb: number,
    kv_gb: number,
    backend_gb: number,
    compute_gb: number,
    available_gb: number | null,
    total_layers: number,
    os: OperatingSystem | null,
    gpu_type: GpuType | null,
): OffloadResult {
    const total_needed_gb = modelSize_gb + kv_gb + backend_gb + compute_gb;

    if (available_gb === null) {
        return {
            verdict: 'fits',
            model_gb: modelSize_gb,
            kv_cache_gb: kv_gb,
            backend_gb,
            compute_gb,
            total_needed_gb,
            available_gb: null,
            layers_on_gpu: total_layers,
            total_layers,
            gpu_resident_gb: modelSize_gb,
            ram_spill_gb: 0,
            note: null,
        };
    }

    if (total_needed_gb <= available_gb) {
        return {
            verdict: 'fits',
            model_gb: modelSize_gb,
            kv_cache_gb: kv_gb,
            backend_gb,
            compute_gb,
            total_needed_gb,
            available_gb,
            layers_on_gpu: total_layers,
            total_layers,
            gpu_resident_gb: modelSize_gb,
            ram_spill_gb: 0,
            note: null,
        };
    }

    // How many weight layers fit after reserving overhead + KV?
    const gpu_budget_for_weights = Math.max(0, available_gb - backend_gb - compute_gb - kv_gb);
    const size_per_layer = total_layers > 0 ? modelSize_gb / total_layers : modelSize_gb;
    const layers_on_gpu =
        total_layers > 0 ? Math.max(0, Math.min(total_layers, Math.floor(gpu_budget_for_weights / size_per_layer))) : 0;

    if (layers_on_gpu === 0) {
        return {
            verdict: 'no_fit',
            model_gb: modelSize_gb,
            kv_cache_gb: kv_gb,
            backend_gb,
            compute_gb,
            total_needed_gb,
            available_gb,
            layers_on_gpu: 0,
            total_layers,
            gpu_resident_gb: backend_gb + compute_gb,
            ram_spill_gb: modelSize_gb,
            note: null,
        };
    }

    const gpu_resident_model = layers_on_gpu * size_per_layer;
    const ram_spill_gb = roundTo(modelSize_gb - gpu_resident_model, 2);
    const gpu_resident_gb = roundTo(gpu_resident_model + backend_gb + compute_gb, 2);

    let note: string | null = null;
    if (gpu_type === 'nvidia-amd' && os === 'windows') {
        note = 'Windows may spill overflow weights to slow shared GPU memory (system RAM)';
    } else if (gpu_type === 'nvidia-amd' && (os === 'linux-gui' || os === 'linux-headless')) {
        note = 'NVIDIA on Linux has no shared-memory fallback — hard OOM if weights exceed VRAM';
    }

    return {
        verdict: 'partial',
        model_gb: modelSize_gb,
        kv_cache_gb: kv_gb,
        backend_gb,
        compute_gb,
        total_needed_gb,
        available_gb,
        layers_on_gpu,
        total_layers,
        gpu_resident_gb,
        ram_spill_gb,
        note,
    };
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
 * @param kvCacheQuantK - KV cache quantization level for K tensor.
 * @param kvCacheQuantV - KV cache quantization level for V tensor.
 * @param layers - Number of transformer layers, or null for estimation.
 * @param keyDim - Key head dimension.
 * @param valueDim - Value head dimension.
 * @param kvHeads - Number of KV heads.
 * @param slidingWindow - Sliding window cap, or null for no cap.
 * @param batch_size - Batch size for inference.
 * @returns KV cache size in GB.
 */
function calculateKvCache(
    params_b: number,
    contextSize: number,
    kvCacheEnabled: boolean,
    kvCacheQuantK: KVCacheQuant,
    kvCacheQuantV: KVCacheQuant,
    layers: number | null,
    keyDim: number,
    valueDim: number,
    kvHeads: number,
    slidingWindow: number | null,
    batch_size: number = 1,
): number {
    if (!kvCacheEnabled) return 0;

    let effectiveContext = contextSize;
    if (slidingWindow !== null && slidingWindow > 0) {
        effectiveContext = Math.min(contextSize, slidingWindow);
    }

    const bytesK = KV_CACHE_BYTES[kvCacheQuantK];
    const bytesV = KV_CACHE_BYTES[kvCacheQuantV];

    if (layers !== null) {
        // EXACT: K tensor + V tensor separately (no leading 2×)
        const kvBytes = layers * effectiveContext * batch_size * kvHeads * (keyDim * bytesK + valueDim * bytesV);
        return kvBytes / BYTES_PER_GB;
    }

    // ESTIMATED: both K and V; estimatedHeadDim is shared
    const estimatedLayers = estimateLayers(params_b);
    const estimatedHeadDim = estimateHeadDim(params_b);
    const estimatedKvHeads = estimateKvHeads(params_b);
    const avgBytes = (bytesK + bytesV) / 2;
    const kvBytes =
        estimatedLayers *
        effectiveContext *
        batch_size *
        estimatedKvHeads *
        (estimatedHeadDim + estimatedHeadDim) *
        avgBytes;
    return kvBytes / BYTES_PER_GB;
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
    readonly quantBpw: number;
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

    // Validate batch_size value
    if (input.batch_size !== undefined && input.batch_size !== null) {
        if (!isFinitePositiveInteger(input.batch_size)) {
            return err('INVALID_BATCH_SIZE');
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
 * Finds the configuration with maximum quality (bpw then context) from a list.
 */
function findMaxQuality(configs: readonly ConfigEntry[]): ConfigEntry {
    return configs.reduce((best, c) => {
        if (c.quantBpw > best.quantBpw) return c;
        if (c.quantBpw === best.quantBpw && c.context > best.context) return c;
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
    // Prefer Q4_K_M, IQ4_XS, Q5_K_M, Q4_K_S, largest context that fits
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
    gpu_type: GpuType | null,
    engine: InferenceEngine | null,
    active_ratio: number,
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
        model_size_gb: model_size_gb ?? 'estimated',
        quantization: quantization ?? 'all',
        context_size: context_size ?? 'all',
        kv_cache_enabled,
        kv_cache_quant,
        os,
        vram_gb,
        layers: layers ?? 'estimated',
        sliding_window,
        is_moe: expert_count !== null,
        expert_info: expertInfo,
        gpu_type,
        engine,
        active_ratio,
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
    kv_cache_quant_k: KVCacheQuant,
    kv_cache_quant_v: KVCacheQuant,
    layers: number | null,
    key_dim: number,
    value_dim: number,
    kv_heads: number,
    sliding_window: number | null,
    availableVram: number | null,
    quant: Quantization,
    batch_size: number,
    backendGb: number,
    active_ratio: number,
): { contextTable: readonly ContextEntry[]; configs: readonly ConfigEntry[] } {
    const contextTable: ContextEntry[] = [];
    const configs: ConfigEntry[] = [];
    const quantBpw = QUANT_CATALOG[quant].bpw;

    for (const ctx of contextList) {
        const kvCache = calculateKvCache(
            params_b,
            ctx,
            kv_cache_enabled,
            kv_cache_quant_k,
            kv_cache_quant_v,
            layers,
            key_dim,
            value_dim,
            kv_heads,
            sliding_window,
            batch_size,
        );

        const computeGb = estimateComputeBuffer(ctx, batch_size, active_ratio);
        const vramWithCache = modelSize + kvCache + backendGb + computeGb;
        const vramWithoutCache = modelSize + backendGb + computeGb;

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
            quantBpw,
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
    const kv_cache_quant = input.kv_cache_quant ?? 'q8_0';
    const kv_cache_quant_v = input.kv_cache_quant_v ?? kv_cache_quant;
    const os = input.os ?? null;
    const vram_gb = input.vram_gb ?? null;
    const layers = input.layers ?? null;
    const key_dim = input.key_dim ?? 128;
    const value_dim = input.value_dim ?? 128;
    const kv_heads = input.kv_heads ?? 8;
    const sliding_window = input.sliding_window ?? null;
    const expert_count = input.expert_count ?? null;
    const active_experts = input.active_experts ?? null;
    const batch_size = input.batch_size ?? 1;
    const gpu_type = input.gpu_type ?? null;
    const engine = input.engine ?? null;
    const active_ratio =
        expert_count !== null && expert_count !== undefined && active_experts !== null && active_experts !== undefined
            ? Math.min(1, active_experts / expert_count)
            : 1;
    const backendGb = getBackendBaseline(engine);

    // Step 1: Determine quantization list
    const quantList: readonly Quantization[] = quantization === null ? STANDARD_QUANTIZATIONS : [quantization];

    // Step 2: Determine context list
    let contextList: readonly number[];
    if (context_size === null) {
        contextList = STANDARD_CONTEXTS;
    } else {
        const contextSet = new Set<number>([context_size]);
        for (const stdCtx of STANDARD_CONTEXTS) {
            contextSet.add(stdCtx);
        }
        contextList = Array.from(contextSet).sort((a, b) => a - b);
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
        gpu_type,
        engine,
        active_ratio,
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
        const computeAtMinCtx = estimateComputeBuffer(MIN_CONTEXT_SIZE, batch_size, active_ratio);
        const minVramNoCache = modelSize + backendGb + computeAtMinCtx;
        const minKv = calculateKvCache(
            params_b,
            MIN_CONTEXT_SIZE,
            kv_cache_enabled,
            kv_cache_quant,
            kv_cache_quant_v,
            layers,
            key_dim,
            value_dim,
            kv_heads,
            sliding_window,
            batch_size,
        );
        const minVramWithCache = modelSize + minKv + backendGb + computeAtMinCtx;

        // Build context table
        const { contextTable, configs } = buildContextAnalysis(
            params_b,
            modelSize,
            contextList,
            kv_cache_enabled,
            kv_cache_quant,
            kv_cache_quant_v,
            layers,
            key_dim,
            value_dim,
            kv_heads,
            sliding_window,
            availableVram,
            quant,
            batch_size,
            backendGb,
            active_ratio,
        );

        allConfigs.push(...configs);

        quantizationAnalysis.push({
            quantization: quant,
            eff_bpw: QUANT_CATALOG[quant].bpw,
            family: QUANT_CATALOG[quant].family,
            sweet_spot: QUANT_CATALOG[quant].sweetSpot,
            estimated_gguf_gb: estimatedSize === null ? null : roundTo(estimatedSize, 2),
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

    // Step 8: Compute offload result
    let offload_result: OffloadResult | null = null;
    if (availableVram !== null && quantizationAnalysis.length > 0) {
        const primaryAnalysis = quantizationAnalysis[0];
        const primaryModelSizeGb =
            primaryAnalysis.estimated_gguf_gb ??
            (model_size_gb !== null && quantList.length === 1
                ? model_size_gb
                : estimateModelSize(params_b, quantList[0]));
        const offloadCtx = context_size ?? MIN_CONTEXT_SIZE;
        const offloadEntry =
            primaryAnalysis.context_table.find((e) => e.context_size === offloadCtx) ??
            primaryAnalysis.context_table[0];
        const offloadKv = offloadEntry?.kv_cache_gb ?? 0;
        const offloadCompute = estimateComputeBuffer(offloadCtx, batch_size, active_ratio);
        const totalLayersForOffload = layers ?? estimateLayers(params_b);

        offload_result = calculateOffload(
            primaryModelSizeGb,
            offloadKv,
            backendGb,
            offloadCompute,
            availableVram,
            totalLayersForOffload,
            os,
            gpu_type,
        );
    }

    return {
        input_summary: inputSummary,
        os_overhead: osOverhead,
        quantization_analysis: quantizationAnalysis,
        recommendations,
        summary,
        offload_result,
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
 *   quantization: 'Q4_K_M',
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
 * - When `quantization` is null, calculates for 15 curated formats: Q2_K, IQ2_M, Q3_K_S, Q3_K_M, IQ3_M,
 *   IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, UD-Q4_K_XL, Q5_K_M, Q6_K, Q8_0, FP16, FP32.
 * - When `vram_gb` is provided, generates recommendations for configurations that fit.
 * - Recommendations include three tiers: optimal (balanced), minimum (smallest), maximum_quality (best quality).
 * - OS overhead varies: macOS reserves 25%, Windows 0.8GB, Linux GUI 0.5GB, Linux headless 0.05GB.
 * - KV cache calculation is exact when `layers` is provided, otherwise uses empirical estimation.
 * - Model size is estimated as params_b × bpw / 8, where bpw is from QUANT_CATALOG (empirical whole-file values).
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
 * - Quantization: Union type of all quant keys (type-only)
 * - QuantEntry: Metadata structure for a quant catalog entry (type-only)
 *
 * Exported Constants:
 * - QUANT_CATALOG: 44-entry catalog of GGUF quantization formats with effective bpw
 * - KVCacheQuant: KV cache quantization options
 * - OperatingSystem: Supported operating systems
 * - GpuType: GPU architecture types
 * - InferenceEngine: Inference engine options
 * - STANDARD_CONTEXTS: Standard context sizes for analysis
 * - STANDARD_QUANTIZATIONS: 15 curated standard quantization levels
 * - KV_CACHE_BYTES: Bytes per KV value mapping
 * - KV_CACHE_FACTOR: KV cache scaling factors
 * - BACKEND_BASELINE_GB: Backend baseline memory per engine
 */

export {
    BACKEND_BASELINE_GB,
    GpuType,
    InferenceEngine,
    KVCacheQuant,
    KV_CACHE_BYTES,
    KV_CACHE_FACTOR,
    OperatingSystem,
    QUANT_CATALOG,
    // Configuration constants
    STANDARD_CONTEXTS,
    STANDARD_QUANTIZATIONS,
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
    OffloadResult,
    QuantEntry,
    // Error, Result, and Quantization types
    Quantization,
    QuantizationAnalysis,
    Recommendation,
    RecommendationTier,
    Result,
    SummaryStatistics,
    ValidationError,
};
