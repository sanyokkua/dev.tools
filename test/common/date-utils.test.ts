import {
    applyCustomPattern,
    calculateDuration,
    calculateWorkingDays,
    convertTimestamp,
    detectUnit,
    formatRFC2822,
    getDayOfYear,
    getISOWeek,
    toMs,
} from '@/common/date-utils';

// ─── detectUnit ────────────────────────────────────────────────────────────────
describe('detectUnit', () => {
    it('treats small numbers as seconds', () => expect(detectUnit(1760000000)).toBe('seconds'));
    it('treats large numbers as milliseconds', () => expect(detectUnit(1760000000000)).toBe('milliseconds'));
    it('boundary: exactly 1e12 is seconds', () => expect(detectUnit(1e12)).toBe('seconds'));
    it('boundary: 1e12 + 1 is milliseconds', () => expect(detectUnit(1e12 + 1)).toBe('milliseconds'));
});

// ─── toMs ──────────────────────────────────────────────────────────────────────
describe('toMs', () => {
    it('multiplies seconds by 1000', () => expect(toMs(1000)).toBe(1000000));
    it('leaves milliseconds unchanged', () => expect(toMs(1760000000000)).toBe(1760000000000));
});

// ─── getDayOfYear ──────────────────────────────────────────────────────────────
describe('getDayOfYear', () => {
    it('Jan 1 = day 1', () => expect(getDayOfYear(new Date('2025-01-01T00:00:00Z'))).toBe(1));
    it('Dec 31 non-leap = day 365', () => expect(getDayOfYear(new Date('2025-12-31T00:00:00Z'))).toBe(365));
    it('Dec 31 leap year = day 366', () => expect(getDayOfYear(new Date('2024-12-31T00:00:00Z'))).toBe(366));
    it('Oct 9 2025 = day 282', () => expect(getDayOfYear(new Date('2025-10-09T00:00:00Z'))).toBe(282));
});

// ─── getISOWeek ────────────────────────────────────────────────────────────────
describe('getISOWeek', () => {
    it('Jan 1 2025 is week 1', () => expect(getISOWeek(new Date('2025-01-01T00:00:00Z'))).toBe(1));
    it('Oct 9 2025 is week 41', () => expect(getISOWeek(new Date('2025-10-09T00:00:00Z'))).toBe(41));
    it('Dec 29 2025 is week 1 of 2026', () => expect(getISOWeek(new Date('2025-12-29T00:00:00Z'))).toBe(1));
});

// ─── formatRFC2822 ─────────────────────────────────────────────────────────────
describe('formatRFC2822', () => {
    it('formats known timestamp correctly', () => {
        const date = new Date('2025-10-09T09:33:20Z');
        expect(formatRFC2822(date)).toBe('Thu, 09 Oct 2025 09:33:20 +0000');
    });
    it('zero-pads day and time components', () => {
        const date = new Date('2025-01-05T08:07:06Z');
        expect(formatRFC2822(date)).toBe('Sun, 05 Jan 2025 08:07:06 +0000');
    });
});

// ─── convertTimestamp ──────────────────────────────────────────────────────────
describe('convertTimestamp', () => {
    const TS = 1760000000; // 2025-10-09T09:33:20Z
    it('detects unit as seconds', () => {
        expect(convertTimestamp(TS, 'UTC', 'iso').detectedUnit).toBe('seconds');
    });
    it('returns correct ISO 8601', () => {
        expect(convertTimestamp(TS, 'UTC', 'iso').primaryFormatted).toBe('2025-10-09T08:53:20.000Z');
    });
    it('returns correct RFC 2822', () => {
        expect(convertTimestamp(TS, 'UTC', 'rfc2822').primaryFormatted).toBe('Thu, 09 Oct 2025 08:53:20 +0000');
    });
    it('returns day of week Thursday', () => {
        expect(convertTimestamp(TS, 'UTC', 'iso').dayOfWeek).toBe('Thursday');
    });
    it('returns day of year 282', () => {
        expect(convertTimestamp(TS, 'UTC', 'iso').dayOfYear).toBe(282);
    });
    it('returns ISO week 41', () => {
        expect(convertTimestamp(TS, 'UTC', 'iso').isoWeek).toBe(41);
    });
    it('custom format uses tokens', () => {
        const result = convertTimestamp(TS, 'UTC', 'custom', 'YYYY-MM-DD');
        expect(result.primaryFormatted).toBe('2025-10-09');
    });
});

// ─── calculateWorkingDays ──────────────────────────────────────────────────────
describe('calculateWorkingDays', () => {
    it('Mon–Fri (5 days) = 5 working', () => {
        const start = new Date('2025-01-06T00:00:00Z'); // Monday
        const end = new Date('2025-01-11T00:00:00Z'); // Saturday
        expect(calculateWorkingDays(start, end)).toBe(5);
    });
    it('Sat–Sun = 0 working', () => {
        const start = new Date('2025-01-04T00:00:00Z'); // Saturday
        const end = new Date('2025-01-05T00:00:00Z'); // Sunday
        expect(calculateWorkingDays(start, end)).toBe(0);
    });
    it('same date = 0', () => {
        const d = new Date('2025-01-06T00:00:00Z');
        expect(calculateWorkingDays(d, d)).toBe(0);
    });
});

// ─── calculateDuration ─────────────────────────────────────────────────────────
describe('calculateDuration', () => {
    it('returns null for invalid date strings', () => {
        expect(calculateDuration('bad', '2025-01-01')).toBeNull();
    });
    it('7-day span: Jan 1–8 2025 (Wed–Wed)', () => {
        const r = calculateDuration('2025-01-01', '2025-01-08')!;
        expect(r.totalDays).toBe(7);
        expect(r.workingDays).toBe(5);
        expect(r.weekendDays).toBe(2);
    });
    it('handles reversed start/end gracefully', () => {
        const fwd = calculateDuration('2025-01-01', '2025-01-08')!;
        const rev = calculateDuration('2025-01-08', '2025-01-01')!;
        expect(rev.totalDays).toBe(fwd.totalDays);
        expect(rev.workingDays).toBe(fwd.workingDays);
    });
    it('same start and end = 0 days', () => {
        const r = calculateDuration('2025-06-01', '2025-06-01')!;
        expect(r.totalDays).toBe(0);
        expect(r.workingDays).toBe(0);
    });
    it('one full week = 7 days, 1.0 totalWeeks', () => {
        const r = calculateDuration('2025-01-06', '2025-01-13')!;
        expect(r.totalDays).toBe(7);
        expect(r.totalWeeks).toBe(1);
    });
    it('endpoint cards contain correct day names', () => {
        const r = calculateDuration('2025-01-06', '2025-01-07')!; // Mon → Tue
        expect(r.startCard.dayName).toBe('Monday');
        expect(r.endCard.dayName).toBe('Tuesday');
    });
    it('endpoint card year matches', () => {
        const r = calculateDuration('2025-03-15', '2026-03-15')!;
        expect(r.startCard.year).toBe(2025);
        expect(r.endCard.year).toBe(2026);
    });
});

// ─── applyCustomPattern ────────────────────────────────────────────────────────
describe('applyCustomPattern', () => {
    it('replaces YYYY MM DD tokens', () => {
        const date = new Date('2025-10-09T09:33:20Z');
        expect(applyCustomPattern(date, 'YYYY-MM-DD', 'UTC')).toBe('2025-10-09');
    });
    it('replaces HH mm ss tokens', () => {
        const date = new Date('2025-10-09T09:33:20Z');
        expect(applyCustomPattern(date, 'HH:mm:ss', 'UTC')).toBe('09:33:20');
    });
});
