import React from "react";
import {message} from "antd";

export enum MessageType {
    SUCCESS = "success",
    ERROR = "error",
    WARNING = "warning",
    INFO = "info",
    LOADING = "loading",
}

export function showMessage(msgType: MessageType, content: string, onClose?: () => void): void {
    switch (msgType) {
        case MessageType.INFO:
            message.info(content, undefined, onClose);
            return;
        case MessageType.SUCCESS:
            message.success(content, undefined, onClose);
            return;
        case MessageType.WARNING:
            message.warning(content, undefined, onClose);
            return;
        case MessageType.ERROR:
            message.error(content, undefined, onClose);
            return;
        case MessageType.LOADING:
            message.loading(content, undefined, onClose);
            return;
        default:
            message.info(content, undefined, onClose);
            return;
    }
}