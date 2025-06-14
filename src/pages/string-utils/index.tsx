import { usePage } from '@/contexts/PageContext';
import { copyToClipboard, pasteFromClipboard } from '@/tools/clipboard_utils';
import { IToolList } from '@/tools/types';
import { LineUtils, SortingTypes, StringUtils } from 'coreutilsts';
import { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AvailableFunction } from '../../controllers/elements/column/ColumnMenu';
import ColumnView from '../../controllers/elements/column/ColumnView';
import { EditorProperties } from '../../controllers/elements/editor/CodeEditor';
import { getEditorContent, setEditorContent } from '../../controllers/elements/editor/CodeEditorUtils';
import FileOpen from '../../controllers/elements/file/FileOpen';
import { FileInfo } from '../../controllers/elements/file/FileTypes';
import { MenuBuilder } from '../../controllers/elements/navigation/menubar/utils';
import { SelectItem } from '../../custom-components/controls/Select';

const caseUtils: IToolList<(text: string) => string> = {
    tools: [
        {
            text: 'lower case',
            toolFunction: (text) => {
                return StringUtils.lowerCase(text);
            },
        },
        {
            text: 'UPPER CASE',
            toolFunction: (text) => {
                return StringUtils.upperCase(text);
            },
        },
        {
            text: 'Capitalize',
            toolFunction: (text) => {
                return StringUtils.capitalize(text);
            },
        },
        {
            text: 'uNCAPITALIZE',
            toolFunction: (text) => {
                return StringUtils.uncapitalize(text);
            },
        },
        {
            text: 'Swap Case',
            toolFunction: (text) => {
                return StringUtils.swapCase(text);
            },
        },
    ],
};
const lineUtils: IToolList<(text: string | string[]) => string[]> = {
    tools: [
        {
            text: 'Split String',
            toolFunction: (text) => {
                if (typeof text === 'string') {
                    return LineUtils.splitLines(text);
                }
                return text;
            },
        },
        {
            text: 'Sort ASC',
            toolFunction: (text) => {
                let lines: string[] = [];
                if (typeof text === 'string') {
                    lines = LineUtils.splitLines(text);
                }
                return LineUtils.sortLines(lines, SortingTypes.ASC);
            },
        },
        {
            text: 'Sort DSC',
            toolFunction: (text) => {
                let lines: string[] = [];
                if (typeof text === 'string') {
                    lines = LineUtils.splitLines(text);
                }
                return LineUtils.sortLines(lines, SortingTypes.DSC);
            },
        },
        {
            text: 'Sort ASC Ignore Case',
            toolFunction: (text) => {
                let lines: string[] = [];
                if (typeof text === 'string') {
                    lines = LineUtils.splitLines(text);
                }
                return LineUtils.sortLines(lines, SortingTypes.ASC_IGN_CASE);
            },
        },
        {
            text: 'Sort DSC Ignore Case',
            toolFunction: (text) => {
                let lines: string[] = [];
                if (typeof text === 'string') {
                    lines = LineUtils.splitLines(text);
                }
                return LineUtils.sortLines(lines, SortingTypes.DSC_IGN_CASE);
            },
        },
        {
            text: 'Shuffle',
            toolFunction: (text) => {
                let lines: string[] = [];
                if (typeof text === 'string') {
                    lines = LineUtils.splitLines(text);
                }
                return LineUtils.shuffleLines(lines);
            },
        },
        {
            text: 'Remove Duplicates',
            toolFunction: (text) => {
                let lines: string[] = [];
                if (typeof text === 'string') {
                    lines = LineUtils.splitLines(text);
                }
                return LineUtils.removeDuplicates(lines);
            },
        },
    ],
};

const caseUtilsItem = { itemId: 'caseUtils', displayText: 'Case Utils' };
const lineUtilsItem = { itemId: 'lineUtils', displayText: 'Line Utils' };
const items = [caseUtilsItem, lineUtilsItem];
const selectItems: { [key: string]: SelectItem } = { caseUtils: caseUtilsItem, lineUtils: lineUtilsItem };

