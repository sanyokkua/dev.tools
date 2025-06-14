import { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { usePage } from '@/contexts/PageContext';
import ColumnMenu, { AvailableFunction } from '@/modules/ui/elements/column/ColumnMenu';
import CodeEditor, { EditorProperties } from '@/modules/ui/elements/editor/CodeEditor';
import {
    copyToClipboardFromEditor,
    getEditorContent,
    pasteFromClipboardToEditor,
    setEditorContent,
} from '@/modules/ui/elements/editor/CodeEditorUtils';
import FileNameElement from '@/modules/ui/elements/editor/FileNameElement';
import FileOpen from '@/modules/ui/elements/file/FileOpen';
import { fileSave } from '@/modules/ui/elements/file/FileSave';
import { FileInfo } from '@/modules/ui/elements/file/FileTypes';
import Menubar from '@/modules/ui/elements/navigation/menubar/Menubar';
import { MenuBuilder } from '@/modules/ui/elements/navigation/menubar/utils';
import { Base64 } from 'js-base64';
import Select, { SelectItem } from '../../components/controls/Select';
import ContentContainerGrid from '../../components/layout/ContentContainerGrid';
import ContentContainerGridChild from '../../components/layout/ContentContainerGridChild';

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

const appModeEncodeItem: SelectItem = { itemId: AppMode.ENCODE, displayText: 'Encode' };
const appModeDecodeItem: SelectItem = { itemId: AppMode.DECODE, displayText: 'Decode' };
const modeSelectItems: SelectItem[] = [appModeEncodeItem, appModeDecodeItem];

const encodeModeOptions: SelectItem[] = [
    { itemId: EncodeModes.ENCODE, displayText: 'Encode' },
    { itemId: EncodeModes.ENCODE_URL_SAFE, displayText: 'Encode Url Safe' },
    { itemId: EncodeModes.ENCODE_URL, displayText: 'Encode Url' },
    { itemId: EncodeModes.ENCODE_URI, displayText: 'Encode Uri' },
];
const decodeModeOptions: SelectItem[] = [{ itemId: DecodeModes.DECODE, displayText: 'Decode' }];

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
        setExtensionOptions(props.supportedExtensions.map((ext: string) => ({ itemId: ext, displayText: ext })));
    }, []);

    const handleRightEditorMount = useCallback((props: EditorProperties) => {
        rightEditorRef.current = props.editor;
    }, []);

    // Mode selection handler
    const handleModeSelect = (newKey: SelectItem): void => {
        if (newKey.itemId === AppMode.ENCODE.toString()) {
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

    // Build ApplicationTopBar items
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
        selectedMode.itemId === AppMode.ENCODE.toString() ? EncodingTools : DecodingTools;

    const availableFunctions: AvailableFunction[] = modeOptions.map((option) => ({
        name: option.displayText,
        onClick: () => {
            const text = getEditorContent(leftEditorRef);
            const func: EncodeDecodeFunction = functionsMap[option.itemId];
            const result = func(text);
            setEditorContent(rightEditorRef, result);
        },
    }));

    return (
        <>
            <ContentContainerGrid>
                <ContentContainerGridChild>
                    <Menubar menuItems={leftMenuItems} />
                    <CodeEditor minimap={false} onEditorMounted={handleLeftEditorMount} />
                </ContentContainerGridChild>

                <ContentContainerGridChild>
                    <h3>Choose Mode</h3>
                    <Select items={modeSelectItems} selectedItem={selectedMode} onSelect={handleModeSelect} />
                    <br />
                    <ColumnMenu availableFunctions={availableFunctions} />
                </ContentContainerGridChild>

                <ContentContainerGridChild>
                    <Menubar menuItems={rightMenuItems} />
                    <FileNameElement
                        defaultName={fileName}
                        defaultExtensionKey={fileExtension}
                        extensions={extensionOptions}
                        onNameChanged={setFileName}
                        onExtensionChanged={(it) => {
                            setFileExtension(it.itemId);
                        }}
                    />
                    <CodeEditor minimap={false} isReadOnly={true} onEditorMounted={handleRightEditorMount} />
                </ContentContainerGridChild>
            </ContentContainerGrid>

            <FileOpen
                openFile={isFileDialogOpen}
                supportedFiles={supportedExtensions}
                onFileOpened={handleFileOpened}
            />
        </>
    );
};

export default Home;
