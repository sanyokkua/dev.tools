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

export function joinTerminalCommands(commands: string[] | null | undefined, ignoreErrors: boolean = false): string {
    if (!commands || commands.length === 0) {
        return "";
    }
    if (commands.length === 1) {
        return commands[0];
    }

    const separator: string = ignoreErrors ? " & " : " && ";
    return commands.join(separator);
}