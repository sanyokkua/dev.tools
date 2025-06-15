export type FileInfo = {
    fullName: string; // name+extension
    size: number; // size in bytes
    content: string;
    name: string;
    extension: string;
};

export function createEmptyFile(): FileInfo {
    return { fullName: '', size: 0, content: '', name: '', extension: '' };
}

export function createDefaultFile(): FileInfo {
    return { fullName: '', size: 0, content: '', name: 'Untitled', extension: '.txt' };
}
