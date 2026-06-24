import { parse as parseToml, stringify as stringifyToml } from 'smol-toml';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

export type DataFormat = 'json' | 'yaml' | 'querystring' | 'toml' | 'csv' | 'markdown-table';

export interface FormatConversion {
    format: DataFormat;
    label: string;
    value?: string;
    error?: string;
}

const FORMAT_LABELS: Record<DataFormat, string> = {
    'json': 'JSON',
    'yaml': 'YAML',
    'querystring': 'Query-string',
    'toml': 'TOML',
    'csv': 'CSV',
    'markdown-table': 'Markdown table',
};

export const DATA_FORMATS: DataFormat[] = ['json', 'yaml', 'querystring', 'toml', 'csv', 'markdown-table'];

// --- CSV helpers (RFC 4180 subset; no multi-line fields) ---

function csvQuoteField(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
        return '"' + value.replaceAll('"', '""') + '"';
    }
    return value;
}

function csvParseRow(line: string): string[] {
    const fields: string[] = [];
    let i = 0;
    while (i < line.length) {
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
    // RFC 4180: trailing comma means final empty field
    if (line.length > 0 && line.at(-1) === ',') {
        fields.push('');
    }
    return fields;
}

function csvParse(input: string): unknown {
    const lines = input.replaceAll('\r\n', '\n').replaceAll('\r', '\n').split('\n');
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
        for (const item of obj) {
            if (typeof item !== 'object' || item === null || Array.isArray(item)) {
                throw new Error('CSV only supports arrays of flat objects');
            }
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

// --- Markdown table helpers (GFM; no multi-line cells) ---

function mdTableQuoteCell(value: string): string {
    return value.replaceAll('\\', '\\\\').replaceAll('|', String.raw`\|`);
}

function mdTableUnquoteCell(raw: string): string {
    return raw
        .trim()
        .replaceAll(String.raw`\|`, '|')
        .replaceAll('\\\\', '\\');
}

function mdTableParseRow(line: string): string[] {
    let s = line;
    if (s.startsWith('|')) s = s.slice(1);
    if (s.endsWith('|')) s = s.slice(0, -1);
    const cells: string[] = [];
    let cell = '';
    let i = 0;
    while (i < s.length) {
        if (s[i] === '\\' && i + 1 < s.length) {
            cell += s[i] + s[i + 1];
            i += 2;
        } else if (s[i] === '|') {
            cells.push(cell);
            cell = '';
            i++;
        } else {
            cell += s[i];
            i++;
        }
    }
    cells.push(cell);
    return cells.map(mdTableUnquoteCell);
}

function mdTableParse(input: string): unknown {
    const lines = input.replaceAll('\r\n', '\n').replaceAll('\r', '\n').split('\n');
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();
    if (lines.length < 2) throw new Error('Markdown table must have at least a header row and a separator row');
    const headers = mdTableParseRow(lines[0]);
    if (headers.every((h) => h === '')) throw new Error('Markdown table has no headers');
    const sepCells = lines[1]
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((s) => s.trim());
    if (!sepCells.every((s) => /^:?-+:?$/.test(s)))
        throw new Error('Line 2 must be a Markdown table separator row (e.g. | --- | --- |)');
    return lines.slice(2).map((line) => {
        const fields = mdTableParseRow(line);
        const obj: Record<string, string> = {};
        headers.forEach((h, idx) => {
            obj[h] = fields[idx] ?? '';
        });
        return obj;
    });
}

function mdTableStringify(obj: unknown): string {
    if (Array.isArray(obj)) {
        if (obj.length === 0) return '';
        for (const item of obj) {
            if (typeof item !== 'object' || item === null || Array.isArray(item))
                throw new Error('Markdown table only supports arrays of flat objects');
        }
        const allKeys = Array.from(new Set(obj.flatMap((row) => Object.keys(row as Record<string, unknown>))));
        for (const row of obj) {
            const r = row as Record<string, unknown>;
            for (const key of Object.keys(r)) {
                if (typeof r[key] === 'object' && r[key] !== null)
                    throw new Error('Markdown table does not support nested objects');
            }
        }
        const headerRow = '| ' + allKeys.map(mdTableQuoteCell).join(' | ') + ' |';
        const sepRow = '| ' + allKeys.map(() => '---').join(' | ') + ' |';
        const dataRows = (obj as Record<string, unknown>[]).map(
            (row) =>
                '| ' +
                allKeys
                    .map((k) => mdTableQuoteCell(row[k] !== undefined && row[k] !== null ? String(row[k]) : ''))
                    .join(' | ') +
                ' |',
        );
        return [headerRow, sepRow, ...dataRows].join('\n');
    }
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        const rec = obj as Record<string, unknown>;
        if (Object.values(rec).some((v) => typeof v === 'object' && v !== null))
            throw new Error('Nested objects cannot be converted to Markdown table');
        const headerRow = '| key | value |';
        const sepRow = '| --- | --- |';
        const dataRows = Object.entries(rec).map(
            ([k, v]) => '| ' + mdTableQuoteCell(k) + ' | ' + mdTableQuoteCell(String(v ?? '')) + ' |',
        );
        return [headerRow, sepRow, ...dataRows].join('\n');
    }
    throw new Error('Markdown table only supports objects or arrays of flat objects');
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
        case 'markdown-table':
            return mdTableParse(input);
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
        case 'markdown-table':
            return mdTableStringify(obj);
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
