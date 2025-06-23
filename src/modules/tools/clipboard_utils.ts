import { toasterApi, ToastType } from '@/controls/toaster/ToasterApi';
import copy from 'copy-to-clipboard';
import { ErrorUtils } from 'coreutilsts';

export type OnSuccessCallback = (text: string) => void;
export type OnErrorCallback = (errMsg: string) => void;

export function pasteFromClipboard(onSuccess: OnSuccessCallback, onError: OnErrorCallback): void {
    navigator.clipboard
        .readText()
        .then((value) => {
            onSuccess(value);
            toasterApi.show('Content pasted successfully', ToastType.SUCCESS);
        })
        .catch((err: unknown) => {
            const errMsg = ErrorUtils.extractErrorDetails(err);
            onError(errMsg);
            toasterApi.show('Failed to paste content', ToastType.ERROR);
        });
}

export function copyToClipboard(text: string): boolean {
    const success = copy(text);
    if (success) {
        toasterApi.show('Content copied to clipboard', ToastType.SUCCESS);
    } else {
        toasterApi.show('Failed to copy content', ToastType.ERROR);
    }
    return success;
}
