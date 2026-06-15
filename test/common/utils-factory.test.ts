import {
    createCaseUtils,
    createDecodingUtils,
    createEncodingDecodingUtilList,
    createEncodingUtils,
    createHashingUtils,
    createJsonFormatter,
    createLineUtils,
    createStringUtilList,
    createStringUtils,
} from '../../src/common/utils-factory';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findTool<T extends { toolId: string }>(list: T[], id: string): T {
    const tool = list.find((t) => t.toolId === id);
    if (!tool) throw new Error(`Tool "${id}" not found`);
    return tool;
}

// ─── createStringUtils ────────────────────────────────────────────────────────

describe('createStringUtils', () => {
    const utils = createStringUtils();

    it('returns an array with at least one entry', () => {
        expect(utils.length).toBeGreaterThan(0);
    });

    it('each entry has toolId, textToDisplay, and toolFunction', () => {
        utils.forEach((u) => {
            expect(typeof u.toolId).toBe('string');
            expect(typeof u.textToDisplay).toBe('string');
            expect(typeof u.toolFunction).toBe('function');
        });
    });

    it('slugify-with-underscore replaces spaces with underscores', () => {
        const tool = findTool(utils, 'slugify-with-underscore');
        expect(tool.toolFunction('hello world')).toContain('_');
    });

    it('slugify-with-dash replaces spaces with dashes', () => {
        const tool = findTool(utils, 'slugify-with-dash');
        expect(tool.toolFunction('hello world')).toContain('-');
    });

    it('slugify-with-underscore-lower produces lowercase output', () => {
        const tool = findTool(utils, 'slugify-with-underscore-lower');
        expect(tool.toolFunction('Hello World')).toBe(tool.toolFunction('Hello World').toLowerCase());
    });

    it('slugify-with-dash-lower produces lowercase output', () => {
        const tool = findTool(utils, 'slugify-with-dash-lower');
        expect(tool.toolFunction('Hello World')).toBe(tool.toolFunction('Hello World').toLowerCase());
    });

    it('slugify handles empty string without throwing', () => {
        const tool = findTool(utils, 'slugify-with-underscore');
        expect(() => tool.toolFunction('')).not.toThrow();
    });
});

// ─── createCaseUtils ─────────────────────────────────────────────────────────

describe('createCaseUtils', () => {
    const utils = createCaseUtils();

    it('to-lower-case converts to lowercase', () => {
        const tool = findTool(utils, 'to-lower-case');
        expect(tool.toolFunction('HELLO')).toBe('hello');
    });

    it('to-upper-case converts to uppercase', () => {
        const tool = findTool(utils, 'to-upper-case');
        expect(tool.toolFunction('hello')).toBe('HELLO');
    });

    it('to-sentence-case capitalizes first letter', () => {
        const tool = findTool(utils, 'to-sentence-case');
        const result = tool.toolFunction('hello world');
        expect(result[0]).toBe(result[0].toUpperCase());
    });

    it('to-title-case capitalizes start of each word', () => {
        const tool = findTool(utils, 'to-title-case');
        const result = tool.toolFunction('hello world');
        expect(result).toMatch(/Hello/);
        expect(result).toMatch(/World/);
    });

    it('to-camel-case removes spaces and capitalizes each subsequent word', () => {
        const tool = findTool(utils, 'to-camel-case');
        const result = tool.toolFunction('hello world');
        expect(result).toMatch(/^[a-z]/);
        expect(result).not.toContain(' ');
    });

    it('to-pascal-case starts with uppercase and has no spaces', () => {
        const tool = findTool(utils, 'to-pascal-case');
        const result = tool.toolFunction('hello world');
        expect(result[0]).toBe(result[0].toUpperCase());
        expect(result).not.toContain(' ');
    });

    it('to-snake-case produces snake_case', () => {
        const tool = findTool(utils, 'to-snake-case');
        expect(tool.toolFunction('hello world')).toContain('_');
        expect(tool.toolFunction('hello world')).toBe(tool.toolFunction('hello world').toLowerCase());
    });

    it('to-screaming-snake-case produces SCREAMING_SNAKE_CASE', () => {
        const tool = findTool(utils, 'to-screaming-snake-case');
        const result = tool.toolFunction('hello world');
        expect(result).toContain('_');
        expect(result).toBe(result.toUpperCase());
    });

    it('to-kebab-case produces kebab-case', () => {
        const tool = findTool(utils, 'to-kebab-case');
        const result = tool.toolFunction('hello world');
        expect(result).toContain('-');
        expect(result).toBe(result.toLowerCase());
    });

    it('to-cobol-case produces COBOL-CASE', () => {
        const tool = findTool(utils, 'to-cobol-case');
        const result = tool.toolFunction('hello world');
        expect(result).toContain('-');
        expect(result).toBe(result.toUpperCase());
    });

    it('to-train-case produces Train-Case', () => {
        const tool = findTool(utils, 'to-train-case');
        const result = tool.toolFunction('hello world');
        expect(result).toContain('-');
    });

    it('to-dot-case produces dot.case', () => {
        const tool = findTool(utils, 'to-dot-case');
        expect(tool.toolFunction('hello world')).toContain('.');
    });

    it('to-slash-case produces slash/case', () => {
        const tool = findTool(utils, 'to-slash-case');
        expect(tool.toolFunction('hello world')).toContain('/');
    });

    it('swap-case swaps the case of each character', () => {
        const tool = findTool(utils, 'swap-case');
        const result = tool.toolFunction('Hello');
        expect(result[0]).toBe('h');
        expect(result[1]).toBe('E');
    });

    it('capitalize uppercases first letter', () => {
        const tool = findTool(utils, 'capitalize');
        const result = tool.toolFunction('hello');
        expect(result[0]).toBe('H');
    });

    it('uncapitalize lowercases first letter', () => {
        const tool = findTool(utils, 'uncapitalize');
        const result = tool.toolFunction('Hello');
        expect(result[0]).toBe('h');
    });

    it('all tools handle empty string without throwing', () => {
        utils.forEach((u) => {
            expect(() => u.toolFunction('')).not.toThrow();
        });
    });
});

