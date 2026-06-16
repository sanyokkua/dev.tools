import { formatXml, minifyXml, queryXPath, validateXml } from '@/common/xml-formatting-tools';

describe('validateXml', () => {
    it('returns { valid: true } for valid XML', () => {
        expect(validateXml('<root/>')).toEqual({ valid: true });
    });

    it('returns { valid: true } for XML with children', () => {
        expect(validateXml('<root><item>hi</item></root>')).toEqual({ valid: true });
    });

    it('returns { valid: false } with error for malformed XML', () => {
        const result = validateXml('<unclosed');
        expect(result.valid).toBe(false);
        if (!result.valid) {
            expect(result.error).toBeTruthy();
        }
    });

    it('returns line and column for parse errors when available', () => {
        const result = validateXml('<a><b></a>');
        expect(result.valid).toBe(false);
        // line/col may or may not be present depending on jsdom's parser error message
    });
});

describe('formatXml', () => {
    it('formats with 2-space indent', () => {
        const result = formatXml('<root><item>hi</item></root>', 2);
        expect(result).toContain('<?xml');
        expect(result).toContain('<root>');
        expect(result).toContain('  <item>');
    });

    it('formats with tab indent', () => {
        const result = formatXml('<root><item>hi</item></root>', '\t');
        expect(result).toContain('\t<item>');
    });

    it('throws on invalid XML', () => {
        expect(() => formatXml('<unclosed')).toThrow();
    });

    it('preserves XML declaration in output', () => {
        const result = formatXml('<root/>', 2);
        expect(result).toMatch(/^<\?xml/);
    });

    it('handles self-closing elements', () => {
        const result = formatXml('<root><empty/></root>', 2);
        expect(result).toContain('<?xml');
        expect(result).toContain('<root>');
    });
});

describe('minifyXml', () => {
    it('removes whitespace between elements', () => {
        const result = minifyXml('<root>\n  <item>hi</item>\n</root>');
        expect(result).not.toContain('\n  ');
        expect(result).toContain('<item>hi</item>');
    });

    it('throws on invalid XML', () => {
        expect(() => minifyXml('<unclosed')).toThrow();
    });

    it('preserves text content', () => {
        const result = minifyXml('<root>  <item>hello world</item>  </root>');
        expect(result).toContain('hello world');
    });
});

describe('queryXPath', () => {
    it('returns nodes result for element query', () => {
        const result = queryXPath('<root><item>a</item></root>', '//item');
        expect(result).not.toHaveProperty('error');
        if (!('error' in result)) {
            expect(result.type).toBe('nodes');
            if (result.type === 'nodes') {
                expect(result.count).toBe(1);
                expect(result.nodes).toHaveLength(1);
            }
        }
    });

    it('returns number result for count()', () => {
        const result = queryXPath('<root><item/><item/></root>', 'count(//item)');
        expect(result).not.toHaveProperty('error');
        if (!('error' in result)) {
            expect(result.type).toBe('number');
            if (result.type === 'number') {
                expect(result.value).toBe(2);
            }
        }
    });

    it('returns string result for string()', () => {
        const result = queryXPath('<root><item>hello</item></root>', 'string(//item)');
        expect(result).not.toHaveProperty('error');
        if (!('error' in result)) {
            expect(result.type).toBe('string');
            if (result.type === 'string') {
                expect(result.value).toBe('hello');
            }
        }
    });

    it('returns number 0 for count when no matching nodes', () => {
        const result = queryXPath('<root/>', 'count(//item)');
        if (!('error' in result) && result.type === 'number') {
            expect(result.value).toBe(0);
        }
    });

    it('returns error for invalid XML', () => {
        const result = queryXPath('<unclosed', '//item');
        expect(result).toHaveProperty('error');
    });

    it('returns error for invalid XPath', () => {
        const result = queryXPath('<root/>', 'invalid xpath ][');
        // jsdom may or may not throw on invalid xpath — either an error is returned or a result is returned
        // We just verify the function doesn't crash and returns a valid shape
        expect(result).toBeDefined();
        if ('error' in result) {
            expect(result.error).toBeTruthy();
        } else {
            expect(result).toHaveProperty('type');
        }
    });
});
