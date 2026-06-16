'use client';
import { DEFAULT_EXTENSION, DEFAULT_MIME_TYPE } from '@/common/constants';
import {
    escapeJsonString,
    formatJson,
    sortJsonKeys,
    unescapeJsonString,
    validateJson,
    type JsonValidationResult,
} from '@/common/formatting-tools';
import { queryJsonPath } from '@/common/json-query';
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
    { value: 'query', label: 'Query (JSONPath)' },
];

const JsonFormatterPage: React.FC = () => {
    const [indent, setIndent] = useState<IndentValue>('2');
    const [mode, setMode] = useState<Mode>('format');
    const [jsonPathInput, setJsonPathInput] = useState<string>('');
    const [matchCount, setMatchCount] = useState<number | null>(null);
    const [validState, setValidState] = useState<JsonValidationResult | null>(null);
    const leftEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const rightEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const [supportedExtensions, setSupportedExtensions] = useState<string[]>([]);
    const contentListenerRef = useRef<IDisposable | null>(null);

    const { showFileOpenDialog } = useFileOpen();
    const { showFileSaveDialog } = useFileSaveDialog();
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
            setValidState(text.trim() ? validateJson(text) : null);
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
            const result = formatJson(getEditorContent(leftEditorRef), getIndentValue());
            setEditorContent(rightEditorRef, result);
            showToast({ message: 'Beautified', type: ToastType.INFO });
        } catch (e) {
            toastError(e);
        }
    }, [getIndentValue, showToast, toastError]);

    const handleMinify = useCallback((): void => {
        try {
            const result = formatJson(getEditorContent(leftEditorRef), 0);
            setEditorContent(rightEditorRef, result);
            showToast({ message: 'Minified', type: ToastType.INFO });
        } catch (e) {
            toastError(e);
        }
    }, [showToast, toastError]);

    const handleSortKeys = useCallback((): void => {
        try {
            const result = sortJsonKeys(getEditorContent(leftEditorRef), getIndentValue());
            setEditorContent(rightEditorRef, result);
            showToast({ message: 'Keys sorted', type: ToastType.INFO });
        } catch (e) {
            toastError(e);
        }
    }, [getIndentValue, showToast, toastError]);

    const handleValidate = useCallback((): void => {
        const input = getEditorContent(leftEditorRef);
        if (!input.trim()) {
            showToast({ message: 'Nothing to validate', type: ToastType.WARNING });
            return;
        }
        const result = validateJson(input);
        if (result.valid) {
            setEditorContent(rightEditorRef, JSON.stringify({ valid: true }, null, 2));
        } else {
            setEditorContent(
                rightEditorRef,
                JSON.stringify(
                    {
                        valid: false,
                        error: result.error,
                        ...(result.line != null && { line: result.line, column: result.column }),
                    },
                    null,
                    2,
                ),
            );
        }
        showToast({
            message: result.valid ? 'Valid JSON' : 'Invalid JSON',
            type: result.valid ? ToastType.SUCCESS : ToastType.ERROR,
        });
    }, [showToast]);

    const handleEscape = useCallback((): void => {
        try {
            const result = escapeJsonString(getEditorContent(leftEditorRef));
            setEditorContent(rightEditorRef, result);
            showToast({ message: 'Escaped', type: ToastType.INFO });
        } catch (e) {
            toastError(e);
        }
    }, [showToast, toastError]);

    const handleUnescape = useCallback((): void => {
        try {
            const result = unescapeJsonString(getEditorContent(leftEditorRef));
            setEditorContent(rightEditorRef, result);
            showToast({ message: 'Unescaped', type: ToastType.INFO });
        } catch (e) {
            toastError(e);
        }
    }, [showToast, toastError]);

    const handleQuery = useCallback(async (): Promise<void> => {
        const input = getEditorContent(leftEditorRef);
        if (!input.trim()) {
            showToast({ message: 'Nothing to query', type: ToastType.WARNING });
            return;
        }
        if (!jsonPathInput.trim()) {
            showToast({ message: 'Enter a JSONPath expression', type: ToastType.WARNING });
            return;
        }
        setMatchCount(null);
        const result = await queryJsonPath(input, jsonPathInput);
        if ('error' in result) {
            toastError(result.error);
            setEditorContent(rightEditorRef, '');
            return;
        }
        setMatchCount(result.matches.length);
        setEditorContent(rightEditorRef, JSON.stringify(result.matches, null, getIndentValue()));
        showToast({
            message: `${result.matches.length} match${result.matches.length === 1 ? '' : 'es'}`,
            type: ToastType.INFO,
        });
    }, [jsonPathInput, getIndentValue, showToast, toastError]);

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
        showFileSaveDialog({
            fileContent: getEditorContent(rightEditorRef),
            fileName: 'output',
            fileExtension: DEFAULT_EXTENSION,
            mimeType: DEFAULT_MIME_TYPE,
            availableExtensions: supportedExtensions,
        });
    }, [showFileSaveDialog, supportedExtensions]);

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
                                {validState.valid ? 'Valid JSON' : 'Invalid JSON'}
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
                        <CodeEditor minimap={false} onEditorMounted={handleLeftMount} languageId="json" height="100%" />
                    </div>
                </div>
            </ContentContainerGridChild>

            <ContentContainerGridChild>
                <div
                    className="card pad"
                    style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 'var(--s2)',
                        }}
                    >
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>Mode</span>
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
                                <button className="func-btn" onClick={handleSortKeys}>
                                    Sort Keys (A→Z)
                                </button>
                                <button className="func-btn" onClick={handleValidate}>
                                    Validate
                                </button>
                                <button className="func-btn" onClick={handleEscape}>
                                    Escape String
                                </button>
                                <button className="func-btn" onClick={handleUnescape}>
                                    Unescape String
                                </button>
                            </ScrollableContentContainer>
                        </>
                    )}

                    {mode === 'query' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                            <div className="json-formatter-field">
                                <label htmlFor="jsonpath-input">JSONPath</label>
                                <Input
                                    id="jsonpath-input"
                                    value={jsonPathInput}
                                    onChange={setJsonPathInput}
                                    placeholder="$.store.book[*].title"
                                    block
                                />
                            </div>
                            {matchCount !== null && (
                                <span className="pill muted">
                                    {matchCount} {matchCount === 1 ? 'match' : 'matches'}
                                </span>
                            )}
                            <button className="func-btn" onClick={() => void handleQuery()}>
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
                            languageId="json"
                            height="100%"
                        />
                    </div>
                </div>
            </ContentContainerGridChild>
        </ContentContainerGrid>
    );
};

export default JsonFormatterPage;