// ─── createLineUtils ──────────────────────────────────────────────────────────

describe('createLineUtils', () => {
    const utils = createLineUtils();

    it('split-lines-by-comma splits comma-separated input', () => {
        const tool = findTool(utils, 'split-lines-by-comma');
        const result = tool.toolFunction('a,b,c');
        expect(result).toContain('\n');
    });

    it('split-lines-by-semicolon splits semicolon-separated input', () => {
        const tool = findTool(utils, 'split-lines-by-semicolon');
        const result = tool.toolFunction('a;b;c');
        expect(result).toContain('\n');
    });

    it('sort-lines-ascending sorts lines A→Z', () => {
        const tool = findTool(utils, 'sort-lines-ascending');
        const result = tool.toolFunction('banana\napple\ncherry');
        const lines = result.split('\n');
        expect(lines[0]).toBe('apple');
    });

    it('sort-lines-descending sorts lines Z→A', () => {
        const tool = findTool(utils, 'sort-lines-descending');
        const result = tool.toolFunction('apple\nbanana\ncherry');
        const lines = result.split('\n');
        expect(lines[0]).toBe('cherry');
    });

    it('remove-duplicates removes duplicate lines', () => {
        const tool = findTool(utils, 'remove-duplicates');
        const result = tool.toolFunction('a\nb\na\nc');
        const lines = result.split('\n');
        const aCount = lines.filter((l) => l === 'a').length;
        expect(aCount).toBe(1);
    });

    it('remove-duplicates-ignore-case removes case-insensitive duplicates', () => {
        const tool = findTool(utils, 'remove-duplicates-ignore-case');
        const result = tool.toolFunction('Apple\napple\nBanana');
        const lines = result.split('\n').map((l) => l.toLowerCase());
        const appleCount = lines.filter((l) => l === 'apple').length;
        expect(appleCount).toBe(1);
    });

    it('shuffle-lines returns same number of lines', () => {
        const tool = findTool(utils, 'shuffle-lines');
        const input = 'a\nb\nc\nd';
        const result = tool.toolFunction(input);
        expect(result.split('\n').length).toBe(input.split('\n').length);
    });

    it('all line tools handle empty string without throwing', () => {
        utils.forEach((u) => {
            expect(() => u.toolFunction('')).not.toThrow();
        });
    });
});

// ─── createEncodingUtils ──────────────────────────────────────────────────────

