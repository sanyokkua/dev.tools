// src/toaster/ToasterApi.ts
export enum NotificationType {
    INFO = 'info',
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error',
}

export interface Toast {
    id: string;
    title?: string;
    message: string;
    type: NotificationType;
}

// Simple event emitter:
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
    public show(message: string, type: NotificationType = NotificationType.INFO, title?: string) {
        const toast: Toast = { id: Math.random().toString(36).substr(2, 9), title, message, type };
        this.listeners.forEach((fn) => fn(toast));
    }
}

export const toasterApi = new ToasterApiClass();
