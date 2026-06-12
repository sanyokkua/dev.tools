import { convertUnit, UNITS_BY_CATEGORY } from '@/common/converting/units';

describe('convertUnit — data sizes', () => {
    it('1024 bytes = 1 KiB', () => {
        const results = convertUnit(1024, 'b', 'data');
        const kib = results.find((r) => r.id === 'kib');
        expect(parseFloat(kib!.value)).toBeCloseTo(1);
    });

    it('1 MB = 1000 KB (decimal)', () => {
        const results = convertUnit(1, 'mb', 'data');
        const kb = results.find((r) => r.id === 'kb');
        expect(parseFloat(kb!.value)).toBeCloseTo(1000);
    });

    it('1 GiB = 1024 MiB', () => {
        const results = convertUnit(1, 'gib', 'data');
        const mib = results.find((r) => r.id === 'mib');
        expect(parseFloat(mib!.value)).toBeCloseTo(1024);
    });
});

describe('convertUnit — temperature', () => {
    it('0°C = 32°F', () => {
        const results = convertUnit(0, 'c', 'temperature');
        const f = results.find((r) => r.id === 'f');
        expect(parseFloat(f!.value)).toBeCloseTo(32);
    });

    it('100°C = 212°F', () => {
        const results = convertUnit(100, 'c', 'temperature');
        const f = results.find((r) => r.id === 'f');
        expect(parseFloat(f!.value)).toBeCloseTo(212);
    });

    it('0°C = 273.15 K', () => {
        const results = convertUnit(0, 'c', 'temperature');
        const k = results.find((r) => r.id === 'k');
        expect(parseFloat(k!.value)).toBeCloseTo(273.15);
    });

    it('-40°C = -40°F (crossover point)', () => {
        const results = convertUnit(-40, 'c', 'temperature');
        const f = results.find((r) => r.id === 'f');
        expect(parseFloat(f!.value)).toBeCloseTo(-40);
    });
});

describe('convertUnit — time', () => {
    it('1 hour = 3600 seconds', () => {
        const results = convertUnit(1, 'hr', 'time');
        const s = results.find((r) => r.id === 's');
        expect(parseFloat(s!.value)).toBeCloseTo(3600);
    });

    it('1 week = 7 days', () => {
        const results = convertUnit(1, 'week', 'time');
        const day = results.find((r) => r.id === 'day');
        expect(parseFloat(day!.value)).toBeCloseTo(7);
    });
});

describe('convertUnit — length', () => {
    it('1 km = 1000 m', () => {
        const results = convertUnit(1, 'km', 'length');
        const m = results.find((r) => r.id === 'm');
        expect(parseFloat(m!.value)).toBeCloseTo(1000);
    });

    it('1 inch = 2.54 cm', () => {
        const results = convertUnit(1, 'in', 'length');
        const cm = results.find((r) => r.id === 'cm');
        expect(parseFloat(cm!.value)).toBeCloseTo(2.54);
    });
});

describe('UNITS_BY_CATEGORY', () => {
    it('all categories have at least 3 units', () => {
        const cats = Object.values(UNITS_BY_CATEGORY);
        expect(cats.every((u) => u.length >= 3)).toBe(true);
    });
});
