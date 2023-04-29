import React from "react";
import {Toast, ToastContainer} from "react-bootstrap";

type NotificationToastProps = {
    header: string;
    message: string;
    show: boolean;
    onClose: () => void;
};

export function NotificationToast(props: NotificationToastProps) {
    return (
        <ToastContainer className="p-3" position="bottom-end">
            <Toast onClose={() => props.onClose()}
                   show={props.show} bg="success"
                   delay={3000} autohide>
                <Toast.Header>
                    <strong className="me-auto">{props.header}</strong>
                </Toast.Header>
                <Toast.Body> <strong className="me-auto">{props.message}</strong> </Toast.Body>
            </Toast>
        </ToastContainer>
    );
}