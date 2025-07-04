export enum ToastType {
    INFO = 'info',
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error',
}

export interface ShowToastOptions {
    message: string;
    type?: ToastType;
    title?: string;
    durationMs?: number;
}

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    title?: string;
}
