import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

export type DataFormat = 'json' | 'yaml' | 'querystring';

export interface FormatConversion {
    format: DataFormat;
    label: string;
    value?: string;
    error?: string;
}

const FORMAT_LABELS: Record<DataFormat, string> = { json: 'JSON', yaml: 'YAML', querystring: 'Query-string' };

export const DATA_FORMATS: DataFormat[] = ['json', 'yaml', 'querystring'];

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
