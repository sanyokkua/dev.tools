import { DEFAULT_EXTENSION, DEFAULT_MIME_TYPE } from '@/common/constants';

/**
 * Represents the properties required to save a file.
 * - `fileName`: The name of the file without the extension.
 * - `fileExtension`: The extension of the file (e.g., ".txt", ".pdf").
 * - `fileContent` (optional): The content of the file as a string.
 * - `fileMimeType` (optional): The MIME type of the file (e.g., "text/plain", "application/pdf").
 */
export type FileSaveProperties = {
    fileName: string;
    fileExtension: string;
    fileContent?: string;
    fileMimeType?: string;
};

/**
 * Validates the properties required for saving a file.
 *
 * @param fileSaveProperties - An object containing the file save properties.
 * @param fileSaveProperties.fileName - The name of the file to be saved.
 * @param fileSaveProperties.fileExtension - The extension of the file to be saved.
 * @return void - Throws an error if any validation fails, otherwise returns nothing.
 */
function validateTheFileSaveProperties({ fileName, fileExtension }: FileSaveProperties) {
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
}

/**
 * Saves a text file with the specified content and properties.
 *
 * @param options - An object containing the properties for saving the file.
 *   @property fileName - The name of the file to save (without extension).
 *   @property [fileContent=''] - The content of the file to save.
 *   @property [fileExtension=DEFAULT_EXTENSION] - The extension of the file.
 *   @property [fileMimeType=DEFAULT_MIME_TYPE] - The MIME type of the file.
 *
 * @return void
 */
export function saveTextFile({
    fileName,
    fileContent = '',
    fileExtension = DEFAULT_EXTENSION,
    fileMimeType = DEFAULT_MIME_TYPE,
}: FileSaveProperties) {
    validateTheFileSaveProperties({ fileName, fileExtension });

    const fileFullName = `${fileName}${fileExtension}`;
    const blob = new Blob([fileContent], { type: fileMimeType });
    const url = URL.createObjectURL(blob);
    const htmlATag = document.createElement('a');

    htmlATag.href = url;
    htmlATag.download = fileFullName;

    document.body.appendChild(htmlATag);
    htmlATag.click();

    document.body.removeChild(htmlATag);
    URL.revokeObjectURL(url);
}
