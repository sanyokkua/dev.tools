'use client';
import React from 'react';
import { createPortal } from 'react-dom';
import { Toast as ToastType } from './types';

/**
 * Properties for configuring a toast notification system.
 */
interface ToasterProps {
    toasts: ToastType[];
}

/**
 * React component for displaying notifications/toasts on the page.
 * Creates a portal to ensure proper rendering in all parent contexts.
 * @param toasts - Collection of toast messages to display
 */
export const Toaster: React.FC<ToasterProps> = ({ toasts }) => {
    return createPortal(
        <div className="toaster-container fixed top-4 right-4 space-y-2 z-50">
            {toasts.map((t) => (
                <div key={t.id} className={`toast toast-${t.type}`}>
                    {t.title && <div className="toast-title font-bold">{t.title}</div>}
                    <div className="toast-message">{t.message}</div>
                </div>
            ))}
        </div>,
        document.getElementById('toaster-root') || document.body,
    );
};