describe('createEncodingUtils', () => {
    const utils = createEncodingUtils();

    it('encode-url encodes special characters', () => {
        const tool = findTool(utils, 'encode-url');
        expect(tool.toolFunction('hello world')).toContain('%');
    });

    it('encode-base-64 produces base64 string', () => {
        const tool = findTool(utils, 'encode-base-64');
        const result = tool.toolFunction('hello');
        expect(result).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    it('encode-base-64 for "hello" produces aGVsbG8=', () => {
        const tool = findTool(utils, 'encode-base-64');
        expect(tool.toolFunction('hello')).toBe('aGVsbG8=');
    });

    it('encode-base-64-url produces base64url string (no + or /)', () => {
        const tool = findTool(utils, 'encode-base-64-url');
        const result = tool.toolFunction('hello world');
        expect(result).not.toContain('+');
        expect(result).not.toContain('/');
    });

    it('encode-html-entities encodes < and >', () => {
        const tool = findTool(utils, 'encode-html-entities');
        const result = tool.toolFunction('<div>');
        expect(result).toContain('&lt;');
        expect(result).toContain('&gt;');
    });

    it('encode-html-entities encodes &', () => {
        const tool = findTool(utils, 'encode-html-entities');
        expect(tool.toolFunction('a & b')).toContain('&amp;');
    });

    it('encode-html-entities encodes double quotes', () => {
        const tool = findTool(utils, 'encode-html-entities');
        expect(tool.toolFunction('"hello"')).toContain('&quot;');
    });

    it('encode-html-entities encodes single quotes', () => {
        const tool = findTool(utils, 'encode-html-entities');
        expect(tool.toolFunction("'hello'")).toContain('&#39;');
    });

    it('all encoding tools handle empty string without throwing', () => {
        utils.forEach((u) => {
            expect(() => u.toolFunction('')).not.toThrow();
        });
    });
});

// ─── createDecodingUtils ──────────────────────────────────────────────────────

describe('createDecodingUtils', () => {
    const utils = createDecodingUtils();

    it('decode-url decodes encoded URL', () => {
        const tool = findTool(utils, 'decode-url');
        expect(tool.toolFunction('hello%20world')).toContain('hello world');
    });

    it('decode-base-64 decodes "aGVsbG8=" to "hello"', () => {
        const tool = findTool(utils, 'decode-base-64');
        expect(tool.toolFunction('aGVsbG8=')).toBe('hello');
    });

    it('decode-base-64-url decodes base64url string', () => {
        const tool = findTool(utils, 'decode-base-64-url');
        // "hello" in base64url is "aGVsbG8"
        expect(tool.toolFunction('aGVsbG8')).toBe('hello');
    });

    it('decode-html-entities decodes &lt; and &gt;', () => {
        const tool = findTool(utils, 'decode-html-entities');
        const result = tool.toolFunction('&lt;div&gt;');
        expect(result).toContain('<div>');
    });

    it('decode-html-entities decodes &amp;', () => {
        const tool = findTool(utils, 'decode-html-entities');
        expect(tool.toolFunction('a &amp; b')).toContain('a & b');
    });

    it('all decoding tools handle empty string without throwing', () => {
        utils.forEach((u) => {
            expect(() => u.toolFunction('')).not.toThrow();
        });
    });
});

// ─── round-trip encode/decode ─────────────────────────────────────────────────

describe('encode/decode round-trips', () => {
    const encoding = createEncodingUtils();
    const decoding = createDecodingUtils();

    it('base64 encode then decode round-trips "hello world"', () => {
        const enc = findTool(encoding, 'encode-base-64');
        const dec = findTool(decoding, 'decode-base-64');
        expect(dec.toolFunction(enc.toolFunction('hello world'))).toBe('hello world');
    });

    it('URL encode then decode round-trips "hello world"', () => {
        const enc = findTool(encoding, 'encode-url');
        const dec = findTool(decoding, 'decode-url');
        expect(dec.toolFunction(enc.toolFunction('hello world'))).toBe('hello world');
    });
});

// ─── createHashingUtils ───────────────────────────────────────────────────────

describe('createHashingUtils', () => {
    const utils = createHashingUtils();

    it('returns 5 hashing tools', () => {
        expect(utils.length).toBe(5);
    });

    it('each tool has toolId, textToDisplay, and toolFunction', () => {
        utils.forEach((u) => {
            expect(typeof u.toolId).toBe('string');
            expect(typeof u.textToDisplay).toBe('string');
            expect(typeof u.toolFunction).toBe('function');
        });
    });

    it('encode-to-md-5 returns a thenable (async hash)', () => {
        const tool = findTool(utils, 'encode-to-md-5');
        const result = tool.toolFunction('hello');
        expect(typeof (result as unknown as Promise<string>).then).toBe('function');
    });

    it('encode-to-sha-256 returns a thenable', () => {
        const tool = findTool(utils, 'encode-to-sha-256');
        const result = tool.toolFunction('hello');
        expect(typeof (result as unknown as Promise<string>).then).toBe('function');
    });

    it('encode-to-sha-256 resolves to a 64-char hex string for "hello"', async () => {
        const tool = findTool(utils, 'encode-to-sha-256');
        const result = await tool.toolFunction('hello');
        expect(result).toMatch(/^[0-9a-f]{64}$/i);
    });

    it('encode-to-sha-512 resolves to a 128-char hex string', async () => {
        const tool = findTool(utils, 'encode-to-sha-512');
        const result = await tool.toolFunction('hello');
        expect(result).toMatch(/^[0-9a-f]{128}$/i);
    });

    it('same input always produces same MD5 hash', async () => {
        const tool = findTool(utils, 'encode-to-md-5');
        const a = await tool.toolFunction('test');
        const b = await tool.toolFunction('test');
        expect(a).toBe(b);
    });

    it('different inputs produce different SHA-256 hashes', async () => {
        const tool = findTool(utils, 'encode-to-sha-256');
        const a = await tool.toolFunction('hello');
        const b = await tool.toolFunction('world');
        expect(a).not.toBe(b);
    });
});

// ─── createJsonFormatter ─────────────────────────────────────────────────────

describe('createJsonFormatter', () => {
    const utils = createJsonFormatter();

    it('returns two tools: beautify and shorten', () => {
        expect(utils).toHaveLength(2);
        expect(utils.find((u) => u.toolId === 'json-beautify')).toBeDefined();
        expect(utils.find((u) => u.toolId === 'json-shorten')).toBeDefined();
    });

    it('json-beautify formats JSON with indentation', () => {
        const tool = findTool(utils, 'json-beautify');
        const result = tool.toolFunction('{"a":1}');
        expect(result).toContain('\n');
        expect(result).toContain('  ');
    });

    it('json-shorten compresses JSON to a single line', () => {
        const tool = findTool(utils, 'json-shorten');
        const result = tool.toolFunction('{\n  "a": 1\n}');
        expect(result).not.toContain('\n');
    });

    it('json-beautify throws SyntaxError on invalid JSON', () => {
        const tool = findTool(utils, 'json-beautify');
        expect(() => tool.toolFunction('not json')).toThrow(SyntaxError);
    });
});

// ─── createEncodingDecodingUtilList ──────────────────────────────────────────

describe('createEncodingDecodingUtilList', () => {
    const list = createEncodingDecodingUtilList();

    it('returns two groups: encoding-utils and decoding-utils', () => {
        expect(list).toHaveLength(2);
        expect(list.find((g) => g.toolGroupId === 'encoding-utils')).toBeDefined();
        expect(list.find((g) => g.toolGroupId === 'decoding-utils')).toBeDefined();
    });

    it('encoding group has a non-empty displayName', () => {
        const group = list.find((g) => g.toolGroupId === 'encoding-utils')!;
        expect(group.displayName.length).toBeGreaterThan(0);
    });

    it('each group has at least one utility', () => {
        list.forEach((group) => {
            expect(group.utils.length).toBeGreaterThan(0);
        });
    });
});

// ─── createStringUtilList ────────────────────────────────────────────────────

describe('createStringUtilList', () => {
    const list = createStringUtilList();

    it('returns three groups', () => {
        expect(list).toHaveLength(3);
    });

    it('contains string-utils, case-utils, and line-utils groups', () => {
        const ids = list.map((g) => g.toolGroupId);
        expect(ids).toContain('string-utils');
        expect(ids).toContain('case-utils');
        expect(ids).toContain('line-utils');
    });

    it('each group has a displayName and at least one util', () => {
        list.forEach((group) => {
            expect(group.displayName.length).toBeGreaterThan(0);
            expect(group.utils.length).toBeGreaterThan(0);
        });
    });
});
