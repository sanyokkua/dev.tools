import React from "react";
import ReadOnlyCodeEditor from "@/components/editor/code_editor_readonly";
import {generateGitConfig} from "@/tools/git_utils";
import {copyToClipboard} from "@/tools/common_tools";
import {MessageType, showMessage} from "@/components/notifications";
import AppLayout from "@/components/app_layout";
import {GenericButton} from "@/components/common_controls";
import {Alert, Col, Row} from "antd";
import {GitForm, GitFormResult} from "@/components/git/git_form";

type GitPageState = {
    usernameCommand: string;
    emailCommandString: string;
    combinedCommandString: string;
    onCopyText: string;
    onCopyToastShow: boolean;
}

export default class GitPage extends React.Component<any, GitPageState> {
    constructor(props: any) {
        super(props);
        this.state = {
            usernameCommand: "",
            emailCommandString: "",
            combinedCommandString: "",
            onCopyText: "",
            onCopyToastShow: false,
        };
    }

    onFormSubmitted(formResult: GitFormResult) {
        const result = generateGitConfig(formResult.username, formResult.userEmail, formResult.isGlobalConfig);
        this.setState({
            usernameCommand: result.userNameCommand,
            emailCommandString: result.userEmailCommand,
            combinedCommandString: result.combinedCommand,
        });
        console.log(`onFormSubmitted`);
    }

    onReset() {
        this.setState({
            usernameCommand: "",
            emailCommandString: "",
            combinedCommandString: "",
        });
    }


    onCopyBtnClicked(text: string) {
        copyToClipboard(text);
        showMessage(MessageType.SUCCESS, `Copied ${text}`);
        console.log(`onCopyBtnClicked`);
    }

    render() {
        const example: string = `git config --global user.name "Your Name"\ngit config --global user.email "youremail@yourdomain.com"`;
        const content = <>

            <p>
                When you just bought new Mac or PC, or re-installed OS and need to setup git - this is the base
                commands that you will need.
            </p>

            <ReadOnlyCodeEditor text={example} syntax={"shell"} width={"30hv"} height={"5vh"}/>

            <p>
                In order to do that - you can use form below to generate appropriate commands and copy them to
                terminal (and execute)
            </p>

            <GitForm onSubmit={(res) => this.onFormSubmitted(res)} onReset={() => this.onReset()}/>

            <br/>

            {this.state?.combinedCommandString?.length > 0 && <div>
                <Row>
                    <Col span={22}>
                        <Alert message={this.state.usernameCommand} type="success"/>
                    </Col>
                    <Col span={2}>
                        <GenericButton type={"default"} label={"Copy"} fitToWidth={true}
                                       onClick={() => this.onCopyBtnClicked(this.state.usernameCommand)}/>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col span={22}>
                        <Alert message={this.state.emailCommandString} type="success"/>
                    </Col>
                    <Col span={2}>
                        <GenericButton type={"default"} label={"Copy"} fitToWidth={true}
                                       onClick={() => this.onCopyBtnClicked(this.state.emailCommandString)}/>
                    </Col>
                </Row>
                <br/>
                <div>
                    <ReadOnlyCodeEditor text={this.state?.combinedCommandString} syntax={"shell"} width={"30hv"}
                                        height={"5vh"}/>
                    <GenericButton type={"default"} label={"Copy"} fitToWidth={true}
                                   onClick={() => this.onCopyBtnClicked(this.state.combinedCommandString)}/>
                </div>

            </div>}
        </>;
        return (
            <>
                <AppLayout breadcrumbItems={["Home", "string"]} content={content}/>
            </>
        );
    }
}
