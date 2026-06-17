'use client';
import {
    describeCron,
    getDialectHints,
    getFieldDefs,
    getNextRuns,
    TIMEZONES,
    type CronDialect,
} from '@/common/cron-utils';
import { useToast } from '@/contexts/ToasterContext';
import Button from '@/controls/Button';
import SegmentedControl, { type SegmentedOption } from '@/controls/SegmentedControl';
import Select, { createSelectItemsFromStringArray } from '@/controls/Select';
import { ToastType } from '@/controls/toaster/types';
import React, { useCallback, useMemo, useState } from 'react';

const DIALECT_OPTIONS: SegmentedOption[] = [
    { value: 'linux', label: 'Linux' },
    { value: 'quartz', label: 'Quartz' },
    { value: 'aws', label: 'AWS' },
];

const COUNT_OPTIONS: SegmentedOption[] = [
    { value: '5', label: '5' },
    { value: '10', label: '10' },
    { value: '20', label: '20' },
];

const TZ_ITEMS = createSelectItemsFromStringArray([...TIMEZONES]);

const CronPage: React.FC = () => {
    const { showToast } = useToast();
    const [dialect, setDialect] = useState<CronDialect>('linux');
    const [expression, setExpression] = useState('');
    const [timezone, setTimezone] = useState('UTC');
    const [count, setCount] = useState(5);

    const description = useMemo(
        () => (expression.trim() ? describeCron(expression, dialect) : null),
        [expression, dialect],
    );
    const nextRuns = useMemo(
        () => (expression.trim() ? getNextRuns(expression, dialect, timezone, count) : null),
        [expression, dialect, timezone, count],
    );
    const hints = useMemo(() => getDialectHints(dialect), [dialect]);
    const fieldDefs = useMemo(() => getFieldDefs(dialect), [dialect]);

    const handlePaste = useCallback(async (): Promise<void> => {
        try {
            const text = await navigator.clipboard.readText();
            setExpression(text);
        } catch {
            showToast({ message: 'Clipboard read failed', type: ToastType.ERROR });
        }
    }, [showToast]);

    const handleClear = useCallback((): void => {
        setExpression('');
    }, []);

    return (
        <div className="cron-layout">
            <div className="cron-toolbar">
                <SegmentedControl
                    options={DIALECT_OPTIONS}
                    value={dialect}
                    onChange={(v) => setDialect(v as CronDialect)}
                    aria-label="Cron dialect"
                />
            </div>

            {/* Input card */}
            <div className="card pad">
                <div className="cron-input-toolbar">
                    <span className="cron-section-label">Expression</span>
                    <Button text="Paste" variant="text" size="small" onClick={handlePaste} />
                    <Button text="Clear" variant="text" size="small" onClick={handleClear} />
                </div>
                <textarea
                    className="cron-textarea"
                    data-testid="cron-input"
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    placeholder={
                        dialect === 'quartz'
                            ? '0 0 9 * * ? (sec min hr dom mon dow)'
                            : dialect === 'aws'
                              ? '15 10 ? * MON-FRI 2024 (min hr dom mon dow year)'
                              : '0 9 * * 1-5 (min hr dom mon dow)'
                    }
                    spellCheck={false}
                />
                <div className="cron-fields" aria-label="Field reference">
                    {fieldDefs.map((f) => (
                        <div key={f.name} className="cron-field-item">
                            <span className="cron-field-name">{f.name}</span>
                            <span className="cron-field-allowed">{f.allowed}</span>
                        </div>
                    ))}
                </div>
                {dialect === 'aws' && (
                    <small className="cron-format-hint">
                        Format: min hr dom mon dow year — e.g. 15 10 ? * MON-FRI 2024
                    </small>
                )}
            </div>

            {expression.trim() && (
                <>
                    {/* Description card */}
                    <div className="card pad">
                        <div className="cron-section-label">Description</div>
                        {description !== null ? (
                            <span data-testid="cron-description">{description}</span>
                        ) : (
                            <span className="pill no" data-testid="cron-error">
                                Invalid expression
                            </span>
                        )}
                    </div>

                    {/* Next runs card */}
                    <div className="card pad">
                        <div className="cron-section-label">Next Runs</div>
                        <div className="cron-runs-toolbar">
                            <Select
                                items={TZ_ITEMS}
                                selectedItem={timezone}
                                onSelect={(item) => setTimezone(item.itemId)}
                            />
                            <SegmentedControl
                                options={COUNT_OPTIONS}
                                value={String(count)}
                                onChange={(v) => setCount(Number(v))}
                                aria-label="Run count"
                            />
                        </div>
                        {nextRuns !== null ? (
                            <ol className="cron-runs-list" data-testid="cron-next-runs">
                                {nextRuns.map((r, i) => (
                                    <li key={i} className="cron-run-item" data-testid="cron-run-item">
                                        {r}
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <span className="pill no">Could not compute run times</span>
                        )}
                        {dialect === 'aws' && (
                            <p className="cron-aws-note">
                                Next-run times are best-effort for AWS expressions. Named days (MON-FRI) and wildcards
                                are exact; numeric day-of-week is shifted by -1 for compatibility.
                            </p>
                        )}
                    </div>

                    {/* Hints card */}
                    {hints.length > 0 && (
                        <div className="card pad">
                            <div className="cron-section-label">Dialect Notes</div>
                            <ul data-testid="cron-hints">
                                {hints.map((h, i) => (
                                    <li key={i}>{h}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CronPage;
