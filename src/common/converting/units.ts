export type UnitCategory = 'data' | 'time' | 'temperature' | 'length';

interface Unit {
    id: string;
    label: string;
    toBase: (v: number) => number;
    fromBase: (v: number) => number;
}

const DATA_UNITS: Unit[] = [
    { id: 'b', label: 'Bytes (B)', toBase: (v) => v, fromBase: (v) => v },
    { id: 'kb', label: 'Kilobytes (KB)', toBase: (v) => v * 1e3, fromBase: (v) => v / 1e3 },
    { id: 'mb', label: 'Megabytes (MB)', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
    { id: 'gb', label: 'Gigabytes (GB)', toBase: (v) => v * 1e9, fromBase: (v) => v / 1e9 },
    { id: 'tb', label: 'Terabytes (TB)', toBase: (v) => v * 1e12, fromBase: (v) => v / 1e12 },
    { id: 'kib', label: 'Kibibytes (KiB)', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
    { id: 'mib', label: 'Mebibytes (MiB)', toBase: (v) => v * 1024 ** 2, fromBase: (v) => v / 1024 ** 2 },
    { id: 'gib', label: 'Gibibytes (GiB)', toBase: (v) => v * 1024 ** 3, fromBase: (v) => v / 1024 ** 3 },
    { id: 'tib', label: 'Tebibytes (TiB)', toBase: (v) => v * 1024 ** 4, fromBase: (v) => v / 1024 ** 4 },
];

const TIME_UNITS: Unit[] = [
    { id: 'ns', label: 'Nanoseconds (ns)', toBase: (v) => v * 1e-9, fromBase: (v) => v * 1e9 },
    { id: 'us', label: 'Microseconds (µs)', toBase: (v) => v * 1e-6, fromBase: (v) => v * 1e6 },
    { id: 'ms', label: 'Milliseconds (ms)', toBase: (v) => v * 1e-3, fromBase: (v) => v * 1e3 },
    { id: 's', label: 'Seconds (s)', toBase: (v) => v, fromBase: (v) => v },
    { id: 'min', label: 'Minutes (min)', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
    { id: 'hr', label: 'Hours (hr)', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
    { id: 'day', label: 'Days (day)', toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
    { id: 'week', label: 'Weeks (wk)', toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
];

const TEMP_UNITS: Unit[] = [
    { id: 'c', label: 'Celsius (°C)', toBase: (v) => v, fromBase: (v) => v },
    { id: 'f', label: 'Fahrenheit (°F)', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
    { id: 'k', label: 'Kelvin (K)', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
];

const LENGTH_UNITS: Unit[] = [
    { id: 'mm', label: 'Millimeters (mm)', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { id: 'cm', label: 'Centimeters (cm)', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
    { id: 'm', label: 'Meters (m)', toBase: (v) => v, fromBase: (v) => v },
    { id: 'km', label: 'Kilometers (km)', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { id: 'in', label: 'Inches (in)', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    { id: 'ft', label: 'Feet (ft)', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { id: 'yd', label: 'Yards (yd)', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
    { id: 'mi', label: 'Miles (mi)', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
];

export const UNITS_BY_CATEGORY: Record<UnitCategory, Unit[]> = {
    data: DATA_UNITS,
    time: TIME_UNITS,
    temperature: TEMP_UNITS,
    length: LENGTH_UNITS,
};

export const CATEGORY_LABELS: Record<UnitCategory, string> = {
    data: 'Data size',
    time: 'Time',
    temperature: 'Temperature',
    length: 'Length',
};

export interface UnitConversion {
    id: string;
    label: string;
    value: string;
}

function formatNumber(n: number): string {
    if (Number.isNaN(n)) return 'NaN';
    if (!Number.isFinite(n)) return n > 0 ? '∞' : '-∞';
    if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-9 && n !== 0)) {
        return n.toExponential(6).replace(/\.?0+(e)/, '$1');
    }
    return Number.parseFloat(n.toPrecision(10)).toString();
}

export function convertUnit(value: number, fromUnitId: string, category: UnitCategory): UnitConversion[] {
    const units = UNITS_BY_CATEGORY[category];
    const fromUnit = units.find((u) => u.id === fromUnitId);
    if (!fromUnit) return [];
    const baseValue = fromUnit.toBase(value);
    return units.map((u) => ({ id: u.id, label: u.label, value: formatNumber(u.fromBase(baseValue)) }));
}
