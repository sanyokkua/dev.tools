export const TIMEZONES = [
    'UTC',
    'Europe/Kyiv',
    'Europe/London',
    'Europe/Berlin',
    'Europe/Paris',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Asia/Dubai',
    'Australia/Sydney',
    'Pacific/Auckland',
] as const;

export type TimezoneValue = (typeof TIMEZONES)[number];
export type FormatOption = 'iso' | 'rfc2822' | 'relative' | 'custom';

export type TimestampBreakdown = {
    primaryFormatted: string;
    relativeFormatted: string;
    localFormatted: string;
    rfc2822: string;
    dayOfWeek: string;
    dayOfYear: number;
    isoWeek: number;
    detectedUnit: 'seconds' | 'milliseconds';
};

export type EndpointCard = { dayName: string; monthName: string; year: number };

export type DurationResult = {
    totalDays: number;
    workingDays: number;
    weekendDays: number;
    totalWeeks: number;
    totalMonths: number;
    totalYears: number;
    totalDecades: number;
    startCard: EndpointCard;
    endCard: EndpointCard;
};

export function detectUnit(value: number): 'seconds' | 'milliseconds' {
    return value > 1e12 ? 'milliseconds' : 'seconds';
}

export function toMs(value: number): number {
    return detectUnit(value) === 'seconds' ? value * 1000 : value;
}

export function getDayOfYear(date: Date): number {
    const start = Date.UTC(date.getUTCFullYear(), 0, 1);
    const cur = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return Math.round((cur - start) / 86400000) + 1;
}

