import { md5 } from 'js-md5';
import { editor, type IDisposable } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { copyToClipboard } from '@/common/clipboard-utils';
import { useToast } from '@/contexts/ToasterContext';
import Button from '@/controls/Button';
import Switch from '@/controls/Switch';
import { ToastType } from '@/controls/toaster/types';
import CodeEditor from '../../components/elements/editor/CodeEditor';
import { pasteFromClipboardToEditor, setEditorContent } from '../../components/elements/editor/code-editor-utils';
import { EditorProperties } from '../../components/elements/editor/types';

type HashRow = { alg: string; subtleAlg?: string; digest: string | null; loading: boolean };

const ALGORITHMS: HashRow[] = [
    { alg: 'MD5', subtleAlg: undefined, digest: null, loading: false },
    { alg: 'SHA-1', subtleAlg: 'SHA-1', digest: null, loading: false },
    { alg: 'SHA-256', subtleAlg: 'SHA-256', digest: null, loading: false },
    { alg: 'SHA-384', subtleAlg: 'SHA-384', digest: null, loading: false },
    { alg: 'SHA-512', subtleAlg: 'SHA-512', digest: null, loading: false },
];

const HashingPage: React.FC = () => {
    const [rows, setRows] = useState<HashRow[]>(ALGORITHMS);
    const [upperHex, setUpperHex] = useState(false);
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const contentListenerRef = useRef<IDisposable | null>(null);
    const { showToast } = useToast();

    useEffect((): (() => void) => {
        return (): void => {
            contentListenerRef.current?.dispose();
        };
    }, []);

    const computeHashes = useCallback(async (input: string | ArrayBuffer): Promise<void> => {
        setRows(ALGORITHMS.map((r) => ({ ...r, digest: null, loading: true })));
        const isBuffer = input instanceof ArrayBuffer;

        const results = await Promise.allSettled(
            ALGORITHMS.map(async (r) => {
                if (r.alg === 'MD5') {
                    return isBuffer ? md5(new Uint8Array(input as ArrayBuffer)) : md5(input as string);
                }
                const buf = isBuffer ? (input as ArrayBuffer) : new TextEncoder().encode(input as string);
                const hash = await crypto.subtle.digest(r.subtleAlg!, buf);
                return Array.from(new Uint8Array(hash))
                    .map((b) => b.toString(16).padStart(2, '0'))
                    .join('');
            }),
        );

        setRows(
            ALGORITHMS.map((r, i) => ({
                ...r,
                loading: false,
                digest: results[i].status === 'fulfilled' ? (results[i] as PromiseFulfilledResult<string>).value : null,
            })),
        );
    }, []);

    const handleMount = useCallback(
        (props: EditorProperties): void => {
            editorRef.current = props.editor;
            contentListenerRef.current?.dispose();
            contentListenerRef.current = props.editor.onDidChangeModelContent(() => {
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => {
                    void computeHashes(props.editor.getValue());
                }, 300);
            });
        },
        [computeHashes],
    );

    const handleFileSelect = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
            const file = e.target.files?.[0];
            if (!file) return;
            const buffer = await file.arrayBuffer();
            void computeHashes(buffer);
            e.target.value = '';
        },
        [computeHashes],
    );

    const handleOpenFile = useCallback((): void => {
        fileInputRef.current?.click();
    }, []);

    const handlePaste = useCallback((): void => {
        pasteFromClipboardToEditor(editorRef, () => {}, showToast);
    }, [showToast]);

    const handleClear = useCallback((): void => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setEditorContent(editorRef, '');
        setRows(ALGORITHMS.map((r) => ({ ...r, digest: null, loading: false })));
    }, []);

    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((): void => {
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        async (e: React.DragEvent<HTMLDivElement>): Promise<void> => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files[0];
            if (!file) return;
            const buffer = await file.arrayBuffer();
            void computeHashes(buffer);
        },
        [computeHashes],
    );

    const display = useCallback(
        (digest: string | null): string => {
            if (!digest) return '';
            return upperHex ? digest.toUpperCase() : digest;
        },
        [upperHex],
    );

    const handleCopy = useCallback(
        (digest: string | null): void => {
            if (!digest) return;
            const text = display(digest);
            copyToClipboard(text);
            showToast({ message: 'Copied to clipboard', type: ToastType.INFO });
        },
        [display, showToast],
    );

    return (
        <div className="hashing-layout">
            {/* Input pane */}
            <div
                className={`hashing-input-pane${isDragOver ? ' hashing-input-pane--drag-over' : ''}`}
                data-testid="hashing-input-pane"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="hashing-toolbar">
                    <Button
                        text="Open File"
                        variant="outlined"
                        size="small"
                        colorStyle="secondary-color"
                        onClick={handleOpenFile}
                    />
                    <Button
                        text="Paste"
                        variant="outlined"
                        size="small"
                        colorStyle="secondary-color"
                        onClick={handlePaste}
                    />
                    <Button
                        text="Clear"
                        variant="outlined"
                        size="small"
                        colorStyle="secondary-color"
                        onClick={handleClear}
                    />
                    <Switch checked={upperHex} onChange={setUpperHex} label="UPPERCASE" />
                    <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileSelect} />
                </div>
                <div className="editor-fill">
                    <CodeEditor minimap={false} onEditorMounted={handleMount} height="100%" />
                </div>
            </div>

            {/* Results pane */}
            <div className="hashing-results-pane">
                <h3>Hash Results</h3>
                <table className="hash-table">
                    <thead>
                        <tr>
                            <th>Algorithm</th>
                            <th>Digest</th>
                            <th style={{ width: 64 }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.alg}>
                                <td>
                                    <strong>{r.alg}</strong>
                                </td>
                                <td className="hash-digest">
                                    {r.loading ? (
                                        <span className="spinner" aria-label="Computing…" />
                                    ) : (
                                        display(r.digest)
                                    )}
                                </td>
                                <td>
                                    <Button
                                        text="Copy"
                                        variant="outlined"
                                        size="small"
                                        colorStyle="secondary-color"
                                        disabled={!r.digest || r.loading}
                                        onClick={() => handleCopy(r.digest)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HashingPage;