const IndexPage = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('String Utilities Page');
    }, [setPageTitle]);

    const caseUtilsList: AvailableFunction[] = caseUtils.tools.map((tool) => {
        return {
            name: tool.text,
            onClick: () => {
                console.log('caseUtilsList clicked');
                const content = getEditorContent(monacoLeftEditorRef);
                const result = tool.toolFunction(content);
                setEditorContent(monacoRightEditorRef, result);
            },
        };
    });
    const lineUtilsList: AvailableFunction[] = lineUtils.tools.map((tool) => {
        return {
            name: tool.text,
            onClick: () => {
                console.log('lineUtilsList clicked');
                const content = getEditorContent(monacoLeftEditorRef);
                const result = tool.toolFunction(content);
                setEditorContent(monacoRightEditorRef, result.join('\n'));
            },
        };
    });

    const [openFileDialog, setOpenFileDialog] = useState<boolean>(false);
    const [select, setSelect] = React.useState<SelectItem>(selectItems['caseUtils']);
    const [functions, setFunctions] = React.useState<AvailableFunction[]>(caseUtilsList);
    const monacoLeftEditorRef = useRef<editor.IStandaloneCodeEditor>(null);
    const monacoRightEditorRef = useRef<editor.IStandaloneCodeEditor>(null);

    const switchFunctionsList = (selected: string) => {
        if (selected === 'caseUtils') {
            setFunctions(caseUtilsList);
        }
        if (selected === 'lineUtils') {
            setFunctions(lineUtilsList);
        }
    };

    const onMenuSelected = (newVal: SelectItem) => {
        const selectItem = selectItems[newVal.itemId];
        setSelect(selectItem);
        switchFunctionsList(newVal.itemId);
    };

    const onFileOpen = () => {
        setOpenFileDialog(true);
    };
    const onLeftEditorPaste = () => {
        pasteFromClipboard(
            (text) => {
                setEditorContent(monacoLeftEditorRef, text);
            },
            (errMsg) => {
                console.log('Failed to paste from clipboard: ' + errMsg);
            },
        );
    };
    const onLeftEditorCopy = () => {
        if (copyToClipboard(getEditorContent(monacoLeftEditorRef))) {
            // toaster.create({ description: 'Copied To Clipboard', type: 'info' });
        }
    };
    const onLeftEditorClear = () => {
        setEditorContent(monacoLeftEditorRef, '');
    };

    const onRightEditorCopy = () => {
        if (copyToClipboard(getEditorContent(monacoRightEditorRef))) {
            // toaster.create({ description: 'Copied To Clipboard', type: 'info' });
        }
    };
    const onRightEditorClear = () => {
        setEditorContent(monacoRightEditorRef, '');
    };

    const onFileOpenedHandler = useCallback((openedFileInfo: FileInfo) => {
        setOpenFileDialog(false);
        setEditorContent(monacoLeftEditorRef, openedFileInfo.content);
    }, []);

    const onLeftMount = useCallback((editorProps: EditorProperties) => {
        monacoLeftEditorRef.current = editorProps.editor;
    }, []);

    const onRightMount = useCallback((editorProps: EditorProperties) => {
        monacoRightEditorRef.current = editorProps.editor;
    }, []);

    const menuLeft = MenuBuilder.newBuilder()
        .addButton('open-file', 'Open File', onFileOpen)
        .addButton('paste-from-clipboard', 'Paste', onLeftEditorPaste)
        .addButton('copy-to-clipboard', 'Copy', onLeftEditorCopy)
        .addButton('clear', 'Clear', onLeftEditorClear)
        .build();
    const menuRight = MenuBuilder.newBuilder()
        .addButton('copy-to-clipboard', 'Copy', onRightEditorCopy)
        .addButton('clear', 'Clear', onRightEditorClear)
        .build();

    return (
        <>
            <ColumnView
                leftEditorMenu={menuLeft}
                leftEditor={{ minimap: false, onEditorMounted: onLeftMount }}
                selectedItem={select}
                selectItems={items}
                onSelectItem={onMenuSelected}
                rightEditorMenu={menuRight}
                rightEditor={{ minimap: false, isReadOnly: true, onEditorMounted: onRightMount }}
                functions={{ availableFunctions: functions }}
            />
            <FileOpen openFile={openFileDialog} supportedFiles={[]} onFileOpened={onFileOpenedHandler} />
        </>
    );
};

export default IndexPage;
