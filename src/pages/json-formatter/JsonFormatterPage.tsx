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
import Button from '@/controls/Button';
import SegmentedControl, { SegmentedOption } from '@/controls/SegmentedControl';
import { ToastType } from '@/controls/toaster/types';
import { editor, type IDisposable } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

    const getIndentValue = (): number | string => (indent === '\t' ? '\t' : Number(indent));

    const handleBeautify = (): void => {
        try {
            const result = formatJson(getEditorContent(leftEditorRef), getIndentValue());
            setEditorContent(rightEditorRef, result);
            showToast({ message: 'Beautified', type: ToastType.INFO });
        } catch (e) {
            showToast({ message: `Error: ${e instanceof Error ? e.message : String(e)}`, type: ToastType.ERROR });
        }
    };

    const handleMinify = (): void => {
        try {
            const result = formatJson(getEditorContent(leftEditorRef), 0);
            setEditorContent(rightEditorRef, result);
            showToast({ message: 'Minified', type: ToastType.INFO });
        } catch (e) {
            showToast({ message: `Error: ${e instanceof Error ? e.message : String(e)}`, type: ToastType.ERROR });
        }
    };

    const handleSortKeys = (): void => {
        try {
            const result = sortJsonKeys(getEditorContent(leftEditorRef), getIndentValue());
            setEditorContent(rightEditorRef, result);
            showToast({ message: 'Keys sorted', type: ToastType.INFO });
        } catch (e) {
            showToast({ message: `Error: ${e instanceof Error ? e.message : String(e)}`, type: ToastType.ERROR });
        }
    };

    const handleValidate = (): void => {
        const input = getEditorContent(leftEditorRef);
        const result = validateJson(input);
        if (result.valid) {
            setEditorContent(rightEditorRef, 'Valid JSON');
        } else {
            const detail = result.line != null ? ` (line ${result.line}, col ${result.column})` : '';
            setEditorContent(rightEditorRef, `Invalid JSON: ${result.error}${detail}`);
        }
        showToast({
            message: result.valid ? 'Valid JSON' : 'Invalid JSON',
            type: result.valid ? ToastType.SUCCESS : ToastType.ERROR,
        });
    };

    const handleEscape = (): void => {
        try {
            const result = escapeJsonString(getEditorContent(leftEditorRef));
            setEditorContent(rightEditorRef, result);
            showToast({ message: 'Escaped', type: ToastType.INFO });
        } catch (e) {
            showToast({ message: `Error: ${e instanceof Error ? e.message : String(e)}`, type: ToastType.ERROR });
        }
    };

    const handleUnescape = (): void => {
        try {
            const result = unescapeJsonString(getEditorContent(leftEditorRef));
            setEditorContent(rightEditorRef, result);
            showToast({ message: 'Unescaped', type: ToastType.INFO });
        } catch (e) {
            showToast({ message: `Error: ${e instanceof Error ? e.message : String(e)}`, type: ToastType.ERROR });
        }
    };

    const handleLeftOpen = (): void => {
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
    };

    const handleLeftPaste = (): void => pasteFromClipboardToEditor(leftEditorRef, () => {}, showToast);
    const handleLeftClear = (): void => setEditorContent(leftEditorRef, '');

    const handleRightSave = (): void => {
        showFileSaveDialog({
            fileContent: getEditorContent(rightEditorRef),
            fileName: 'output',
            fileExtension: DEFAULT_EXTENSION,
            mimeType: DEFAULT_MIME_TYPE,
            availableExtensions: supportedExtensions,
        });
    };

    const handleRightCopy = (): void => copyToClipboardFromEditor(rightEditorRef, showToast);
    const handleRightClear = (): void => setEditorContent(rightEditorRef, '');

    const handleUseAsInput = (): void => {
        const out = getEditorContent(rightEditorRef);
        setEditorContent(leftEditorRef, out);
        setEditorContent(rightEditorRef, '');
    };

    const leftMenu = MenuBuilder.newBuilder()
        .addButton('open-file', 'Open', handleLeftOpen)
        .addButton('paste', 'Paste', handleLeftPaste)
        .addButton('clear', 'Clear', handleLeftClear)
        .build();

    const rightMenu = MenuBuilder.newBuilder()
        .addButton('save', 'Save', handleRightSave)
        .addButton('copy', 'Copy', handleRightCopy)
        .addButton('clear', 'Clear', handleRightClear)
        .addButton('use-input', 'Use as Input', handleUseAsInput)
        .build();

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
                <CodeEditor minimap={false} onEditorMounted={handleLeftMount} languageId="json" />
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
                    <Button text="Beautify" variant="solid" colorStyle="primary-color" block onClick={handleBeautify} />
                    <Button text="Minify" variant="solid" colorStyle="primary-color" block onClick={handleMinify} />
                    <Button
                        text="Sort Keys (A→Z)"
                        variant="solid"
                        colorStyle="primary-color"
                        block
                        onClick={handleSortKeys}
                    />
                    <Button text="Validate" variant="solid" colorStyle="primary-color" block onClick={handleValidate} />
                    <Button
                        text="Escape String"
                        variant="solid"
                        colorStyle="primary-color"
                        block
                        onClick={handleEscape}
                    />
                    <Button
                        text="Unescape String"
                        variant="solid"
                        colorStyle="primary-color"
                        block
                        onClick={handleUnescape}
                    />
                </ScrollableContentContainer>
            </ContentContainerGridChild>

            <ContentContainerGridChild>
                <Menubar menuItems={rightMenu} />
                <CodeEditor
                    minimap={false}
                    wordWrap={true}
                    isReadOnly
                    onEditorMounted={handleRightMount}
                    languageId="json"
                />
            </ContentContainerGridChild>
        </ContentContainerGrid>
    );
};

export default JsonFormatterPage;
