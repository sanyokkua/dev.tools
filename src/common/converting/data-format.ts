import { parse as parseToml, stringify as stringifyToml } from 'smol-toml';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

export type DataFormat = 'json' | 'yaml' | 'querystring' | 'toml' | 'csv';

export interface FormatConversion {
    format: DataFormat;
    label: string;
    value?: string;
    error?: string;
}

const FORMAT_LABELS: Record<DataFormat, string> = {
    json: 'JSON',
    yaml: 'YAML',
    querystring: 'Query-string',
    toml: 'TOML',
    csv: 'CSV',
};

export const DATA_FORMATS: DataFormat[] = ['json', 'yaml', 'querystring', 'toml', 'csv'];

// --- CSV helpers (RFC 4180) ---

function csvQuoteField(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
        return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
}

function csvParseRow(line: string): string[] {
    const fields: string[] = [];
    let i = 0;
    while (i <= line.length) {
        if (i === line.length) break;
        if (line[i] === '"') {
            let field = '';
            i++;
            while (i < line.length) {
                if (line[i] === '"') {
                    if (line[i + 1] === '"') {
                        field += '"';
                        i += 2;
                    } else {
                        i++;
                        break;
                    }
                } else {
                    field += line[i];
                    i++;
                }
            }
            fields.push(field);
            if (line[i] === ',') i++;
        } else {
            const end = line.indexOf(',', i);
            if (end === -1) {
                fields.push(line.slice(i));
                break;
            } else {
                fields.push(line.slice(i, end));
                i = end + 1;
            }
        }
    }
    return fields;
}

function csvParse(input: string): unknown {
    const lines = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();
    if (lines.length === 0) throw new Error('CSV input is empty');
    const headers = csvParseRow(lines[0]);
    if (headers.length === 0) throw new Error('CSV has no headers');
    return lines.slice(1).map((line) => {
        const fields = csvParseRow(line);
        const obj: Record<string, string> = {};
        headers.forEach((h, idx) => {
            obj[h] = fields[idx] ?? '';
        });
        return obj;
    });
}

function csvStringify(obj: unknown): string {
    if (Array.isArray(obj)) {
        if (obj.length === 0) return '';
        const first = obj[0];
        if (typeof first !== 'object' || first === null || Array.isArray(first)) {
            throw new Error('CSV only supports arrays of flat objects');
        }
        const allKeys = Array.from(new Set(obj.flatMap((row) => Object.keys(row as Record<string, unknown>))));
        for (const row of obj) {
            const r = row as Record<string, unknown>;
            for (const key of Object.keys(r)) {
                if (typeof r[key] === 'object' && r[key] !== null) {
                    throw new Error('CSV does not support nested objects');
                }
            }
        }
        const headerRow = allKeys.map(csvQuoteField).join(',');
        const dataRows = (obj as Record<string, unknown>[]).map((row) =>
            allKeys.map((k) => csvQuoteField(row[k] !== undefined && row[k] !== null ? String(row[k]) : '')).join(','),
        );
        return [headerRow, ...dataRows].join('\n');
    }
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        const rec = obj as Record<string, unknown>;
        const nested = Object.values(rec).some((v) => typeof v === 'object' && v !== null);
        if (nested) throw new Error('Nested objects cannot be converted to CSV');
        const rows = Object.entries(rec).map(([k, v]) => [csvQuoteField(k), csvQuoteField(String(v ?? ''))].join(','));
        return ['key,value', ...rows].join('\n');
    }
    throw new Error('CSV only supports objects or arrays of flat objects');
}

// --- Format conversion core ---

function toObject(input: string, from: DataFormat): unknown {
    switch (from) {
        case 'json':
            return JSON.parse(input);
        case 'yaml':
            return parseYaml(input);
        case 'querystring': {
            const obj: Record<string, string> = {};
            new URLSearchParams(input).forEach((v, k) => {
                obj[k] = v;
            });
            return obj;
        }
        case 'toml':
            return parseToml(input);
        case 'csv':
            return csvParse(input);
    }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isFlat(obj: Record<string, unknown>): boolean {
    return Object.values(obj).every((v) => typeof v !== 'object' || v === null);
}

function fromObject(obj: unknown, to: DataFormat): string {
    switch (to) {
        case 'json':
            return JSON.stringify(obj, null, 2);
        case 'yaml':
            return stringifyYaml(obj);
        case 'querystring': {
            if (!isPlainObject(obj)) {
                throw new Error('Only flat objects can be converted to query-string');
            }
            if (!isFlat(obj)) {
                throw new Error('Nested objects cannot be converted to query-string');
            }
            const entries = Object.entries(obj).map(([k, v]) => [k, String(v)] as [string, string]);
            return new URLSearchParams(entries).toString();
        }
        case 'toml': {
            if (!isPlainObject(obj)) {
                throw new Error('Top-level TOML must be an object/table');
            }
            return stringifyToml(obj as Parameters<typeof stringifyToml>[0]);
        }
        case 'csv':
            return csvStringify(obj);
    }
}

export function convertDataFormat(input: string, fromFormat: DataFormat): FormatConversion[] {
    const targets = DATA_FORMATS.filter((f) => f !== fromFormat);

    let parsed: unknown;
    try {
        parsed = toObject(input.trim(), fromFormat);
    } catch (e) {
        const error = e instanceof Error ? e.message : 'Parse error';
        return targets.map((f) => ({ format: f, label: FORMAT_LABELS[f], error }));
    }

    if (parsed === undefined || parsed === null) {
        return targets.map((f) => ({ format: f, label: FORMAT_LABELS[f], error: 'Input is empty or null' }));
    }

    return targets.map((f) => {
        try {
            return { format: f, label: FORMAT_LABELS[f], value: fromObject(parsed, f) };
        } catch (e) {
            return { format: f, label: FORMAT_LABELS[f], error: e instanceof Error ? e.message : 'Conversion error' };
        }
    });
}
