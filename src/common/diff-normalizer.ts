import { sortJsonKeys } from './formatting-tools';
import { formatXml } from './xml-formatting-tools';

export type DiffType = 'text' | 'json' | 'xml';

export interface NormalizeResult {
    result: string;
    error?: string;
}

export function normalizeForDiff(text: string, type: DiffType): NormalizeResult {
    if (type === 'text' || !text.trim()) return { result: text };
    try {
        if (type === 'json') return { result: sortJsonKeys(text, 2) };
        if (type === 'xml') return { result: formatXml(text, 2) };
    } catch (e) {
        return { result: text, error: e instanceof Error ? e.message : String(e) };
    }
    return { result: text };
}
