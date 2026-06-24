import { createDecodingUtils, createEncodingUtils } from '@/common/utils-factory';

const encode = createEncodingUtils().find((u) => u.toolId === 'encode-html-entities')!.toolFunction;
const decode = createDecodingUtils().find((u) => u.toolId === 'decode-html-entities')!.toolFunction;

describe('HTML entities encode', () => {
    it('encodes angle brackets', () => {
        expect(encode('<b>bold</b>')).toBe('&lt;b&gt;bold&lt;/b&gt;');
    });
    it('encodes ampersand', () => {
        expect(encode('a & b')).toBe('a &amp; b');
    });
    it('encodes double quotes', () => {
        expect(encode('"hi"')).toBe('&quot;hi&quot;');
    });
});

describe('HTML entities decode', () => {
    it('decodes &lt; and &gt;', () => {
        expect(decode('&lt;b&gt;')).toBe('<b>');
    });
    it('round-trips encode → decode', () => {
        const input = '<a href="x">test & more</a>';
        expect(decode(encode(input))).toBe(input);
    });
});
