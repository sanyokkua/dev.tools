/**
 * Defines types of toast notifications used in the UI.
 */
export enum ToastType {
    INFO = 'info',
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error',
}

/**
 * Configuration options for customizing toast notifications.
 */
export interface ShowToastOptions {
    message: string;
    type?: ToastType;
    title?: string;
    durationMs?: number;
}

/**
 * Represents a notification toast with customizable content and styling.
 */
export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    title?: string;
    exiting?: boolean;
}
