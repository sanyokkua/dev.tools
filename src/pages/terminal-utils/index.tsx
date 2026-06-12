import { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';

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
import ContentContainerFlex from '@/layouts/ContentContainerFlex';
import { StringUtils } from 'coreutilsts';
import CodeEditor from '../../components/elements/editor/CodeEditor';

type EditorLanguage = 'shell' | 'bat' | 'powershell';

const SYNTAX_OPTIONS: { value: EditorLanguage; label: string }[] = [
    { value: 'shell', label: 'Unix bash' },
    { value: 'bat', label: 'Windows bat' },
    { value: 'powershell', label: 'PowerShell' },
];

const IndexPage: React.FC = (): React.JSX.Element => {
    const { setPageTitle } = usePage();
    const { showToast } = useToast();

    useEffect(() => {
        setPageTitle('Terminal Utils');
    }, [setPageTitle]);

    const [languageId, setLanguageId] = useState<EditorLanguage>('shell');

    const editorOriginalRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const editorResultRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    const handleOriginalEditorMount = useCallback((props: EditorProperties) => {
        editorOriginalRef.current = props.editor;
    }, []);

    const handleResultEditorMount = useCallback((props: EditorProperties) => {
        editorResultRef.current = props.editor;
    }, []);

    const handlePaste = useCallback((): void => {
        pasteFromClipboardToEditor(editorOriginalRef, () => {}, showToast);
    }, [showToast]);

    const handleCopy = useCallback((): void => {
        copyToClipboardFromEditor(editorResultRef, showToast);
    }, [showToast]);

    const handleClearInput = useCallback((): void => {
        setEditorContent(editorOriginalRef, '');
    }, []);

    const handleClearResult = useCallback((): void => {
        setEditorContent(editorResultRef, '');
    }, []);

    const handleJoinWithSingleAmp = useCallback((): void => {
        const content = getEditorContent(editorOriginalRef);
        const parts = StringUtils.splitString(content).map((s) => s.trim());
        const joined = StringUtils.joinStrings(parts, ' & ');
        setEditorContent(editorResultRef, joined);
    }, []);

    const handleJoinWithDoubleAmp = useCallback((): void => {
        const content = getEditorContent(editorOriginalRef);
        const parts = StringUtils.splitString(content).map((s) => s.trim());
        const joined = StringUtils.joinStrings(parts, ' && ');
        setEditorContent(editorResultRef, joined);
    }, []);

    const handleSyntaxChange = (lang: EditorLanguage): void => {
        setLanguageId(lang);
        showToast({ message: `Changed Syntax to ${lang}`, type: ToastType.INFO });
    };

    return (
        <ContentContainerFlex>
            <div className="terminal-utils">
                <div>
                    <h1>Terminal Utilities</h1>
                    <p>Join multiple commands or lines into a single command using a chosen separator.</p>
                </div>

                <div className="terminal-utils__toolbar">
                    <span className="terminal-utils__syntax-label">Syntax:</span>
                    <div className="seg-control" role="group" aria-label="Syntax">
                        {SYNTAX_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleSyntaxChange(opt.value)}
                                aria-pressed={languageId === opt.value}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="terminal-utils__pane">
                    <div className="terminal-utils__pane-header">
                        <span className="terminal-utils__pane-label">Input (one command per line)</span>
                        <button type="button" className="button-base button-ghost button-small" onClick={handlePaste}>
                            Paste
                        </button>
                        <button
                            type="button"
                            className="button-base button-ghost button-small"
                            onClick={handleClearInput}
                        >
                            Clear
                        </button>
                        <span className="terminal-utils__pane-spacer" />
                        <button
                            type="button"
                            className="button-base button-filled button-small"
                            onClick={handleJoinWithSingleAmp}
                        >
                            Join with &amp;
                        </button>
                        <button
                            type="button"
                            className="button-base button-solid button-small"
                            onClick={handleJoinWithDoubleAmp}
                        >
                            Join with &amp;&amp;
                        </button>
                    </div>
                    <div className="terminal-utils__pane-editor">
                        <CodeEditor
                            minimap={false}
                            onEditorMounted={handleOriginalEditorMount}
                            languageId={languageId}
                            height="100%"
                        />
                    </div>
                </div>

                <div className="terminal-utils__pane">
                    <div className="terminal-utils__pane-header">
                        <span className="terminal-utils__pane-label">Result (single line)</span>
                        <span className="terminal-utils__pane-spacer" />
                        <button type="button" className="button-base button-ghost button-small" onClick={handleCopy}>
                            Copy
                        </button>
                        <button
                            type="button"
                            className="button-base button-ghost button-small"
                            onClick={handleClearResult}
                        >
                            Clear
                        </button>
                    </div>
                    <div className="terminal-utils__pane-editor">
                        <CodeEditor
                            minimap={false}
                            onEditorMounted={handleResultEditorMount}
                            languageId={languageId}
                            height="100%"
                        />
                    </div>
                </div>
            </div>
        </ContentContainerFlex>
    );
};

export default IndexPage;
