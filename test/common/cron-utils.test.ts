import { describeCron, getDialectHints, getNextRuns, TIMEZONES } from '../../src/common/cron-utils';

describe('describeCron', () => {
    describe('linux dialect', () => {
        it('returns a non-null string for a valid weekday expression', () => {
            const result = describeCron('0 9 * * 1-5', 'linux');
            expect(result).not.toBeNull();
            expect(result).toContain('9');
        });

        it('returns a string containing "Every minute" for * * * * *', () => {
            const result = describeCron('* * * * *', 'linux');
            expect(result).not.toBeNull();
            expect(result!.toLowerCase()).toContain('every minute');
        });

        it('returns null for an invalid expression', () => {
            expect(describeCron('invalid', 'linux')).toBeNull();
        });

        it('returns null for an empty string', () => {
            expect(describeCron('', 'linux')).toBeNull();
        });

        it('returns null for a whitespace-only string', () => {
            expect(describeCron('   ', 'linux')).toBeNull();
        });
    });

    describe('quartz dialect', () => {
        it('returns a non-null string for a 6-field quartz expression', () => {
            expect(describeCron('0 0 9 * * ?', 'quartz')).not.toBeNull();
        });

        it('returns a non-null string for a seconds-based quartz expression', () => {
            expect(describeCron('0/5 * * * * ?', 'quartz')).not.toBeNull();
        });

        it('returns a non-null string for a 5-field expression on quartz path', () => {
            expect(describeCron('0 9 * * *', 'quartz')).not.toBeNull();
        });

        it('returns null for an invalid quartz expression', () => {
            expect(describeCron('invalid expr!!!', 'quartz')).toBeNull();
        });
    });

    describe('aws dialect', () => {
        it('returns a non-null string for a named DOW expression with year', () => {
            expect(describeCron('15 10 ? * MON-FRI 2024', 'aws')).not.toBeNull();
        });

        it('returns a non-null string for a numeric DOW expression with year', () => {
            expect(describeCron('15 10 ? * 2-6 2025', 'aws')).not.toBeNull();
        });

        it('returns null for an invalid aws expression', () => {
            expect(describeCron('invalid expr!!!', 'aws')).toBeNull();
        });
    });
});

describe('getNextRuns', () => {
    describe('linux dialect', () => {
        it('returns an array of 5 date strings for a valid weekday expression in UTC', () => {
            const result = getNextRuns('0 9 * * 1-5', 'linux', 'UTC', 5);
            expect(result).not.toBeNull();
            expect(Array.isArray(result)).toBe(true);
            expect(result!.length).toBe(5);
            result!.forEach((s) => expect(s).toMatch(/\d{4}-\d{2}-\d{2}/));
        });

        it('returns an array of 5 date strings when using America/New_York timezone', () => {
            const result = getNextRuns('0 9 * * 1-5', 'linux', 'America/New_York', 5);
            expect(result).not.toBeNull();
            expect(result!.length).toBe(5);
        });

        it('returns an array of 10 date strings when count is 10', () => {
            const result = getNextRuns('0 9 * * 1-5', 'linux', 'UTC', 10);
            expect(result).not.toBeNull();
            expect(result!.length).toBe(10);
        });

        it('returns null for an invalid expression', () => {
            expect(getNextRuns('invalid', 'linux', 'UTC', 5)).toBeNull();
        });

        it('returns null for an empty expression', () => {
            expect(getNextRuns('', 'linux', 'UTC', 5)).toBeNull();
        });
    });

    describe('quartz dialect', () => {
        it('returns an array of 5 date strings for a valid 6-field quartz expression', () => {
            const result = getNextRuns('0 0 9 * * ?', 'quartz', 'UTC', 5);
            expect(result).not.toBeNull();
            expect(result!.length).toBe(5);
        });
    });

    describe('aws dialect', () => {
        it('returns an array of 5 date strings for a wildcard year AWS expression', () => {
            const result = getNextRuns('15 10 ? * MON-FRI *', 'aws', 'UTC', 5);
            expect(result).not.toBeNull();
            expect(result!.length).toBe(5);
        });

        it('returns null for an invalid aws expression', () => {
            expect(getNextRuns('invalid expr!!!', 'aws', 'UTC', 5)).toBeNull();
        });
    });
});

describe('getDialectHints', () => {
    it('returns an empty array for linux', () => {
        expect(getDialectHints('linux')).toEqual([]);
    });

    it('returns a non-empty array for quartz', () => {
        const hints = getDialectHints('quartz');
        expect(Array.isArray(hints)).toBe(true);
        expect(hints.length).toBeGreaterThan(0);
        hints.forEach((h) => expect(typeof h).toBe('string'));
        hints.forEach((h) => expect(h.length).toBeGreaterThan(0));
    });

    it('returns a non-empty array for aws', () => {
        const hints = getDialectHints('aws');
        expect(Array.isArray(hints)).toBe(true);
        expect(hints.length).toBeGreaterThan(0);
    });

    it('first aws hint contains "minutes"', () => {
        const hints = getDialectHints('aws');
        expect(hints[0].toLowerCase()).toContain('minutes');
    });
});

describe('TIMEZONES re-export', () => {
    it('includes UTC', () => {
        expect(TIMEZONES).toContain('UTC');
    });

    it('includes America/New_York', () => {
        expect(TIMEZONES).toContain('America/New_York');
    });
});
