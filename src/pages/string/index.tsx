import React, {ReactElement} from "react";
import NavigationBar from "@/components/navigation";
import CodeEditor from "@/components/editor/codeeditor";
import {Container, Nav, Navbar, NavDropdown} from "react-bootstrap";
import {copyToClipboard, getFromClipboard} from "@/tools/common_tools";
import {
    decodeText,
    encodeText,
    getLinesFromString,
    randomizeStringsOrder,
    SortingTypes,
    sortStrings,
    splitStringBy,
} from "@/tools/string_tools";
import {Decoder, DECODERS, EncodeDecodeFunc, Encoder, ENCODERS} from "@/tools/encoding_tools";

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
        const txt = this.state?.text;
        copyToClipboard(txt && txt.length > 0 ? txt : "");
    }

    onPasteClicked() {
        getFromClipboard()
            .then((text) => this.setState({text: text}))
            .catch(err => console.error(err));

    }

    onCutClicked() {
        const txt = this.state?.text;
        copyToClipboard(txt && txt.length > 0 ? txt : "");
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

        const strings = splitStringBy(txt, ".");
        const result = strings.join("\n");
        this.setState({text: result});
    }

    onShuffleClicked() {
        const txt = this.state?.text;
        if (txt === null || txt === undefined || txt.length === 0) {
            return;
        }

        const linesFromString = getLinesFromString(txt);
        const sorted = randomizeStringsOrder(linesFromString);

        this.setState({text: sorted.join("\n")});
    }

    onSortClicked(sortType: SortingTypes) {
        const txt = this.state?.text;
        if (txt === null || txt === undefined || txt.length === 0) {
            return;
        }

        const linesFromString = getLinesFromString(txt);
        const sorted = sortStrings(linesFromString, sortType);

        this.setState({text: sorted.join("\n")});
    }

    onTextChanged(text: string) {
        this.setState({
            text: text,
        });
    }

    onEncodeClicked(encoder: Encoder) {
        const txt = this.state?.text;
        if (txt === null || txt === undefined || txt.length === 0) {
            return;
        }

        encodeText(txt, encoder)
            .then((text: string) => this.setState({text: text}))
            .catch(e => console.warn(e));
    }

    onDecodeClicked(decoder: Decoder) {
        const txt = this.state?.text;
        if (txt === null || txt === undefined || txt.length === 0) {
            return;
        }

        decodeText(txt, decoder)
            .then((text: string) => this.setState({text: text}))
            .catch(e => console.warn(e));
    }

    buildSortingItems() {
        const dropdownItems: ReactElement[] = [];
        [SortingTypes.ASC, SortingTypes.DSC, SortingTypes.ASC_IGN_CASE, SortingTypes.DSC_IGN_CASE]
            .forEach((value: SortingTypes) => {
                dropdownItems.push(
                    <NavDropdown.Item eventKey={value} onClick={(e) => this.onSortClicked(value)}>
                        {value}
                    </NavDropdown.Item>,
                );
            });
        return <NavDropdown title="Sorting" id="basic-nav-dropdown-sort">
            {dropdownItems}
        </NavDropdown>;
    }

    buildEncodersItems() {
        const dropdownItems: ReactElement[] = [];
        ENCODERS.forEach((value: EncodeDecodeFunc, key: Encoder) => {
            dropdownItems.push(
                <NavDropdown.Item eventKey={key} onClick={(e) => this.onEncodeClicked(key)}>
                    {key}
                </NavDropdown.Item>,
            );
        });

        return <NavDropdown title="Encoders" id="basic-nav-dropdown-encode">
            {dropdownItems}
        </NavDropdown>;
    }

    buildDecodersItems() {
        const dropdownItems: ReactElement[] = [];
        DECODERS.forEach((value: EncodeDecodeFunc, key: Decoder) => {
            dropdownItems.push(
                <NavDropdown.Item eventKey={key} onClick={(e) => this.onDecodeClicked(key)}>
                    {key}
                </NavDropdown.Item>,
            );
        });

        return <NavDropdown title="Decoders" id="basic-nav-dropdown-decode">
            {dropdownItems}
        </NavDropdown>;
    }

    render() {
        const editorText: string = this.state?.text ? this.state.text : "";
        return (
            <>
                <NavigationBar/>
                <Navbar bg="light" variant="light" expand="lg">
                    <Container>
                        <Nav>
                            <Nav.Link onClick={(e) => this.onCopyClicked()}>Copy</Nav.Link>
                            <Nav.Link onClick={(e) => this.onPasteClicked()}>Paste</Nav.Link>
                            <Nav.Link onClick={(e) => this.onCutClicked()}>Cut</Nav.Link>
                            <Nav.Link onClick={(e) => this.onClearClicked()}>Clear</Nav.Link>
                            <Nav.Link onClick={(e) => this.onSplitClicked()}>Split</Nav.Link>
                            <Nav.Link onClick={(e) => this.onShuffleClicked()}>Shuffle</Nav.Link>
                            {this.buildSortingItems()}
                            {this.buildEncodersItems()}
                            {this.buildDecodersItems()}
                        </Nav>
                    </Container>
                </Navbar>

                <CodeEditor text={editorText} onTextChanged={(text) => this.onTextChanged(text)}/>
            </>
        );
    }
}
