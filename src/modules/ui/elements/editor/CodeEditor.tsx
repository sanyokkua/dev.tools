import { DEFAULT_LANGUAGE_ID } from '@/common/constants';
import { buildEditorProperties } from '@/modules/ui/elements/editor/CodeEditorUtils';
import { EditorProperties } from '@/modules/ui/elements/editor/types';
import { Editor, Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import React, { useCallback } from 'react';

export type EditorOnMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void;

export interface AppCodeEditorPropsBase {
    editorContent?: string;
    languageId?: string;
    isReadOnly?: boolean;
    wordWrap?: boolean;
    minimap?: boolean;
}

export interface CodeEditorProps extends AppCodeEditorPropsBase {
    onChange?: (value: string | undefined, ev: editor.IModelContentChangedEvent) => void;
    onEditorMounted?: (editorProps: EditorProperties) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = (props) => {
    const {
        editorContent = '',
        languageId = DEFAULT_LANGUAGE_ID,
        isReadOnly = false,
        wordWrap = false,
        minimap = true,
        onChange,
        onEditorMounted,
    } = props;

    const wordWrapValue = wordWrap ? 'on' : 'off';
    const options: editor.IStandaloneEditorConstructionOptions = {
        autoIndent: 'full',
        contextmenu: true,
        fontFamily: 'monospace',
        fontSize: 12,
        lineHeight: 24,
        hideCursorInOverviewRuler: true,
        matchBrackets: 'always',
        minimap: { enabled: minimap },
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: isReadOnly,
        automaticLayout: true,
        wordWrap: wordWrapValue,
        scrollBeyondLastLine: true,
        lineNumbers: 'on',
    };

    const editorOnMount: EditorOnMount = useCallback(
        (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
            if (onEditorMounted) {
                const properties = buildEditorProperties(editor, monaco);
                onEditorMounted(properties);
            }
        },
        [onEditorMounted],
    );

    return (
        <Editor
            height="100vh"
            options={options}
            defaultLanguage={languageId}
            defaultValue=""
            language={languageId}
            value={editorContent}
            onMount={editorOnMount}
            onChange={onChange}
            theme="vs-dark"
        />
    );
};

export default CodeEditor;
