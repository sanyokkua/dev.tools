export enum SortingTypes {
    ASC = "ASC",
    DSC = "DSC",
    ASC_IGN_CASE = "ASC_IGN_CASE",
    DSC_IGN_CASE = "DSC_IGN_CASE",
}

export function sortStrings(arr: string[], sortingType: SortingTypes = SortingTypes.ASC): string[] {
    const modifier = (sortingType === SortingTypes.DSC || sortingType === SortingTypes.DSC_IGN_CASE) ? -1 : 1;
    const caseInsensitive: boolean = (sortingType === SortingTypes.ASC_IGN_CASE || sortingType === SortingTypes.DSC_IGN_CASE);

    const compareFn = caseInsensitive ?
        (a: string, b: string) => modifier * a.localeCompare(b, undefined, {sensitivity: "base"}) :
        (a: string, b: string) => modifier * a.localeCompare(b);

    return arr.sort(compareFn);
}