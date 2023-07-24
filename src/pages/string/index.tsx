import React from "react";
import CodeEditor from "@/components/editor/code_editor";
import {copyToClipboard, getFromClipboard} from "@/tools/common_tools";
import {
    decodeText,
    encodeText,
    getLinesFromString,
    randomizeStringsOrder,
    removeDuplicates,
    SortingTypes,
    sortStrings,
    splitStringBy,
} from "@/tools/string_tools";
import {Decoder, DECODERS, EncodeDecodeFunc, Encoder, ENCODERS} from "@/tools/encoding_tools";
import AppLayout, {mapPageMenuItemsToMenuPropsItems, PageMenuItem} from "@/components/app_layout";
import {MessageType, showMessage} from "@/components/notifications";
import SplitModal from "@/components/string/string_modals";

type StringPageState = {
    text: string;
    showModal: boolean;
};
export default class StringPage extends React.Component<any, StringPageState> {
    constructor(props: any) {
        super(props);
        this.state = {
            text: "",
            showModal: false,
        };
    }

    onCopyClicked() {
        const txt = this.state?.text;
        copyToClipboard(txt && txt.length > 0 ? txt : "");
        showMessage(MessageType.INFO, "Copied");
    }

    onPasteClicked() {
        getFromClipboard()
            .then((text) => {
                this.setState({text: text});
                showMessage(MessageType.INFO, "Pasted");
            })
            .catch(err => {
                console.error(err);
                showMessage(MessageType.ERROR, "Failed to paste data");
            });
    }

    onCutClicked() {
        const txt = this.state?.text;
        copyToClipboard(txt && txt.length > 0 ? txt : "");
        this.setState({text: ""});
        showMessage(MessageType.INFO, "Cut");
    }

    onClearClicked() {
        this.setState({text: ""});
        showMessage(MessageType.INFO, "Cleared");
    }

    onSplitClicked() {
        this.setState({showModal: true});
    }

    splitText(splitter: string | null) {
        this.setState({showModal: false});
        const txt = this.state.text;
        if (txt === null || txt === undefined || txt.length === 0) {
            showMessage(MessageType.WARNING, "Nothing to split");
            return;
        }
        if (!splitter) {
            showMessage(MessageType.WARNING, "Split is cancelled");
            return;
        }
        if (splitter.length === 0) {
            showMessage(MessageType.WARNING, "Splitter is empty");
            return;
        }

        const strings = splitStringBy(txt, splitter);
        const result = strings.join("\n");
        this.setState({text: result});
        showMessage(MessageType.SUCCESS, "Split successful");
    }

    onShuffleClicked() {
        const txt = this.state?.text;
        if (txt === null || txt === undefined || txt.length === 0) {
            showMessage(MessageType.WARNING, "Nothing to shuffle");
            return;
        }

        const linesFromString = getLinesFromString(txt);
        const sorted = randomizeStringsOrder(linesFromString);

        this.setState({text: sorted.join("\n")});
        showMessage(MessageType.SUCCESS, "Shuffle successful");
    }

    onRemoveDuplicatesClicked(ignoreCase: boolean = false) {
        const txt = this.state?.text;
        if (txt === null || txt === undefined || txt.length === 0) {
            showMessage(MessageType.WARNING, "No lines to filter duplicates");
            return;
        }
        const linesFromString = getLinesFromString(txt);
        const strings = removeDuplicates(linesFromString, ignoreCase);
        this.setState({
            text: strings.join("\n"),
        });
        showMessage(MessageType.SUCCESS, "Duplicates removed successfully");
    }

    onSortClicked(sortType: SortingTypes) {
        const txt = this.state?.text;
        if (txt === null || txt === undefined || txt.length === 0) {
            showMessage(MessageType.WARNING, "Nothing to sort");
            return;
        }

        const linesFromString = getLinesFromString(txt);
        const sorted = sortStrings(linesFromString, sortType);

        this.setState({text: sorted.join("\n")});
        showMessage(MessageType.SUCCESS, "Sort successful");
    }

