/**
 * Defines a file's metadata and contents.
 * Contains the file name, extension, size, and its full content.
 */
export type FileInfo = {
    fullName: string; // name+extension
    size: number; // size in bytes
    content: string;
    name: string;
    extension: string;
};
/**
 * Defines the properties required to save a file in the system.
 *
 * @property {string} fileName - The name of the file without extension.
 * @property {string} fileExtension - The file's extension (e.g., 'txt', 'pdf').
 * @property {string} [fileContent] - The content to be saved, if applicable.
 * @property {string} [fileMimeType] - The MIME type of the file, optional when extension is provided.
 */
export type FileSaveProperties = {
    fileName: string;
    fileExtension: string;
    fileContent?: string;
    fileMimeType?: string;
};
/**
 * A callback function that handles the successful completion of a file read operation.
 * @param event - The ProgressEvent object containing details about the completed FileReader operation
 */
export type OnSuccessHandler = (event: ProgressEvent<FileReader>) => void;
/**
 * A callback function that handles errors occurring during event handling.
 *
 * @callback OnErrorHandler
 */
export type OnErrorHandler = () => void;
