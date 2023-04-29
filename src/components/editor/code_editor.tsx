import React from "react";
import CodeMirror from "@uiw/react-codemirror";

type CodeEditorProps = {
    text: string;
    onTextChanged: (text: string) => void;
}

type CodeEditorState = any;


class Code_editor extends React.Component<CodeEditorProps, CodeEditorState> {
    contentIsChanged(text: string) {
        this.props.onTextChanged(text);
    }

    render() {
        const widgetText: string = this.props.text ? this.props.text : "";
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
                            onChange={(text) => this.contentIsChanged(text)}
                />
            </div>
        );
    }
}

export default Code_editor;