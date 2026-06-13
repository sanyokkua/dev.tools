'use client';
import { Toaster } from '@/controls/toaster/Toaster';
import { ShowToastOptions, Toast, ToastType } from '@/controls/toaster/types';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { v4 } from 'uuid';

const EXIT_DURATION = 300;

/**
 * Provides the context for displaying toast notifications.
 */
interface ToastContextValue {
    showToast: (options: ShowToastOptions) => void;
}

/**
 * Provides access to Toast notifications state and functionality throughout the application.
 */
const ToasterContext = createContext<ToastContextValue | null>(null);

/**
 * Retrieves the current toast context value from the nearest ToasterProvider.
 * Throws an error if no provider is found in the component hierarchy.
 */
export const useToast = (): ToastContextValue => {
    const ctx = useContext(ToasterContext);
    if (!ctx) {
        throw new Error('useToast must be used within a ToasterProvider');
    }
    return ctx;
};

/**
 * React hook component providing a context for displaying toasts (notifications)
 * @param children - Child components that use toast functionality via ToasterContext
 */
export const ToasterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const markExiting = (id: string): void => {
        setToasts((curr) => curr.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    };

    const removeToast = (id: string): void => {
        setToasts((curr) => curr.filter((t) => t.id !== id));
    };

    const showToast = (options: ShowToastOptions): void => {
        const { message, type = ToastType.INFO, title = '', durationMs = 4000 } = options;
        const id = v4();
        setToasts((curr) => [...curr, { id, title, message, type }]);

        const exitAt = Math.max(0, durationMs - EXIT_DURATION);
        setTimeout(() => markExiting(id), exitAt);
        setTimeout(() => removeToast(id), durationMs);
    };

    const dismissToast = (id: string): void => {
        markExiting(id);
        setTimeout(() => removeToast(id), EXIT_DURATION);
    };

    const elementToRender = toasts.length > 0 && <Toaster toasts={toasts} onDismiss={dismissToast} />;

    return (
        <ToasterContext.Provider value={{ showToast }}>
            {children}
            {/* mount the container once at root */}
            {elementToRender}
        </ToasterContext.Provider>
    );
};
