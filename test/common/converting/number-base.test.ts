import { convertNumberBase, parseInputAsDecimal } from '@/common/converting/number-base';

describe('parseInputAsDecimal', () => {
    it('parses decimal 255', () => expect(parseInputAsDecimal('255', 10)).toBe(255));
    it('parses hex FF (with prefix)', () => expect(parseInputAsDecimal('0xFF', 16)).toBe(255));
    it('parses hex FF (no prefix)', () => expect(parseInputAsDecimal('FF', 16)).toBe(255));
    it('parses binary 11111111 (with prefix)', () => expect(parseInputAsDecimal('0b11111111', 2)).toBe(255));
    it('parses binary with spaces', () => expect(parseInputAsDecimal('1111 1111', 2)).toBe(255));
    it('parses octal 377 (with prefix)', () => expect(parseInputAsDecimal('0o377', 8)).toBe(255));
    it('returns null for empty string', () => expect(parseInputAsDecimal('', 10)).toBeNull());
    it('returns null for invalid input', () => expect(parseInputAsDecimal('XYZ', 10)).toBeNull());
    it('returns null for hex chars in decimal context', () => expect(parseInputAsDecimal('FF', 10)).toBeNull());
    it('handles zero', () => expect(parseInputAsDecimal('0', 10)).toBe(0));
    it('returns null for hex prefix in decimal context', () => expect(parseInputAsDecimal('0xFF', 10)).toBeNull());
    it('returns null for partial-valid input like 123abc', () => expect(parseInputAsDecimal('123abc', 10)).toBeNull());
});

describe('convertNumberBase', () => {
    it('converts 255 from decimal to all standard bases', () => {
        const results = convertNumberBase('255', 10);
        const hex = results.find((r) => r.base === 16);
        const bin = results.find((r) => r.base === 2);
        const oct = results.find((r) => r.base === 8);
        const dec = results.find((r) => r.base === 10);
        expect(hex?.value).toBe('0xFF');
        expect(bin?.value).toBe('0b1111 1111');
        expect(oct?.value).toBe('0o377');
        expect(dec?.value).toBe('255');
    });

    it('all rows show error for invalid input', () => {
        const results = convertNumberBase('ZZZ', 10);
        expect(results.every((r) => r.error !== undefined)).toBe(true);
    });

    it('includes custom base row when customBase provided', () => {
        const results = convertNumberBase('255', 10, 36);
        const custom = results.find((r) => r.base === 36);
        expect(custom?.value).toBe('73'); // 255 in base 36: 7*36+3=255
    });

    it('does not duplicate custom base when it matches a standard base', () => {
        const results = convertNumberBase('255', 10, 16);
        const hexRows = results.filter((r) => r.base === 16);
        expect(hexRows.length).toBe(1);
    });

    it('converts hex input FF to decimal 255', () => {
        const results = convertNumberBase('FF', 16);
        const dec = results.find((r) => r.base === 10);
        expect(dec?.value).toBe('255');
    });

    it('handles zero input correctly', () => {
        const results = convertNumberBase('0', 10);
        expect(results.every((r) => r.error === undefined)).toBe(true);
        const hex = results.find((r) => r.base === 16);
        expect(hex?.value).toBe('0x0');
    });

    it('groups binary digits with spaces (nibbles)', () => {
        const results = convertNumberBase('10', 10); // 10 decimal = 1010 binary
        const bin = results.find((r) => r.base === 2);
        expect(bin?.value).toBe('0b1010');
    });

    it('groups 8-bit binary correctly', () => {
        const results = convertNumberBase('200', 10);
        const bin = results.find((r) => r.base === 2);
        expect(bin?.value).toBe('0b1100 1000');
    });
});
