import { convertColor } from '@/common/converting/color';

describe('convertColor — red anchor', () => {
    it('hex #FF0000 → rgb(255, 0, 0)', () => {
        const results = convertColor('#FF0000', 'hex');
        const rgb = results.find((r) => r.format === 'rgb');
        expect(rgb?.value).toBe('rgb(255, 0, 0)');
        expect(rgb?.error).toBeUndefined();
    });

    it('hex #FF0000 → hsl(0, 100%, 50%)', () => {
        const results = convertColor('#FF0000', 'hex');
        const hsl = results.find((r) => r.format === 'hsl');
        expect(hsl?.value).toBe('hsl(0, 100%, 50%)');
    });

    it('hex #FF0000 → hsv(0, 100%, 100%)', () => {
        const results = convertColor('#FF0000', 'hex');
        const hsv = results.find((r) => r.format === 'hsv');
        expect(hsv?.value).toBe('hsv(0, 100%, 100%)');
    });

    it('hex #FF0000 — hex row is itself', () => {
        const results = convertColor('#FF0000', 'hex');
        const hex = results.find((r) => r.format === 'hex');
        expect(hex?.value).toBe('#FF0000');
    });
});

describe('convertColor — 3-char hex', () => {
    it('expands #F00 to #FF0000', () => {
        const results = convertColor('#F00', 'hex');
        const rgb = results.find((r) => r.format === 'rgb');
        expect(rgb?.value).toBe('rgb(255, 0, 0)');
    });
});

describe('convertColor — rgb input', () => {
    it('rgb(255, 0, 0) → #FF0000', () => {
        const results = convertColor('rgb(255, 0, 0)', 'rgb');
        const hex = results.find((r) => r.format === 'hex');
        expect(hex?.value).toBe('#FF0000');
    });

    it('rgb(0, 0, 0) → #000000', () => {
        const results = convertColor('rgb(0, 0, 0)', 'rgb');
        const hex = results.find((r) => r.format === 'hex');
        expect(hex?.value).toBe('#000000');
    });

    it('rgb(255, 255, 255) → #FFFFFF', () => {
        const results = convertColor('rgb(255, 255, 255)', 'rgb');
        const hex = results.find((r) => r.format === 'hex');
        expect(hex?.value).toBe('#FFFFFF');
    });
});

describe('convertColor — hsl input', () => {
    it('hsl(0, 100%, 50%) → #FF0000', () => {
        const results = convertColor('hsl(0, 100%, 50%)', 'hsl');
        const hex = results.find((r) => r.format === 'hex');
        expect(hex?.value).toBe('#FF0000');
    });
});

describe('convertColor — hsv input', () => {
    it('hsv(0, 100%, 100%) → #FF0000', () => {
        const results = convertColor('hsv(0, 100%, 100%)', 'hsv');
        const hex = results.find((r) => r.format === 'hex');
        expect(hex?.value).toBe('#FF0000');
    });
});

describe('convertColor — invalid input', () => {
    it('invalid hex returns errors on all rows', () => {
        const results = convertColor('not-a-color', 'hex');
        expect(results.every((r) => r.error !== undefined)).toBe(true);
    });

    it('invalid rgb string returns errors', () => {
        const results = convertColor('rgb(999, 0)', 'rgb');
        expect(results.every((r) => r.error !== undefined)).toBe(true);
    });
});

describe('convertColor — swatchColor', () => {
    it('valid input includes an rgb swatchColor', () => {
        const results = convertColor('#FF0000', 'hex');
        expect(results[0].swatchColor).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });
});

describe('convertColor — hue branch coverage', () => {
    it('#00FF00 green round-trips through hex', () => {
        const results = convertColor('#00FF00', 'hex');
        expect(results.find((r) => r.format === 'hex')?.value).toBe('#00FF00');
    });
    it('#0000FF blue round-trips through hex', () => {
        const results = convertColor('#0000FF', 'hex');
        expect(results.find((r) => r.format === 'hex')?.value).toBe('#0000FF');
    });
    it('#FFFF00 yellow round-trips through hex', () => {
        const results = convertColor('#FFFF00', 'hex');
        expect(results.find((r) => r.format === 'hex')?.value).toBe('#FFFF00');
    });
    it('#FF00FF magenta round-trips through hex', () => {
        const results = convertColor('#FF00FF', 'hex');
        expect(results.find((r) => r.format === 'hex')?.value).toBe('#FF00FF');
    });
    it('returns exactly 4 results', () => {
        const results = convertColor('#FF0000', 'hex');
        expect(results).toHaveLength(4);
    });
});
