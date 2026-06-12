import { convertDataFormat } from '@/common/converting/data-format';

describe('convertDataFormat — JSON input', () => {
    it('flat JSON object → YAML', () => {
        const results = convertDataFormat('{"name":"Alice","age":30}', 'json');
        const yaml = results.find((r) => r.format === 'yaml');
        expect(yaml?.error).toBeUndefined();
        expect(yaml?.value).toContain('name: Alice');
        expect(yaml?.value).toContain('age: 30');
    });

    it('flat JSON object → query-string', () => {
        const results = convertDataFormat('{"name":"Alice","age":"30"}', 'json');
        const qs = results.find((r) => r.format === 'querystring');
        expect(qs?.error).toBeUndefined();
        expect(qs?.value).toContain('name=Alice');
        expect(qs?.value).toContain('age=30');
    });

    it('nested JSON object → query-string returns error', () => {
        const results = convertDataFormat('{"a":{"b":1}}', 'json');
        const qs = results.find((r) => r.format === 'querystring');
        expect(qs?.error).toBeDefined();
    });

    it('invalid JSON returns errors on all rows', () => {
        const results = convertDataFormat('{invalid}', 'json');
        expect(results.every((r) => r.error !== undefined)).toBe(true);
    });

    it('JSON array → query-string returns error', () => {
        const results = convertDataFormat('[1,2,3]', 'json');
        const qs = results.find((r) => r.format === 'querystring');
        expect(qs?.error).toBeDefined();
    });
});

describe('convertDataFormat — YAML input', () => {
    it('YAML → JSON round-trip', () => {
        const yamlInput = 'name: Alice\nage: 30\n';
        const results = convertDataFormat(yamlInput, 'yaml');
        const json = results.find((r) => r.format === 'json');
        expect(json?.error).toBeUndefined();
        const parsed = JSON.parse(json!.value!);
        expect(parsed.name).toBe('Alice');
        expect(parsed.age).toBe(30);
    });

    it('invalid YAML → errors on all rows', () => {
        const results = convertDataFormat(':\n  bad: [unclosed', 'yaml');
        expect(results.every((r) => r.error !== undefined)).toBe(true);
    });
});

describe('convertDataFormat — query-string input', () => {
    it('query-string → JSON', () => {
        const results = convertDataFormat('name=Alice&age=30', 'querystring');
        const json = results.find((r) => r.format === 'json');
        expect(json?.error).toBeUndefined();
        const parsed = JSON.parse(json!.value!);
        expect(parsed.name).toBe('Alice');
    });

    it('query-string → YAML', () => {
        const results = convertDataFormat('name=Alice&age=30', 'querystring');
        const yaml = results.find((r) => r.format === 'yaml');
        expect(yaml?.error).toBeUndefined();
        expect(yaml?.value).toContain('name: Alice');
    });

    it('does not include same format in results', () => {
        const results = convertDataFormat('a=b', 'querystring');
        expect(results.find((r) => r.format === 'querystring')).toBeUndefined();
    });
});

describe('convertDataFormat — edge cases', () => {
    it('empty YAML input returns errors on all rows', () => {
        const results = convertDataFormat('', 'yaml');
        expect(results.every((r) => r.error !== undefined)).toBe(true);
    });
});
