import { formatJson } from '@/common/formatting-tools';
import { mapApplicationToCommand } from '@/common/macos-utils';
import { CommandBuilder, IHashUtil, IStringUtil, OSType, UtilList } from '@/common/types';
import { CaseUtils, EncodingUtils, HashingUtils, LineUtils, SortingTypes, StringUtils } from 'coreutilsts';

/**
 * Creates and returns an array of utility functions for string manipulation.
 * @returns An array containing string transformation tools with their configurations.
 */
export function createStringUtils(): IStringUtil[] {
    return [
        {
            toolId: 'slugify-with-underscore',
            textToDisplay: 'Slugify_with_underscore',
            toolFunction: (input: string) => StringUtils.slugifyString(input, '_'),
        },
        {
            toolId: 'slugify-with-dash',
            textToDisplay: 'Slugify-with-dash',
            toolFunction: (input: string) => StringUtils.slugifyString(input, '-'),
        },
        {
            toolId: 'slugify-with-underscore-lower',
            textToDisplay: 'slugify_with_underscore_lower',
            toolFunction: (input: string) => StringUtils.slugifyString(input, '_', true),
        },
        {
            toolId: 'slugify-with-dash-lower',
            textToDisplay: 'slugify-with-dash-lower',
            toolFunction: (input: string) => StringUtils.slugifyString(input, '-', true),
        },
    ];
}

/**
 * Creates an array of case transformation utilities.
 * @returns Array of utility objects with predefined case conversion functions.
 */
export function createCaseUtils(): IStringUtil[] {
    return [
        {
            toolId: 'to-lower-case',
            textToDisplay: 'lower case',
            toolFunction: (input: string) => CaseUtils.toLowerCase(input),
        },
        {
            toolId: 'to-upper-case',
            textToDisplay: 'UPPER CASE',
            toolFunction: (input: string) => CaseUtils.toUpperCase(input),
        },
        {
            toolId: 'to-lower-case-strict',
            textToDisplay: 'lowercase (strict)',
            toolFunction: (input: string) => CaseUtils.toLowerCaseStrict(input),
        },
        {
            toolId: 'to-upper-case-strict',
            textToDisplay: 'UPPERCASE (STRICT)',
            toolFunction: (input: string) => CaseUtils.toUpperCaseStrict(input),
        },
        {
            toolId: 'to-sentence-case',
            textToDisplay: 'Sentence case',
            toolFunction: (input: string) => CaseUtils.toSentenceCase(input),
        },
        {
            toolId: 'to-title-case',
            textToDisplay: 'Title Case',
            toolFunction: (input: string) => CaseUtils.toTitleCase(input),
        },
        {
            toolId: 'to-camel-case',
            textToDisplay: 'camelCase',
            toolFunction: (input: string) => CaseUtils.toCamelCase(input),
        },
        {
            toolId: 'to-pascal-case',
            textToDisplay: 'PascalCase',
            toolFunction: (input: string) => CaseUtils.toPascalCase(input),
        },
        {
            toolId: 'to-snake-case',
            textToDisplay: 'snake_case',
            toolFunction: (input: string) => CaseUtils.toSnakeCase(input),
        },
        {
            toolId: 'to-screaming-snake-case',
            textToDisplay: 'SCREAMING_SNAKE_CASE',
            toolFunction: (input: string) => CaseUtils.toScreamingSnakeCase(input),
        },
        {
            toolId: 'to-kebab-case',
            textToDisplay: 'kebab-case',
            toolFunction: (input: string) => CaseUtils.toKebabCase(input),
        },
        {
            toolId: 'to-cobol-case',
            textToDisplay: 'COBOL-CASE',
            toolFunction: (input: string) => CaseUtils.toCobolCase(input),
        },
        {
            toolId: 'to-train-case',
            textToDisplay: 'Train-Case',
            toolFunction: (input: string) => CaseUtils.toTrainCase(input),
        },
        {
            toolId: 'to-dot-case',
            textToDisplay: 'dot.case',
            toolFunction: (input: string) => CaseUtils.toDotCase(input),
        },
        {
            toolId: 'to-slash-case',
            textToDisplay: 'slash/case',
            toolFunction: (input: string) => CaseUtils.toSlashCase(input),
        },
        { toolId: 'swap-case', textToDisplay: 'Swap case', toolFunction: (input: string) => CaseUtils.swapCase(input) },
        {
            toolId: 'capitalize',
            textToDisplay: 'Capitalize',
            toolFunction: (input: string) => CaseUtils.capitalize(input),
        },
        {
            toolId: 'uncapitalize',
            textToDisplay: 'uncapitalize',
            toolFunction: (input: string) => CaseUtils.uncapitalize(input),
        },
    ];
}

