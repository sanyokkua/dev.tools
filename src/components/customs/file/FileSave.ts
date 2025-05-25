export type FileSaveProperties = {
    fileName: string;
    fileExtension: string;
    fileContent?: string;
    fileMimeType?: string;
};

export function fileSave({
    fileName,
    fileExtension,
    fileContent = '',
    fileMimeType = 'text/plain;charset=utf-8',
}: FileSaveProperties) {
    if (!fileName || fileName.trim().length === 0) {
        throw new Error("File name can't be empty");
    }
    if (!fileExtension || fileExtension.trim().length === 0) {
        throw new Error("File extension can't be empty");
    }
    if (fileExtension.length < 2) {
        throw new Error("File extension should be at least 2 characters long, for ex: '.h'");
    }
    if (!fileExtension.startsWith('.')) {
        throw new Error('File extension should start from . (dot)');
    }
    if (fileName.endsWith(fileExtension)) {
        throw new Error('File name already contains file extension');
    }

    const blob = new Blob([fileContent], { type: fileMimeType });
    const url = URL.createObjectURL(blob);
    const htmlATag = document.createElement('a');
    htmlATag.href = url;
    htmlATag.download = `${fileName}${fileExtension}`;
    document.body.appendChild(htmlATag);
    htmlATag.click();
    document.body.removeChild(htmlATag);
    URL.revokeObjectURL(url);
}
