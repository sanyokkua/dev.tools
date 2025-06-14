import copy from 'copy-to-clipboard';
import { ErrorUtils } from 'coreutilsts';

export type OnSuccessCallback = (text: string) => void;
export type OnErrorCallback = (errMsg: string) => void;

export function pasteFromClipboard(onSuccess: OnSuccessCallback, onError: OnErrorCallback): void {
    navigator.clipboard
        .readText()
        .then((value) => {
            onSuccess(value);
        })
        .catch((err: unknown) => {
            const errMsg = ErrorUtils.extractErrorDetails(err);
            onError(errMsg);
        });
}

export function copyToClipboard(text: string): boolean {
    return copy(text);
}
