/**
 * Interface representing a set of utility functions for manipulating strings.
 *
 * @property {string} toolId - Unique identifier for the string processing tool.
 * @property {string} textToDisplay - The input or target text to process using this utility.
 * @property {string?} description - Optional detailed explanation of what the tool does.
 * @property {(input: string) => string} toolFunction - Function that performs the actual string manipulation operation
 *     on the provided input.
 */
export interface IStringUtil {
    toolId: string;
    textToDisplay: string;
    description?: string;
    toolFunction: (input: string) => string;
}

/**
 * Defines a utility list structure containing metadata and an array of string utilities.
 *
 * @property {string} toolGroupId - Unique identifier for grouping related tools together.
 * @property {string} displayName - Human-readable label for the group of tools.
 * @property {IStringUtil[]} utils - Array of individual string processing utilities defined by this interface.
 */
export interface UtilList {
    toolGroupId: string;
    displayName: string;
    utils: IStringUtil[];
}

/**
 * Interface defining the structure of a hash utility tool.
 *
 * @interface
 * @property {string} toolId - Unique identifier for the hashing tool.
 * @property {string} textToDisplay - Human-readable name or label for the tool.
 * @property {string=} description - Optional detailed description of the hashing functionality.
 * @property {(input: string) => Promise<string>} toolFunction - Asynchronous function that performs the hash operation
 *     on provided input.
 */
export interface IHashUtil {
    toolId: string;
    textToDisplay: string;
    description?: string;
    toolFunction: (input: string) => Promise<string>;
}

/**
 * Represents operating system types supported by the application.
 * Used to identify platform-specific behavior or configurations.
 */
export type OSType = 'windows' | 'macos' | 'linux';
