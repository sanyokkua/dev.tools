import ToolAbout from '@/controls/ToolAbout';
import { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useFileOpen } from '@/contexts/FileOpenContext';
import { useFileSaveDialog } from '@/contexts/FileSaveDialogContext';
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
import MermaidBlock from '@/elements/mermaid/MermaidBlock';
import CodeEditor from '../../components/elements/editor/CodeEditor';
import MarkdownToolbar from '../../components/elements/editor/MarkdownToolbar';

import { DEFAULT_FILE_NAME } from '@/common/constants';
import { FileInfo } from '@/common/file-types';
import { mapBoolean } from '@/common/formatting-tools';
import 'katex/dist/katex.min.css';
import ReactMarkdown, { type Components } from 'react-markdown';
import { useReactToPrint } from 'react-to-print';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import ContentContainerFlex from '../../components/layouts/ContentContainerFlex';

const markdownExtension = '.md';

const markdownComponents: Components = {
    code({ className, children, ...rest }) {
        const lang = /language-(\w+)/.exec(className ?? '')?.[1];
        if (lang === 'mermaid') {
            return <MermaidBlock src={String(children).trim()} />;
        }
        return (
            <code className={className} {...rest}>
                {children}
            </code>
        );
    },
};

const IndexPage: React.FC = () => {
    const { setPageTitle } = usePage();
    const { showFileOpenDialog } = useFileOpen();
    const { save, saveAs } = useFileSaveDialog();
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
    const savedEditorContent = useRef<string>('');

    const handleEditorMount = useCallback((props: EditorProperties) => {
        leftEditorRef.current = props.editor;
        setEditorContent(leftEditorRef, savedEditorContent.current);
    }, []);

    const handleNewFile = useCallback(() => {
        const emptyContent = '';
        savedEditorContent.current = emptyContent;
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
                savedEditorContent.current = fileInfo.content;
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
        save({
            fileName: currentFileInfo.name,
            fileExtension: currentFileInfo.extension,
            fileContent: content,
            availableExtensions: ['.md', '.txt'],
        });
    }, [currentFileInfo.name, currentFileInfo.extension, save]);

    const handleSaveFileAs = useCallback(() => {
        const content = getEditorContent(leftEditorRef);
        saveAs({
            fileName: currentFileInfo.name,
            fileExtension: currentFileInfo.extension,
            fileContent: content,
            availableExtensions: ['.md', '.txt'],
        });
    }, [currentFileInfo.name, currentFileInfo.extension, saveAs]);

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
        savedEditorContent.current = updatedContent;
        setCurrentFileInfo((prevState) => ({ ...prevState, content: updatedContent, size: updatedContent.length }));
    }, []);

    return (
        <ContentContainerFlex>
            <ToolAbout routeKey="markdown-tools">
                Write Markdown on the left and see a live, GitHub-flavored preview on the right — with tables, math
                (KaTeX), syntax-highlighted code, and <strong>embedded Mermaid diagrams</strong>. Toggle the
                editor/preview panes, word-wrap and minimap; <strong>Print / Export to PDF</strong>; open and save{' '}
                <code>.md</code> files. Renders entirely in the browser.
            </ToolAbout>
            <div className="markdown-tools">
                <div className="markdown-tools__header">
                    <h1>Markdown Tools</h1>
                </div>
                <MarkdownToolbar
                    onFileNewClick={handleNewFile}
                    onFileOpenClick={handleOpenFileDialog}
                    onFileSaveClick={handleSaveFile}
                    onFileSaveAsClick={handleSaveFileAs}
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

                <div className="markdown-tools__info card pad">
                    <span>WordWrap: {mapBoolean(isWordWrapEnabled)}</span>
                    <span>Minimap: {mapBoolean(isMinimapEnabled)}</span>
                    <span>MD Editor: {mapBoolean(isEditorVisible)}</span>
                    <span>MD Preview: {mapBoolean(isPreviewVisible)}</span>
                    <span>FileName: {currentFileInfo.name}</span>
                    <span>TextLength: {currentFileInfo.content.length}</span>
                </div>

                <div className="markdown-tools__body">
                    {isEditorVisible && (
                        <div className="markdown-tools__pane editorpane">
                            <div className="eh">
                                <span className="markdown-tools__filename">
                                    {currentFileInfo.fullName || `${currentFileInfo.name}${currentFileInfo.extension}`}
                                </span>
                            </div>
                            <div className="eb">
                                <CodeEditor
                                    minimap={isMinimapEnabled}
                                    wordWrap={isWordWrapEnabled}
                                    onEditorMounted={handleEditorMount}
                                    languageId="markdown"
                                    onChange={handleTextChange}
                                    height="100%"
                                />
                            </div>
                        </div>
                    )}
                    {isPreviewVisible && (
                        <div ref={contentRef} className="markdown-tools__pane card pad">
                            <div className="markdown-tools__preview">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex, rehypeHighlight]}
                                    components={markdownComponents}
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
