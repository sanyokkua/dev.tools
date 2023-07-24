import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import AppLayout from "@/components/app_layout";
import ReadOnlyCodeEditor from "@/components/editor/code_editor_readonly";
import {
    BREW_CASK_LIST,
    BREW_FORMULAE_LIST,
    BREW_INSTALL_COMMAND,
    BREW_VERSIONS_COMMAND,
    BREW_WEB_SITE,
    buildDesktopAppsCommand,
    buildTerminalAppsCommand,
} from "@/tools/macos_tools";
import {Col, Row} from "antd";
import {GenericButton} from "@/components/common_controls";
import {copyToClipboard} from "@/tools/common_tools";
import {MessageType, showMessage} from "@/components/notifications";
import {GenericTransfer} from "@/components/transfer/generic_transfer";

type MacSetupState = {
    originalText: string;
    resultText: string;
    terminalApps: string;
    desktopApps: string;
};

export default class MacOSSetupPage extends React.Component<any, MacSetupState> {
    constructor(props: any) {
        super(props);
        this.state = {
            originalText: "",
            resultText: "",
            terminalApps: "",
            desktopApps: "",
        };
    }

    onTerminalAppsChose(values: string[]) {
        if (values && values.length > 0) {
            const result = buildTerminalAppsCommand(values);
            this.setState({terminalApps: result});
        }
    }

    onDesktopAppsChose(values: string[]) {
        if (values && values.length > 0) {
            const result = buildDesktopAppsCommand(values);
            this.setState({desktopApps: result});
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
                For MacOS, probably, the most popular is <a href={BREW_WEB_SITE} target={"_blank"}>Homebrew</a>
            </p>
            <p>
                In order to use it and save your time during setup of fresh Mac follow next steps:
            </p>
            <ol>
                <li>Install <a href={"https://brew.sh/"} target={"_blank"}>Homebrew</a></li>
                <li>Select apps from left side on this page</li>
                <li>Generate one single terminal command</li>
                <li>Execute command in your terminal</li>
            </ol>
            <br/>
            <p>
                In order to install <b>Homebrew</b> you can follow official guide or execute following command in the
                terminal:
            </p>
            <Row>
                <Col span={22}>
                    <ReadOnlyCodeEditor text={BREW_INSTALL_COMMAND} syntax={"shell"} width={"30hv"} height={"3vh"}/>
                </Col>
                <Col span={2}>
                    <GenericButton type={"primary"} label={"Copy"} fitToWidth={true}
                                   onClick={() => this.onCopyBtnClicked(BREW_INSTALL_COMMAND)}/>
                </Col>
            </Row>
            <br/>
            <p>
                In order to install any version of <b>CASK</b> you can execute following command in the terminal:
            </p>
            <Row>
                <Col span={22}>
                    <ReadOnlyCodeEditor text={BREW_VERSIONS_COMMAND} syntax={"shell"} width={"30hv"} height={"3vh"}/>
                </Col>
                <Col span={2}>
                    <GenericButton type={"primary"} label={"Copy"} fitToWidth={true}
                                   onClick={() => this.onCopyBtnClicked(BREW_VERSIONS_COMMAND)}/>
                </Col>
            </Row>
            <br/>
            <GenericTransfer title={"Chose terminal apps"}
                             availableRecords={BREW_FORMULAE_LIST}
                             onRecordsChosen={(records) => this.onTerminalAppsChose(records)}/>
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

            <GenericTransfer title={"Chose Desktop apps"}
                             availableRecords={BREW_CASK_LIST}
                             onRecordsChosen={(records) => this.onDesktopAppsChose(records)}/>

            <br/>

            {this.state.desktopApps && this.state.desktopApps.length > 0 && <div>
                <p>Below you can find terminal statement to install all desktop apps:</p>
                <Row>
                    <Col span={22}>
                        <ReadOnlyCodeEditor text={this.state?.desktopApps} syntax={"shell"} width={"5hv"}
                                            height={"30vh"} wrapLines={true}/>
                    </Col>
                    <Col span={2}>
                        <GenericButton type={"primary"} label={"Copy"} fitToWidth={true}
                                       onClick={() => this.onCopyBtnClicked(this.state.desktopApps)}/>
                    </Col>
                </Row>
            </div>}
        </div>;
        return (
            <>
                <AppLayout breadcrumbItems={["Home", "MacOS"]} content={content}/>
            </>
        );
    }
}