export function getISOWeek(date: Date): number {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function formatRFC2822(date: Date): string {
    const pad = (n: number): string => String(n).padStart(2, '0');
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${DAYS[date.getUTCDay()]}, ${pad(date.getUTCDate())} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} +0000`;
}

export function getRelativeTime(date: Date): string {
    const diffMs = date.getTime() - Date.now();
    const diffDays = Math.round(diffMs / 86400000);
    if (Math.abs(diffDays) < 1) return 'today';
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    if (Math.abs(diffDays) < 30) return rtf.format(diffDays, 'day');
    if (Math.abs(diffDays) < 365) return rtf.format(Math.round(diffDays / 30), 'month');
    return rtf.format(Math.round(diffDays / 365), 'year');
}

export function formatInTimezone(date: Date, timezone: string): string {
    try {
        return new Intl.DateTimeFormat('sv-SE', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).format(date);
    } catch {
        return date.toISOString();
    }
}

export function applyCustomPattern(date: Date, pattern: string, timezone: string): string {
    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).formatToParts(date);
        const get = (type: string): string => parts.find((p) => p.type === type)?.value ?? '';
        const h = get('hour');
        return pattern
            .replace('YYYY', get('year'))
            .replace('MM', get('month'))
            .replace('DD', get('day'))
            .replace('HH', h === '24' ? '00' : h)
            .replace('mm', get('minute'))
            .replace('ss', get('second'));
    } catch {
        return date.toISOString();
    }
}

export function convertTimestamp(
    rawValue: number,
    timezone: string,
    format: FormatOption,
    customPattern?: string,
): TimestampBreakdown {
    const ms = toMs(rawValue);
    const date = new Date(ms);

    let primaryFormatted: string;
    switch (format) {
        case 'iso':
            primaryFormatted = date.toISOString();
            break;
        case 'rfc2822':
            primaryFormatted = formatRFC2822(date);
            break;
        case 'relative':
            primaryFormatted = getRelativeTime(date);
            break;
        case 'custom':
            primaryFormatted = customPattern ? applyCustomPattern(date, customPattern, timezone) : date.toISOString();
            break;
    }

    return {
        primaryFormatted,
        relativeFormatted: getRelativeTime(date),
        localFormatted: formatInTimezone(date, timezone),
        rfc2822: formatRFC2822(date),
        dayOfWeek: new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' }).format(date),
        dayOfYear: getDayOfYear(date),
        isoWeek: getISOWeek(date),
        detectedUnit: detectUnit(rawValue),
    };
}

export function calculateWorkingDays(start: Date, end: Date): number {
    let count = 0;
    const cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
    const endNorm = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
    while (cur < endNorm) {
        const day = cur.getUTCDay();
        if (day !== 0 && day !== 6) count++;
        cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return count;
}

export function calculateDuration(startDateStr: string, endDateStr: string): DurationResult | null {
    const startRaw = new Date(startDateStr);
    const endRaw = new Date(endDateStr);
    if (Number.isNaN(startRaw.getTime()) || Number.isNaN(endRaw.getTime())) return null;

    const [start, end] = startRaw <= endRaw ? [startRaw, endRaw] : [endRaw, startRaw];
    const totalMs = end.getTime() - start.getTime();
    const totalDays = Math.round(totalMs / 86400000);
    const workingDays = calculateWorkingDays(start, end);
    const weekendDays = totalDays - workingDays;

    const toCard = (d: Date): EndpointCard => ({
        dayName: new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' }).format(d),
        monthName: new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(d),
        year: d.getUTCFullYear(),
    });

    return {
        totalDays,
        workingDays,
        weekendDays,
        totalWeeks: Number.parseFloat((totalDays / 7).toFixed(2)),
        totalMonths: Number.parseFloat((totalDays / 30.4375).toFixed(2)),
        totalYears: Number.parseFloat((totalDays / 365.25).toFixed(2)),
        totalDecades: Number.parseFloat((totalDays / 3652.5).toFixed(2)),
        startCard: toCard(start),
        endCard: toCard(end),
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Date/time ↔ Unix, pattern-based parsing, and add/subtract-days helpers
// ─────────────────────────────────────────────────────────────────────────────

export type DateComponents = {
    year: number;
    month: number; // 1-12
    day: number;
    hour: number;
    minute: number;
    second: number;
};

function readZonedComponents(instantMs: number, timezone: string): DateComponents {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).formatToParts(new Date(instantMs));
    const get = (type: string): number => Number(parts.find((p) => p.type === type)?.value ?? '0');
    const hour = get('hour');
    return {
        year: get('year'),
        month: get('month'),
        day: get('day'),
        hour: hour === 24 ? 0 : hour,
        minute: get('minute'),
        second: get('second'),
    };
}

function componentsToEpoch(c: DateComponents): number {
    return Date.UTC(c.year, c.month - 1, c.day, c.hour, c.minute, c.second);
}

/**
 * Converts wall-clock date/time components in an IANA timezone to the UTC instant they represent.
 * Uses two-pass offset correction (guess as UTC, read the offset back via Intl, correct, repeat once)
 * to handle DST boundaries. Spring-forward gaps and fall-back overlaps resolve to whichever offset the
 * second pass converges on rather than being user-selectable — an accepted limitation of this approach.
 */
export function zonedComponentsToUtc(components: DateComponents, timezone: string): Date {
    const guess = componentsToEpoch(components);

    const offset1 = componentsToEpoch(readZonedComponents(guess, timezone)) - guess;
    const instant1 = guess - offset1;

    const offset2 = componentsToEpoch(readZonedComponents(instant1, timezone)) - instant1;
    const instant2 = guess - offset2;

    return new Date(instant2);
}

export function dateToUnix(components: DateComponents, timezone: string): { seconds: number; milliseconds: number } {
    const milliseconds = zonedComponentsToUtc(components, timezone).getTime();
    return { seconds: Math.round(milliseconds / 1000), milliseconds };
}

const PATTERN_TOKEN_GROUPS: Record<string, string> = {
    YYYY: 'year',
    MM: 'month',
    DD: 'day',
    HH: 'hour',
    mm: 'minute',
    ss: 'second',
};

const PATTERN_TOKEN_SPLIT = /(YYYY|MM|DD|HH|mm|ss)/;

function escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildPatternRegex(pattern: string): RegExp {
    const source = pattern
        .split(PATTERN_TOKEN_SPLIT)
        .map((segment) => {
            const group = PATTERN_TOKEN_GROUPS[segment];
            return group ? `(?<${group}>\\d{${segment.length}})` : escapeRegExp(segment);
        })
        .join('');
    return new RegExp(`^${source}$`);
}

function daysInMonth(year: number, month: number): number {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function isValidDateComponents(c: DateComponents): boolean {
    if (c.month < 1 || c.month > 12) return false;
    if (c.day < 1 || c.day > daysInMonth(c.year, c.month)) return false;
    if (c.hour < 0 || c.hour > 23) return false;
    if (c.minute < 0 || c.minute > 59) return false;
    if (c.second < 0 || c.second > 59) return false;
    return true;
}

/**
 * Inverse of applyCustomPattern: derives a regex from the pattern's fixed-width tokens (YYYY MM DD HH mm ss)
 * and extracts date/time components from a matching value. 2-digit years, variable-width M/D, and
 * month/day-name tokens are intentionally out of scope, matching applyCustomPattern's token set.
 */
export function parsePatternComponents(value: string, pattern: string): DateComponents | null {
    const match = buildPatternRegex(pattern).exec(value.trim());
    if (!match?.groups) return null;

    const { year, month, day, hour, minute, second } = match.groups;
    if (year === undefined || month === undefined || day === undefined) return null;

    const components: DateComponents = {
        year: Number(year),
        month: Number(month),
        day: Number(day),
        hour: hour === undefined ? 0 : Number(hour),
        minute: minute === undefined ? 0 : Number(minute),
        second: second === undefined ? 0 : Number(second),
    };

    return isValidDateComponents(components) ? components : null;
}

export function parseWithPattern(value: string, pattern: string, timezone: string): Date | null {
    const components = parsePatternComponents(value, pattern);
    return components ? zonedComponentsToUtc(components, timezone) : null;
}

export type ParseStrategy = 'unix-seconds' | 'unix-milliseconds' | 'pattern' | 'native';
export type SmartParseResult = { date: Date; strategy: ParseStrategy } | null;

/**
 * Best-effort date parser for the Formatter mode. If an input pattern is supplied, parsing is strict —
 * a mismatch returns null rather than silently falling back, since an explicit pattern signals the user
 * wants unambiguous parsing. Otherwise tries Unix-timestamp auto-detection, then native Date parsing.
 */
export function smartParseDate(value: string, timezone: string, inputPattern?: string): SmartParseResult {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (inputPattern?.trim()) {
        const parsed = parseWithPattern(trimmed, inputPattern.trim(), timezone);
        return parsed ? { date: parsed, strategy: 'pattern' } : null;
    }

    if (/^-?\d+$/.test(trimmed)) {
        const num = Number(trimmed);
        const unit = detectUnit(Math.abs(num));
        return { date: new Date(toMs(num)), strategy: unit === 'seconds' ? 'unix-seconds' : 'unix-milliseconds' };
    }

    const native = new Date(trimmed);
    return Number.isNaN(native.getTime()) ? null : { date: native, strategy: 'native' };
}

export type DayOffsetResult = { resultDate: Date; dayName: string; monthName: string; year: number; isoDate: string };

function normalizeToUtcMidnight(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function toDayOffsetResult(date: Date): DayOffsetResult {
    return {
        resultDate: date,
        dayName: new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' }).format(date),
        monthName: new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(date),
        year: date.getUTCFullYear(),
        isoDate: date.toISOString().slice(0, 10),
    };
}

/** Shifts a date by a signed number of calendar days. Millisecond-based arithmetic handles month/year/leap-year rollovers correctly. */
export function addCalendarDays(base: Date, amount: number): DayOffsetResult {
    const normalized = normalizeToUtcMidnight(base);
    return toDayOffsetResult(new Date(normalized.getTime() + amount * 86400000));
}

/**
 * Shifts a date by a signed number of business days (Mon-Fri), skipping Sat/Sun. The base day itself is
 * never counted, and amount 0 returns the base unchanged even if it falls on a weekend.
 */
export function addBusinessDays(base: Date, amount: number): DayOffsetResult {
    let cur = normalizeToUtcMidnight(base);
    const step = amount >= 0 ? 1 : -1;
    let remaining = Math.abs(amount);
    while (remaining > 0) {
        cur = new Date(cur.getTime() + step * 86400000);
        const day = cur.getUTCDay();
        if (day !== 0 && day !== 6) remaining--;
    }
    return toDayOffsetResult(cur);
}
