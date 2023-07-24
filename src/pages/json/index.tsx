import React from "react";
import AppLayout, {mapPageMenuItemsToMenuPropsItems, PageMenuItem} from "@/components/app_layout";
import CodeEditor from "@/components/editor/code_editor";
import {copyToClipboard, getFromClipboard} from "@/tools/common_tools";
import {MessageType, showMessage} from "@/components/notifications";
import {formatJson} from "@/tools/json_tools";
import ReadOnlyCodeEditor from "@/components/editor/code_editor_readonly";
import {GenericButton} from "@/components/common_controls";

type JsonPageState = {
    originalJson: string;
    formattedJson: string;
};

export default class JsonPage extends React.Component<any, JsonPageState> {
    constructor(props: any) {
        super(props);
        this.state = {
            originalJson: "",
            formattedJson: "",
        };
    }

    onCopyClicked() {
        const txt = this.state?.formattedJson;
        copyToClipboard(txt && txt.length > 0 ? txt : "");
        showMessage(MessageType.INFO, "Copied");
    }

    onPasteClicked() {
        getFromClipboard()
            .then((text) => {
                this.setState({
                    originalJson: text,
                    formattedJson: "",
                });
                showMessage(MessageType.INFO, "Pasted");
            })
            .catch(err => {
                console.error(err);
                showMessage(MessageType.ERROR, "Failed to paste data");
            });
    }

    onClearClicked() {
        this.setState({
            formattedJson: "",
            originalJson: ""
        });
        showMessage(MessageType.INFO, "Cleared");
    }

    onFormat() {
        const toFormat: string = this.state.originalJson ? this.state.originalJson.trim() : "";
        try {
            const json = formatJson(toFormat, 4);
            this.setState({
                formattedJson: json
            })
        } catch (e: any) {
            this.setState({
                formattedJson: "",
            }, () => showMessage(MessageType.ERROR, e.toString()));
        }
    }

    onMinimize() {
        const toFormat: string = this.state.originalJson ? this.state.originalJson.trim() : "";
        try {
            const json = formatJson(toFormat, 0);
            this.setState({
                formattedJson: json
            })
        } catch (e: any) {
            this.setState({
                formattedJson: "",
            }, () => showMessage(MessageType.ERROR, e.toString()));
        }
    }

    onTextChanged(text: string) {
        this.setState({
            originalJson: text,
        });
    }

    render() {
        const originalJsonText: string = this.state?.originalJson ? this.state.originalJson : "";
        const formattedJsonText: string = this.state?.formattedJson ? this.state.formattedJson : "";
        const operations: PageMenuItem[] = [
            {title: "Paste", onClick: () => this.onPasteClicked()},
            {title: "Clear", onClick: () => this.onClearClicked()},
            {title: "Format", onClick: () => this.onFormat()},
            {title: "Minimize", onClick: () => this.onMinimize()},
        ];
        const menuItems = mapPageMenuItemsToMenuPropsItems(operations);
        const content =
            <div>
                <h3>Original Json</h3>
                <CodeEditor text={originalJsonText} syntax={"json"} onTextChanged={(text) => this.onTextChanged(text)}
                            height={"50hv"}/>
                <h3>
                    Formatted Json
                </h3>
                <ReadOnlyCodeEditor text={formattedJsonText} syntax={"json"} height={"50hv"} width={"100hv"}/>
                <GenericButton type={"primary"} label={"Copy"} fitToWidth={true}
                               onClick={() => this.onCopyClicked()}/>
            </div>;
        return (
            <AppLayout breadcrumbItems={["Home", "Json"]} content={content} menuProps={menuItems}/>
        );
    }
}
