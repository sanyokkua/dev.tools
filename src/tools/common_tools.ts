import copy from "copy-to-clipboard";

export function copyToClipboard(text: string | null | undefined): boolean {
    const textToCopy: string = text ? text : "";
    return copy(textToCopy);
}

export async function getFromClipboard(): Promise<string> {
    try {
        return await navigator.clipboard.readText();
    } catch (e) {
        console.warn(e);
        return "";
    }
}