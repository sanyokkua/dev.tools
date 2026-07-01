import { copyToClipboard } from '@/common/clipboard-utils';
import {
    calculateDuration,
    convertTimestamp,
    DateComponents,
    dateToUnix,
    DurationResult,
    formatInTimezone,
    FormatOption,
    TimestampBreakdown,
    TIMEZONES,
    TimezoneValue,
} from '@/common/date-utils';
import { usePage } from '@/contexts/PageContext';
import { useToast } from '@/contexts/ToasterContext';
import Input from '@/controls/Input';
import SegmentedControl, { SegmentedOption } from '@/controls/SegmentedControl';
import Select, { createSelectItemsFromStringArray, SelectItem } from '@/controls/Select';
import { ToastType } from '@/controls/toaster/types';
import ToolAbout from '@/controls/ToolAbout';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

type DateMode = 'timestamp' | 'calculator';
type TimestampDirection = 'unixToDate' | 'dateToUnix';

const MODE_OPTIONS: SegmentedOption[] = [
    { value: 'timestamp', label: 'Timestamp ↔ Date' },
    { value: 'calculator', label: 'Calculator' },
];

const DIRECTION_OPTIONS: SegmentedOption[] = [
    { value: 'unixToDate', label: 'Unix → Date' },
    { value: 'dateToUnix', label: 'Date → Unix' },
];

const SELECT_FORMAT_ITEMS: SelectItem[] = [
    { itemId: 'iso', displayText: 'ISO 8601' },
    { itemId: 'rfc2822', displayText: 'RFC 2822' },
    { itemId: 'relative', displayText: 'Relative' },
    { itemId: 'custom', displayText: 'Custom…' },
];

const TIMEZONE_ITEMS = createSelectItemsFromStringArray([...TIMEZONES]);

function parseDateTimeLocal(value: string): DateComponents | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
    if (!match) return null;
    const [, year, month, day, hour, minute, second] = match;
    return {
        year: Number(year),
        month: Number(month),
        day: Number(day),
        hour: Number(hour),
        minute: Number(minute),
        second: second ? Number(second) : 0,
    };
}

