'use client';
import { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useFileOpen } from '@/contexts/FileOpenContext';
import { usePage } from '@/contexts/PageContext';
import { useToast } from '@/contexts/ToasterContext';
import { ToastType } from '@/controls/toaster/types';
import CodeEditor from '@/modules/ui/elements/editor/CodeEditor';
import {
    getEditorContent,
    pasteFromClipboardToEditor,
    setEditorContent,
} from '@/modules/ui/elements/editor/code-editor-utils';
import { EditorProperties } from '@/modules/ui/elements/editor/types';
import Menubar from '@/modules/ui/elements/navigation/menubar/Menubar';
import { MenuBuilder } from '@/modules/ui/elements/navigation/menubar/utils';

import { DEFAULT_FILE_NAME } from '@/common/constants';
import { FileInfo } from '@/common/file-types';
import { saveTextFile } from '@/common/file-utils';
import { mapBoolean } from '@/common/formatting-tools';
import InformationPanel, { InformationPanelItem } from '@/controls/InformationPanel';
import HorizontalContainer from '@/layout/HorizontalContainer';
import ScrollableContentContainer from '@/layout/ScrollableContentContainer';
import TextContainer from '@/layout/TextContainer';
import 'highlight.js/styles/github.css';
import 'katex/dist/katex.min.css';
import ReactMarkdown from 'react-markdown';
import { useReactToPrint } from 'react-to-print';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

const markdownExtension = '.md';

const IndexPage: React.FC = () => {
    const { setPageTitle } = usePage();
    const { showFileOpenDialog } = useFileOpen();
    const { showToast } = useToast();

    useEffect(() => {
        setPageTitle('Markdown Utilities');
    }, [setPageTitle]);

    const contentRef = useRef<HTMLDivElement>(null);
    const reactToPrintFn = useReactToPrint({ contentRef });

    // State management
    const [isEditorVisible, setIsEditorVisible] = useState<boolean>(true);
    const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(true);
    const [isWordWrapEnabled, setIsWordWrapEnabled] = useState<boolean>(false);
    const [isMinimapEnabled, setIsMinimapEnabled] = useState<boolean>(true);
    const [currentFileInfo, setCurrentFileInfo] = useState<FileInfo>({
        name: DEFAULT_FILE_NAME,
        extension: markdownExtension,
        content: '',
        fullName: '',
        size: 0,
    });

    const leftEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    // Event handlers with useCallback for optimization
    const handleEditorMount = useCallback(
        (props: EditorProperties) => {
            leftEditorRef.current = props.editor;
            setEditorContent(leftEditorRef, currentFileInfo.content);
        },
        [currentFileInfo.content],
    );

    const handleNewFile = useCallback(() => {
        const emptyContent = '';
        setEditorContent(leftEditorRef, emptyContent);
        setCurrentFileInfo((prevState) => ({
            ...prevState,
            content: emptyContent,
            name: DEFAULT_FILE_NAME,
            extension: markdownExtension,
            fullName: `${DEFAULT_FILE_NAME}${markdownExtension}`,
            size: emptyContent.length,
        }));
    }, []);

    const handleOpenFileDialog = useCallback(() => {
        showFileOpenDialog({
            supportedFiles: ['.md', '.txt'],
            onSuccess: (fileInfo) => {
                if (!fileInfo) {
                    showToast({ message: 'No files are chosen', type: ToastType.WARNING });
                    return;
                }
                setEditorContent(leftEditorRef, fileInfo.content);
                setCurrentFileInfo(fileInfo);
                showToast({ message: 'File opened', type: ToastType.INFO });
            },
            onFailure: (err: unknown) => {
                console.error(err);
                showToast({ message: 'Failed to open file', type: ToastType.ERROR });
            },
        });
    }, [showFileOpenDialog, showToast]);

    const handleSaveFile = useCallback(() => {
        const content = getEditorContent(leftEditorRef);
        saveTextFile({
            fileName: currentFileInfo.name,
            fileExtension: currentFileInfo.extension,
            fileContent: content,
        });
    }, [currentFileInfo]);

    const handlePaste = useCallback(() => {
        pasteFromClipboardToEditor(leftEditorRef);
        const updatedContent = getEditorContent(leftEditorRef);
        setCurrentFileInfo((prevState) => ({ ...prevState, content: updatedContent, size: updatedContent.length }));
    }, []);

    const handleToggleEditor = useCallback(() => {
        setIsEditorVisible((prev) => !prev);
    }, []);

    const handleTogglePreview = useCallback(() => {
        setIsPreviewVisible((prev) => !prev);
    }, []);

    const handleToggleWordWrap = useCallback(() => {
        setIsWordWrapEnabled((prev) => !prev);
    }, []);

    const handleToggleMinimap = useCallback(() => {
        setIsMinimapEnabled((prev) => !prev);
    }, []);

    const handlePrint = useCallback(() => {
        reactToPrintFn();
    }, [reactToPrintFn]);

    // Application menu items
    const leftMenuItems = MenuBuilder.newBuilder()
        .addButton('new-file', 'New File', handleNewFile)
        .addButton('open-file', 'Open File', handleOpenFileDialog)
        .addButton('save', 'Save File', handleSaveFile)
        .addButton('paste-from-clipboard', 'Paste', handlePaste)
        .addButton('show-editor', 'Show Editor', handleToggleEditor)
        .addButton('show-preview', 'Show Preview', handleTogglePreview)
        .addButton('word-wrap', 'Word Wrap', handleToggleWordWrap)
        .addButton('mini-map', 'Mini Map', handleToggleMinimap)
        .addButton('save-pdf', 'Print Markdown', handlePrint)
        .build();

    // Editor change handler
    const handleTextChange = useCallback(() => {
        const updatedContent = getEditorContent(leftEditorRef);
        setCurrentFileInfo((prevState) => ({ ...prevState, content: updatedContent, size: updatedContent.length }));
    }, []);

    // Information panel data
    const infoPanelItems: InformationPanelItem[] = [
        `WordWrap: ${mapBoolean(isWordWrapEnabled)}`,
        `Minimap: ${mapBoolean(isMinimapEnabled)}`,
        `MD Editor: ${mapBoolean(isEditorVisible)}`,
        `MD Preview: ${mapBoolean(isPreviewVisible)}`,
        `FileName: ${currentFileInfo.name}`,
        `TextLength: ${currentFileInfo.content.length}`,
    ];

    return (
        <>
            <Menubar menuItems={leftMenuItems} />
            <InformationPanel items={infoPanelItems} />

            <HorizontalContainer>
                {isEditorVisible && (
                    <CodeEditor
                        minimap={isMinimapEnabled}
                        wordWrap={isWordWrapEnabled}
                        onEditorMounted={handleEditorMount}
                        languageId="markdown"
                        onChange={handleTextChange}
                        height="100vh"
                    />
                )}

                {isPreviewVisible && (
                    <ScrollableContentContainer>
                        <TextContainer ref={contentRef}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex, rehypeHighlight]}
                            >
                                {currentFileInfo.content}
                            </ReactMarkdown>
                        </TextContainer>
                    </ScrollableContentContainer>
                )}
            </HorizontalContainer>
        </>
    );
};

export default IndexPage;
