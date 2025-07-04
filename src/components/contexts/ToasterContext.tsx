'use client';
import { Toaster } from '@/controls/toaster/Toaster';
import { ShowToastOptions, Toast, ToastType } from '@/controls/toaster/types';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { v4 } from 'uuid';

interface ToastContextValue {
    showToast: (options: ShowToastOptions) => void;
}

const ToasterContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
    const ctx = useContext(ToasterContext);
    if (!ctx) {
        throw new Error('useToast must be used within a ToasterProvider');
    }
    return ctx;
};

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
