import {
    getLinesFromString,
    randomizeStringsOrder,
    removeDuplicates,
    SortingTypes,
    sortStrings,
    splitStringBy,
} from "../string_tools";

describe("splitStringBy", () => {
    test("test empty or null(undefined) data passed to splitStringBy", () => {
        expect(splitStringBy(null, ","))
            .toStrictEqual([]);
        expect(splitStringBy(undefined, ","))
            .toStrictEqual([]);
        expect(splitStringBy("", ","))
            .toStrictEqual([]);
    });
    test("test null(undefined) splitter passed to splitStringBy", () => {
        const data = "text\nsome\nlines";
        expect(() => splitStringBy(data, null))
            .toThrowError("Splitter is null or undefined");
        expect(() => splitStringBy(data, undefined))
            .toThrowError("Splitter is null or undefined");
    });
    test("test splitStringBy works as expected with appropriate data and splitters", () => {
        const data = "text\n  some  \nlines";
        const data2 = "  text\n\rsome\n\rlines";
        const data3 = "text\rsome\rlines   ";
        const data4 = "text,some,   lines";
        const data5 = "text : some : lines:";
        const data6 = "text";
        const data7 = "        ";
        const data8 = "text YGR2 some YGR2 lines YGR2  YGR2  YGR2  YGR2";
        const expectedResult = ["text", "some", "lines"];
        expect(splitStringBy(data, "\n")).toStrictEqual(expectedResult);
        expect(splitStringBy(data, /\n/)).toStrictEqual(expectedResult);
        expect(splitStringBy(data2, "\n\r")).toStrictEqual(expectedResult);
        expect(splitStringBy(data2, /[\n\r]+/)).toStrictEqual(expectedResult);
        expect(splitStringBy(data3, "\r")).toStrictEqual(expectedResult);
        expect(splitStringBy(data3, /\r/)).toStrictEqual(expectedResult);
        expect(splitStringBy(data4, ",")).toStrictEqual(expectedResult);
        expect(splitStringBy(data4, /[,\\.:]/)).toStrictEqual(expectedResult);
        expect(splitStringBy(data5, ":")).toStrictEqual(expectedResult);
        expect(splitStringBy(data6, "\n")).toStrictEqual(["text"]);
        expect(splitStringBy(data7, "\n")).toStrictEqual([]);
        expect(splitStringBy(data8, "YGR2")).toStrictEqual(expectedResult);
    });
});

describe("getLinesFromString", () => {
    test("test empty or null(undefined) data passed to getLinesFromString", () => {
        expect(getLinesFromString(null))
            .toStrictEqual([]);
        expect(getLinesFromString(undefined))
            .toStrictEqual([]);
        expect(getLinesFromString(""))
            .toStrictEqual([]);
    });
    test("test getLinesFromString works as expected with appropriate data", () => {
        const data = "text\n  some  \nlines";
        const data2 = "  text\n\rsome\n\rlines";
        const data3 = "text\rsome\rlines   ";
        const expectedResult = ["text", "some", "lines"];
        expect(getLinesFromString(data)).toStrictEqual(expectedResult);
        expect(getLinesFromString(data)).toStrictEqual(expectedResult);
        expect(getLinesFromString(data2)).toStrictEqual(expectedResult);
        expect(getLinesFromString(data2)).toStrictEqual(expectedResult);
        expect(getLinesFromString(data3)).toStrictEqual(expectedResult);
        expect(getLinesFromString(data3)).toStrictEqual(expectedResult);
    });
});

