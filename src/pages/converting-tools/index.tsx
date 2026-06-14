import { copyToClipboard } from '@/common/clipboard-utils';
import { ColorFormat, convertColor } from '@/common/converting/color';
import { convertDataFormat, DataFormat } from '@/common/converting/data-format';
import { convertNumberBase } from '@/common/converting/number-base';
import { convertUnit, UnitCategory, UNITS_BY_CATEGORY } from '@/common/converting/units';
import { usePage } from '@/contexts/PageContext';
import { useToast } from '@/contexts/ToasterContext';
import Input from '@/controls/Input';
import SegmentedControl, { SegmentedOption } from '@/controls/SegmentedControl';
import Switch from '@/controls/Switch';
import { ToastType } from '@/controls/toaster/types';
import React, { useEffect, useMemo, useState } from 'react';

type ConverterMode = 'number-base' | 'data-format' | 'color' | 'units';
type NumberBaseId = 'dec' | 'hex' | 'bin' | 'oct';

const MODE_OPTIONS: SegmentedOption[] = [
    { value: 'number-base', label: 'Number base' },
    { value: 'data-format', label: 'Data format' },
    { value: 'color', label: 'Color' },
    { value: 'units', label: 'Units' },
];

const NUMBER_BASE_OPTIONS: SegmentedOption[] = [
    { value: 'dec', label: 'DEC' },
    { value: 'hex', label: 'HEX' },
    { value: 'bin', label: 'BIN' },
    { value: 'oct', label: 'OCT' },
];

const BASE_MAP: Record<NumberBaseId, number> = { dec: 10, hex: 16, bin: 2, oct: 8 };

const DATA_FORMAT_OPTIONS: SegmentedOption[] = [
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML' },
    { value: 'querystring', label: 'Query-string' },
    { value: 'toml', label: 'TOML' },
    { value: 'csv', label: 'CSV' },
];

const COLOR_FORMAT_OPTIONS: SegmentedOption[] = [
    { value: 'hex', label: 'HEX' },
    { value: 'rgb', label: 'RGB' },
    { value: 'hsl', label: 'HSL' },
    { value: 'hsv', label: 'HSV' },
];

const CATEGORY_OPTIONS: SegmentedOption[] = [
    { value: 'data', label: 'Data size' },
    { value: 'time', label: 'Time' },
    { value: 'temperature', label: 'Temperature' },
    { value: 'length', label: 'Length' },
];

function StepLabel({ letter, title }: { letter: string; title: string }): React.JSX.Element {
    return (
        <div className="converting-step-label">
            <span className="converting-step-circle">{letter}</span>
            {title}
        </div>
    );
}

