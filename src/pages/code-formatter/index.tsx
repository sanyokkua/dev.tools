import { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { usePage } from '@/contexts/PageContext';
import { saveTextFile } from '@/controls/file/FileSave';
import { FileInfo } from '@/controls/file/FileTypes';
import OpenFileDialog from '@/controls/file/OpenFileDialog';
import { formatJson } from '@/modules/tools/json_tools';
import ColumnMenu, { AvailableFunction } from '@/modules/ui/elements/column/ColumnMenu';
import CodeEditor from '@/modules/ui/elements/editor/CodeEditor';
import {
    copyToClipboardFromEditor,
    getEditorContent,
    pasteFromClipboardToEditor,
    setEditorContent,
} from '@/modules/ui/elements/editor/CodeEditorUtils';
import FileNameElement from '@/modules/ui/elements/editor/FileNameElement';
import { EditorProperties } from '@/modules/ui/elements/editor/types';
import Menubar from '@/modules/ui/elements/navigation/menubar/Menubar';
import { MenuBuilder } from '@/modules/ui/elements/navigation/menubar/utils';
import Select, { SelectItem } from '../../components/controls/Select';
import ContentContainerGrid from '../../components/layout/ContentContainerGrid';
import ContentContainerGridChild from '../../components/layout/ContentContainerGridChild';

const JSON_FORMATTER_ITEM: SelectItem = { itemId: 'json', displayText: 'Json' };
const FORMATTER_ITEMS: SelectItem[] = [JSON_FORMATTER_ITEM];
const FORMATTER_MAP: Record<string, SelectItem> = { json: JSON_FORMATTER_ITEM };

const IndexPage: React.FC = () => {
    const { setPageTitle } = usePage();

    useEffect(() => {
        setPageTitle('Code Formatter');
    }, [setPageTitle]);

    // State
    const fileInputDialogRef = useRef<HTMLInputElement | null>(null);
    const [selectedFormatter, setSelectedFormatter] = useState<SelectItem>(FORMATTER_MAP['json']);
    const leftEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const rightEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [supportedExtensions, setSupportedExtensions] = useState<string[]>(['.json']);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [extensionOptions, setExtensionOptions] = useState<SelectItem[]>([{ itemId: 'json', displayText: '.json' }]);
    const [fileName, setFileName] = useState<string>('Untitled');
    const [fileExtension, setFileExtension] = useState<string>('.json');

    // Editor mount handlers
    const handleLeftEditorMount = useCallback((props: EditorProperties) => {
        leftEditorRef.current = props.editor;
    }, []);

    const handleRightEditorMount = useCallback((props: EditorProperties) => {
        rightEditorRef.current = props.editor;
    }, []);

    // Menu and file handlers
    const handleMenuSelection = (formatter: SelectItem): void => {
        // Placeholder for future formatter selection logic
        const selected = FORMATTER_MAP[formatter.itemId];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (selected) {
            setSelectedFormatter(selected);
        }
    };

    const handleFileOpened = (fileInfo?: FileInfo): void => {
        setEditorContent(leftEditorRef, fileInfo?.content ?? '');
    };

    const handleOpenFileDialog = (): void => {
        fileInputDialogRef.current?.click();
    };

    const handleLeftPaste = (): void => {
        pasteFromClipboardToEditor(leftEditorRef);
    };

    const handleLeftClear = (): void => {
        setEditorContent(leftEditorRef, '');
    };

    const handleSaveFile = (): void => {
        const content = getEditorContent(rightEditorRef);
        saveTextFile({ fileName, fileExtension, fileContent: content });
    };

    const handleRightCopy = (): void => {
        copyToClipboardFromEditor(rightEditorRef);
    };

    const handleRightClear = (): void => {
        setEditorContent(rightEditorRef, '');
    };

    // ApplicationTopBar items
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

    // ColumnMenu functions
    const formatJsonFunction: AvailableFunction = {
        name: 'Format',
        onClick: () => {
            const content = getEditorContent(leftEditorRef);
            setEditorContent(rightEditorRef, formatJson(content, 4));
        },
    };

    const shortenJsonFunction: AvailableFunction = {
        name: 'Shorten',
        onClick: () => {
            const content = getEditorContent(leftEditorRef);
            setEditorContent(rightEditorRef, formatJson(content, 0));
        },
    };

    return (
        <>
            <ContentContainerGrid>
                <ContentContainerGridChild>
                    <Menubar menuItems={leftMenuItems} />
                    <CodeEditor minimap={false} onEditorMounted={handleLeftEditorMount} languageId="json" />
                </ContentContainerGridChild>

                <ContentContainerGridChild>
                    <h3>Chose Syntax</h3>
                    <Select items={FORMATTER_ITEMS} selectedItem={selectedFormatter} onSelect={handleMenuSelection} />
                    <br />
                    <ColumnMenu availableFunctions={[formatJsonFunction, shortenJsonFunction]} />
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
                    <CodeEditor
                        minimap={false}
                        isReadOnly={true}
                        onEditorMounted={handleRightEditorMount}
                        languageId="json"
                    />
                </ContentContainerGridChild>
            </ContentContainerGrid>

            <OpenFileDialog
                supportedFiles={supportedExtensions}
                onFileOpened={handleFileOpened}
                onMount={(ref) => {
                    fileInputDialogRef.current = ref;
                }}
            />
        </>
    );
};

export default IndexPage;
