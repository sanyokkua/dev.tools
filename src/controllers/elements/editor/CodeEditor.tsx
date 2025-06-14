import { Editor, Monaco } from '@monaco-editor/react';
import { editor, languages } from 'monaco-editor';
import React, { useCallback } from 'react';

export type EditorProperties = {
    editor: editor.IStandaloneCodeEditor;
    monaco: Monaco;
    languages: languages.ILanguageExtensionPoint[];
    supportedExtensions: string[]; // .txt, .json, .c, etc
    supportedMimeTypes: string[];
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

function getSupportedExtensions(languages: languages.ILanguageExtensionPoint[]) {
    return [
        ...new Set(
            languages
                .flatMap((lang) => {
                    console.log(lang);
                    if (lang.extensions) {
                        return lang.extensions;
                    }
                    return [];
                })
                .filter((ext) => {
                    return !(!ext || ext.trim().length === 0);
                })
                .map((ext) => {
                    if (ext.startsWith('.')) {
                        return ext;
                    } else {
                        return `.${ext}`;
                    }
                }),
        ),
    ];
}

function getSupportedMimeTypes(languages: languages.ILanguageExtensionPoint[]) {
    return [
        ...new Set(
            languages
                .flatMap((lang) => {
                    if (lang.mimetypes) {
                        return lang.mimetypes;
                    }
                    return [];
                })
                .filter((ext) => {
                    return !(!ext || ext.trim().length === 0);
                }),
        ),
    ];
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
        lineNumbers: 'on',
    };

    const editorOnMount: EditorOnMount = useCallback(
        (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
            if (onEditorMounted) {
                const languages: languages.ILanguageExtensionPoint[] = monaco.languages.getLanguages();
                const supportedExtensions = getSupportedExtensions(languages);
                const supportedMimeTypes = getSupportedMimeTypes(languages);
                onEditorMounted({ editor, monaco, languages, supportedExtensions, supportedMimeTypes });
            }
        },
        [onEditorMounted],
    );

    return (
        <Editor
            height="100vh"
            options={options}
            defaultLanguage={originalLang}
            defaultValue=""
            language={originalLang}
            value={editorContent}
            onMount={editorOnMount}
            onChange={onChange}
            theme="vs-dark"
        />
    );
};

export default CodeEditor;
