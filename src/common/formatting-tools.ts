/**
 * Formats a JSON string with specified indentation.
 *
 * @param {string} jsonStr - The input JSON string to format.
 * @param {number | string} [spaces=4] - Number of spaces or a string (e.g. '\t') for indentation. Default is 4.
 * @returns {string} The formatted JSON string with proper indentation.
 */
export function formatJson(jsonStr: string, spaces: number | string = 4): string {
    try {
        const jsonObj: unknown = JSON.parse(jsonStr);
        return JSON.stringify(jsonObj, null, spaces as number);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * Recursively sorts all object keys alphabetically (A→Z).
 */
function sortKeysDeep(val: unknown): unknown {
    if (Array.isArray(val)) return val.map(sortKeysDeep);
    if (val !== null && typeof val === 'object') {
        const rec = val as Record<string, unknown>;
        return Object.fromEntries(
            Object.keys(rec)
                .sort()
                .map((k) => [k, sortKeysDeep(rec[k])]),
        );
    }
    return val;
}

/**
 * Sorts all object keys in a JSON string alphabetically (A→Z), then re-serializes.
 *
 * @param {string} jsonStr - The input JSON string.
 * @param {number | string} [spaces=2] - Indentation for the output.
 * @returns {string} JSON string with keys sorted at every level.
 */
export function sortJsonKeys(jsonStr: string, spaces: number | string = 2): string {
    return JSON.stringify(sortKeysDeep(JSON.parse(jsonStr)), null, spaces as number);
}

/**
 * Result of a JSON validation check.
 */
export type JsonValidationResult = { valid: true } | { valid: false; error: string; line?: number; column?: number };

/**
 * Validates a JSON string and returns a structured result.
 *
 * @param {string} jsonStr - The JSON string to validate.
 * @returns {JsonValidationResult} An object indicating whether the JSON is valid,
 *   and if not, the error message and optional line/column information.
 */
export function validateJson(jsonStr: string): JsonValidationResult {
    try {
        JSON.parse(jsonStr);
        return { valid: true };
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const line = msg.match(/line (\d+)/i)?.[1];
        const col = msg.match(/column (\d+)/i)?.[1];
        return {
            valid: false,
            error: msg,
            line: line ? Number(line) : undefined,
            column: col ? Number(col) : undefined,
        };
    }
}

/**
 * Escapes a plain string into a JSON-encoded string (including surrounding quotes).
 *
 * @param {string} input - The raw string to escape.
 * @returns {string} The JSON-encoded representation, e.g. `"hello\\nworld"`.
 */
export function escapeJsonString(input: string): string {
    return JSON.stringify(input);
}

/**
 * Unescapes a JSON-encoded string back to its raw value.
 * Accepts strings with or without surrounding double quotes.
 *
 * @param {string} input - The JSON-encoded string to unescape.
 * @returns {string} The decoded raw string.
 */
export function unescapeJsonString(input: string): string {
    const t = input.trim();
    const quoted = t.startsWith('"') ? t : `"${t}"`;
    return JSON.parse(quoted) as string;
}

/**
 * Maps a Boolean value to an "On" or "Off" string representation.
 * @param b - Boolean flag indicating the state to represent as text
 * @returns The corresponding text representation ('On' or 'Off')
 */
export function mapBoolean(b: boolean): 'On' | 'Off' {
    return b ? 'On' : 'Off';
}
