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

    it('CSV with trailing comma preserves final empty field', () => {
        const results = convertDataFormat('name,value,extra\nAlice,30,\n', 'csv');
        const json = results.find((r) => r.format === 'json');
        expect(json?.error).toBeUndefined();
        const parsed = JSON.parse(json!.value!);
        expect(parsed[0].extra).toBe('');
    });

    it('JSON mixed-type array → CSV returns error', () => {
        const results = convertDataFormat('[{"name":"Alice"},"oops"]', 'json');
        const csv = results.find((r) => r.format === 'csv');
        expect(csv?.error).toBeDefined();
    });
});

describe('convertDataFormat — markdown-table output', () => {
    it('JSON array of flat objects → Markdown table', () => {
        const results = convertDataFormat('[{"name":"Alice","age":"30"},{"name":"Bob","age":"25"}]', 'json');
        const md = results.find((r) => r.format === 'markdown-table');
        expect(md?.error).toBeUndefined();
        expect(md?.value).toContain('| name | age |');
        expect(md?.value).toContain('| --- | --- |');
        expect(md?.value).toContain('| Alice | 30 |');
        expect(md?.value).toContain('| Bob | 25 |');
    });

    it('JSON flat object → Markdown table key/value', () => {
        const results = convertDataFormat('{"name":"Alice","age":"30"}', 'json');
        const md = results.find((r) => r.format === 'markdown-table');
        expect(md?.error).toBeUndefined();
        expect(md?.value).toContain('| key | value |');
        expect(md?.value).toContain('| name | Alice |');
        expect(md?.value).toContain('| age | 30 |');
    });

    it('CSV → Markdown table (via shared pipeline)', () => {
        const results = convertDataFormat('name,age\nAlice,30\nBob,25\n', 'csv');
        const md = results.find((r) => r.format === 'markdown-table');
        expect(md?.error).toBeUndefined();
        expect(md?.value).toContain('| name | age |');
        expect(md?.value).toContain('| Alice | 30 |');
    });

    it('nested JSON → markdown-table returns error', () => {
        const results = convertDataFormat('{"a":{"b":1}}', 'json');
        const md = results.find((r) => r.format === 'markdown-table');
        expect(md?.error).toBeDefined();
    });

    it('JSON mixed-type array → markdown-table returns error', () => {
        const results = convertDataFormat('[{"name":"Alice"},"oops"]', 'json');
        const md = results.find((r) => r.format === 'markdown-table');
        expect(md?.error).toBeDefined();
    });

    it('markdown-table not included in results when fromFormat is markdown-table', () => {
        const results = convertDataFormat('| name | age |\n| --- | --- |\n| Alice | 30 |', 'markdown-table');
        expect(results.find((r) => r.format === 'markdown-table')).toBeUndefined();
    });
});

describe('convertDataFormat — markdown-table input', () => {
    it('standard table → JSON array (happy path)', () => {
        const results = convertDataFormat(
            '| name | age |\n| --- | --- |\n| Alice | 30 |\n| Bob | 25 |',
            'markdown-table',
        );
        const json = results.find((r) => r.format === 'json');
        expect(json?.error).toBeUndefined();
        const parsed = JSON.parse(json!.value!);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed[0].name).toBe('Alice');
        expect(parsed[1].age).toBe('25');
    });

    it('standard table → CSV round-trip', () => {
        const results = convertDataFormat('| name | age |\n| --- | --- |\n| Alice | 30 |', 'markdown-table');
        const csv = results.find((r) => r.format === 'csv');
        expect(csv?.error).toBeUndefined();
        expect(csv?.value).toContain('name,age');
        expect(csv?.value).toContain('Alice,30');
    });

    it('table with alignment markers (:---:, ---:) parsed correctly', () => {
        const results = convertDataFormat('| name | age |\n| :---: | ---: |\n| Alice | 30 |', 'markdown-table');
        const json = results.find((r) => r.format === 'json');
        expect(json?.error).toBeUndefined();
        const parsed = JSON.parse(json!.value!);
        expect(parsed[0].name).toBe('Alice');
        expect(parsed[0].age).toBe('30');
    });

    it('table with pipe characters in values (escaped \\|) round-trips', () => {
        const mdInput = '| name | value |\n| --- | --- |\n| a\\|b | c\\|d |';
        const results = convertDataFormat(mdInput, 'markdown-table');
        const json = results.find((r) => r.format === 'json');
        expect(json?.error).toBeUndefined();
        const parsed = JSON.parse(json!.value!);
        expect(parsed[0].name).toBe('a|b');
        expect(parsed[0].value).toBe('c|d');
    });

    it('table with only header + separator (no data rows) → empty array', () => {
        const results = convertDataFormat('| name | age |\n| --- | --- |', 'markdown-table');
        const json = results.find((r) => r.format === 'json');
        expect(json?.error).toBeUndefined();
        const parsed = JSON.parse(json!.value!);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed.length).toBe(0);
    });

    it('fewer than 2 lines → error on all rows', () => {
        const results = convertDataFormat('| name | age |', 'markdown-table');
        expect(results.every((r) => r.error !== undefined)).toBe(true);
    });

    it('missing/invalid separator row → error on all rows', () => {
        const results = convertDataFormat('| name | age |\n| not a separator |\n| Alice | 30 |', 'markdown-table');
        expect(results.every((r) => r.error !== undefined)).toBe(true);
    });

    it('empty string input → error on all rows', () => {
        const results = convertDataFormat('', 'markdown-table');
        expect(results.every((r) => r.error !== undefined)).toBe(true);
    });
});
