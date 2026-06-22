import type { LogicalPromptDef, Mode, PromptVariant } from './model/types';

export interface SelectAxes {
    mode?: Mode;
    model?: string;
    sub?: string;
}

export function selectVariant(logical: LogicalPromptDef, axes: SelectAxes): PromptVariant {
    const { mode, model, sub } = axes;
    let candidates = logical.variants;

    if (mode != null && candidates.some((v) => v.executionContext != null)) {
        const filtered = candidates.filter((v) => v.executionContext === mode);
        if (filtered.length) candidates = filtered;
    }

    if (model != null && candidates.some((v) => v.model != null)) {
        const filtered = candidates.filter((v) => v.model === model);
        if (filtered.length) candidates = filtered;
    }

    if (sub != null && candidates.some((v) => v.subVariant != null)) {
        const filtered = candidates.filter((v) => v.subVariant === sub);
        if (filtered.length) candidates = filtered;
    }

    const defaultV = logical.variants.find((v) => v.id === logical.defaultVariantId);
    return candidates[0] ?? defaultV ?? logical.variants[0];
}

export function preserveParamValues(
    prevValues: Record<string, string>,
    prevVariant: PromptVariant,
    nextVariant: PromptVariant,
): Record<string, string> {
    const prevNames = new Set(prevVariant.parameters.map((p) => p.name));
    const result: Record<string, string> = {};
    for (const param of nextVariant.parameters) {
        const value = prevValues[param.name];
        if (prevNames.has(param.name) && value) {
            result[param.name] = value;
        }
    }
    return result;
}
