import { Decoder, DECODERS, EncodeDecodeFunc, Encoder, ENCODERS } from '../tools/encoding_tools';

export enum SortingTypes {
    ASC = 'ASCENDING',
    DSC = 'DESCENDING',
    ASC_IGN_CASE = 'ASCENDING IGNORE CASE',
    DSC_IGN_CASE = 'DESCENDING IGNORE CASE',
}

export function splitStringBy(data: string | undefined | null, splitter: RegExp | string | undefined | null): string[] {
    if (data === null || data === undefined || data.length === 0) {
        return [];
    }

    if (splitter === null || splitter === undefined) {
        throw new Error('Splitter is null or undefined');
    }

    return data
        .split(splitter)
        .filter((data: string) => data && data.trim().length > 0)
        .map((data) => data.trim());
}

export function getLinesFromString(data: string | null | undefined): string[] {
    if (data === null || data === undefined || data.length === 0) {
        return [];
    }

    const splitter: RegExp = /[\r\n]+/;
    return splitStringBy(data, splitter);
}

export function sortStrings(
    arr: string[] | null | undefined,
    sortingType: SortingTypes | null | undefined = SortingTypes.ASC,
): string[] {
    if (arr === null || arr === undefined || arr.length === 0) {
        return [];
    }

    if (arr.length === 1) {
        return arr.slice();
    }

    if (sortingType === null || sortingType === undefined) {
        sortingType = SortingTypes.ASC;
    }

    const dataArrCopy: string[] = arr.slice();

    const directionModifier: number =
        sortingType === SortingTypes.DSC || sortingType === SortingTypes.DSC_IGN_CASE ? -1 : 1;
    const caseInsensitive: boolean =
        sortingType === SortingTypes.ASC_IGN_CASE || sortingType === SortingTypes.DSC_IGN_CASE;

    const compFunc = (first: string, second: string) => {
        let compRes: number;
        let firstItem: string = caseInsensitive ? first.toLowerCase() : first;
        let secondItem: string = caseInsensitive ? second.toLowerCase() : second;

        if (firstItem > secondItem) {
            compRes = 1;
        } else if (firstItem < secondItem) {
            compRes = -1;
        } else {
            compRes = 0;
        }

        return compRes * directionModifier;
    };

    return dataArrCopy.sort(compFunc);
}

export function randomizeStringsOrder(arr: string[] | null | undefined): string[] {
    if (arr === null || arr === undefined || arr.length === 0) {
        return [];
    }

    if (arr.length === 1) {
        return arr.slice();
    }

    const dataArrCopy: string[] = arr.slice();
    const compFunc = (first: string, second: string) => {
        const list = [-1, 0, 1];
        const randomIndex = Math.floor(Math.random() * list.length);
        return list[randomIndex];
    };

    return dataArrCopy.sort(compFunc);
}

export async function encodeText(text: string, encoder: Encoder): Promise<string> {
    if (text === null || text === undefined || text.length === 0) {
        return '';
    }

    const encoderFunc: EncodeDecodeFunc | undefined = ENCODERS.get(encoder);
    if (encoderFunc) {
        return encoderFunc(text);
    }

    return text;
}

export async function decodeText(text: string, decoder: Decoder): Promise<string> {
    if (text === null || text === undefined || text.length === 0) {
        return '';
    }
    const decoderFunc: EncodeDecodeFunc | undefined = DECODERS.get(decoder);
    if (decoderFunc) {
        return decoderFunc(text);
    }

    return text;
}

export function removeDuplicates(lines: string[] | undefined | null, ignoreCase: boolean = false): string[] {
    if (lines === undefined || lines === null || lines.length === 0) {
        return [];
    }
    if (lines.length === 1) {
        return [lines[0]];
    }
    const uniqueArr: string[] = [];
    const map: Map<string, boolean> = new Map();
    lines.forEach((item: string) => {
        const key: string = ignoreCase ? item.toLowerCase() : item;
        if (!map.has(key)) {
            map.set(key, true);
            uniqueArr.push(item);
        }
    });
    return uniqueArr;
}
