import React from "react";
import Form from "react-bootstrap/Form";

type FormInputProps<T> = {
    value: T;
    label: string;
    placeholder?: string | undefined;
    onValueChanged: (value: T) => void;
};

export function FormInputText(props: FormInputProps<string>) {
    const placeholder = props?.placeholder && props.placeholder.length > 0 ? props.placeholder : "";
    return (
        <Form.Group className="mb-3">
            <Form.Label>{props.label}</Form.Label>
            <Form.Control type="text" placeholder={placeholder} value={props.value}
                          onChange={(event) => props.onValueChanged(event.target.value)}/>
        </Form.Group>
    );
}

export function FormInputEmail(props: FormInputProps<string>) {
    const placeholder = props?.placeholder && props.placeholder.length > 0 ? props.placeholder : "";
    return (
        <Form.Group className="mb-3">
            <Form.Label>{props.label}</Form.Label>
            <Form.Control type="email" placeholder={placeholder} value={props.value}
                          onChange={(event) => props.onValueChanged(event.target.value)}/>
        </Form.Group>
    );
}

export function FormInputCheckbox(props: FormInputProps<boolean>) {
    return (
        <Form.Check type="checkbox" label={props.label}
                    onChange={(event) => props.onValueChanged(event.target.checked)}
        />
    );
}