export type JsonQueryResult = { matches: unknown[] } | { error: string };

export async function queryJsonPath(jsonStr: string, path: string): Promise<JsonQueryResult> {
    if (!jsonStr.trim()) return { error: 'Empty input' };
    if (!path.trim()) return { error: 'Empty path' };
    let parsed: unknown;
    try {
        parsed = JSON.parse(jsonStr);
    } catch (e) {
        return { error: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}` };
    }
    try {
        const { JSONPath } = await import('jsonpath-plus');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const matches = JSONPath({ path, json: parsed as any }) as unknown as unknown[];
        return { matches };
    } catch (e) {
        return { error: `JSONPath error: ${e instanceof Error ? e.message : String(e)}` };
    }
}
