import { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { usePage } from '@/contexts/PageContext';
import FileOpen from '@/controls/file/FileOpen';
import { fileSave } from '@/controls/file/FileSave';
import { FileInfo } from '@/controls/file/FileTypes';
import CodeEditor from '@/modules/ui/elements/editor/CodeEditor';
import CodeEditorInfoLine from '@/modules/ui/elements/editor/CodeEditorInfoLine';
import {
    getEditorContent,
    pasteFromClipboardToEditor,
    setEditorContent,
} from '@/modules/ui/elements/editor/CodeEditorUtils';
import Menubar from '@/modules/ui/elements/navigation/menubar/Menubar';
import { MenuBuilder } from '@/modules/ui/elements/navigation/menubar/utils';
import ContentContainerGrid from '../../components/layout/ContentContainerGrid';
import ContentContainerGridChild from '../../components/layout/ContentContainerGridChild';
import { EditorProperties } from '@/modules/ui/elements/editor/types';

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
        fullName: '',
        size: 0
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

    // ApplicationTopBar items
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
            <Menubar menuItems={leftMenuItems} />

            <CodeEditorInfoLine
                languageName="markdown"
                wordWrap={isWordWrapEnabled ? 'On' : 'Off'}
                minimap={isMinimapEnabled ? 'On' : 'Off'}
                fileInfo={currentFileInfo}
            />

            <ContentContainerGrid>
                <ContentContainerGridChild>
                    {isEditorVisible && (
                        <CodeEditor
                            minimap={isMinimapEnabled}
                            wordWrap={isWordWrapEnabled}
                            onEditorMounted={handleEditorMount}
                            languageId="markdown"
                            onChange={handleTextChange}
                        />
                    )}
                </ContentContainerGridChild>
                <ContentContainerGridChild> </ContentContainerGridChild>
                <ContentContainerGridChild>
                    {isPreviewVisible && <ReactMarkdown>{editorContent}</ReactMarkdown>}
                </ContentContainerGridChild>
            </ContentContainerGrid>

            <FileOpen
                showOpenFileDialog={isFileDialogOpen}
                supportedFiles={['.md', '.txt']}
                onFileOpened={handleFileOpen}
            />
        </>
    );
};

export default IndexPage;
