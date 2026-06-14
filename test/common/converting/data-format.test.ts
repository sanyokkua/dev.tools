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

describe('convertDataFormat — TOML input', () => {
    it('TOML → JSON round-trip', () => {
        const results = convertDataFormat('name = "Alice"\nage = 30\n', 'toml');
        const json = results.find((r) => r.format === 'json');
        expect(json?.error).toBeUndefined();
        const parsed = JSON.parse(json!.value!);
        expect(parsed.name).toBe('Alice');
        expect(parsed.age).toBe(30);
    });

    it('JSON flat object → TOML', () => {
        const results = convertDataFormat('{"name":"Alice","age":30}', 'json');
        const toml = results.find((r) => r.format === 'toml');
        expect(toml?.error).toBeUndefined();
        expect(toml?.value).toContain('name');
        expect(toml?.value).toContain('Alice');
    });

    it('invalid TOML → errors on all rows', () => {
        const results = convertDataFormat('[unclosed', 'toml');
        expect(results.every((r) => r.error !== undefined)).toBe(true);
    });

    it('JSON array → TOML returns error (top-level must be object)', () => {
        const results = convertDataFormat('[1,2,3]', 'json');
        const toml = results.find((r) => r.format === 'toml');
        expect(toml?.error).toBeDefined();
        expect(toml?.error).toContain('object');
    });

    it('toml not included in results when fromFormat is toml', () => {
        const results = convertDataFormat('name = "Alice"\n', 'toml');
        expect(results.find((r) => r.format === 'toml')).toBeUndefined();
    });
});

describe('convertDataFormat — CSV input', () => {
    it('CSV → JSON (array of objects)', () => {
        const results = convertDataFormat('name,age\nAlice,30\nBob,25\n', 'csv');
        const json = results.find((r) => r.format === 'json');
        expect(json?.error).toBeUndefined();
        const parsed = JSON.parse(json!.value!);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed[0].name).toBe('Alice');
        expect(parsed[1].age).toBe('25');
    });

    it('JSON array of flat objects → CSV round-trip', () => {
        const results = convertDataFormat('[{"name":"Alice","age":"30"},{"name":"Bob","age":"25"}]', 'json');
        const csv = results.find((r) => r.format === 'csv');
        expect(csv?.error).toBeUndefined();
        expect(csv?.value).toContain('name,age');
        expect(csv?.value).toContain('Alice,30');
        expect(csv?.value).toContain('Bob,25');
    });

    it('flat JSON object → key,value CSV', () => {
        const results = convertDataFormat('{"name":"Alice","age":"30"}', 'json');
        const csv = results.find((r) => r.format === 'csv');
        expect(csv?.error).toBeUndefined();
        expect(csv?.value).toContain('key,value');
        expect(csv?.value).toContain('name,Alice');
        expect(csv?.value).toContain('age,30');
    });

    it('nested JSON → CSV returns error', () => {
        const results = convertDataFormat('{"a":{"b":1}}', 'json');
        const csv = results.find((r) => r.format === 'csv');
        expect(csv?.error).toBeDefined();
    });

    it('CSV with quoted fields containing commas', () => {
        const results = convertDataFormat('name,city\n"Smith, John","New York"\n', 'csv');
        const json = results.find((r) => r.format === 'json');
        expect(json?.error).toBeUndefined();
        const parsed = JSON.parse(json!.value!);
        expect(parsed[0].name).toBe('Smith, John');
        expect(parsed[0].city).toBe('New York');
    });

    it('csv not included in results when fromFormat is csv', () => {
        const results = convertDataFormat('name,age\nAlice,30\n', 'csv');
        expect(results.find((r) => r.format === 'csv')).toBeUndefined();
    });
});