    onTextChanged(text: string) {
        this.setState({
            text: text,
        });
    }

    onEncodeClicked(encoder: Encoder) {
        const txt = this.state?.text;
        if (txt === null || txt === undefined || txt.length === 0) {
            showMessage(MessageType.WARNING, "Nothing to encode");
            return;
        }

        encodeText(txt, encoder)
            .then((text: string) => {
                this.setState({text: text});
                showMessage(MessageType.SUCCESS, "Encoded successful");
            })
            .catch(err => {
                console.error(err);
                showMessage(MessageType.ERROR, "Failed to encode data");
            });
    }

    onDecodeClicked(decoder: Decoder) {
        const txt = this.state?.text;
        if (txt === null || txt === undefined || txt.length === 0) {
            showMessage(MessageType.WARNING, "Nothing to decode");
            return;
        }

        decodeText(txt, decoder)
            .then((text: string) => {
                this.setState({text: text});
                showMessage(MessageType.SUCCESS, "Decoded successful");
            })
            .catch(err => {
                console.error(err);
                showMessage(MessageType.ERROR, "Failed to decode data");
            });
    }

    buildMenuItemsSort(): PageMenuItem[] {
        return [SortingTypes.ASC, SortingTypes.DSC, SortingTypes.ASC_IGN_CASE, SortingTypes.DSC_IGN_CASE]
            .map(sortType => {
                return {title: sortType, onClick: () => this.onSortClicked(sortType)};
            });
    }

    buildMenuItemsEncoders(): PageMenuItem[] {
        const dropdownItems: PageMenuItem[] = [];
        ENCODERS.forEach((value: EncodeDecodeFunc, key: Encoder) => {
            dropdownItems.push(
                {title: key, onClick: () => this.onEncodeClicked(key)},
            );
        });
        return dropdownItems;
    }

    buildMenuItemsDecoders(): PageMenuItem[] {
        const dropdownItems: PageMenuItem[] = [];
        DECODERS.forEach((value: EncodeDecodeFunc, key: Decoder) => {
            dropdownItems.push(
                {title: key, onClick: () => this.onDecodeClicked(key)},
            );
        });

        return dropdownItems;
    }

    buildMenuItemsDuplicates(): PageMenuItem[] {
        return [
            {title: "Remove Duplicates", onClick: () => this.onRemoveDuplicatesClicked(false)},
            {title: "Remove Duplicates Ignore Case", onClick: () => this.onRemoveDuplicatesClicked(true)},
        ];
    }

    render() {
        const editorText: string = this.state?.text ? this.state.text : "";
        const operations: PageMenuItem[] = [
            {title: "Copy", onClick: () => this.onCopyClicked()},
            {title: "Paste", onClick: () => this.onPasteClicked()},
            {title: "Cut", onClick: () => this.onCutClicked()},
            {title: "Clear", onClick: () => this.onClearClicked()},
            {title: "Split", onClick: () => this.onSplitClicked()},
            {title: "Shuffle", onClick: () => this.onShuffleClicked()},
            {title: "Remove Duplicate Lines", children: this.buildMenuItemsDuplicates()},
            {title: "Sorting", children: this.buildMenuItemsSort()},
            {title: "Encoders", children: this.buildMenuItemsEncoders()},
            {title: "Decoders", children: this.buildMenuItemsDecoders()},

        ];
        const menuItems = mapPageMenuItemsToMenuPropsItems(operations);
        const content = <div>
            <CodeEditor text={editorText} onTextChanged={(text) => this.onTextChanged(text)} height={"50hv"}/>
            <SplitModal showModal={this.state.showModal}
                        onSubmit={(value) => this.splitText(value?.splitSymbol)}/>
        </div>;
        return (
            <AppLayout breadcrumbItems={["Home", "String"]} content={content} menuProps={menuItems}/>
        );
    }
}
