import { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { usePage } from '@/contexts/PageContext';
import FileOpen from '@/controls/file/FileOpen';
import { fileSave } from '@/controls/file/FileSave';
import { FileInfo } from '@/controls/file/FileTypes';
import { SelectItem } from '@/controls/Select';
import ColumnMenu, { AvailableFunction } from '@/modules/ui/elements/column/ColumnMenu';
import CodeEditor  from '@/modules/ui/elements/editor/CodeEditor';
import {
    copyToClipboardFromEditor,
    getEditorContent,
    pasteFromClipboardToEditor,
    setEditorContent,
} from '@/modules/ui/elements/editor/CodeEditorUtils';
import FileNameElement from '@/modules/ui/elements/editor/FileNameElement';
import Menubar from '@/modules/ui/elements/navigation/menubar/Menubar';
import { MenuBuilder } from '@/modules/ui/elements/navigation/menubar/utils';
import { sha1, sha256, sha384, sha512 } from 'crypto-hash';
import ContentContainerGrid from '../../components/layout/ContentContainerGrid';
import ContentContainerGridChild from '../../components/layout/ContentContainerGridChild';
import { EditorProperties } from '@/modules/ui/elements/editor/types';

type HashFunction = (text: string) => Promise<string>;

enum EncodingModes {
    SHA1 = 'sha1',
    SHA256 = 'sha256',
    SHA384 = 'sha384',
    SHA512 = 'sha512',
}

const sha1Option: SelectItem = { itemId: EncodingModes.SHA1, displayText: 'SHA1' };
const sha256Option: SelectItem = { itemId: EncodingModes.SHA256, displayText: 'SHA256' };
const sha384Option: SelectItem = { itemId: EncodingModes.SHA384, displayText: 'SHA384' };
const sha512Option: SelectItem = { itemId: EncodingModes.SHA512, displayText: 'SHA512' };

const encodingModeOptions: SelectItem[] = [sha1Option, sha256Option, sha384Option, sha512Option];

const hashFunctions: Record<EncodingModes, HashFunction> = {
    [EncodingModes.SHA1]: sha1,
    [EncodingModes.SHA256]: sha256,
    [EncodingModes.SHA384]: sha384,
    [EncodingModes.SHA512]: sha512,
};

const Home: React.FC = () => {
    const { setPageTitle } = usePage();

    useEffect(() => {
        setPageTitle('Hashing Utilities Page');
    }, [setPageTitle]);

    // State
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

    // Available hashing functions for ColumnMenu
    const availableFunctions: AvailableFunction[] = encodingModeOptions.map((option) => ({
        name: option.displayText,
        onClick: () => {
            const inputText = getEditorContent(leftEditorRef);
            const hashFunction = hashFunctions[option.itemId as EncodingModes];

            hashFunction(inputText)
                .then((hashValue: string) => {
                    setEditorContent(rightEditorRef, hashValue);
                })
                .catch((error: unknown) => {
                    console.error(error);
                });
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
                    <h3>Choose Algorithm</h3>
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
                showOpenFileDialog={isFileDialogOpen}
                supportedFiles={supportedExtensions}
                onFileOpened={handleFileOpened}
            />
        </>
    );
};

export default Home;
