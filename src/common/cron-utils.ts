import { CronExpressionParser } from 'cron-parser';
import cronstrue from 'cronstrue';
import { formatInTimezone, TIMEZONES } from './date-utils';

export { TIMEZONES };

export type CronDialect = 'linux' | 'quartz' | 'aws';

function adaptAwsForDescription(expression: string): string {
    const fields = expression.trim().split(/\s+/);
    return fields.slice(0, 5).join(' ');
}

function adaptAwsForParsing(expression: string): string {
    const fields = expression.trim().split(/\s+/);
    const five = fields.slice(0, 5);
    five[4] = five[4].replace(/(?<![/])\b([1-7])\b(?![0-9])/g, (_, n) => String(Number(n) - 1));
    return five.join(' ');
}

export function describeCron(expression: string, dialect: CronDialect): string | null {
    if (!expression || !expression.trim()) return null;
    try {
        if (dialect === 'aws') {
            const adapted = adaptAwsForDescription(expression);
            return cronstrue.toString(adapted, { dayOfWeekStartIndexZero: false, throwExceptionOnParseError: true });
        }
        return cronstrue.toString(expression, { throwExceptionOnParseError: true });
    } catch {
        return null;
    }
}

export function getNextRuns(
    expression: string,
    dialect: CronDialect,
    timezone: string,
    count: number,
): string[] | null {
    if (!expression || !expression.trim()) return null;
    try {
        const tz = timezone || 'UTC';
        const expr = dialect === 'aws' ? adaptAwsForParsing(expression) : expression;
        const dates = CronExpressionParser.parse(expr, { tz }).take(count);
        return dates.map((cronDate) => formatInTimezone(cronDate.toDate(), tz));
    } catch {
        return null;
    }
}

export function getDialectHints(dialect: CronDialect): string[] {
    if (dialect === 'linux') return [];
    if (dialect === 'quartz') {
        return [
            'Fields: seconds minutes hours dom month dow [year]',
            'Use ? for day-of-month or day-of-week (not both)',
            'Supports L, W, # special characters',
        ];
    }
    return [
        'Fields: minutes hours dom month dow year (no seconds)',
        '? required on either dom or dow (not both)',
        'Day-of-week: 1=SUN, 2=MON … 7=SAT (1-based)',
        'Supports L, W, # special characters',
        'Year range: 2024–2199 or *',
    ];
}
