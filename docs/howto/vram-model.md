# How to Extend the LLM VRAM Calculator Engine

## Engine location

`src/common/llm-vram-calc.ts` (~1412 lines)

---

## Before you start

Read `.tmp/research/VRAM-RESEARCH.md` before modifying the engine. It contains:

- The empirical quant table used to calibrate `QUANT_CATALOG`
- The KV-cache formula
- The MoE adjustment factor
- Context-scaling overhead methodology
- 7 concrete improvement steps with sanity anchors

Do not rely on memory or external sources for quant bit-widths — use the research doc as the authoritative reference.

---

## Key types

```ts
// One entry in the quant catalog
type QuantEntry = {
    bpw: number; // bits per weight
    family: string; // e.g. 'GGUF', 'GPTQ', 'AWQ'
    sweetSpot: boolean; // marks recommended quants in the UI
    hint: string; // short label shown to the user
};

// Main input to calculateVram()
type CalculatorInput = {
    params: number; // model parameter count in billions
    quant: Quantization; // key of QUANT_CATALOG
    gpuType: GpuType;
    vramGb: number;
    os: OperatingSystem;
    contextTokens: number;
    kvCacheQuant: KVCacheQuant;
    inferenceEngine: InferenceEngine;
    // ... additional fields — see the type definition in the file
};

// Derived from QUANT_CATALOG keys
type Quantization = keyof typeof QUANT_CATALOG;

// String literal unions — see file for full values
type KVCacheQuant = 'fp16' | 'fp8' | 'q8' | 'q4';
type OperatingSystem = 'linux' | 'macos' | 'windows';
type GpuType = 'nvidia' | 'amd' | 'apple' | 'cpu';
type InferenceEngine = 'llama.cpp' | 'ollama' | 'vllm' | 'transformers' | 'mlx';
```

---

## How to extend

### 1. Add new quant families to `QUANT_CATALOG`

Locate `QUANT_CATALOG` near the top of `src/common/llm-vram-calc.ts` and add entries for new quant families (K-quants, I-quants, UD-quants, FP4, etc.):

```ts
'Q4_K_M': { bpw: 4.85, family: 'GGUF', sweetSpot: true, hint: 'Best size/quality balance' },
'FP4':    { bpw: 4.0,  family: 'GPTQ', sweetSpot: false, hint: 'FP4 quantization' },
```

Use the empirical bpw values from `.tmp/research/VRAM-RESEARCH.md`, not rounded integers.

### 2. Update `calculateVram()`

Follow the 7-step plan in the research doc when modifying the core calculation:

1. Use the catalog `bpw` directly for weight memory.
2. Apply the KV-cache formula from the research doc (accounts for `kvCacheQuant`).
3. Apply the MoE adjustment factor for mixture-of-experts models.
4. Add context-scaling overhead.
5. Apply per-engine overhead factors.
6. Apply per-OS memory management factors.
7. Clamp and format the output.

### 3. Run existing tests

All 198 existing cases must remain green after any change:

```bash
npx jest test/common/llm-vram-calc.test.ts
```

### 4. Add new anchored test cases

Add test cases from the sanity anchors in the research doc. Each anchor specifies a concrete model size × quant combination and an expected VRAM range. Example shape:

```ts
it('70B Q4_K_M fits in ~42 GB', () => {
  const result = calculateVram({ params: 70, quant: 'Q4_K_M', ... });
  expect(result.totalGb).toBeGreaterThan(40);
  expect(result.totalGb).toBeLessThan(45);
});
```

### 5. Live verify

```bash
npm run verify:ui
```

Navigate to the LLM VRAM Calculator. Enter known values from the research doc's sanity anchors (e.g. 70B params, Q4_K_M quant → expected ~42 GB) and confirm the displayed output matches expectations.

---

## Verification checklist

- [ ] `npx jest test/common/llm-vram-calc.test.ts` — all existing tests pass
- [ ] New test cases added for any new quant entries or formula changes
- [ ] `npm run verify` — full lint + test pipeline clean
- [ ] `npm run verify:ui` — live calculator output matches research doc anchors
