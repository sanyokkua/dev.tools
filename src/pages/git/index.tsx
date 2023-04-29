import React from "react";
import NavigationBar from "@/components/navigation";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import {Alert, Container} from "react-bootstrap";
import ReadOnlyCodeEditor from "@/components/editor/code_editor_readonly";
import {generateGitConfig} from "@/tools/git_utils";
import {copyToClipboard} from "@/tools/common_tools";
import {FormInputCheckbox, FormInputEmail, FormInputText} from "@/components/form_input";
import {NotificationToast} from "@/components/notifications";

type GitPageState = {
    inputName: string;
    inputEmail: string;
    isGlobalConfig: boolean;
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
            inputName: "",
            inputEmail: "",
            isGlobalConfig: false,
            usernameCommand: "",
            emailCommandString: "",
            combinedCommandString: "",
            onCopyText: "",
            onCopyToastShow: false,
        };
    }

    onNameChanged(text: string): void {
        this.setState({
            inputName: text,
        });
    }

    onEmailChanged(text: string): void {
        this.setState({
            inputEmail: text,
        });
    }

    onGlobalCheckboxClicked(checked: boolean): void {
        this.setState({
            isGlobalConfig: checked,
        });
    }

    onFormSubmitted() {
        const result = generateGitConfig(this.state.inputName, this.state.inputEmail, this.state.isGlobalConfig);
        this.setState({
            usernameCommand: result.userNameCommand,
            emailCommandString: result.userEmailCommand,
            combinedCommandString: result.combinedCommand,
        });
    }

    onResetBtnClicked() {
        this.setState({
            inputName: "",
            inputEmail: "",
            isGlobalConfig: false,
            usernameCommand: "",
            emailCommandString: "",
            combinedCommandString: "",
        });
    }

    onCopyBtnClicked(text: string) {
        copyToClipboard(text);
        this.setState({
            onCopyToastShow: true,
            onCopyText: text,
        });
    }

    render() {
        return (
            <>
                <NavigationBar/>
                <Container>
                    <p>
                        When you just bought new Mac or PC, or re-installed OS and need to setup git - this is the base
                        commands that you will need.
                    </p>
                    <ReadOnlyCodeEditor
                        text={`git config --global user.name "Your Name"\ngit config --global user.email "youremail@yourdomain.com"`}
                        syntax={"shell"} width={"30hv"}
                        height={"5vh"}/>
                    <p>
                        In order to do that - you can use form below to generate appropriate commands and copy them to
                        terminal (and execute)
                    </p>

                    <Form>
                        <FormInputText value={this.state.inputName} label="Username" placeholder="Enter username"
                                       onValueChanged={(text: string) => this.onNameChanged(text)}/>
                        <FormInputEmail value={this.state.inputEmail} label="Email address" placeholder="Enter email"
                                        onValueChanged={(text: string) => this.onEmailChanged(text)}/>
                        <FormInputCheckbox value={this.state.isGlobalConfig} label="Is Config Global?"
                                           onValueChanged={(text: boolean) => this.onGlobalCheckboxClicked(text)}/>

                        <Button variant="primary" type="button" onClick={() => this.onFormSubmitted()}
                                disabled={this.state.inputName.length === 0 || this.state.inputEmail.length === 0}>
                            Generate commands
                        </Button>
                        <Button variant="danger" type="button" onClick={() => this.onResetBtnClicked()}>
                            Reset
                        </Button>
                    </Form>
                    <br/>
                    {this.state?.combinedCommandString && <div>
                        <Container>
                            <Alert key="alert-name" variant="success">
                                <strong className="me-auto">{this.state.usernameCommand}</strong>
                            </Alert>
                            <Button variant="outline-success"
                                    onClick={() => this.onCopyBtnClicked(this.state.usernameCommand)}>Copy</Button>
                        </Container>
                        <br/>
                        <Container>
                            <Alert key="alert-email" variant="info">
                                <strong className="me-auto">{this.state.emailCommandString}</strong>
                            </Alert>
                            <Button variant="outline-success"
                                    onClick={() => this.onCopyBtnClicked(this.state.emailCommandString)}>Copy</Button>
                        </Container>
                        <br/>
                        <Container>
                            <ReadOnlyCodeEditor text={this.state?.combinedCommandString} syntax={"shell"} width={"30hv"}
                                                height={"5vh"}/>
                            <Button variant="outline-success"
                                    onClick={() => this.onCopyBtnClicked(this.state.combinedCommandString)}>Copy</Button>
                        </Container>

                    </div>}
                </Container>

                <NotificationToast header={"Copied"} message={this.state.onCopyText} show={this.state.onCopyToastShow}
                                   onClose={() => this.setState({onCopyToastShow: false, onCopyText: ""})}/>
            </>
        );
    }
}
