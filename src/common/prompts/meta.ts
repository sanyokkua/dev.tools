export const META_CATEGORY_CODES: ReadonlySet<string> = new Set(['D01', 'D02', 'D03', 'D05', 'D06']);

export function isMetaPrompt(variant: { isMetaPrompt?: boolean; categoryCode: string }): boolean {
    return variant.isMetaPrompt ?? META_CATEGORY_CODES.has(variant.categoryCode);
}
