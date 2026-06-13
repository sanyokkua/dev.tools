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
import { useFileOpen } from '@/contexts/FileOpenContext';
import { useFileSaveDialog } from '@/contexts/FileSaveDialogContext';
import { useToast } from '@/contexts/ToasterContext';
import SegmentedControl, { SegmentedOption } from '@/controls/SegmentedControl';
import { ToastType } from '@/controls/toaster/types';
import { editor, type IDisposable } from 'monaco-editor';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CodeEditor from '../../components/elements/editor/CodeEditor';
import {
    copyToClipboardFromEditor,
    getEditorContent,
    pasteFromClipboardToEditor,
    setEditorContent,
} from '../../components/elements/editor/code-editor-utils';
import { EditorProperties } from '../../components/elements/editor/types';
import Menubar from '../../components/elements/navigation/menubar/Menubar';
import { MenuBuilder } from '../../components/elements/navigation/menubar/utils';
import ContentContainerGrid from '../../components/layouts/ContentContainerGrid';
import ContentContainerGridChild from '../../components/layouts/ContentContainerGridChild';
import ScrollableContentContainer from '../../components/layouts/ScrollableContentContainer';

type IndentValue = '2' | '4' | '\t';

const INDENT_OPTIONS: SegmentedOption[] = [
    { value: '2', label: '2' },
    { value: '4', label: '4' },
    { value: '\t', label: 'Tab' },
];

const JsonFormatterPage: React.FC = () => {
    const [indent, setIndent] = useState<IndentValue>('2');
    const [validState, setValidState] = useState<JsonValidationResult | null>(null);
    const leftEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const rightEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const [supportedExtensions, setSupportedExtensions] = useState<string[]>([]);
    const contentListenerRef = useRef<IDisposable | null>(null);

    const { showFileOpenDialog } = useFileOpen();
    const { showFileSaveDialog } = useFileSaveDialog();
    const { showToast } = useToast();

    // Fix 4: Reusable error toast helper
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

    // Fix 3: Wrap operation handlers in useCallback
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

    // Fix 1 & 2: Output valid JSON and guard empty input
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

    // Fix 3: Wrap menu handlers in useCallback
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

    // Fix 3: Memoize menu arrays
    const leftMenu = useMemo(
        () =>
            MenuBuilder.newBuilder()
                .addButton('open-file', 'Open', handleLeftOpen)
                .addButton('paste', 'Paste', handleLeftPaste)
                .addButton('clear', 'Clear', handleLeftClear)
                .build(),
        [handleLeftOpen, handleLeftPaste, handleLeftClear],
    );

    const rightMenu = useMemo(
        () =>
            MenuBuilder.newBuilder()
                .addButton('save', 'Save', handleRightSave)
                .addButton('copy', 'Copy', handleRightCopy)
                .addButton('clear', 'Clear', handleRightClear)
                .addButton('use-input', 'Use as Input', handleUseAsInput)
                .build(),
        [handleRightSave, handleRightCopy, handleRightClear, handleUseAsInput],
    );

    return (
        <ContentContainerGrid>
            <ContentContainerGridChild>
                <Menubar menuItems={leftMenu} />
                {validState !== null && (
                    <span className={validState.valid ? 'badge badge-ok' : 'badge badge-err'}>
                        {validState.valid ? 'Valid JSON' : 'Invalid JSON'}
                    </span>
                )}
                {validState && !validState.valid && (
                    <p className="json-error-msg">
                        {validState.error}
                        {validState.line != null && ` (line ${validState.line}, col ${validState.column})`}
                    </p>
                )}
                <div className="editor-fill">
                    <CodeEditor minimap={false} onEditorMounted={handleLeftMount} languageId="json" height="100%" />
                </div>
            </ContentContainerGridChild>

            <ContentContainerGridChild>
                <h3>JSON Formatter</h3>
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
            </ContentContainerGridChild>

            <ContentContainerGridChild>
                <Menubar menuItems={rightMenu} />
                <div className="editor-fill">
                    <CodeEditor
                        minimap={false}
                        wordWrap={true}
                        isReadOnly
                        onEditorMounted={handleRightMount}
                        languageId="json"
                        height="100%"
                    />
                </div>
            </ContentContainerGridChild>
        </ContentContainerGrid>
    );
};

export default JsonFormatterPage;