/**
 * Creates an array of utility functions for line manipulation.
 *
 * @returns Array of string utilities for various text processing operations
 */
export function createLineUtils(): IStringUtil[] {
    function splitInternal(input: string): string[] {
        return LineUtils.splitStringIntoLines(input, '\n');
    }

    function joinResult(input: string[]): string {
        return input.join('\n');
    }

    return [
        {
            toolId: 'split-lines-by-common-line-end',
            textToDisplay: 'Split by common line end',
            toolFunction: (input: string) => joinResult(LineUtils.splitLines(input)),
        },
        {
            toolId: 'split-lines-by-comma',
            textToDisplay: 'Split by ","',
            toolFunction: (input: string) => joinResult(LineUtils.splitStringIntoLines(input, ',')),
        },
        {
            toolId: 'split-lines-by-semicolon',
            textToDisplay: 'Split by ";"',
            toolFunction: (input: string) => joinResult(LineUtils.splitStringIntoLines(input, ';')),
        },
        {
            toolId: 'split-lines-by-colon',
            textToDisplay: 'Split by "."',
            toolFunction: (input: string) => joinResult(LineUtils.splitStringIntoLines(input, '.')),
        },
        {
            toolId: 'split-lines-by-ampersand',
            textToDisplay: 'Split by "&"',
            toolFunction: (input: string) => joinResult(LineUtils.splitStringIntoLines(input, '&')),
        },
        {
            toolId: 'split-lines-by-double-ampersand',
            textToDisplay: 'Split by "&&"',
            toolFunction: (input: string) => joinResult(LineUtils.splitStringIntoLines(input, '&&')),
        },
        {
            toolId: 'split-lines-by-pipe',
            textToDisplay: 'Split by "|"',
            toolFunction: (input: string) => joinResult(LineUtils.splitStringIntoLines(input, '|')),
        },
        {
            toolId: 'sort-lines-ascending',
            textToDisplay: 'Sort Ascending',
            toolFunction: (input: string) => joinResult(LineUtils.sortLines(splitInternal(input), SortingTypes.ASC)),
        },
        {
            toolId: 'sort-lines-descending',
            textToDisplay: 'Sort Descending',
            toolFunction: (input: string) => joinResult(LineUtils.sortLines(splitInternal(input), SortingTypes.DSC)),
        },
        {
            toolId: 'sort-lines-ascending-ignore-case',
            textToDisplay: 'Sort Ascending Ignore Case',
            toolFunction: (input: string) =>
                joinResult(LineUtils.sortLines(splitInternal(input), SortingTypes.ASC_IGN_CASE)),
        },
        {
            toolId: 'sort-lines-descending-ignore-case',
            textToDisplay: 'Sort Descending Ignore Case',
            toolFunction: (input: string) =>
                joinResult(LineUtils.sortLines(splitInternal(input), SortingTypes.DSC_IGN_CASE)),
        },
        {
            toolId: 'shuffle-lines',
            textToDisplay: 'Shuffle Lines',
            toolFunction: (input: string) => joinResult(LineUtils.shuffleLines(splitInternal(input))),
        },
        {
            toolId: 'remove-duplicates',
            textToDisplay: 'Remove Duplicates',
            toolFunction: (input: string) => joinResult(LineUtils.removeDuplicates(splitInternal(input), false)),
        },
        {
            toolId: 'remove-duplicates-ignore-case',
            textToDisplay: 'Remove Duplicates Ignore Case',
            toolFunction: (input: string) => joinResult(LineUtils.removeDuplicates(splitInternal(input), true)),
        },
    ];
}

/**
 * Creates a list of string utility groups containing their respective utilities.
 * @returns Array of utility lists with grouped string manipulation tools.
 */
