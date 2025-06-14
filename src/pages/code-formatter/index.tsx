import { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { usePage } from '@/contexts/PageContext';
import { formatJson } from '@/tools/json_tools';
import ColumnMenu, { AvailableFunction } from '../../controllers/elements/column/ColumnMenu';
import CodeEditor, { EditorProperties } from '../../controllers/elements/editor/CodeEditor';
import {
    copyToClipboardFromEditor,
    getEditorContent,
    pasteFromClipboardToEditor,
    setEditorContent,
} from '../../controllers/elements/editor/CodeEditorUtils';
import FileNameElement from '../../controllers/elements/editor/FileNameElement';
import FileOpen from '../../controllers/elements/file/FileOpen';
import { fileSave } from '../../controllers/elements/file/FileSave';
import { FileInfo } from '../../controllers/elements/file/FileTypes';
import Menubar from '../../controllers/elements/navigation/menubar/Menubar';
import { MenuBuilder } from '../../controllers/elements/navigation/menubar/utils';
import Select, { SelectItem } from '../../custom-components/controls/Select';
import ContentContainerGrid from '../../custom-components/layout/ContentContainerGrid';
import ContentContainerGridChild from '../../custom-components/layout/ContentContainerGridChild';

const JSON_FORMATTER_ITEM: SelectItem = { itemId: 'json', displayText: 'Json' };
const FORMATTER_ITEMS: SelectItem[] = [JSON_FORMATTER_ITEM];
const FORMATTER_MAP: Record<string, SelectItem> = { json: JSON_FORMATTER_ITEM };

const IndexPage: React.FC = () => {
    const { setPageTitle } = usePage();

    useEffect(() => {
        setPageTitle('Code Formatter');
    }, [setPageTitle]);

    // State
    const [isFileDialogOpen, setIsFileDialogOpen] = useState<boolean>(false);
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

    const handleFileOpened = (fileInfo: FileInfo): void => {
        setIsFileDialogOpen(false);
        setEditorContent(leftEditorRef, fileInfo.content);
    };

    const handleOpenFileDialog = (): void => {
        setIsFileDialogOpen(true);
    };

    const handleLeftPaste = (): void => {
        pasteFromClipboardToEditor(leftEditorRef);
    };

    const handleLeftClear = (): void => {
        setEditorContent(leftEditorRef, '');
    };

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
                    <CodeEditor minimap={false} onEditorMounted={handleLeftEditorMount} originalLang="json" />
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
                        originalLang="json"
                    />
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

export default IndexPage;
