import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import {LanguageName, loadLanguage} from "@uiw/codemirror-extensions-langs";
import {darcula} from "@uiw/codemirror-theme-darcula";
import {EditorView} from "@codemirror/view";

type ReadOnlyCodeEditorProps = {
    text: string;
    syntax: string;
    width: string | undefined;
    height: string | undefined;
    wrapLines?: boolean | undefined;
}

export const ReadOnlyCodeEditor: React.FC<ReadOnlyCodeEditorProps> = (props: ReadOnlyCodeEditorProps) => {
    const widgetText: string = props.text ? props.text : "";
    const extensions: any[] = [];
    const currentSyntaxLang = loadLanguage(props.syntax as LanguageName);

    if (props.wrapLines) {
        extensions.push(EditorView.lineWrapping);
    }

    if (currentSyntaxLang) {
        extensions.push(currentSyntaxLang);
    }

    return (
        <div>
            <CodeMirror height={props.height}
                        width={props.width}
                        readOnly={true}
                        theme={darcula}
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
                        extensions={extensions}
                        value={widgetText}
            />
        </div>
    );
};

export default ReadOnlyCodeEditor;