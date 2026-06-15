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

/**
 * Represents a set of software categories used for classification and organization.
 *
 * This enum provides predefined categories that help in categorizing different types of software applications,
 * tools, and utilities. Each category represents a specific domain or functionality area where the software is intended to be used.
 *
 * @enum {string}
 */
export enum Category {
    CODE_EDITORS = 'Code Editors & IDEs',
    IDE_EXTENSIONS = 'IDE Extensions & Plugins',
    DIAGRAM_TOOLS = 'Diagram & Visualization Tools',
    DATABASE_CLIENTS = 'Database Clients & Tools',
    SYSTEM_UTILS = 'System & File Utilities',
    RUNTIME_ENVIRONMENTS = 'Language Runtimes',
    BUILD_TOOLING = 'Build & Dependency Management',
    VIRTUALIZATION = 'Containerization & Virtualization',
    LLM_PLATFORMS = 'Local LLM Platforms',
    COMMUNICATION = 'Communication & Collaboration',
    BROWSERS = 'Web Browsers',
    DOWNLOAD_MANAGERS = 'Download & Network Tools',
    MEDIA_PLAYERS = 'Media Players',
    DEV_UTILITIES = 'Developer Utilities',
    API_TOOLS = 'API Development Tools',
    CLOUD_STORAGE = 'Cloud Storage & File Sharing',
    DOCUMENT_EDITORS = 'Document Editors',
    GRAPHICS_AND_3D = 'Graphics & 3D',
    NETWORKING = 'Network Tools',
    AI_CODING_TOOLS = 'AI Tools',
    NOTE_TAKING = 'Notes',
    GAMING = 'Gaming',
}

/**
 * Interface representing a CLI command structure.
 * Defines the basic properties required to describe and execute a command in a
 * command-line environment.
 */
export interface Command {
    description: string;
    command: string;
}
