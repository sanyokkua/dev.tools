import { normalizeForDiff } from '@/common/diff-normalizer';

describe('normalizeForDiff – type=text', () => {
    it('returns the input unchanged', () => {
        expect(normalizeForDiff('hello world', 'text')).toEqual({ result: 'hello world' });
    });

    it('returns empty string unchanged', () => {
        expect(normalizeForDiff('', 'text')).toEqual({ result: '' });
    });

    it('returns whitespace-only string unchanged', () => {
        expect(normalizeForDiff('   ', 'text')).toEqual({ result: '   ' });
    });
});

describe('normalizeForDiff – type=json', () => {
    it('returns empty string unchanged (no normalization attempt)', () => {
        expect(normalizeForDiff('', 'json')).toEqual({ result: '' });
    });

    it('returns whitespace-only string unchanged', () => {
        expect(normalizeForDiff('   ', 'json')).toEqual({ result: '   ' });
    });

    it('pretty-prints valid JSON with 2-space indent', () => {
        const { result, error } = normalizeForDiff('{"a":1}', 'json');
        expect(error).toBeUndefined();
        expect(result).toBe('{\n  "a": 1\n}');
    });

    it('sorts object keys alphabetically', () => {
        const { result, error } = normalizeForDiff('{"b":2,"a":1}', 'json');
        expect(error).toBeUndefined();
        expect(result).toBe('{\n  "a": 1,\n  "b": 2\n}');
    });

    it('sorts keys recursively in nested objects', () => {
        const { result } = normalizeForDiff('{"z":{"y":1,"x":2},"a":0}', 'json');
        const parsed = JSON.parse(result);
        expect(Object.keys(parsed)).toEqual(['a', 'z']);
        expect(Object.keys(parsed.z)).toEqual(['x', 'y']);
    });

    it('returns raw text + error for invalid JSON', () => {
        const raw = '{invalid json}';
        const { result, error } = normalizeForDiff(raw, 'json');
        expect(result).toBe(raw);
        expect(error).toBeTruthy();
        expect(typeof error).toBe('string');
    });

    it('handles JSON arrays without throwing', () => {
        const { result, error } = normalizeForDiff('[1,2,3]', 'json');
        expect(error).toBeUndefined();
        expect(JSON.parse(result)).toEqual([1, 2, 3]);
    });
});

describe('normalizeForDiff – type=xml', () => {
    it('returns empty string unchanged', () => {
        expect(normalizeForDiff('', 'xml')).toEqual({ result: '' });
    });

    it('pretty-prints valid XML', () => {
        const { result, error } = normalizeForDiff('<root><item>hi</item></root>', 'xml');
        expect(error).toBeUndefined();
        expect(result).toContain('<?xml');
        expect(result).toContain('  <item>hi</item>');
    });

    it('returns raw text + error for invalid XML', () => {
        const raw = '<unclosed';
        const { result, error } = normalizeForDiff(raw, 'xml');
        expect(result).toBe(raw);
        expect(error).toBeTruthy();
    });

    it('preserves text content after normalization', () => {
        const { result } = normalizeForDiff('<root><item>hello world</item></root>', 'xml');
        expect(result).toContain('hello world');
    });
});
