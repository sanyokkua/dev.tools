import React from "react";
import {Button, Col, Row} from "antd";
import ReadOnlyCodeEditor from "@/components/editor/code_editor_readonly";
import {copyToClipboard} from "@/tools/common_tools";
import {MessageType, showMessage} from "@/components/notifications";

export type BtnType = "primary" | "default" | "dashed" | "text" | "link";
export type BtnSize = "large" | "middle" | "small";
export type BtnColor = "white" | "black" | "blue" | "red" | "green" | "grey" | string;

type GenericButtonProps = {
    label: string;
    type: BtnType;
    onClick: (event?: MouseEvent) => void;

    outline?: boolean;
    color?: BtnColor;
    size?: BtnSize;
    disabled?: boolean;
    fitToWidth?: boolean;
};

export function GenericButton(props: GenericButtonProps) {
    const outline: boolean = props.outline ? props.outline : false;
    const color: BtnColor | undefined = props.color;
    const size: BtnSize | undefined = props.size;
    const disabled: boolean = props.disabled ? props.disabled : false;
    const fitToWidth: boolean = props.fitToWidth ? props.fitToWidth : false;

    return (
        <Button type={props.type} color={color} size={size} ghost={outline} disabled={disabled} block={fitToWidth}
                onClick={() => props.onClick()}>
            {props.label}
        </Button>
    );
}

type GenericCodeViewerWithCopyButtonProps = {
    codeText: string;
    height?: string;
}

export function GenericCodeViewerWithCopyButton(props: GenericCodeViewerWithCopyButtonProps) {
    const onCopyBtnClicked = (text: string) => {
        copyToClipboard(text);
        showMessage(MessageType.SUCCESS, `Copied ${text}`);
        console.log(`onCopyBtnClicked`);
    };

    const height = props?.height ? props.height : "3vh";

    return <Row>
        <Col span={22}>
            <ReadOnlyCodeEditor text={props.codeText} syntax={"shell"} width={"10hv"} wrapLines={true}
                                height={height}/>
        </Col>
        <Col span={2}>
            <GenericButton type={"primary"} label={"Copy"} fitToWidth={true}
                           onClick={() => onCopyBtnClicked(props.codeText)}/>
        </Col>
    </Row>;
}

