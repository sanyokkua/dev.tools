import { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { usePage } from '@/contexts/PageContext';
import { useToast } from '@/contexts/ToasterContext';
import Button from '@/controls/Button';
import SegmentedControl, { type SegmentedOption } from '@/controls/SegmentedControl';
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
import EditorToolbar from '../../components/elements/editor/EditorToolbar';

type EditorLanguage = 'shell' | 'bat' | 'powershell';

const SYNTAX_OPTIONS: SegmentedOption[] = [
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

    const handleSyntaxChange = (lang: string): void => {
        setLanguageId(lang as EditorLanguage);
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
                    <SegmentedControl
                        options={SYNTAX_OPTIONS}
                        value={languageId}
                        onChange={handleSyntaxChange}
                        aria-label="Syntax"
                    />
                </div>

                <div className="editorpane">
                    <EditorToolbar>
                        <span className="terminal-utils__pane-label">Input (one command per line)</span>
                        <Button text="Paste" variant="text" size="small" onClick={handlePaste} />
                        <Button text="Clear" variant="text" size="small" onClick={handleClearInput} />
                        <span style={{ flex: 1 }} />
                        <Button text="Join with &" variant="filled" size="small" onClick={handleJoinWithSingleAmp} />
                        <Button text="Join with &&" variant="solid" size="small" onClick={handleJoinWithDoubleAmp} />
                    </EditorToolbar>
                    <div className="eb">
                        <CodeEditor
                            minimap={false}
                            onEditorMounted={handleOriginalEditorMount}
                            languageId={languageId}
                            height="100%"
                        />
                    </div>
                </div>

                <div className="editorpane">
                    <EditorToolbar>
                        <span className="terminal-utils__pane-label">Result (single line)</span>
                        <span style={{ flex: 1 }} />
                        <Button text="Copy" variant="text" size="small" onClick={handleCopy} />
                        <Button text="Clear" variant="text" size="small" onClick={handleClearResult} />
                    </EditorToolbar>
                    <div className="eb">
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
