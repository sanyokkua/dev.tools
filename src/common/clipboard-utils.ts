import copy from 'copy-to-clipboard';
import { ErrorUtils } from 'coreutilsts';

/**
 * Callback function invoked when an operation completes successfully.
 * @param text - Success message or result to be handled by the callback.
 */
type OnSuccessCallback = (text: string) => void;
/**
 * Callback function to handle error messages from the system.
 * @param errMsg - Error message received from the system.
 */
type OnErrorCallback = (errMsg: string) => void;

/**
 * Reads text from the clipboard and passes it to a success callback.
 *
 * @param onSuccess - Callback function invoked with the clipboard contents on successful read.
 * @param onError - Callback function invoked with an error message if reading fails.
 */
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

/**
 * Copies the provided text to the clipboard and returns a boolean indicating success.
 *
 * @param {string} text - The text content to be copied to the clipboard.
 * @returns {boolean} True if the copying operation was successful, false otherwise.
 */
export function copyToClipboard(text: string): boolean {
    return copy(text);
}
