import { queryJsonPath } from '../../src/common/json-query';

describe('queryJsonPath', () => {
    it('returns matches for a simple path', async () => {
        const result = await queryJsonPath('{"name":"Alice","age":30}', '$.name');
        expect(result).toEqual({ matches: ['Alice'] });
    });

    it('returns multiple matches for recursive descent', async () => {
        const json = '{"a":{"b":1},"c":{"b":2}}';
        const result = await queryJsonPath(json, '$..b');
        expect('matches' in result && result.matches).toEqual([1, 2]);
    });

    it('returns matches for a filter expression', async () => {
        const json = '[{"x":3},{"x":8},{"x":1}]';
        const result = await queryJsonPath(json, '$[?(@.x>5)]');
        expect('matches' in result && result.matches).toEqual([{ x: 8 }]);
    });

    it('returns empty matches array when path has no hits', async () => {
        const result = await queryJsonPath('{"name":"Alice"}', '$.missing');
        expect(result).toEqual({ matches: [] });
    });

    it('returns error for empty JSON input', async () => {
        const result = await queryJsonPath('', '$.name');
        expect('error' in result).toBe(true);
    });

    it('returns error for whitespace-only JSON input', async () => {
        const result = await queryJsonPath('   ', '$.name');
        expect('error' in result).toBe(true);
    });

    it('returns error for empty path', async () => {
        const result = await queryJsonPath('{"name":"Alice"}', '');
        expect('error' in result).toBe(true);
    });

    it('returns error for invalid JSON', async () => {
        const result = await queryJsonPath('{not valid json}', '$.name');
        expect('error' in result).toBe(true);
        expect((result as { error: string }).error).toMatch(/invalid json/i);
    });

    it('returns error for invalid JSONPath expression', async () => {
        const result = await queryJsonPath('{"name":"Alice"}', '@invalid');
        expect('error' in result).toBe(true);
    });

    it('handles large input without error', async () => {
        const large = JSON.stringify(Array.from({ length: 1000 }, (_, i) => ({ id: i, val: `item${i}` })));
        const result = await queryJsonPath(large, '$[0].val');
        expect(result).toEqual({ matches: ['item0'] });
    });
});
