/**
 * Formats a JSON string with specified indentation.
 *
 * @param {string} jsonStr - The input JSON string to format.
 * @param {number} [spaces=4] - Number of spaces for each level of indentation. Default is 4.
 * @returns {string} The formatted JSON string with proper indentation.
 */
export function formatJson(jsonStr: string, spaces: number = 4): string {
    try {
        const jsonObj: unknown = JSON.parse(jsonStr);
        return JSON.stringify(jsonObj, null, spaces);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * Maps a Boolean value to an "On" or "Off" string representation.
 * @param b - Boolean flag indicating the state to represent as text
 * @returns The corresponding text representation ('On' or 'Off')
 */
export function mapBoolean(b: boolean): 'On' | 'Off' {
    return b ? 'On' : 'Off';
}
