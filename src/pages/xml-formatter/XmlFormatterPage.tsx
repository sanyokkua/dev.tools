'use client';
import { DEFAULT_EXTENSION, DEFAULT_MIME_TYPE } from '@/common/constants';
import { formatXml, minifyXml, queryXPath, validateXml, type XmlValidationResult } from '@/common/xml-formatting-tools';
import { useFileOpen } from '@/contexts/FileOpenContext';
import { useFileSaveDialog } from '@/contexts/FileSaveDialogContext';
import { useToast } from '@/contexts/ToasterContext';
import Button from '@/controls/Button';
import Input from '@/controls/Input';
import SegmentedControl, { SegmentedOption } from '@/controls/SegmentedControl';
import { ToastType } from '@/controls/toaster/types';
import { editor, type IDisposable } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import CodeEditor from '../../components/elements/editor/CodeEditor';
import EditorToolbar from '../../components/elements/editor/EditorToolbar';
import {
    copyToClipboardFromEditor,
    getEditorContent,
    pasteFromClipboardToEditor,
    setEditorContent,
} from '../../components/elements/editor/code-editor-utils';
import { EditorProperties } from '../../components/elements/editor/types';
import ContentContainerGrid from '../../components/layouts/ContentContainerGrid';
import ContentContainerGridChild from '../../components/layouts/ContentContainerGridChild';
import ScrollableContentContainer from '../../components/layouts/ScrollableContentContainer';

type IndentValue = '2' | '4' | '\t';
type Mode = 'format' | 'query';

const INDENT_OPTIONS: SegmentedOption[] = [
    { value: '2', label: '2' },
    { value: '4', label: '4' },
    { value: '\t', label: 'Tab' },
];

const MODE_OPTIONS: SegmentedOption[] = [
    { value: 'format', label: 'Format' },
    { value: 'query', label: 'Query (XPath)' },
];

