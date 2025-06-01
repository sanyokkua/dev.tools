import { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import ColumnMenu, { AvailableFunction } from '@/components/elements/column/ColumnMenu';
import CodeEditor, { EditorProperties } from '@/components/elements/editor/CodeEditor';
import {
    copyToClipboardFromEditor,
    getEditorContent,
    pasteFromClipboardToEditor,
    setEditorContent,
} from '@/components/elements/editor/CodeEditorUtils';
import FileNameElement from '@/components/elements/editor/FileNameElement';
import FileOpen from '@/components/elements/file/FileOpen';
import { fileSave } from '@/components/elements/file/FileSave';
import { FileInfo } from '@/components/elements/file/FileTypes';
import MenuBar from '@/components/elements/menuBar/MenuBar';
import { MenuBuilder } from '@/components/elements/menuBar/utils';
import AppSelect, { SelectItem } from '@/components/ui/AppSelect';
import AppColumn from '@/components/ui/layout/Column';
import AppColumnContainer from '@/components/ui/layout/ColumnContainer';
import { usePage } from '@/contexts/PageContext';
import { Base64 } from 'js-base64';

type EncodeDecodeFunction = (text: string) => string;

enum EncodeModes {
    ENCODE = 'encode',
    ENCODE_URL_SAFE = 'encodeUrlSafe',
    ENCODE_URL = 'encodeUrl',
    ENCODE_URI = 'encodeUri',
}

enum DecodeModes {
    DECODE = 'decode',
}

enum AppMode {
    ENCODE = 'encode',
    DECODE = 'decode',
}

const appModeEncodeItem: SelectItem = { key: AppMode.ENCODE, value: 'Encode' };
const appModeDecodeItem: SelectItem = { key: AppMode.DECODE, value: 'Decode' };
const modeSelectItems: SelectItem[] = [appModeEncodeItem, appModeDecodeItem];

const encodeModeOptions: SelectItem[] = [
    { key: EncodeModes.ENCODE, value: 'Encode' },
    { key: EncodeModes.ENCODE_URL_SAFE, value: 'Encode Url Safe' },
    { key: EncodeModes.ENCODE_URL, value: 'Encode Url' },
    { key: EncodeModes.ENCODE_URI, value: 'Encode Uri' },
];
const decodeModeOptions: SelectItem[] = [{ key: DecodeModes.DECODE, value: 'Decode' }];

const EncodingTools: Record<EncodeModes, EncodeDecodeFunction> = {
    [EncodeModes.ENCODE]: (text: string) => Base64.encode(text, false),
    [EncodeModes.ENCODE_URL_SAFE]: (text: string) => Base64.encode(text, true),
    [EncodeModes.ENCODE_URL]: Base64.encodeURL,
    [EncodeModes.ENCODE_URI]: Base64.encodeURI,
};
const DecodingTools: Record<DecodeModes, EncodeDecodeFunction> = { [DecodeModes.DECODE]: Base64.decode };

const Home: React.FC = () => {
    const { setPageTitle } = usePage();

    useEffect(() => {
        setPageTitle('Base64 Encoding Page');
    }, [setPageTitle]);

    // State
    const [selectedMode, setSelectedMode] = useState<SelectItem>(appModeEncodeItem);
    const [modeOptions, setModeOptions] = useState<SelectItem[]>(encodeModeOptions);

    const [isFileDialogOpen, setIsFileDialogOpen] = useState<boolean>(false);
    const [supportedExtensions, setSupportedExtensions] = useState<string[]>([]);
    const [extensionOptions, setExtensionOptions] = useState<SelectItem[]>([]);

    const [fileName, setFileName] = useState<string>('Untitled');
    const [fileExtension, setFileExtension] = useState<string>('.txt');

    const leftEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const rightEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    // Editor mount handlers
    const handleLeftEditorMount = useCallback((props: EditorProperties) => {
        leftEditorRef.current = props.editor;
        setSupportedExtensions(props.supportedExtensions);
        setExtensionOptions(props.supportedExtensions.map((ext: string) => ({ key: ext, value: ext })));
    }, []);

    const handleRightEditorMount = useCallback((props: EditorProperties) => {
        rightEditorRef.current = props.editor;
    }, []);

    // Mode selection handler
    const handleModeSelect = (newKey: string): void => {
        if (newKey === AppMode.ENCODE.toString()) {
            setSelectedMode(appModeEncodeItem);
            setModeOptions(encodeModeOptions);
        } else {
            setSelectedMode(appModeDecodeItem);
            setModeOptions(decodeModeOptions);
        }
    };

    // File open handler
    const handleFileOpened = (fileInfo: FileInfo): void => {
        setIsFileDialogOpen(false);
        setEditorContent(leftEditorRef, fileInfo.content);
    };

    // Left editor actions
    const handleOpenFileDialog = (): void => {
        setIsFileDialogOpen(true);
    };

    const handleLeftPaste = (): void => {
        pasteFromClipboardToEditor(leftEditorRef);
    };

    const handleLeftClear = (): void => {
        setEditorContent(leftEditorRef, '');
    };

    // Right editor actions
    const handleSaveFile = (): void => {
        const content = getEditorContent(rightEditorRef);
        fileSave({ fileName, fileExtension, fileContent: content });
    };

    const handleRightCopy = (): void => {
        copyToClipboardFromEditor(rightEditorRef);
    };

    const handleRightClear = (): void => {
        setEditorContent(rightEditorRef, '');
    };

    // Build MenuBar items
    const leftMenuItems = MenuBuilder.newBuilder()
        .addButton('open-file', 'Open File', handleOpenFileDialog)
        .addButton('paste-from-clipboard', 'Paste', handleLeftPaste)
        .addButton('clear', 'Clear', handleLeftClear)
        .build();

    const rightMenuItems = MenuBuilder.newBuilder()
        .addButton('save-file', 'Save File', handleSaveFile)
        .addButton('copy-to-clipboard', 'Copy', handleRightCopy)
        .addButton('clear', 'Clear', handleRightClear)
        .build();

    // Available functions based on mode
    const functionsMap: Record<string, EncodeDecodeFunction> =
        selectedMode.key === AppMode.ENCODE.toString() ? EncodingTools : DecodingTools;

    const availableFunctions: AvailableFunction[] = modeOptions.map((option) => ({
        name: option.value,
        onClick: () => {
            const text = getEditorContent(leftEditorRef);
            const func: EncodeDecodeFunction = functionsMap[option.key];
            const result = func(text);
            setEditorContent(rightEditorRef, result);
        },
    }));

    return (
        <>
            <AppColumnContainer>
                <AppColumn>
                    <MenuBar menuItems={leftMenuItems} />
                    <CodeEditor minimap={false} onEditorMounted={handleLeftEditorMount} />
                </AppColumn>

                <AppColumn>
                    <h3>Choose Mode</h3>
                    <AppSelect
                        items={modeSelectItems}
                        defaultKey={selectedMode.key}
                        onSelect={handleModeSelect}
                        className="inline-select"
                    />
                    <br />
                    <ColumnMenu availableFunctions={availableFunctions} />
                </AppColumn>

                <AppColumn>
                    <MenuBar menuItems={rightMenuItems} />
                    <FileNameElement
                        defaultName={fileName}
                        defaultExtensionKey={fileExtension}
                        extensions={extensionOptions}
                        onNameChanged={setFileName}
                        onExtensionChanged={setFileExtension}
                    />
                    <CodeEditor minimap={false} isReadOnly={true} onEditorMounted={handleRightEditorMount} />
                </AppColumn>
            </AppColumnContainer>

            <FileOpen
                openFile={isFileDialogOpen}
                supportedFiles={supportedExtensions}
                onFileOpened={handleFileOpened}
            />
        </>
    );
};

export default Home;
