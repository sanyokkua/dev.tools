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
