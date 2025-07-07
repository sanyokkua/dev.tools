'use client';
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
import { MenuBuilder } from '@/elements/navigation/menubar/utils';
import { StringUtils } from 'coreutilsts';
import CodeEditor from '../../components/elements/editor/CodeEditor';
import Menubar from '../../components/elements/navigation/menubar/Menubar';

type EditorLanguage = 'shell' | 'bat' | 'powershell';

const IndexPage: React.FC = () => {
    const { setPageTitle } = usePage();
    const { showToast } = useToast();

    useEffect(() => {
        setPageTitle('Terminal Utils');
    }, [setPageTitle]);

    const [languageId, setLanguageId] = useState<EditorLanguage>('shell');

    // Editor ref
    const editorOriginalRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const editorResultRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    const handleOriginalEditorMount = useCallback((props: EditorProperties) => {
        editorOriginalRef.current = props.editor;
    }, []);
    const handleResultEditorMount = useCallback((props: EditorProperties) => {
        editorResultRef.current = props.editor;
    }, []);

    // Handlers
    const handlePaste = useCallback((): void => {
        pasteFromClipboardToEditor(editorOriginalRef, () => {}, showToast);
    }, []);

    const handleCopy = useCallback((): void => {
        copyToClipboardFromEditor(editorResultRef, showToast);
    }, []);

    const handleClear = useCallback((): void => {
        setEditorContent(editorOriginalRef, '');
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

    const handleShell = () => {
        setLanguageId('shell');
        showToast({ message: 'Changed Syntax to shell', type: ToastType.INFO });
    };
    const handleBat = () => {
        setLanguageId('bat');
        showToast({ message: 'Changed Syntax to bat', type: ToastType.INFO });
    };
    const handlePowershell = () => {
        setLanguageId('powershell');
        showToast({ message: 'Changed Syntax to powershell', type: ToastType.INFO });
    };

    const topMenuItems = MenuBuilder.newBuilder()
        .addButton('paste-from-clipboard', 'Paste', handlePaste)
        .addButton('clear', 'Clear', handleClear)
        .addButton('joinWithOne', 'Join with &', handleJoinWithSingleAmp)
        .addButton('joinWithTwo', 'Join with &&', handleJoinWithDoubleAmp)
        .addButton('langBat', 'Syntax Windows Bash', handleBat)
        .addButton('langPowershell', 'Syntax Windows Powershell', handlePowershell)
        .addButton('langShell', 'Syntax (Unix) Bash', handleShell)
        .build();

    const bottomMenuItems = MenuBuilder.newBuilder()
        .addButton('copy-to-clipboard', 'Copy', handleCopy)
        .addButton('clear', 'Clear', handleClear)
        .build();

    return (
        <>
            <Menubar menuItems={topMenuItems} />
            <CodeEditor
                minimap={false}
                onEditorMounted={handleOriginalEditorMount}
                languageId={languageId}
                height="40vh"
            />
            <br />
            <Menubar menuItems={bottomMenuItems} />
            <CodeEditor
                minimap={false}
                onEditorMounted={handleResultEditorMount}
                languageId={languageId}
                height="40vh"
            />
        </>
    );
};

export default IndexPage;
