---
name: update-vram-model
description: Extend the LLM VRAM calculator — add quant families, update formulas, add test anchors
---

# Update the VRAM Calculator Engine

Engine: `src/common/llm-vram-calc.ts` (~1412 lines)

**Read `.tmp/research/VRAM-RESEARCH.md` first.** It contains the authoritative quant bpw table, KV-cache formula, MoE factor, and sanity anchors. Do not use memory or external sources for bit-widths.

## Key types (abbreviated)

```ts
type QuantEntry = { bpw: number; family: string; sweetSpot: boolean; hint: string };
type Quantization = keyof typeof QUANT_CATALOG;
type GpuType = 'nvidia' | 'amd' | 'apple' | 'cpu';
type KVCacheQuant = 'fp16' | 'fp8' | 'q8' | 'q4';
```

## Steps

- [ ]   1. **Add quant families** to `QUANT_CATALOG` near the top of `llm-vram-calc.ts`:

    ```ts
    'Q4_K_M': { bpw: 4.85, family: 'GGUF', sweetSpot: true, hint: 'Best size/quality balance' },
    ```

    Use empirical bpw values from `.tmp/research/VRAM-RESEARCH.md` — not rounded integers.

- [ ]   2. **Update `calculateVram()`** following the 7-step plan in the research doc:
    1. Use catalog `bpw` for weight memory
    1. Apply KV-cache formula (accounts for `kvCacheQuant`)
    1. Apply MoE adjustment factor
    1. Add context-scaling overhead
    1. Apply per-engine overhead factors
    1. Apply per-OS memory factors
    1. Clamp and format output

- [ ]   3. **Run existing tests** — all cases must remain green:

    ```bash
    npx jest test/common/llm-vram-calc.test.ts
    ```

- [ ]   4. **Add anchored test cases** from the research doc's sanity anchors:

    ```ts
    it('70B Q4_K_M fits in ~42 GB', () => {
        const result = calculateVram({ params: 70, quant: 'Q4_K_M' /* ... */ });
        expect(result.totalGb).toBeGreaterThan(40);
        expect(result.totalGb).toBeLessThan(45);
    });
    ```

- [ ]   5. **Full verify**:

    ```bash
    npm run verify
    npm run verify:ui           # navigate to LLM VRAM Calculator, enter known anchor values, confirm output matches
    ```

- [ ]   6. **Commit**: `git add -A && git commit -m "feat(vram): ..."` then `git status` clean.
