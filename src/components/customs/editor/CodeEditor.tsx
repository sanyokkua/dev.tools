import { Editor, Monaco } from '@monaco-editor/react';
import { editor, languages } from 'monaco-editor';
import React, { useCallback } from 'react';

export type EditorProperties = {
    editor: editor.IStandaloneCodeEditor;
    monaco: Monaco;
    languages: languages.ILanguageExtensionPoint[];
};
export const DEFAULT_LANGUAGE = 'plaintext';

export type EditorOnMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void;

export interface AppCodeEditorPropsBase {
    editorContent?: string;
    isReadOnly?: boolean;
    wordWrap?: boolean;
    minimap?: boolean;
    originalLang?: string;
}

export interface CodeEditorProps extends AppCodeEditorPropsBase {
    onChange?: (value: string | undefined, ev: editor.IModelContentChangedEvent) => void;
    onEditorMounted?: (editorProps: EditorProperties) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = (props) => {
    const {
        editorContent = '',
        isReadOnly = false,
        originalLang = DEFAULT_LANGUAGE,
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
    };

    const editorOnMount: EditorOnMount = useCallback(
        (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
            if (onEditorMounted) {
                const languages = monaco.languages.getLanguages();
                onEditorMounted({ editor, monaco, languages });
            }
        },
        [onEditorMounted],
    );

    return (
        <Editor
            height="90vh"
            options={options}
            defaultLanguage={DEFAULT_LANGUAGE}
            defaultValue=""
            language={originalLang}
            value={editorContent}
            onMount={editorOnMount}
            onChange={onChange}
        />
    );
};

export default CodeEditor;
