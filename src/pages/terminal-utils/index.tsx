import { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef } from 'react';

import { usePage } from '@/contexts/PageContext';
import { StringUtils } from 'coreutilsts';
import CodeEditor, { EditorProperties } from '../../controllers/elements/editor/CodeEditor';
import {
    copyToClipboardFromEditor,
    getEditorContent,
    pasteFromClipboardToEditor,
    setEditorContent,
} from '../../controllers/elements/editor/CodeEditorUtils';
import Menubar from '../../controllers/elements/navigation/menubar/Menubar';
import { MenuBuilder } from '../../controllers/elements/navigation/menubar/utils';

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
            <CodeEditor minimap={false} onEditorMounted={handleEditorMount} originalLang="bash" />
        </>
    );
};

export default IndexPage;
