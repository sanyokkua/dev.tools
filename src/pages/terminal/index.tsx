import React from "react";
import AppLayout, {mapPageMenuItemsToMenuPropsItems, PageMenuItem} from "@/components/app_layout";
import {copyToClipboard, getFromClipboard, joinTerminalCommands} from "@/tools/common_tools";
import {MessageType, showMessage} from "@/components/notifications";
import CodeEditor from "@/components/editor/code_editor";
import {getLinesFromString} from "@/tools/string_tools";
import ReadOnlyCodeEditor from "@/components/editor/code_editor_readonly";
import {GenericButton} from "@/components/common_controls";

type TerminalUtilsPageState = {
    originalText: string;
    resultText: string;
};

export default class TerminalUtilsPage extends React.Component<any, TerminalUtilsPageState> {
    constructor(props: any) {
        super(props);
        this.state = {
            originalText: "",
            resultText: "",
        };
    }

    onCopyClicked() {
        const txt = this.state?.resultText;
        copyToClipboard(txt && txt.length > 0 ? txt : "");
        showMessage(MessageType.INFO, "Copied");
    }

    onPasteClicked() {
        getFromClipboard()
            .then((text) => {
                this.setState({originalText: text});
                showMessage(MessageType.INFO, "Pasted");
            })
            .catch(err => {
                console.error(err);
                showMessage(MessageType.ERROR, "Failed to paste data");
            });
    }

    onClearClicked() {
        this.setState({originalText: ""});
        showMessage(MessageType.INFO, "Cleared");
    }

    onTextChanged(text: string) {
        this.setState({
            originalText: text,
        });
    }

    buildMenuItemsJoin(): PageMenuItem[] {
        return [
            {title: "Join with &", onClick: () => this.joinCommands(true)},
            {title: "Join with &&", onClick: () => this.joinCommands(false)},
        ];
    }

    joinCommands(ignoreErrors: boolean = false) {
        const txt = this.state?.originalText;
        if (txt === null || txt === undefined || txt.length === 0) {
            showMessage(MessageType.WARNING, "Nothing to join");
            this.setState({resultText: ""});
            return;
        }
        const linesFromString = getLinesFromString(txt);
        const terminalCommands = joinTerminalCommands(linesFromString, ignoreErrors);
        this.setState({resultText: terminalCommands});
        showMessage(MessageType.SUCCESS, "Join successful");
    }

    render() {
        const editorText: string = this.state?.originalText ? this.state.originalText : "";
        const operations: PageMenuItem[] = [
            {title: "Paste", onClick: () => this.onPasteClicked()},
            {title: "Clear", onClick: () => this.onClearClicked()},
            {title: "Join", children: this.buildMenuItemsJoin()},

        ];
        const menuItems = mapPageMenuItemsToMenuPropsItems(operations);
        const content = <div>
            <h1>Enter your terminal commands that you want to join (one command per line):</h1>
            <CodeEditor text={editorText} onTextChanged={(text) => this.onTextChanged(text)} width={"30hv"}
                        height={"50vh"} syntax={"shell"}/>
            {this.state.resultText.length > 0 && <>
                <h1>Below you can find result of join:</h1>
                <ReadOnlyCodeEditor text={this.state.resultText} syntax={"shell"} width={"30hv"} height={"5vh"}/>
                <GenericButton label={"Copy"} type={"primary"} onClick={() => this.onCopyClicked()}/>
            </>}
        </div>;
        return (
            <AppLayout breadcrumbItems={["Home", "Terminal"]} content={content} menuProps={menuItems}/>
        );
    }
}
