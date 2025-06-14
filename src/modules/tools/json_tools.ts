export function formatJson(jsonStr: string, spaces: number = 4): string {
    try {
        const jsonObj: unknown = JSON.parse(jsonStr);
        return JSON.stringify(jsonObj, null, spaces);
    } catch (error) {
        console.error(error);
        throw error;
    }
}
