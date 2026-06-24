import {
    escapeJsonString,
    formatJson,
    sortJsonKeys,
    unescapeJsonString,
    validateJson,
} from '@/common/formatting-tools';

describe('formatJson', () => {
    it('beautifies with 2 spaces', () => {
        expect(formatJson('{"b":1,"a":2}', 2)).toBe('{\n  "b": 1,\n  "a": 2\n}');
    });
    it('beautifies with tab', () => {
        expect(formatJson('{"b":1}', '\t')).toBe('{\n\t"b": 1\n}');
    });
    it('minifies with 0', () => {
        expect(formatJson('{\n  "a":  1  \n}', 0)).toBe('{"a":1}');
    });
    it('throws on invalid JSON', () => {
        expect(() => formatJson('not json', 2)).toThrow();
    });
});

describe('sortJsonKeys', () => {
    it('sorts top-level keys A→Z', () => {
        const result = JSON.parse(sortJsonKeys('{"b":1,"a":2}', 0));
        expect(Object.keys(result)).toEqual(['a', 'b']);
    });
    it('sorts nested object keys', () => {
        const result = JSON.parse(sortJsonKeys('{"z":{"d":1,"c":2},"a":0}', 0));
        expect(Object.keys(result)).toEqual(['a', 'z']);
        expect(Object.keys(result.z)).toEqual(['c', 'd']);
    });
    it('leaves array order unchanged', () => {
        const result = JSON.parse(sortJsonKeys('[3,1,2]', 0));
        expect(result).toEqual([3, 1, 2]);
    });
});

describe('validateJson', () => {
    it('returns valid: true for valid JSON', () => {
        expect(validateJson('{"a":1}')).toEqual({ valid: true });
    });
    it('returns valid: false with error message for invalid JSON', () => {
        const r = validateJson('{bad}') as { valid: false; error: string };
        expect(r.valid).toBe(false);
        expect(r.error).toBeTruthy();
    });
});

describe('escapeJsonString / unescapeJsonString', () => {
    it('round-trips a plain string', () => {
        const input = 'hello "world"\nnewline';
        expect(unescapeJsonString(escapeJsonString(input))).toBe(input);
    });
    it('escapeJsonString wraps in quotes', () => {
        expect(escapeJsonString('hi')).toBe('"hi"');
    });
    it('unescapeJsonString accepts bare escaped content', () => {
        expect(unescapeJsonString(String.raw`hello\nworld`)).toBe('hello\nworld');
    });
});