describe("sortStrings", () => {
    test("test empty or null(undefined) data passed to sortStrings", () => {
        expect(sortStrings(null))
            .toStrictEqual([]);
        expect(sortStrings(undefined))
            .toStrictEqual([]);
        expect(sortStrings([]))
            .toStrictEqual([]);
    });
    test("test sortStrings works as expected with appropriate data", () => {
        const data1 = ["text"];
        const expData1 = ["text"];

        const data2asc = [
            "fUZZy",
            "OXidizE",
            "DUngeon",
            "GlOBAl",
            "sKeTCh",
            "cORnflAKeS",
            "rEPLiCATe",
            "mOonLiGHt",
            "eMbaRRAss",
            "tOoThbrUSh",
        ];
        const expData2asc = [
            "DUngeon",
            "GlOBAl",
            "OXidizE",
            "cORnflAKeS",
            "eMbaRRAss",
            "fUZZy",
            "mOonLiGHt",
            "rEPLiCATe",
            "sKeTCh",
            "tOoThbrUSh",
        ];

        const data3desc = [
            "DUngeon",
            "GlOBAl",
            "OXidizE",
            "cORnflAKeS",
            "eMbaRRAss",
            "fUZZy",
            "mOonLiGHt",
            "rEPLiCATe",
            "sKeTCh",
            "tOoThbrUSh",
        ];
        const expData3desc = [
            "tOoThbrUSh",
            "sKeTCh",
            "rEPLiCATe",
            "mOonLiGHt",
            "fUZZy",
            "eMbaRRAss",
            "cORnflAKeS",
            "OXidizE",
            "GlOBAl",
            "DUngeon",
        ];

        const data4ascCase = [
            "tOoThbrUSh",
            "sKeTCh",
            "rEPLiCATe",
            "mOonLiGHt",
            "fUZZy",
            "eMbaRRAss",
            "cORnflAKeS",
            "OXidizE",
            "GlOBAl",
            "DUngeon",
        ];
        const expData4ascCase = [
            "cORnflAKeS",
            "DUngeon",
            "eMbaRRAss",
            "fUZZy",
            "GlOBAl",
            "mOonLiGHt",
            "OXidizE",
            "rEPLiCATe",
            "sKeTCh",
            "tOoThbrUSh",
        ];

        const data5descCase = [
            "tOoThbrUSh",
            "sKeTCh",
            "rEPLiCATe",
            "mOonLiGHt",
            "fUZZy",
            "eMbaRRAss",
            "cORnflAKeS",
            "OXidizE",
            "GlOBAl",
            "DUngeon",
        ];
        const expData5descCase = [
            "tOoThbrUSh",
            "sKeTCh",
            "rEPLiCATe",
            "OXidizE",
            "mOonLiGHt",
            "GlOBAl",
            "fUZZy",
            "eMbaRRAss",
            "DUngeon",
            "cORnflAKeS",
        ];

        expect(sortStrings(data1)).toStrictEqual(expData1);
        expect(sortStrings(data2asc)).toStrictEqual(expData2asc);
        expect(sortStrings(data3desc, SortingTypes.DSC)).toStrictEqual(expData3desc);
        expect(sortStrings(data4ascCase, SortingTypes.ASC_IGN_CASE))
            .toStrictEqual(expData4ascCase);
        expect(sortStrings(data5descCase, SortingTypes.DSC_IGN_CASE))
            .toStrictEqual(expData5descCase);
    });
});

describe("randomizeStringsOrder", () => {
    test("test empty or null(undefined) data passed to randomizeStringsOrder", () => {
        expect(randomizeStringsOrder(null))
            .toStrictEqual([]);
        expect(randomizeStringsOrder(undefined))
            .toStrictEqual([]);
        expect(randomizeStringsOrder([]))
            .toStrictEqual([]);
    });
    test("test randomizeStringsOrder works as expected with appropriate data", () => {
        const data1 = ["text"];
        const expData1 = ["text"];
        const data2 = [
            "fUZZy",
            "OXidizE",
            "DUngeon",
            "GlOBAl",
            "sKeTCh",
            "cORnflAKeS",
            "rEPLiCATe",
            "mOonLiGHt",
            "eMbaRRAss",
            "tOoThbrUSh",
        ];

        expect(sortStrings(data1)).toStrictEqual(expData1);
        expect(sortStrings(data2)).not.toStrictEqual(data2);
    });
});

describe("removeDuplicates", () => {
    test("test empty or null(undefined) data passed to removeDuplicates", () => {
        expect(removeDuplicates(null))
            .toStrictEqual([]);
        expect(removeDuplicates(undefined))
            .toStrictEqual([]);
        expect(removeDuplicates([]))
            .toStrictEqual([]);
    });
    test("test removeDuplicates works as expected with appropriate data", () => {
        const data1 = ["text"];
        const expData1 = ["text"];
        const data2 = [
            "1111",
            "aaaa",
            "2222",
            "GlOBAl",
            "1111",
            "AAAA",
            "ffffff",
            "wwwww",
            "ddddd",
            "ww",
        ];
        const expData2 = [
            "1111",
            "aaaa",
            "2222",
            "GlOBAl",
            "AAAA",
            "ffffff",
            "wwwww",
            "ddddd",
            "ww",
        ];
        const expData3 = [
            "1111",
            "aaaa",
            "2222",
            "GlOBAl",
            "ffffff",
            "wwwww",
            "ddddd",
            "ww",
        ];

        expect(removeDuplicates(data1)).toStrictEqual(expData1);
        expect(removeDuplicates(data2, false)).toStrictEqual(expData2);
        expect(removeDuplicates(data2, true)).toStrictEqual(expData3);
    });
});