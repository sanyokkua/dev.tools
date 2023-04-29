import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import {LanguageName, loadLanguage} from "@uiw/codemirror-extensions-langs";

type ReadOnlyCodeEditorProps = {
    text: string;
    syntax: string;
    width: string | undefined;
    height: string | undefined;
}


class ReadOnlyCodeEditor extends React.Component<ReadOnlyCodeEditorProps, any> {
    render() {
        const widgetText: string = this.props.text ? this.props.text : "";
        const extensions: any[] = [];
        const currentSyntaxLang = loadLanguage(this.props.syntax as LanguageName);
        if (currentSyntaxLang) {
            extensions.push(currentSyntaxLang);
        }

        return (
            <div>
                <CodeMirror height={this.props.height}
                            width={this.props.width}
                            readOnly={true}
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
    }
}

export default ReadOnlyCodeEditor;