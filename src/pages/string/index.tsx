import React from "react";
import NavigationBar from "@/components/navigation";
import CodeEditor from "@/components/editor/codeeditor";
import {Container, Nav, Navbar, NavDropdown} from "react-bootstrap";
import {copyToClipboard} from "@/tools/common_tools";
import {sortStrings} from "@/tools/string_tools";

enum SortingTypes {
    ASC = "ASC",
    DSC = "DSC",
    ASC_IGN_CASE = "ASC_IGN_CASE",
    DSC_IGN_CASE = "DSC_IGN_CASE",
}

type StringPageState = {
    text: string;
};
export default class StringPage extends React.Component<any, StringPageState> {
    constructor(props: any) {
        super(props);
        this.setState({
            text: "",
        });
    }

    onCopyClicked() {
        copyToClipboard(this.state.text);
    }

    onPasteClicked() {
        navigator.clipboard.readText()
            .then((text) => this.setState({text: text}))
            .catch(err => console.error(err));
    }

    onCutClicked() {
        copyToClipboard(this.state.text);
        this.setState({text: ""});
    }

    onClearClicked() {
        this.setState({text: ""});
    }

    onSplitClicked() {
        const txt = this.state.text;
        if (txt === null || txt === undefined || txt.length === 0) {
            return;
        }
        const regexp: RegExp = /[\r\n]+/;//TODO: symbols for split should be passed from ui
        const result = txt.split(regexp).join("\n");
        this.setState({text: result});
    }

    onSortClicked(sortType: SortingTypes) {
        console.log(sortType);
        const txt = this.state.text;
        if (txt === null || txt === undefined || txt.length === 0) {
            return;
        }
        const regexp: RegExp = /[\r\n]+/;
        const lines = txt.split(regexp);
        console.log(lines);
        let sorted = sortStrings(lines, sortType);
        console.log(sorted);
        this.setState({text: sorted.join("\n")});
    }

    onTextChanged(text: string) {
        this.setState({
            text: text,
        });
        console.log(text);
    }

    render() {
        const editorText: string = this.state?.text ? this.state.text : "";
        return (
            <>
                <NavigationBar/>
                <br/>

                <Navbar bg="light" variant="light">
                    <Container>
                        <Nav>
                            <Nav.Link onClick={(e) => this.onCopyClicked()}>Copy</Nav.Link>
                            <Nav.Link onClick={(e) => this.onPasteClicked()}>Paste</Nav.Link>
                            <Nav.Link onClick={(e) => this.onCutClicked()}>Cut</Nav.Link>
                            <Nav.Link onClick={(e) => this.onClearClicked()}>Clear</Nav.Link>
                            <Nav.Link onClick={(e) => this.onSplitClicked()}>Split</Nav.Link>

                            <NavDropdown title="Sort" id="basic-nav-dropdown">
                                <NavDropdown.Item eventKey={SortingTypes.ASC}
                                                  onClick={(e) => this.onSortClicked(SortingTypes.ASC)}>
                                    Ascending
                                </NavDropdown.Item>

                                <NavDropdown.Item eventKey={SortingTypes.DSC}
                                                  onClick={(e) => this.onSortClicked(SortingTypes.DSC)}>
                                    Descending
                                </NavDropdown.Item>

                                <NavDropdown.Item eventKey={SortingTypes.ASC_IGN_CASE}
                                                  onClick={(e) => this.onSortClicked(SortingTypes.ASC_IGN_CASE)}>
                                    Ascending Ignore Case
                                </NavDropdown.Item>

                                <NavDropdown.Item eventKey={SortingTypes.DSC_IGN_CASE}
                                                  onClick={(e) => this.onSortClicked(SortingTypes.DSC_IGN_CASE)}>
                                    Descending Ignore Case
                                </NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Container>
                </Navbar>

                <CodeEditor text={editorText} onTextChanged={(text) => this.onTextChanged(text)}/>
            </>
        );
    }
}