const DateToolsPage: React.FC = () => {
    const { setPageTitle } = usePage();
    const { showToast } = useToast();

    useEffect(() => {
        setPageTitle('Date Tools');
    }, [setPageTitle]);

    const [mode, setMode] = useState<DateMode>('timestamp');

    // ── Timestamp mode state ──────────────────────────────────────────────────
    const [tsDirection, setTsDirection] = useState<TimestampDirection>('unixToDate');
    const [tsInput, setTsInput] = useState('1760000000');
    const [timezone, setTimezone] = useState<TimezoneValue>('UTC');
    const [format, setFormat] = useState<FormatOption>('iso');
    const [customPattern, setCustomPattern] = useState('YYYY-MM-DD HH:mm:ss');
    const [dtInput, setDtInput] = useState<string>(() => formatInTimezone(new Date(), 'UTC').replace(' ', 'T'));

    // ── Duration mode state ───────────────────────────────────────────────────
    const today = new Date().toISOString().slice(0, 10);
    const oneYearAgo = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10);
    const [startDate, setStartDate] = useState(oneYearAgo);
    const [endDate, setEndDate] = useState(today);

    const handleCopy = useCallback(
        (text: string): void => {
            const ok = copyToClipboard(text);
            showToast({ message: ok ? 'Copied!' : 'Copy failed', type: ok ? ToastType.SUCCESS : ToastType.ERROR });
        },
        [showToast],
    );

    const handleNow = (): void => {
        setTsInput(String(Math.floor(Date.now() / 1000)));
    };

    const handleNowReverse = (): void => {
        setDtInput(formatInTimezone(new Date(), timezone).replace(' ', 'T'));
    };

    // ── Timestamp results (reactive) ──────────────────────────────────────────
    const tsResult = useMemo((): TimestampBreakdown | null => {
        const num = Number(tsInput);
        if (!tsInput.trim() || Number.isNaN(num)) return null;
        return convertTimestamp(num, timezone, format, customPattern);
    }, [tsInput, timezone, format, customPattern]);

    const reverseResult = useMemo((): { seconds: number; milliseconds: number } | null => {
        const components = parseDateTimeLocal(dtInput);
        if (!components) return null;
        return dateToUnix(components, timezone);
    }, [dtInput, timezone]);

    // ── Duration results (reactive) ───────────────────────────────────────────
    const durationResult = useMemo((): DurationResult | null => {
        if (!startDate || !endDate) return null;
        return calculateDuration(startDate, endDate);
    }, [startDate, endDate]);

    return (
        <div style={{ padding: 'var(--s3)' }}>
            <ToolAbout routeKey="date-tools">
                Work with dates two ways: <strong>Timestamp ↔ Date</strong> (Unix seconds/ms ↔ formatted date, timezone
                and format selectors, "Now", and a breakdown with day-of-week, day-of-year and ISO week) and{' '}
                <strong>Calculator</strong> (total / working / weekend days, weeks, months, years between two dates).
                All computed locally.
            </ToolAbout>
            <div className="date-toolbar">
                <SegmentedControl
                    options={MODE_OPTIONS}
                    value={mode}
                    onChange={(v) => setMode(v as DateMode)}
                    aria-label="Date tool mode"
                />
            </div>

            {/* ───────────────── TIMESTAMP MODE ───────────────── */}
            {mode === 'timestamp' && (
                <>
                    <div className="date-submode-toggle">
                        <SegmentedControl
                            options={DIRECTION_OPTIONS}
                            value={tsDirection}
                            onChange={(v) => setTsDirection(v as TimestampDirection)}
                            aria-label="Timestamp direction"
                        />
                    </div>
                    <div className="date-page-layout">
                        {tsDirection === 'unixToDate' ? (
                            <>
                                {/* Left: Input card */}
                                <div
                                    className="card pad"
                                    style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}
                                >
                                    <div className="field">
                                        <label htmlFor="ts-input">
                                            Unix timestamp
                                            {tsResult && (
                                                <span className="date-unit-chip">{tsResult.detectedUnit}</span>
                                            )}
                                        </label>
                                        <Input
                                            id="ts-input"
                                            value={tsInput}
                                            onChange={setTsInput}
                                            placeholder="e.g. 1760000000"
                                            block
                                        />
                                    </div>
                                    <div className="field">
                                        <label htmlFor="tz-select">Timezone</label>
                                        <Select
                                            items={TIMEZONE_ITEMS}
                                            selectedItem={timezone}
                                            onSelect={(item) => setTimezone(item.itemId as TimezoneValue)}
                                            block
                                        />
                                    </div>
                                    <div className="field">
                                        <label>Format</label>
                                        <Select
                                            items={SELECT_FORMAT_ITEMS}
                                            selectedItem={format}
                                            onSelect={(item) => setFormat(item.itemId as FormatOption)}
                                            block
                                        />
                                    </div>
                                    {format === 'custom' && (
                                        <div className="date-custom-row">
                                            <span className="date-custom-label">Pattern:</span>
                                            <Input
                                                value={customPattern}
                                                onChange={setCustomPattern}
                                                placeholder="YYYY-MM-DD HH:mm:ss"
                                                block
                                            />
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: 'var(--s2)' }}>
                                        <button
                                            className="btn primary"
                                            onClick={() => setTsInput(tsInput.trim())}
                                            aria-label="Convert timestamp"
                                        >
                                            Convert
                                        </button>
                                        <button
                                            className="btn ghost"
                                            onClick={handleNow}
                                            aria-label="Use current timestamp"
                                        >
                                            Now
                                        </button>
                                    </div>
                                </div>

                                {/* Right: Results */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {tsResult ? (
                                        <>
                                            {/* KPI row */}
                                            <div className="date-kpi-row">
                                                <div className="date-kpi-card">
                                                    <div className="date-kpi-value">{tsResult.primaryFormatted}</div>
                                                    <div className="date-kpi-label">
                                                        {SELECT_FORMAT_ITEMS.find((f) => f.itemId === format)
                                                            ?.displayText ?? 'Primary'}
                                                    </div>
                                                </div>
                                                <div className="date-kpi-card">
                                                    <div className="date-kpi-value">{tsResult.relativeFormatted}</div>
                                                    <div className="date-kpi-label">Relative to now</div>
                                                </div>
                                            </div>

                                            {/* Breakdown table */}
                                            <div className="card pad">
                                                <table className="date-breakdown-table">
                                                    <tbody>
                                                        <tr>
                                                            <td>Local ({timezone})</td>
                                                            <td>
                                                                {tsResult.localFormatted}
                                                                <button
                                                                    className="btn ghost date-copy-btn"
                                                                    onClick={() => handleCopy(tsResult.localFormatted)}
                                                                    aria-label="Copy local time"
                                                                    style={{ marginLeft: 'var(--s2)' }}
                                                                >
                                                                    ⧉
                                                                </button>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>RFC 2822</td>
                                                            <td>
                                                                {tsResult.rfc2822}
                                                                <button
                                                                    className="btn ghost date-copy-btn"
                                                                    onClick={() => handleCopy(tsResult.rfc2822)}
                                                                    aria-label="Copy RFC 2822"
                                                                    style={{ marginLeft: 'var(--s2)' }}
                                                                >
                                                                    ⧉
                                                                </button>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>Day of week</td>
                                                            <td>{tsResult.dayOfWeek}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Day of year / Week</td>
                                                            <td>
                                                                {tsResult.dayOfYear} · W{tsResult.isoWeek}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    ) : (
                                        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
                                            Enter a valid Unix timestamp.
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Left: Input card */}
                                <div
                                    className="card pad"
                                    style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}
                                >
                                    <div className="field">
                                        <label htmlFor="dt-input">Date &amp; time</label>
                                        <Input
                                            id="dt-input"
                                            type="datetime-local"
                                            value={dtInput}
                                            onChange={setDtInput}
                                            step={1}
                                            block
                                        />
                                    </div>
                                    <div className="field">
                                        <label htmlFor="tz-select">Timezone</label>
                                        <Select
                                            items={TIMEZONE_ITEMS}
                                            selectedItem={timezone}
                                            onSelect={(item) => setTimezone(item.itemId as TimezoneValue)}
                                            block
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--s2)' }}>
                                        <button
                                            className="btn ghost"
                                            onClick={handleNowReverse}
                                            aria-label="Use current date and time"
                                        >
                                            Now
                                        </button>
                                    </div>
                                </div>

                                {/* Right: Results */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {reverseResult ? (
                                        <div className="date-kpi-row">
                                            <div className="date-kpi-card">
                                                <div className="date-kpi-value">{reverseResult.seconds}</div>
                                                <div className="date-kpi-label">Unix seconds</div>
                                                <button
                                                    className="btn ghost date-copy-btn"
                                                    onClick={() => handleCopy(String(reverseResult.seconds))}
                                                    aria-label="Copy unix seconds"
                                                >
                                                    ⧉
                                                </button>
                                            </div>
                                            <div className="date-kpi-card">
                                                <div className="date-kpi-value">{reverseResult.milliseconds}</div>
                                                <div className="date-kpi-label">Unix milliseconds</div>
                                                <button
                                                    className="btn ghost date-copy-btn"
                                                    onClick={() => handleCopy(String(reverseResult.milliseconds))}
                                                    aria-label="Copy unix milliseconds"
                                                >
                                                    ⧉
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
                                            Pick a valid date and time.
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* ───────────────── CALCULATOR MODE ───────────────── */}
            {mode === 'calculator' && (
                <div className="date-page-layout">
                    {/* Left: date range inputs */}
                    <div className="card pad" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
                        <div className="field">
                            <label htmlFor="start-date">Start date</label>
                            <Input id="start-date" type="date" value={startDate} onChange={setStartDate} block />
                        </div>
                        <div className="field">
                            <label htmlFor="end-date">End date</label>
                            <Input id="end-date" type="date" value={endDate} onChange={setEndDate} block />
                        </div>
                    </div>

                    {/* Right: results */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {durationResult ? (
                            <>
                                {/* Stats grid */}
                                <div className="date-stats-grid">
                                    {(
                                        [
                                            { label: 'Total days', value: durationResult.totalDays },
                                            { label: 'Working days', value: durationResult.workingDays },
                                            { label: 'Weekend days', value: durationResult.weekendDays },
                                            { label: 'Weeks', value: durationResult.totalWeeks },
                                            { label: 'Months', value: durationResult.totalMonths },
                                            { label: 'Years', value: durationResult.totalYears },
                                            { label: 'Decades', value: durationResult.totalDecades },
                                        ] as { label: string; value: number }[]
                                    ).map(({ label, value }) => (
                                        <div key={label} className="date-stat-card">
                                            <div className="date-stat-value">{value}</div>
                                            <div className="date-stat-label">{label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Endpoint cards */}
                                <div className="date-endpoint-cards">
                                    {(
                                        [
                                            { title: 'Start', card: durationResult.startCard },
                                            { title: 'End', card: durationResult.endCard },
                                        ] as const
                                    ).map(({ title, card }) => (
                                        <div key={title} className="date-endpoint-card">
                                            <div className="date-endpoint-header">{title}</div>
                                            <div className="date-endpoint-day">{card.dayName}</div>
                                            <div className="date-endpoint-month">{card.monthName}</div>
                                            <div className="date-endpoint-year">{card.year}</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Select a valid date range.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateToolsPage;
