'use client';
import { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef } from 'react';

import { usePage } from '@/contexts/PageContext';
import CodeEditor from '@/modules/ui/elements/editor/CodeEditor';
import {
    copyToClipboardFromEditor,
    getEditorContent,
    pasteFromClipboardToEditor,
    setEditorContent,
} from '@/modules/ui/elements/editor/code-editor-utils';
import { EditorProperties } from '@/modules/ui/elements/editor/types';
import Menubar from '@/modules/ui/elements/navigation/menubar/Menubar';
import { MenuBuilder } from '@/modules/ui/elements/navigation/menubar/utils';
import { StringUtils } from 'coreutilsts';

const IndexPage: React.FC = () => {
    const { setPageTitle } = usePage();

    useEffect(() => {
        setPageTitle('Terminal Utils');
    }, [setPageTitle]);

    // Editor ref
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    const handleEditorMount = useCallback((props: EditorProperties) => {
        editorRef.current = props.editor;
    }, []);

    // Handlers
    const handlePaste = useCallback((): void => {
        pasteFromClipboardToEditor(editorRef);
    }, []);

    const handleCopy = useCallback((): void => {
        copyToClipboardFromEditor(editorRef);
    }, []);

    const handleClear = useCallback((): void => {
        setEditorContent(editorRef, '');
    }, []);

    const handleJoinWithSingleAmp = useCallback((): void => {
        const content = getEditorContent(editorRef);
        const parts = StringUtils.splitString(content).map((s) => s.trim());
        const joined = StringUtils.joinStrings(parts, ' & ');
        setEditorContent(editorRef, joined);
    }, []);

    const handleJoinWithDoubleAmp = useCallback((): void => {
        const content = getEditorContent(editorRef);
        const parts = StringUtils.splitString(content).map((s) => s.trim());
        const joined = StringUtils.joinStrings(parts, ' && ');
        setEditorContent(editorRef, joined);
    }, []);

    const menuItems = MenuBuilder.newBuilder()
        .addButton('paste-from-clipboard', 'Paste', handlePaste)
        .addButton('copy-to-clipboard', 'Copy', handleCopy)
        .addButton('clear', 'Clear', handleClear)
        .addButton('joinWithOne', 'Join with &', handleJoinWithSingleAmp)
        .addButton('joinWithTwo', 'Join with &&', handleJoinWithDoubleAmp)
        .build();

    return (
        <>
            <Menubar menuItems={menuItems} />
            <CodeEditor minimap={false} onEditorMounted={handleEditorMount} languageId="bash" />
        </>
    );
};

export default IndexPage;
