import { v4 } from 'uuid';

export enum ToastType {
    INFO = 'info',
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error',
}

export interface Toast {
    id: string;
    title?: string;
    message: string;
    type: ToastType;
}

type Listener = (toast: Toast) => void;

class ToasterApiClass {
    private listeners: Set<Listener>;

    constructor() {
        this.listeners = new Set<Listener>(); // Initialize the set of listeners
    }

    // Called by <ToasterContainer> to subscribe
    onShow(fn: Listener) {
        this.listeners.add(fn);

        return () => {
            this.listeners.delete(fn);
        };
    }

    // Programmatic call from anywhere:
    public show(message: string, type: ToastType = ToastType.INFO, title?: string) {
        const toastGenId = v4(); // give unique id to close later this toast
        const toast: Toast = { id: toastGenId, title, message, type };
        this.listeners.forEach((fn) => {
            fn(toast);
        });
    }
}

export const toasterApi = new ToasterApiClass();