export function createStringUtilList(): UtilList[] {
    return [
        { toolGroupId: 'string-utils', displayName: 'String Utils', utils: createStringUtils() },
        { toolGroupId: 'case-utils', displayName: 'Case Utils', utils: createCaseUtils() },
        { toolGroupId: 'line-utils', displayName: 'Line Utils', utils: createLineUtils() },
    ];
}

/**
 * Creates an array of utility objects for encoding different data formats.
 * @returns Array of string utility tools with their respective encoding functions.
 */
export function createEncodingUtils(): IStringUtil[] {
    return [
        { toolId: 'encode-url', textToDisplay: 'Encode Url', toolFunction: (input) => StringUtils.encodeUrl(input) },
        {
            toolId: 'encode-base-64',
            textToDisplay: 'Encode Base64',
            toolFunction: (input) => EncodingUtils.encodeBase64(input),
        },
        {
            toolId: 'encode-base-64-url',
            textToDisplay: 'Encode Base64Url',
            toolFunction: (input) => EncodingUtils.encodeBase64Url(input),
        },
    ];
}

/**
 * Creates an array of utility objects for URL and base64 decoding operations.
 * @returns Array of String utilities with their respective decode functions
 */
export function createDecodingUtils(): IStringUtil[] {
    return [
        { toolId: 'decode-url', textToDisplay: 'Decode Url', toolFunction: (input) => StringUtils.decodeUrl(input) },
        {
            toolId: 'decode-base-64',
            textToDisplay: 'Decode Base64',
            toolFunction: (input) => EncodingUtils.decodeBase64(input),
        },
    ];
}

/**
 * Creates a list of utility groups containing encoding and decoding utilities.
 * @returns Array of utility lists with specified tools for encoding and decoding operations
 */
export function createEncodingDecodingUtilList(): UtilList[] {
    return [
        { toolGroupId: 'encoding-utils', displayName: 'Encoding Utils', utils: createEncodingUtils() },
        { toolGroupId: 'decoding-utils', displayName: 'Decoding Utils', utils: createDecodingUtils() },
    ];
}

/**
 * Creates an array of hashing utility objects for different cryptographic algorithms.
 * @returns Array of hash utilities with their respective encoding methods and display text
 */
export function createHashingUtils(): IHashUtil[] {
    return [
        {
            toolId: 'encode-to-md-5',
            textToDisplay: 'Encode to MD5',
            toolFunction: (input: string) => HashingUtils.encodeMD5(input),
        },
        {
            toolId: 'encode-to-sha-1',
            textToDisplay: 'Encode to SHA1',
            toolFunction: (input: string) => HashingUtils.encodeSHA1(input),
        },
        {
            toolId: 'encode-to-sha-256',
            textToDisplay: 'Encode to SHA256',
            toolFunction: (input: string) => HashingUtils.encodeSHA256(input),
        },
        {
            toolId: 'encode-to-sha-384',
            textToDisplay: 'Encode to SHA384',
            toolFunction: (input: string) => HashingUtils.encodeSHA384(input),
        },
        {
            toolId: 'encode-to-sha-512',
            textToDisplay: 'Encode to SHA512',
            toolFunction: (input: string) => HashingUtils.encodeSHA512(input),
        },
    ];
}

/**
 * Creates an array of JSON formatting tools with different configurations.
 * @returns Array of string utility objects providing JSON formatting capabilities.
 */
export function createJsonFormatter(): IStringUtil[] {
    return [
        {
            toolId: 'json-beautify',
            textToDisplay: 'Beautify JSON',
            toolFunction: (input: string) => formatJson(input, 4),
        },
        {
            toolId: 'json-shorten',
            textToDisplay: 'Shorten JSON',
            toolFunction: (input: string) => formatJson(input, 0),
        },
    ];
}

/**
 * Creates a new instance of the CommandBuilder based on the operating system type.
 *
 * @param {OSType} osType - The target operating system for which to create the builder.
 * @returns {CommandBuilder} An instance that constructs commands appropriate for the given OS.
 */
export const getCommandBuilder = (osType: OSType): CommandBuilder => {
    if (osType === 'macos') {
        return mapApplicationToCommand;
    }

    return () => {
        return { description: 'not-implemented', command: 'not-implemented' };
    };
};