const ConvertingToolsPage: React.FC = () => {
    const { setPageTitle } = usePage();
    const { showToast } = useToast();

    useEffect(() => {
        setPageTitle('Converting Tools');
    }, [setPageTitle]);

    const [mode, setMode] = useState<ConverterMode>('number-base');

    // Number base state
    const [nbInput, setNbInput] = useState('255');
    const [nbFromBase, setNbFromBase] = useState<NumberBaseId>('dec');
    const [nbCustomBase, setNbCustomBase] = useState(36);
    const [showCustomBase, setShowCustomBase] = useState(false);

    // Data format state
    const [dfInput, setDfInput] = useState('{"name":"Alice","age":30}');
    const [dfFrom, setDfFrom] = useState<DataFormat>('json');

    // Color state
    const [colorInput, setColorInput] = useState('#FF0000');
    const [colorFrom, setColorFrom] = useState<ColorFormat>('hex');

    // Units state
    const [unitsValue, setUnitsValue] = useState('1');
    const [unitCategory, setUnitCategory] = useState<UnitCategory>('data');
    const [fromUnit, setFromUnit] = useState('b');

    const handleCopy = (text: string): void => {
        const ok = copyToClipboard(text);
        showToast({ message: ok ? 'Copied!' : 'Copy failed', type: ok ? ToastType.SUCCESS : ToastType.ERROR });
    };

    // Reset from-unit when category changes
    useEffect(() => {
        setFromUnit(UNITS_BY_CATEGORY[unitCategory][0].id);
    }, [unitCategory]);

    // --- Number base results ---
    const nbResults = useMemo(
        () =>
            convertNumberBase(
                nbInput,
                BASE_MAP[nbFromBase],
                showCustomBase && nbCustomBase >= 2 && nbCustomBase <= 36 ? nbCustomBase : undefined,
            ),
        [nbInput, nbFromBase, nbCustomBase, showCustomBase],
    );

    // --- Data format results ---
    const dfResults = useMemo(() => convertDataFormat(dfInput, dfFrom), [dfInput, dfFrom]);

    // --- Color results ---
    const colorResults = useMemo(() => convertColor(colorInput, colorFrom), [colorInput, colorFrom]);
    const swatchColor = colorResults.find((r) => !r.error)?.swatchColor;

    // --- Units results ---
    const parsedUnitsValue = parseFloat(unitsValue);
    const unitsResults = useMemo(
        () => (isNaN(parsedUnitsValue) ? [] : convertUnit(parsedUnitsValue, fromUnit, unitCategory)),
        [parsedUnitsValue, fromUnit, unitCategory],
    );

    const unitOptions: SegmentedOption[] = UNITS_BY_CATEGORY[unitCategory].map((u) => ({
        value: u.id,
        label: u.label.split(' ')[0],
    }));

    return (
        <div style={{ padding: 'var(--s3)' }}>
            <div className="converting-toolbar">
                <SegmentedControl
                    options={MODE_OPTIONS}
                    value={mode}
                    onChange={(v) => setMode(v as ConverterMode)}
                    aria-label="Converter mode"
                />
            </div>

            {/* ===== NUMBER BASE ===== */}
            {mode === 'number-base' && (
                <div className="converting-page-layout">
                    <div className="card pad">
                        <StepLabel letter="A" title="Input" />
                        <div className="field" style={{ marginBottom: 'var(--s3)' }}>
                            <label>Value</label>
                            <Input value={nbInput} onChange={setNbInput} placeholder="e.g. 255" block />
                        </div>
                        <div className="converting-from-row">
                            <span className="converting-from-label">From:</span>
                            <SegmentedControl
                                options={NUMBER_BASE_OPTIONS}
                                value={nbFromBase}
                                onChange={(v) => setNbFromBase(v as NumberBaseId)}
                                aria-label="Source number base"
                            />
                        </div>
                        <div className="converting-base-input">
                            <Switch
                                checked={showCustomBase}
                                onChange={setShowCustomBase}
                                label="Show custom base"
                                id="show-custom-base"
                            />
                        </div>
                        {showCustomBase && (
                            <div className="converting-base-input">
                                <div className="converting-base-field">
                                    <label htmlFor="custom-base">Base (2–36):</label>
                                    <Input
                                        id="custom-base"
                                        type="number"
                                        value={String(nbCustomBase)}
                                        onChange={(v) => setNbCustomBase(parseInt(v, 10) || 36)}
                                        min={2}
                                        max={36}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="card pad">
                        <StepLabel letter="B" title="Result" />
                        <div className="converting-results-scroll">
                            <table className="converting-results-table">
                                <thead>
                                    <tr>
                                        <th>Format</th>
                                        <th>Value</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {nbResults.map((r) => (
                                        <tr key={r.base}>
                                            <td>{r.label}</td>
                                            <td>
                                                {r.error ? (
                                                    <span className="converting-error-cell">{r.error}</span>
                                                ) : (
                                                    <span className="converting-value-mono">{r.value}</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="button-base button-text converting-copy-btn"
                                                    disabled={!!r.error}
                                                    onClick={() => r.value && handleCopy(r.value)}
                                                    aria-label={`Copy ${r.label}`}
                                                >
                                                    ⧉
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== DATA FORMAT ===== */}
            {mode === 'data-format' && (
                <div className="converting-page-layout">
                    <div className="card pad">
                        <StepLabel letter="A" title="Input" />
                        <div className="converting-from-row" style={{ marginBottom: 'var(--s3)' }}>
                            <span className="converting-from-label">From:</span>
                            <SegmentedControl
                                options={DATA_FORMAT_OPTIONS}
                                value={dfFrom}
                                onChange={(v) => setDfFrom(v as DataFormat)}
                                aria-label="Source data format"
                            />
                        </div>
                        <textarea
                            className="converting-textarea"
                            value={dfInput}
                            onChange={(e) => setDfInput(e.target.value)}
                            placeholder="Paste your input here…"
                            spellCheck={false}
                        />
                    </div>
                    <div className="card pad">
                        <StepLabel letter="B" title="Result" />
                        <div className="converting-results-scroll">
                            <table className="converting-results-table">
                                <thead>
                                    <tr>
                                        <th>Format</th>
                                        <th>Value</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dfResults.map((r) => (
                                        <tr key={r.format}>
                                            <td>{r.label}</td>
                                            <td>
                                                {r.error ? (
                                                    <span className="converting-error-cell">{r.error}</span>
                                                ) : (
                                                    <span
                                                        className="converting-value-mono"
                                                        style={{ whiteSpace: 'pre-wrap' }}
                                                    >
                                                        {r.value}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="button-base button-text converting-copy-btn"
                                                    disabled={!!r.error || !r.value}
                                                    onClick={() => r.value && handleCopy(r.value)}
                                                    aria-label={`Copy ${r.label}`}
                                                >
                                                    ⧉
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== COLOR ===== */}
            {mode === 'color' && (
                <div className="converting-page-layout">
                    <div className="card pad">
                        <StepLabel letter="A" title="Input" />
                        <div className="field" style={{ marginBottom: 'var(--s3)' }}>
                            <label>Value</label>
                            <Input
                                value={colorInput}
                                onChange={setColorInput}
                                placeholder="#FF0000 / rgb(…) / hsl(…) / hsv(…)"
                                block
                            />
                        </div>
                        <div className="converting-from-row">
                            <span className="converting-from-label">Format:</span>
                            <SegmentedControl
                                options={COLOR_FORMAT_OPTIONS}
                                value={colorFrom}
                                onChange={(v) => setColorFrom(v as ColorFormat)}
                                aria-label="Source color format"
                            />
                        </div>
                        {swatchColor ? (
                            <div
                                className="converting-swatch"
                                style={{ background: swatchColor }}
                                aria-label="Color preview"
                            />
                        ) : (
                            <div className="converting-swatch-placeholder">Enter a valid color</div>
                        )}
                    </div>
                    <div className="card pad">
                        <StepLabel letter="B" title="Result" />
                        <div className="converting-results-scroll">
                            <table className="converting-results-table">
                                <thead>
                                    <tr>
                                        <th>Format</th>
                                        <th>Value</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {colorResults.map((r) => (
                                        <tr key={r.format}>
                                            <td>{r.label}</td>
                                            <td>
                                                {r.error ? (
                                                    <span className="converting-error-cell">{r.error}</span>
                                                ) : (
                                                    <span className="converting-value-mono">{r.value}</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="button-base button-text converting-copy-btn"
                                                    disabled={!!r.error}
                                                    onClick={() => r.value && handleCopy(r.value)}
                                                    aria-label={`Copy ${r.label}`}
                                                >
                                                    ⧉
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== UNITS ===== */}
            {mode === 'units' && (
                <div className="converting-page-layout">
                    <div className="card pad">
                        <StepLabel letter="A" title="Input" />
                        <div className="converting-category-row">
                            <div className="converting-from-row" style={{ marginBottom: 'var(--s2)' }}>
                                <span className="converting-from-label">Category:</span>
                                <SegmentedControl
                                    options={CATEGORY_OPTIONS}
                                    value={unitCategory}
                                    onChange={(v) => setUnitCategory(v as UnitCategory)}
                                    aria-label="Unit category"
                                />
                            </div>
                        </div>
                        <div className="field" style={{ marginBottom: 'var(--s3)' }}>
                            <label>Value</label>
                            <Input type="number" value={unitsValue} onChange={setUnitsValue} placeholder="1" block />
                        </div>
                        <div className="converting-from-row">
                            <span className="converting-from-label">From:</span>
                            <SegmentedControl
                                options={unitOptions}
                                value={fromUnit}
                                onChange={setFromUnit}
                                aria-label="Source unit"
                            />
                        </div>
                    </div>
                    <div className="card pad">
                        <StepLabel letter="B" title="Result" />
                        {unitsResults.length === 0 ? (
                            <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Enter a value to see conversions.</p>
                        ) : (
                            <div className="converting-results-scroll">
                                <table className="converting-results-table">
                                    <thead>
                                        <tr>
                                            <th>Unit</th>
                                            <th>Value</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {unitsResults.map((r) => (
                                            <tr key={r.id}>
                                                <td>{r.label}</td>
                                                <td>
                                                    <span className="converting-value-mono">{r.value}</span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="button-base button-text converting-copy-btn"
                                                        onClick={() => handleCopy(r.value)}
                                                        aria-label={`Copy ${r.label}`}
                                                    >
                                                        ⧉
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConvertingToolsPage;
