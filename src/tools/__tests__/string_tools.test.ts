import * as stringUtils from "../string_tools";
import {randomizeStringsOrder} from "../string_tools";

describe("splitStringBy", () => {
    test("test empty or null(undefined) data passed to splitStringBy", () => {
        expect(stringUtils.splitStringBy(null, ","))
            .toStrictEqual([]);
        expect(stringUtils.splitStringBy(undefined, ","))
            .toStrictEqual([]);
        expect(stringUtils.splitStringBy("", ","))
            .toStrictEqual([]);
    });
    test("test null(undefined) splitter passed to splitStringBy", () => {
        const data = "text\nsome\nlines";
        expect(() => stringUtils.splitStringBy(data, null))
            .toThrowError("Splitter is null or undefined");
        expect(() => stringUtils.splitStringBy(data, undefined))
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
        expect(stringUtils.splitStringBy(data, "\n")).toStrictEqual(expectedResult);
        expect(stringUtils.splitStringBy(data, /\n/)).toStrictEqual(expectedResult);
        expect(stringUtils.splitStringBy(data2, "\n\r")).toStrictEqual(expectedResult);
        expect(stringUtils.splitStringBy(data2, /[\n\r]+/)).toStrictEqual(expectedResult);
        expect(stringUtils.splitStringBy(data3, "\r")).toStrictEqual(expectedResult);
        expect(stringUtils.splitStringBy(data3, /\r/)).toStrictEqual(expectedResult);
        expect(stringUtils.splitStringBy(data4, ",")).toStrictEqual(expectedResult);
        expect(stringUtils.splitStringBy(data4, /[,\\.:]/)).toStrictEqual(expectedResult);
        expect(stringUtils.splitStringBy(data5, ":")).toStrictEqual(expectedResult);
        expect(stringUtils.splitStringBy(data6, "\n")).toStrictEqual(["text"]);
        expect(stringUtils.splitStringBy(data7, "\n")).toStrictEqual([]);
        expect(stringUtils.splitStringBy(data8, "YGR2")).toStrictEqual(expectedResult);
    });
});

describe("getLinesFromString", () => {
    test("test empty or null(undefined) data passed to getLinesFromString", () => {
        expect(stringUtils.getLinesFromString(null))
            .toStrictEqual([]);
        expect(stringUtils.getLinesFromString(undefined))
            .toStrictEqual([]);
        expect(stringUtils.getLinesFromString(""))
            .toStrictEqual([]);
    });
    test("test getLinesFromString works as expected with appropriate data", () => {
        const data = "text\n  some  \nlines";
        const data2 = "  text\n\rsome\n\rlines";
        const data3 = "text\rsome\rlines   ";
        const expectedResult = ["text", "some", "lines"];
        expect(stringUtils.getLinesFromString(data)).toStrictEqual(expectedResult);
        expect(stringUtils.getLinesFromString(data)).toStrictEqual(expectedResult);
        expect(stringUtils.getLinesFromString(data2)).toStrictEqual(expectedResult);
        expect(stringUtils.getLinesFromString(data2)).toStrictEqual(expectedResult);
        expect(stringUtils.getLinesFromString(data3)).toStrictEqual(expectedResult);
        expect(stringUtils.getLinesFromString(data3)).toStrictEqual(expectedResult);
    });
});

describe("sortStrings", () => {
    test("test empty or null(undefined) data passed to sortStrings", () => {
        expect(stringUtils.sortStrings(null))
            .toStrictEqual([]);
        expect(stringUtils.sortStrings(undefined))
            .toStrictEqual([]);
        expect(stringUtils.sortStrings([]))
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

        expect(stringUtils.sortStrings(data1)).toStrictEqual(expData1);
        expect(stringUtils.sortStrings(data2asc)).toStrictEqual(expData2asc);
        expect(stringUtils.sortStrings(data3desc, stringUtils.SortingTypes.DSC)).toStrictEqual(expData3desc);
        expect(stringUtils.sortStrings(data4ascCase, stringUtils.SortingTypes.ASC_IGN_CASE))
            .toStrictEqual(expData4ascCase);
        expect(stringUtils.sortStrings(data5descCase, stringUtils.SortingTypes.DSC_IGN_CASE))
            .toStrictEqual(expData5descCase);
    });
});

describe("randomizeStringsOrder", () => {
    test("test empty or null(undefined) data passed to randomizeStringsOrder", () => {
        expect(stringUtils.randomizeStringsOrder(null))
            .toStrictEqual([]);
        expect(stringUtils.randomizeStringsOrder(undefined))
            .toStrictEqual([]);
        expect(stringUtils.randomizeStringsOrder([]))
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

        expect(stringUtils.sortStrings(data1)).toStrictEqual(expData1);
        expect(stringUtils.sortStrings(data2)).not.toStrictEqual(data2);
    });
});