import { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useFileOpen } from '@/contexts/FileOpenContext';
import { usePage } from '@/contexts/PageContext';
import { useToast } from '@/contexts/ToasterContext';
import { ToastType } from '@/controls/toaster/types';
import {
    copyToClipboardFromEditor,
    getEditorContent,
    pasteFromClipboardToEditor,
    setEditorContent,
} from '@/elements/editor/code-editor-utils';
import { EditorProperties } from '@/elements/editor/types';
import CodeEditor from '../../components/elements/editor/CodeEditor';
import MarkdownToolbar from '../../components/elements/editor/MarkdownToolbar';

import { DEFAULT_FILE_NAME } from '@/common/constants';
import { FileInfo } from '@/common/file-types';
import { saveTextFile } from '@/common/file-utils';
import { mapBoolean } from '@/common/formatting-tools';
import InformationPanel, { InformationPanelItem } from '@/controls/InformationPanel';
import 'katex/dist/katex.min.css';
import ReactMarkdown from 'react-markdown';
import { useReactToPrint } from 'react-to-print';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import ContentContainerFlex from '../../components/layouts/ContentContainerFlex';

const markdownExtension = '.md';

const IndexPage: React.FC = () => {
    const { setPageTitle } = usePage();
    const { showFileOpenDialog } = useFileOpen();
    const { showToast } = useToast();

    useEffect(() => {
        setPageTitle('Markdown Tools');
    }, [setPageTitle]);

    const contentRef = useRef<HTMLDivElement>(null);
    const reactToPrintFn = useReactToPrint({ contentRef });

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

    const handleEditorMount = useCallback((props: EditorProperties) => {
        leftEditorRef.current = props.editor;
        setEditorContent(leftEditorRef, '');
    }, []);

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

    const handleCopy = useCallback(() => {
        copyToClipboardFromEditor(leftEditorRef, showToast);
    }, [showToast]);

    const handlePaste = useCallback(() => {
        pasteFromClipboardToEditor(leftEditorRef, () => {}, showToast);
    }, [showToast]);

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

    const handleTextChange = useCallback(() => {
        const updatedContent = getEditorContent(leftEditorRef);
        setCurrentFileInfo((prevState) => ({ ...prevState, content: updatedContent, size: updatedContent.length }));
    }, []);

    const infoPanelItems: InformationPanelItem[] = [
        `WordWrap: ${mapBoolean(isWordWrapEnabled)}`,
        `Minimap: ${mapBoolean(isMinimapEnabled)}`,
        `MD Editor: ${mapBoolean(isEditorVisible)}`,
        `MD Preview: ${mapBoolean(isPreviewVisible)}`,
        `FileName: ${currentFileInfo.name}`,
        `TextLength: ${currentFileInfo.content.length}`,
    ];

    return (
        <ContentContainerFlex>
            <div className="markdown-tools">
                <div className="markdown-tools__header">
                    <h1>Markdown Tools</h1>
                    <p>Write, live-preview and print/export Markdown. Editor and preview can each be toggled.</p>
                </div>
                <MarkdownToolbar
                    onFileNewClick={handleNewFile}
                    onFileOpenClick={handleOpenFileDialog}
                    onFileSaveClick={handleSaveFile}
                    onCopyClick={handleCopy}
                    onPasteClick={handlePaste}
                    showEditor={isEditorVisible}
                    onToggleEditor={handleToggleEditor}
                    showPreview={isPreviewVisible}
                    onTogglePreview={handleTogglePreview}
                    wordWrap={isWordWrapEnabled}
                    onWordWrapToggle={handleToggleWordWrap}
                    minimap={isMinimapEnabled}
                    onMinimapToggle={handleToggleMinimap}
                    onPrintClick={handlePrint}
                />

                <InformationPanel items={infoPanelItems} />

                <div className="markdown-tools__body">
                    {isEditorVisible && (
                        <div className="markdown-tools__pane editorpane">
                            <CodeEditor
                                minimap={isMinimapEnabled}
                                wordWrap={isWordWrapEnabled}
                                onEditorMounted={handleEditorMount}
                                languageId="markdown"
                                onChange={handleTextChange}
                                height="100%"
                            />
                        </div>
                    )}
                    {isPreviewVisible && (
                        <div className="markdown-tools__pane">
                            <div ref={contentRef} className="markdown-tools__preview">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex, rehypeHighlight]}
                                >
                                    {currentFileInfo.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ContentContainerFlex>
    );
};

export default IndexPage;
