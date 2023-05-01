import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import {darcula} from "@uiw/codemirror-theme-darcula";
import {LanguageName, loadLanguage} from "@uiw/codemirror-extensions-langs";

type CodeEditorProps = {
    text: string;
    onTextChanged: (text: string) => void;
    height?: string;
    width?: string;
    syntax?: string;
}


export const CodeEditor: React.FC<CodeEditorProps> = (props: CodeEditorProps) => {
    const contentIsChanged = (text: string) => props.onTextChanged(text);
    const widgetText: string = props.text ? props.text : "";
    const height = props.height ? props.height : "100vh";
    const width = props.width ? props.width : undefined;
    const extensions: any[] = [];
    const currentSyntaxLang = loadLanguage(props.syntax as LanguageName);
    if (currentSyntaxLang) {
        extensions.push(currentSyntaxLang);
    }

    return (
        <div>
            <CodeMirror height={height} width={width} maxHeight={"100vh"} theme={darcula}
                        basicSetup={{
                            foldGutter: true,
                            allowMultipleSelections: true,
                            indentOnInput: true,
                            tabSize: 4,
                            highlightActiveLine: true,
                            highlightActiveLineGutter: true,
                            highlightSelectionMatches: true,
                            syntaxHighlighting: true,
                            bracketMatching: true,
                        }}
                        value={widgetText}
                        extensions={extensions}
                        onChange={(text) => contentIsChanged(text)}
            />
        </div>
    );
};

export default CodeEditor;