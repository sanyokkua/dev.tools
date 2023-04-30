import React from "react";
import {Button} from "antd";

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