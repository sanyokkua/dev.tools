import { DEFAULT_EXTENSION, DEFAULT_MIME_TYPE } from '@/common/constants';
import { FileInfo, FileSaveProperties, OnErrorHandler, OnSuccessHandler } from '@/common/file-types';

/**
 * Validates the properties required for saving a file.
 *
 * @param fileSaveProperties - An object containing the file save properties.
 * @param fileSaveProperties.fileName - The name of the file to be saved.
 * @param fileSaveProperties.fileExtension - The extension of the file to be saved.
 * @return Throws an error if any validation fails, otherwise returns nothing.
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

/**
 * createFileReader - function to create a FileReader object
 * @param  onSuccess callback function when a file is loaded successfully
 * @param  onFailure callback function when file loading fails
 * @return the created FileReader instance
 */
const createFileReader = (onSuccess: OnSuccessHandler, onFailure: OnErrorHandler) => {
    const reader = new FileReader();
    reader.onload = onSuccess;
    reader.onerror = onFailure;
    return reader;
};

/**
 * A function that creates an OnSuccessHandler callback function.
 *
 * @param resolve - The promise resolve method.
 * @param reject - The promise reject method.
 * @returns An OnSuccessHandler callback function.
 */
const createOnSuccessHandler: (
    resolve: (value: string | PromiseLike<string>) => void,
    reject: (reason?: unknown) => void,
) => OnSuccessHandler = (resolve, reject) => {
    return (event: ProgressEvent<FileReader>) => {
        const isDone = event.target?.readyState === FileReader.DONE;
        const isStringValue = typeof event.target?.result === 'string';
        if (isDone && isStringValue) {
            resolve(event.target.result);
        } else {
            reject(new Error('Failed to read file'));
        }
    };
};

/**
 * Creates an error handler function that calls a rejection callback with an error message.
 *
 * @param reject - A rejection callback that will be invoked when the created onErrorHandler is called.
 * @returns An error handling function that, when invoked, triggers the provided reject callback with a failure error.
 */
const createOnErrorHandler: (reject: (reason?: unknown) => void) => OnErrorHandler = (reject) => {
    return () => {
        reject(new Error('Failed to read file'));
    };
};

/**
 * Creates a promise that resolves with the content of the specified file.
 *
 * @param file - The File object representing the file to read.
 * @returns A Promise that resolves with the text content of the file.
 */
export const createFileReadPromise = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const onFileReadSuccess = createOnSuccessHandler(resolve, reject);
        const onFileReadFailed = createOnErrorHandler(reject);
        const reader = createFileReader(onFileReadSuccess, onFileReadFailed);
        reader.readAsText(file);
    });
};

/**
 * Creates a FileInfo object from a File and its content.
 *
 * @param {File} file - The file to generate the info for. This should be an instance of the File API object.
 * @param {string} content - The contents of the file represented as a string.
 *
 * @returns {FileInfo} An object containing information about the file, including its name, extension, size, and
 *     content.
 */
export function createFileInfo(file: File, content: string): FileInfo {
    const ext = '.' + (file.name.split('.').pop() || '');
    const name = file.name.replace(new RegExp(`${ext}$`), '');
    return { fullName: file.name, size: file.size, content, name, extension: ext.toLowerCase() };
}

/**
 * Creates a new empty file object with default values.
 *
 * @returns A FileInfo object representing an empty file. The returned object contains:
 * - fullName (string): Empty string indicating no full filename is set
 * - size (number): 0 indicating the file has no content
 * - content (string): Empty string indicating no data in the file
 * - name (string): Empty string indicating no filename specified
 * - extension (string): Empty string indicating no file extension provided
 */
export function createEmptyFile(): FileInfo {
    return { fullName: '', size: 0, content: '', name: '', extension: '' };
}

/**
 * Creates a default file object with predefined values.
 * Returns an instance of FileInfo with basic properties set to their default values.
 *
 * @return {FileInfo} A new FileInfo object containing:
 *   - fullName: Empty string representing the full path and filename
 *   - size: Zero bytes indicating empty content
 *   - name: "Untitled" as initial file name
 *   - extension: Default file extension defined in DEFAULT_EXTENSION constant
 *   - content: Empty string for the file contents
 */
export function createDefaultFile(): FileInfo {
    return { fullName: '', size: 0, content: '', name: 'Untitled', extension: DEFAULT_EXTENSION };
}

/**
 * Handles failure to open a file and returns an empty file info object.
 *
 * @param error - The error that occurred while attempting to read the file.
 * @returns An empty FileInfo object created using createEmptyFile().
 */
export const handleFileOpenFailure: (error: unknown) => FileInfo = (error) => {
    console.error('Error reading file:', error);
    return createEmptyFile();
};
