import React from "react";
import ReadOnlyCodeEditor from "@/components/editor/code_editor_readonly";
import {generateGitConfig} from "@/tools/git_utils";
import {copyToClipboard} from "@/tools/common_tools";
import {MessageType, showMessage} from "@/components/notifications";
import AppLayout from "@/components/app_layout";
import {GenericButton} from "@/components/common_controls";
import {Col, Row} from "antd";
import {GitForm, GitFormResult} from "@/components/git/git_form";

type GitPageState = {
    usernameCommand: string;
    emailCommandString: string;
    sshCommandString: string;
    combinedCommandString: string;
    isGlobal: boolean;
    onCopyText: string;
    onCopyToastShow: boolean;
}

export default class GitPage extends React.Component<any, GitPageState> {
    constructor(props: any) {
        super(props);
        this.state = {
            usernameCommand: "",
            emailCommandString: "",
            sshCommandString: "",
            combinedCommandString: "",
            isGlobal: true,
            onCopyText: "",
            onCopyToastShow: false,
        };
    }

    onFormSubmitted(formResult: GitFormResult) {
        const result = generateGitConfig(formResult.username, formResult.userEmail, formResult.isGlobalConfig);
        this.setState({
            usernameCommand: result.userNameCommand,
            emailCommandString: result.userEmailCommand,
            sshCommandString: result.sshCommand,
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
        const commandsExamples: string =
            `git config --global user.name "Your Name"
git config --global user.email "youremail@yourdomain.com"
ssh-keygen -t ed25519 -C "your_email@example.com"`;

        const content = <>
            <p>
                The basic setup of GIT on your PC consists of the following steps:
            </p>

            <ol>
                <li>Install <a href={"https://git-scm.com"} target={"_blank"}>GIT</a></li>
                <li>Configure username and email</li>
                <li>(Optional) Generate SSH and add it to VCS that you use (Github, Bitbucket, etc)</li>
            </ol>

            <br/>

            <p>
                For that you can use following commands:
            </p>

            <ReadOnlyCodeEditor text={commandsExamples} syntax={"shell"} width={"30hv"} height={"7vh"}/>

            <h3>
                You can use following form to generate these commands
            </h3>

            <GitForm isGlobal={true} onSubmit={(res) => this.onFormSubmitted(res)} onReset={() => this.onReset()}/>

            {this.state?.combinedCommandString?.length > 0 && <div>
                <Row>
                    <Col span={22}>
                        <ReadOnlyCodeEditor text={this.state.usernameCommand} syntax={"shell"} width={"10hv"}
                                            height={"3vh"}/>
                    </Col>
                    <Col span={2}>
                        <GenericButton type={"primary"} label={"Copy"} fitToWidth={true}
                                       onClick={() => this.onCopyBtnClicked(this.state.usernameCommand)}/>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col span={22}>
                        <ReadOnlyCodeEditor text={this.state.emailCommandString} syntax={"shell"} width={"10hv"}
                                            height={"3vh"}/>
                    </Col>
                    <Col span={2}>
                        <GenericButton type={"primary"} label={"Copy"} fitToWidth={true}
                                       onClick={() => this.onCopyBtnClicked(this.state.emailCommandString)}/>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col span={22}>
                        <ReadOnlyCodeEditor text={this.state.sshCommandString} syntax={"shell"} width={"10hv"}
                                            height={"3vh"}/>
                    </Col>
                    <Col span={2}>
                        <GenericButton type={"primary"} label={"Copy"} fitToWidth={true}
                                       onClick={() => this.onCopyBtnClicked(this.state.sshCommandString)}/>
                    </Col>
                </Row>
                <br/>
                <div>
                    <p>Combined command:</p>
                    <ReadOnlyCodeEditor text={this.state?.combinedCommandString} syntax={"shell"} width={"30hv"}
                                        height={"5vh"}/>
                    <GenericButton type={"primary"} label={"Copy"} fitToWidth={true}
                                   onClick={() => this.onCopyBtnClicked(this.state.combinedCommandString)}/>
                </div>
            </div>}
        </>;
        return (
            <>
                <AppLayout breadcrumbItems={["Home", "Git"]} content={content}/>
            </>
        );
    }
}
