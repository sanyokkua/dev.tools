import React from "react";
import CodeMirror from "@uiw/react-codemirror";

type CodeEditorProps = {
    text: string;
    onTextChanged: (text: string) => void;
}


export const CodeEditor: React.FC<CodeEditorProps> = (props: CodeEditorProps) => {
    const contentIsChanged = (text: string) => props.onTextChanged(text);
    const widgetText: string = props.text ? props.text : "";

    return (
        <div>
            <CodeMirror height="100vh"
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
                        onChange={(text) => contentIsChanged(text)}
            />
        </div>
    );
};

export default CodeEditor;