import { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import CodeEditor, { EditorProperties } from '@/components/elements/editor/CodeEditor';
import CodeEditorInfoLine from '@/components/elements/editor/CodeEditorInfoLine';
import {
    getEditorContent,
    pasteFromClipboardToEditor,
    setEditorContent,
} from '@/components/elements/editor/CodeEditorUtils';
import FileOpen from '@/components/elements/file/FileOpen';
import { fileSave } from '@/components/elements/file/FileSave';
import { FileInfo } from '@/components/elements/file/FileTypes';
import MenuBar from '@/components/elements/menuBar/MenuBar';
import { MenuBuilder } from '@/components/elements/menuBar/utils';
import AppColumn from '@/components/ui/layout/Column';
import AppColumnContainer from '@/components/ui/layout/ColumnContainer';
import { usePage } from '@/contexts/PageContext';

const IndexPage: React.FC = () => {
    const { setPageTitle } = usePage();

    useEffect(() => {
        setPageTitle('Markdown Utilities');
    }, [setPageTitle]);

    // State
    const [isFileDialogOpen, setIsFileDialogOpen] = useState<boolean>(false);
    const [isEditorVisible, setIsEditorVisible] = useState<boolean>(true);
    const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(true);
    const [isWordWrapEnabled, setIsWordWrapEnabled] = useState<boolean>(false);
    const [isMinimapEnabled, setIsMinimapEnabled] = useState<boolean>(true);

    const [editorContent, setEditorContentState] = useState<string>('');
    const [fileName, setFileName] = useState<string>('Untitled');
    const [fileExtension, setFileExtension] = useState<string>('.md');

    const [currentFileInfo, setCurrentFileInfo] = useState<FileInfo>({
        name: fileName,
        extension: fileExtension,
        content: editorContent,
    });

    const leftEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    // Editor mount handler
    const handleEditorMount = useCallback(
        (props: EditorProperties) => {
            leftEditorRef.current = props.editor;
            setEditorContent(leftEditorRef, editorContent);
        },
        [editorContent],
    );

    // File open handler
    const handleFileOpen = (fileInfo: FileInfo): void => {
        setIsFileDialogOpen(false);
        setEditorContent(leftEditorRef, fileInfo.content);
        setEditorContentState(fileInfo.content);
        setCurrentFileInfo(fileInfo);
    };

    // Menu action handlers
    const handleNewFile = (): void => {
        const emptyContent = '';
        setEditorContent(leftEditorRef, emptyContent);
        setEditorContentState(emptyContent);
    };

    const handleOpenFileDialog = (): void => {
        setIsFileDialogOpen(true);
    };

    const handleSaveFile = (): void => {
        const content = getEditorContent(leftEditorRef);
        fileSave({ fileName, fileExtension, fileContent: content });
    };

    const handlePaste = (): void => {
        pasteFromClipboardToEditor(leftEditorRef);
        const updatedContent = getEditorContent(leftEditorRef);
        setEditorContent(leftEditorRef, updatedContent);
        setEditorContentState(updatedContent);
    };

    const handleToggleEditor = (): void => {
        setIsEditorVisible((prev) => !prev);
    };

    const handleTogglePreview = (): void => {
        setIsPreviewVisible((prev) => !prev);
    };

    const handleToggleWordWrap = (): void => {
        setIsWordWrapEnabled((prev) => !prev);
    };

    const handleToggleMinimap = (): void => {
        setIsMinimapEnabled((prev) => !prev);
    };

    // MenuBar items
    const leftMenuItems = MenuBuilder.newBuilder()
        .addButton('new-file', 'New File', handleNewFile)
        .addButton('open-file', 'Open File', handleOpenFileDialog)
        .addButton('save', 'Save File', handleSaveFile)
        .addButton('paste-from-clipboard', 'Paste', handlePaste)
        .addButton('show-editor', 'Show Editor', handleToggleEditor)
        .addButton('show-preview', 'Show Preview', handleTogglePreview)
        .addButton('word-wrap', 'Word Wrap', handleToggleWordWrap)
        .addButton('mini-map', 'Mini Map', handleToggleMinimap)
        .build();

    // Text change handler
    const handleTextChange = (): void => {
        const updatedContent = getEditorContent(leftEditorRef);
        setEditorContentState(updatedContent);
    };

    return (
        <>
            <MenuBar menuItems={leftMenuItems} />

            <CodeEditorInfoLine
                language="markdown"
                extensions={['.md', '.txt']}
                wordWrap={isWordWrapEnabled ? 'On' : 'Off'}
                minimap={isMinimapEnabled ? 'On' : 'Off'}
                fileInfo={currentFileInfo}
                onNameChanged={setFileName}
                onExtensionChanged={setFileExtension}
            />

            <AppColumnContainer>
                <AppColumn>
                    {isEditorVisible && (
                        <CodeEditor
                            minimap={isMinimapEnabled}
                            wordWrap={isWordWrapEnabled}
                            onEditorMounted={handleEditorMount}
                            originalLang="markdown"
                            onChange={handleTextChange}
                        />
                    )}
                </AppColumn>
                <AppColumn> </AppColumn>
                <AppColumn>{isPreviewVisible && <ReactMarkdown>{editorContent}</ReactMarkdown>}</AppColumn>
            </AppColumnContainer>

            <FileOpen openFile={isFileDialogOpen} supportedFiles={['.md', '.txt']} onFileOpened={handleFileOpen} />
        </>
    );
};

export default IndexPage;
