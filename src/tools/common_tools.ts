import copy from "copy-to-clipboard";

export function copyToClipboard(text: string | null | undefined): boolean {
    const textToCopy: string = text ? text : "";
    return copy(textToCopy);
}