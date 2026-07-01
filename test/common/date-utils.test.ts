import {
    addBusinessDays,
    addCalendarDays,
    applyCustomPattern,
    calculateDuration,
    calculateWorkingDays,
    convertTimestamp,
    dateToUnix,
    detectUnit,
    formatRFC2822,
    getDayOfYear,
    getISOWeek,
    parsePatternComponents,
    parseWithPattern,
    smartParseDate,
    toMs,
    zonedComponentsToUtc,
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

// ─── zonedComponentsToUtc ──────────────────────────────────────────────────────
describe('zonedComponentsToUtc', () => {
    const components = { year: 2025, month: 10, day: 9, hour: 8, minute: 53, second: 20 };

    it('UTC zone matches the naive UTC instant', () => {
        expect(zonedComponentsToUtc(components, 'UTC').toISOString()).toBe('2025-10-09T08:53:20.000Z');
    });

    it('non-UTC zone applies the correct offset (America/New_York is UTC-4 in October, EDT)', () => {
        const utcInstant = zonedComponentsToUtc(components, 'UTC').getTime();
        const nyInstant = zonedComponentsToUtc(components, 'America/New_York').getTime();
        expect(nyInstant - utcInstant).toBe(4 * 3600 * 1000);
    });

    it('normalizes the hour-24 quirk at midnight', () => {
        const midnight = { year: 2025, month: 1, day: 1, hour: 0, minute: 0, second: 0 };
        expect(zonedComponentsToUtc(midnight, 'UTC').toISOString()).toBe('2025-01-01T00:00:00.000Z');
    });

    it('does not throw on a DST spring-forward gap (America/New_York, 2025-03-09 02:30 does not exist)', () => {
        const gap = { year: 2025, month: 3, day: 9, hour: 2, minute: 30, second: 0 };
        const result = zonedComponentsToUtc(gap, 'America/New_York');
        expect(Number.isNaN(result.getTime())).toBe(false);
    });
});

// ─── dateToUnix ────────────────────────────────────────────────────────────────
describe('dateToUnix', () => {
    it('round-trips against convertTimestamp for a known Unix value', () => {
        const TS = 1760000000; // 2025-10-09T08:53:20Z
        const result = dateToUnix({ year: 2025, month: 10, day: 9, hour: 8, minute: 53, second: 20 }, 'UTC');
        expect(result.seconds).toBe(TS);
    });

    it('returns milliseconds equal to seconds * 1000', () => {
        const result = dateToUnix({ year: 2025, month: 10, day: 9, hour: 8, minute: 53, second: 20 }, 'UTC');
        expect(result.milliseconds).toBe(result.seconds * 1000);
    });
});

// ─── parsePatternComponents / parseWithPattern ─────────────────────────────────
describe('parsePatternComponents', () => {
    it('parses DD/MM/YYYY HH:mm:ss', () => {
        expect(parsePatternComponents('09/10/2025 08:53:20', 'DD/MM/YYYY HH:mm:ss')).toEqual({
            year: 2025,
            month: 10,
            day: 9,
            hour: 8,
            minute: 53,
            second: 20,
        });
    });

    it('defaults time components to 0 when absent from the pattern', () => {
        expect(parsePatternComponents('2025-10-09', 'YYYY-MM-DD')).toEqual({
            year: 2025,
            month: 10,
            day: 9,
            hour: 0,
            minute: 0,
            second: 0,
        });
    });

    it('returns null on a literal mismatch', () => {
        expect(parsePatternComponents('09-10-2025', 'DD/MM/YYYY')).toBeNull();
    });

    it('returns null for an out-of-range month', () => {
        expect(parsePatternComponents('32/13/2025', 'DD/MM/YYYY')).toBeNull();
    });

    it('rejects an invalid calendar date (Feb 30)', () => {
        expect(parsePatternComponents('30/02/2025', 'DD/MM/YYYY')).toBeNull();
    });

    it('disambiguates adjacent tokens with no separator', () => {
        expect(parsePatternComponents('20251009', 'YYYYMMDD')).toEqual({
            year: 2025,
            month: 10,
            day: 9,
            hour: 0,
            minute: 0,
            second: 0,
        });
    });

    it('escapes regex-special literals in the pattern', () => {
        expect(parsePatternComponents('2025.10.09', 'YYYY.MM.DD')).toEqual({
            year: 2025,
            month: 10,
            day: 9,
            hour: 0,
            minute: 0,
            second: 0,
        });
        expect(parsePatternComponents('2025X10X09', 'YYYY.MM.DD')).toBeNull();
    });
});

describe('parseWithPattern', () => {
    it('parses and converts to the correct UTC instant', () => {
        const date = parseWithPattern('09/10/2025 08:53:20', 'DD/MM/YYYY HH:mm:ss', 'UTC');
        expect(date?.toISOString()).toBe('2025-10-09T08:53:20.000Z');
    });

    it('returns null when the value does not match the pattern', () => {
        expect(parseWithPattern('bad-value', 'DD/MM/YYYY', 'UTC')).toBeNull();
    });
});

// ─── smartParseDate ────────────────────────────────────────────────────────────
describe('smartParseDate', () => {
    it('detects a Unix-seconds numeric string', () => {
        const result = smartParseDate('1760000000', 'UTC');
        expect(result?.strategy).toBe('unix-seconds');
        expect(result?.date.toISOString()).toBe('2025-10-09T08:53:20.000Z');
    });

    it('detects a Unix-milliseconds numeric string', () => {
        const result = smartParseDate('1760000000000', 'UTC');
        expect(result?.strategy).toBe('unix-milliseconds');
    });

    it('falls back to native parsing for an ISO string', () => {
        const result = smartParseDate('2025-10-09T08:53:20.000Z', 'UTC');
        expect(result?.strategy).toBe('native');
    });

    it('falls back to native parsing for an RFC 2822 string', () => {
        const result = smartParseDate('Thu, 09 Oct 2025 08:53:20 +0000', 'UTC');
        expect(result?.strategy).toBe('native');
    });

    it('prefers the pattern strategy for an all-digit value when an input pattern is given (not misread as Unix)', () => {
        const result = smartParseDate('20251009', 'UTC', 'YYYYMMDD');
        expect(result?.strategy).toBe('pattern');
        expect(result?.date.toISOString()).toBe('2025-10-09T00:00:00.000Z');
    });

    it('returns null when an explicit pattern is given but does not match (no silent fallback)', () => {
        expect(smartParseDate('not-a-date', 'UTC', 'YYYYMMDD')).toBeNull();
    });

    it('returns null for garbage input with no pattern', () => {
        expect(smartParseDate('garbage-input!!', 'UTC')).toBeNull();
    });
});

// ─── addCalendarDays ───────────────────────────────────────────────────────────
describe('addCalendarDays', () => {
    it('adds a positive amount of days', () => {
        expect(addCalendarDays(new Date('2025-01-01T00:00:00Z'), 10).isoDate).toBe('2025-01-11');
    });

    it('subtracts via a negative amount', () => {
        expect(addCalendarDays(new Date('2025-01-11T00:00:00Z'), -10).isoDate).toBe('2025-01-01');
    });

    it('amount 0 returns the same date', () => {
        expect(addCalendarDays(new Date('2025-06-15T00:00:00Z'), 0).isoDate).toBe('2025-06-15');
    });

    it('rolls over month and year boundaries', () => {
        expect(addCalendarDays(new Date('2025-12-25T00:00:00Z'), 10).isoDate).toBe('2026-01-04');
    });

    it('handles a leap-year Feb 29 correctly', () => {
        expect(addCalendarDays(new Date('2024-02-28T00:00:00Z'), 1).isoDate).toBe('2024-02-29');
    });

    it('handles a non-leap-year Feb rollover correctly', () => {
        expect(addCalendarDays(new Date('2025-02-28T00:00:00Z'), 1).isoDate).toBe('2025-03-01');
    });

    it('includes correct day/month names', () => {
        const result = addCalendarDays(new Date('2025-01-06T00:00:00Z'), 1); // Monday -> Tuesday
        expect(result.dayName).toBe('Tuesday');
        expect(result.monthName).toBe('January');
        expect(result.year).toBe(2025);
    });
});

// ─── addBusinessDays ───────────────────────────────────────────────────────────
describe('addBusinessDays', () => {
    it('Friday + 1 business day = Monday', () => {
        const result = addBusinessDays(new Date('2025-01-10T00:00:00Z'), 1); // Friday
        expect(result.dayName).toBe('Monday');
        expect(result.isoDate).toBe('2025-01-13');
    });

    it('Monday - 1 business day = Friday', () => {
        const result = addBusinessDays(new Date('2025-01-13T00:00:00Z'), -1); // Monday
        expect(result.dayName).toBe('Friday');
        expect(result.isoDate).toBe('2025-01-10');
    });

    it('Saturday + 1 business day = Monday', () => {
        const result = addBusinessDays(new Date('2025-01-11T00:00:00Z'), 1); // Saturday
        expect(result.dayName).toBe('Monday');
    });

    it('amount 0 returns the base date unchanged, even on a weekend', () => {
        expect(addBusinessDays(new Date('2025-01-11T00:00:00Z'), 0).isoDate).toBe('2025-01-11');
    });

    it('spans a full weekend over a multi-day shift', () => {
        const result = addBusinessDays(new Date('2025-01-06T00:00:00Z'), 6); // Monday + 6 business days
        expect(result.dayName).toBe('Tuesday');
        expect(result.isoDate).toBe('2025-01-14');
    });
});
