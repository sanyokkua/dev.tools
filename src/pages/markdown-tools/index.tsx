import { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { usePage } from '@/contexts/PageContext';
import { saveTextFile } from '@/controls/file/FileSave';
import { FileInfo } from '@/controls/file/FileTypes';
import OpenFileDialog from '@/controls/file/OpenFileDialog';
import CodeEditor from '@/modules/ui/elements/editor/CodeEditor';
import CodeEditorInfoLine from '@/modules/ui/elements/editor/CodeEditorInfoLine';
import {
    getEditorContent,
    pasteFromClipboardToEditor,
    setEditorContent,
} from '@/modules/ui/elements/editor/CodeEditorUtils';
import { EditorProperties } from '@/modules/ui/elements/editor/types';
import Menubar from '@/modules/ui/elements/navigation/menubar/Menubar';
import { MenuBuilder } from '@/modules/ui/elements/navigation/menubar/utils';
import ContentContainerGrid from '../../components/layout/ContentContainerGrid';
import ContentContainerGridChild from '../../components/layout/ContentContainerGridChild';

const IndexPage: React.FC = () => {
    const { setPageTitle } = usePage();

    useEffect(() => {
        setPageTitle('Markdown Utilities');
    }, [setPageTitle]);

    // State
    const [isEditorVisible, setIsEditorVisible] = useState<boolean>(true);
    const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(true);
    const [isWordWrapEnabled, setIsWordWrapEnabled] = useState<boolean>(false);
    const [isMinimapEnabled, setIsMinimapEnabled] = useState<boolean>(true);
    const fileInputDialogRef = useRef<HTMLInputElement | null>(null);
    const [editorContent, setEditorContentState] = useState<string>('');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [fileName, setFileName] = useState<string>('Untitled');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [fileExtension, setFileExtension] = useState<string>('.md');

    const [currentFileInfo, setCurrentFileInfo] = useState<FileInfo>({
        name: fileName,
        extension: fileExtension,
        content: editorContent,
        fullName: '',
        size: 0,
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
    const handleFileOpen = (fileInfo?: FileInfo): void => {
        setEditorContent(leftEditorRef, fileInfo?.content ?? '');
        setEditorContentState(fileInfo?.content ?? '');
        setCurrentFileInfo(fileInfo ?? ({} as FileInfo));
    };

    // Menu action handlers
    const handleNewFile = (): void => {
        const emptyContent = '';
        setEditorContent(leftEditorRef, emptyContent);
        setEditorContentState(emptyContent);
    };

    const handleOpenFileDialog = (): void => {
        fileInputDialogRef.current?.click();
    };

    const handleSaveFile = (): void => {
        const content = getEditorContent(leftEditorRef);
        saveTextFile({ fileName, fileExtension, fileContent: content });
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
                <ContentContainerGridChild>{isPreviewVisible && <div>{editorContent}</div>}</ContentContainerGridChild>
            </ContentContainerGrid>

            <OpenFileDialog
                onMount={(ref) => {
                    fileInputDialogRef.current = ref;
                }}
                supportedFiles={['.md', '.txt']}
                onFileOpened={handleFileOpen}
            />
        </>
    );
};

export default IndexPage;
