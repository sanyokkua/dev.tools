import { Box } from '@chakra-ui/react';
import { Editor, Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import React from 'react';

export type EditorOnMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void;

export interface AppCodeEditorPropsBase {
    originalContent?: string;
    isReadOnly?: boolean;
    wordWrap?: boolean;
    minimap?: boolean;
    originalLang?: string;
}

export interface CodeEditorProps extends AppCodeEditorPropsBase {
    onChange?: (value: string | undefined, ev: editor.IModelContentChangedEvent) => void;
    onEditorCreated?: EditorOnMount;
}

const CodeEditor: React.FC<CodeEditorProps> = (props) => {
    const {
        originalContent = '',
        isReadOnly = false,
        originalLang = 'plaintext',
        wordWrap = false,
        minimap = true,
        onChange,
        onEditorCreated,
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

    return (
        <Box p={2} borderWidth="1px">
            <Editor
                height="90vh"
                options={options}
                defaultLanguage="plaintext"
                defaultValue=""
                language={originalLang}
                value={originalContent}
                onMount={onEditorCreated}
                onChange={onChange}
            />
        </Box>
    );
};

export default CodeEditor;