const XmlFormatterPage: React.FC = () => {
    const [indent, setIndent] = useState<IndentValue>('2');
    const [mode, setMode] = useState<Mode>('format');
    const [xpathInput, setXpathInput] = useState<string>('');
    const [queryResultPill, setQueryResultPill] = useState<string | null>(null);
    const [validState, setValidState] = useState<XmlValidationResult | null>(null);
    const leftEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const rightEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const [supportedExtensions, setSupportedExtensions] = useState<string[]>([]);
    const contentListenerRef = useRef<IDisposable | null>(null);

    const { showFileOpenDialog } = useFileOpen();
    const { saveAs } = useFileSaveDialog();
    const { showToast } = useToast();

    const toastError = useCallback(
        (e: unknown): void => {
            showToast({ message: `Error: ${e instanceof Error ? e.message : String(e)}`, type: ToastType.ERROR });
        },
        [showToast],
    );

    const handleLeftMount = useCallback((props: EditorProperties) => {
        leftEditorRef.current = props.editor;
        setSupportedExtensions(props.supportedExtensions);
        contentListenerRef.current?.dispose();
        const updateValidation = (text: string): void => {
            setValidState(text.trim() ? validateXml(text) : null);
        };
        contentListenerRef.current = props.editor.onDidChangeModelContent(() => {
            updateValidation(props.editor.getValue());
        });
        updateValidation(props.editor.getValue());
    }, []);

    useEffect((): (() => void) => {
        return (): void => {
            contentListenerRef.current?.dispose();
        };
    }, []);

    const handleRightMount = useCallback((props: EditorProperties) => {
        rightEditorRef.current = props.editor;
    }, []);

    const getIndentValue = useCallback((): number | string => (indent === '\t' ? '\t' : Number(indent)), [indent]);

    const handleBeautify = useCallback((): void => {
        try {
            const result = formatXml(getEditorContent(leftEditorRef), getIndentValue());
            setEditorContent(rightEditorRef, result);
            showToast({ message: 'Beautified', type: ToastType.INFO });
        } catch (e) {
            toastError(e);
        }
    }, [getIndentValue, showToast, toastError]);

    const handleMinify = useCallback((): void => {
        try {
            const result = minifyXml(getEditorContent(leftEditorRef));
            setEditorContent(rightEditorRef, result);
            showToast({ message: 'Minified', type: ToastType.INFO });
        } catch (e) {
            toastError(e);
        }
    }, [showToast, toastError]);

    const handleValidate = useCallback((): void => {
        const input = getEditorContent(leftEditorRef);
        if (!input.trim()) {
            showToast({ message: 'Nothing to validate', type: ToastType.WARNING });
            return;
        }
        const result = validateXml(input);
        if (result.valid) {
            setEditorContent(rightEditorRef, '<result><valid>true</valid></result>');
        } else {
            setEditorContent(rightEditorRef, `<result><valid>false</valid><error>${result.error}</error></result>`);
        }
        showToast({
            message: result.valid ? 'Valid XML' : 'Invalid XML',
            type: result.valid ? ToastType.SUCCESS : ToastType.ERROR,
        });
    }, [showToast]);

    const handleQuery = useCallback((): void => {
        const input = getEditorContent(leftEditorRef);
        if (!input.trim()) {
            showToast({ message: 'Nothing to query', type: ToastType.WARNING });
            return;
        }
        if (!xpathInput.trim()) {
            showToast({ message: 'Enter an XPath expression', type: ToastType.WARNING });
            return;
        }
        setQueryResultPill(null);
        const result = queryXPath(input, xpathInput);
        if ('error' in result) {
            toastError(result.error);
            setEditorContent(rightEditorRef, '');
            return;
        }
        if (result.type === 'nodes') {
            setQueryResultPill(`${result.count} node${result.count === 1 ? '' : 's'}`);
            setEditorContent(rightEditorRef, result.nodes.join('\n'));
        } else if (result.type === 'string') {
            setQueryResultPill('string');
            setEditorContent(rightEditorRef, result.value);
        } else if (result.type === 'number') {
            setQueryResultPill('number');
            setEditorContent(rightEditorRef, String(result.value));
        } else if (result.type === 'boolean') {
            setQueryResultPill('boolean');
            setEditorContent(rightEditorRef, String(result.value));
        }
    }, [xpathInput, showToast, toastError]);

    const handleLeftOpen = useCallback((): void => {
        showFileOpenDialog({
            supportedFiles: supportedExtensions,
            onSuccess: (fileInfo) => {
                if (!fileInfo) {
                    showToast({ message: 'No file chosen', type: ToastType.WARNING });
                    return;
                }
                setEditorContent(leftEditorRef, fileInfo.content);
                showToast({ message: 'File opened', type: ToastType.INFO });
            },
            onFailure: (err) => {
                console.error(err);
                showToast({ message: 'Could not open file', type: ToastType.ERROR });
            },
        });
    }, [showFileOpenDialog, showToast, supportedExtensions]);

    const handleLeftPaste = useCallback(
        (): void => pasteFromClipboardToEditor(leftEditorRef, () => {}, showToast),
        [showToast],
    );
    const handleLeftClear = useCallback((): void => setEditorContent(leftEditorRef, ''), []);

    const handleRightSave = useCallback((): void => {
        saveAs({
            fileContent: getEditorContent(rightEditorRef),
            fileName: 'output',
            fileExtension: DEFAULT_EXTENSION,
            mimeType: DEFAULT_MIME_TYPE,
            availableExtensions: supportedExtensions,
        });
    }, [saveAs, supportedExtensions]);

    const handleRightCopy = useCallback((): void => copyToClipboardFromEditor(rightEditorRef, showToast), [showToast]);
    const handleRightClear = useCallback((): void => setEditorContent(rightEditorRef, ''), []);

    const handleUseAsInput = useCallback((): void => {
        const out = getEditorContent(rightEditorRef);
        setEditorContent(leftEditorRef, out);
        setEditorContent(rightEditorRef, '');
    }, []);

    return (
        <ContentContainerGrid>
            <ContentContainerGridChild>
                <div className="editorpane">
                    <EditorToolbar>
                        <Button text="Open" variant="text" size="small" onClick={handleLeftOpen} />
                        <Button text="Paste" variant="text" size="small" onClick={handleLeftPaste} />
                        <Button text="Clear" variant="text" size="small" onClick={handleLeftClear} />
                        {validState !== null && (
                            <span className={`pill ${validState.valid ? 'ok' : 'no'}`} style={{ marginLeft: 'auto' }}>
                                {validState.valid ? 'Valid XML' : 'Invalid XML'}
                            </span>
                        )}
                    </EditorToolbar>
                    {validState && !validState.valid && (
                        <p className="json-error-msg">
                            {validState.error}
                            {validState.line != null && ` (line ${validState.line}, col ${validState.column})`}
                        </p>
                    )}
                    <div className="eb">
                        <CodeEditor minimap={false} onEditorMounted={handleLeftMount} languageId="xml" height="100%" />
                    </div>
                </div>
            </ContentContainerGridChild>

            <ContentContainerGridChild>
                <div
                    className="card pad"
                    style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                >
                    <div className="json-formatter-field">
                        <label style={{ fontWeight: 600, fontSize: '13px' }}>Mode</label>
                        <SegmentedControl
                            options={MODE_OPTIONS}
                            value={mode}
                            onChange={(v) => setMode(v as Mode)}
                            aria-label="Mode"
                        />
                    </div>

                    {mode === 'format' && (
                        <>
                            <div className="json-formatter-field">
                                <label>Indent</label>
                                <SegmentedControl
                                    options={INDENT_OPTIONS}
                                    value={indent}
                                    onChange={(v) => setIndent(v as IndentValue)}
                                    aria-label="Indent"
                                />
                            </div>
                            <ScrollableContentContainer>
                                <button className="func-btn" onClick={handleBeautify}>
                                    Beautify
                                </button>
                                <button className="func-btn" onClick={handleMinify}>
                                    Minify
                                </button>
                                <button className="func-btn" onClick={handleValidate}>
                                    Validate
                                </button>
                            </ScrollableContentContainer>
                        </>
                    )}

                    {mode === 'query' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                            <div className="json-formatter-field">
                                <label htmlFor="xpath-input">XPath</label>
                                <Input
                                    id="xpath-input"
                                    value={xpathInput}
                                    onChange={setXpathInput}
                                    placeholder="//element[@attr]"
                                    block
                                />
                            </div>
                            {queryResultPill !== null && <span className="pill muted">{queryResultPill}</span>}
                            <button className="func-btn" onClick={handleQuery}>
                                Run Query
                            </button>
                        </div>
                    )}
                </div>
            </ContentContainerGridChild>

            <ContentContainerGridChild>
                <div className="editorpane">
                    <EditorToolbar>
                        <Button text="Save" variant="text" size="small" onClick={handleRightSave} />
                        <Button text="Copy" variant="text" size="small" onClick={handleRightCopy} />
                        <Button text="Clear" variant="text" size="small" onClick={handleRightClear} />
                        <Button text="Use as Input" variant="text" size="small" icon="⇄" onClick={handleUseAsInput} />
                    </EditorToolbar>
                    <div className="eb">
                        <CodeEditor
                            minimap={false}
                            wordWrap={true}
                            isReadOnly
                            onEditorMounted={handleRightMount}
                            languageId="xml"
                            height="100%"
                        />
                    </div>
                </div>
            </ContentContainerGridChild>
        </ContentContainerGrid>
    );
};

export default XmlFormatterPage;
