import { isMetaPrompt } from '../../src/common/prompts/meta';

describe('isMetaPrompt — explicit flag', () => {
    it('isMetaPrompt: true → true', () => expect(isMetaPrompt({ isMetaPrompt: true })).toBe(true));
    it('isMetaPrompt: false → false', () => expect(isMetaPrompt({ isMetaPrompt: false })).toBe(false));
    it('isMetaPrompt: undefined → false', () => expect(isMetaPrompt({ isMetaPrompt: undefined })).toBe(false));

    it('true overrides non-meta category context', () => expect(isMetaPrompt({ isMetaPrompt: true })).toBe(true));

    it('false overrides formerly-meta category context', () =>
        expect(isMetaPrompt({ isMetaPrompt: false })).toBe(false));
});
