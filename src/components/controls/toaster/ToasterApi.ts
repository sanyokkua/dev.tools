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
    private listeners = new Set<Listener>();

    // Called by <ToasterContainer> to subscribe
    onShow(fn: Listener) {
        this.listeners.add(fn);
        return () => {
            this.listeners.delete(fn);
        };
    }

    // Programmatic call from anywhere:
    public show(message: string, type: ToastType = ToastType.INFO, title?: string) {
        const toastGenId = Math.random().toString(36).substr(2, 9);
        const toast: Toast = { id: toastGenId, title, message, type };
        this.listeners.forEach((fn) => {
            fn(toast);
        });
    }
}

export const toasterApi = new ToasterApiClass();
