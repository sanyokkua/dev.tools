'use client';
import { Toaster } from '@/controls/toaster/Toaster';
import { ShowToastOptions, Toast, ToastType } from '@/controls/toaster/types';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { v4 } from 'uuid';

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

    const showToast = (options: ShowToastOptions) => {
        const { message, type = ToastType.INFO, title = '', durationMs = 4000 } = options;
        const id = v4();
        setToasts((curr) => [...curr, { id, title, message, type }]);

        setTimeout(() => {
            setToasts((curr) => curr.filter((t) => t.id !== id));
        }, durationMs);
    };

    const elementToRender = toasts.length > 0 && <Toaster toasts={toasts} />;

    return (
        <ToasterContext.Provider value={{ showToast }}>
            {children}
            {/* mount the container once at root */}
            {elementToRender}
        </ToasterContext.Provider>
    );
};
