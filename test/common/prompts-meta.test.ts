import { META_CATEGORY_CODES, isMetaPrompt } from '../../src/common/prompts/meta';

describe('META_CATEGORY_CODES', () => {
    it('contains exactly D01 D02 D03 D05 D06', () => {
        expect([...META_CATEGORY_CODES].sort()).toEqual(['D01', 'D02', 'D03', 'D05', 'D06']);
    });
});

describe('isMetaPrompt — category code fallback', () => {
    const make = (categoryCode: string, isMetaPrompt?: boolean) => ({ categoryCode, isMetaPrompt });

    it('D01 (prompt-engineering) → true', () => expect(isMetaPrompt(make('D01'))).toBe(true));
    it('D02 (image generation) → true', () => expect(isMetaPrompt(make('D02'))).toBe(true));
    it('D03 (image editing) → true', () => expect(isMetaPrompt(make('D03'))).toBe(true));
    it('D05 (skill authoring) → true', () => expect(isMetaPrompt(make('D05'))).toBe(true));
    it('D06 (video generation) → true', () => expect(isMetaPrompt(make('D06'))).toBe(true));

    it('D04 (diagrams) → false', () => expect(isMetaPrompt(make('D04'))).toBe(false));
    it('A01 (software eng) → false', () => expect(isMetaPrompt(make('A01'))).toBe(false));
    it('B02 (writing) → false', () => expect(isMetaPrompt(make('B02'))).toBe(false));
    it('C03 (thinking) → false', () => expect(isMetaPrompt(make('C03'))).toBe(false));
});

describe('isMetaPrompt — explicit flag overrides category', () => {
    it('isMetaPrompt: true + non-meta D04 → true', () =>
        expect(isMetaPrompt({ categoryCode: 'D04', isMetaPrompt: true })).toBe(true));

    it('isMetaPrompt: false + meta D01 → false', () =>
        expect(isMetaPrompt({ categoryCode: 'D01', isMetaPrompt: false })).toBe(false));

    it('isMetaPrompt: undefined + meta D02 → true (falls through to category)', () =>
        expect(isMetaPrompt({ categoryCode: 'D02', isMetaPrompt: undefined })).toBe(true));
});
