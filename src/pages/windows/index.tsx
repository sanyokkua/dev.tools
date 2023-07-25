import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import AppLayout from "@/components/app_layout";
import ReadOnlyCodeEditor from "@/components/editor/code_editor_readonly";
import {Col, Row} from "antd";
import {GenericButton} from "@/components/common_controls";
import {copyToClipboard} from "@/tools/common_tools";
import {MessageType, showMessage} from "@/components/notifications";
import {GenericTransfer} from "@/components/transfer/generic_transfer";
import {buildCommand, WIN_GET_APPS_LIST, WIN_GET_URL, WIN_GET_WEB_RESOURCES} from "@/tools/win_utils";

type WindowsSetupState = {
    originalText: string;
    resultText: string;
    terminalApps: string;
};

export default class WindowsSetupPage extends React.Component<any, WindowsSetupState> {
    constructor(props: any) {
        super(props);
        this.state = {
            originalText: "",
            resultText: "",
            terminalApps: "",
        };
    }

    onApplicationsAreChosen(values: string[]) {
        if (values && values.length > 0) {
            const result = buildCommand(values);
            this.setState({terminalApps: result});
        }
    }

    onCopyBtnClicked(text: string) {
        copyToClipboard(text);
        showMessage(MessageType.SUCCESS, `Copied ${text}`);
        console.log(`onCopyBtnClicked`);
    }

    render() {
        const content = <div>
            <p>
                Everybody has different apps for work, but on this page can be created script to install some apps
                without manual downloading of the APPs from stores and internet
            </p>
            <p>
                In order to simplify installation of all software it is good idea to use package manager.
                For Windows, probably, the most popular is <a href={WIN_GET_URL} target={"_blank"}>WinGet</a>
            </p>
            <p>
                In order to use it and save your time during setup of fresh Windows 10/11 follow next steps:
            </p>
            <ol>
                <li>Install <a href={WIN_GET_URL} target={"_blank"}>WinGet</a></li>
                <li>Select apps from left side on this page</li>
                <li>Generate one single terminal command</li>
                <li>Execute command in your terminal</li>
            </ol>
            <br/>
            <p>
                In order to install <b>WinGet</b> you can follow official guide.
            </p>
            <p>
                Additional packages can be found for example on the following sites:
            </p>
            <ol>
                {WIN_GET_WEB_RESOURCES.map((link, index) => {
                    return <li key={index}><a href={link} target={"_blank"}>{link}</a></li>;
                })}
            </ol>

            <br/>
            <GenericTransfer title={"Chose apps"}
                             availableRecords={WIN_GET_APPS_LIST}
                             onRecordsChosen={(records) => this.onApplicationsAreChosen(records)}/>
            <br/>


            {this.state.terminalApps && this.state.terminalApps.length > 0 && <div>
                <p>Below you can find terminal statement to install all terminal apps:</p>
                <Row>
                    <Col span={22}>
                        <ReadOnlyCodeEditor text={this.state?.terminalApps} syntax={"shell"} width={"30hv"}
                                            height={"30vh"} wrapLines={true}/>
                    </Col>
                    <Col span={2}>
                        <GenericButton type={"primary"} label={"Copy"} fitToWidth={true}
                                       onClick={() => this.onCopyBtnClicked(this.state.terminalApps)}/>
                    </Col>
                </Row>
            </div>}
        </div>;
        return (
            <>
                <AppLayout breadcrumbItems={["Home", "Windows 10/11"]} content={content}/>
            </>
        );
    }
}