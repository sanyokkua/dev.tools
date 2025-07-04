'use client';
import React from 'react';
import { createPortal } from 'react-dom';
import { Toast as ToastType } from './types';

interface ToasterProps {
    toasts: ToastType[];
}

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
