'use client';
import React from 'react';
import { createPortal } from 'react-dom';
import { ToastType as ToastKind, Toast as ToastType } from './types';

interface ToasterProps {
    toasts: ToastType[];
    onDismiss?: (id: string) => void;
}

const ICONS: Record<ToastKind, React.ReactNode> = {
    [ToastKind.INFO]: (
        <svg className="toast-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.75 12h-1.5V7h1.5v5zm0-6h-1.5V5h1.5v1z" />
        </svg>
    ),
    [ToastKind.SUCCESS]: (
        <svg className="toast-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.78 5.72-4.5 5a.75.75 0 0 1-1.06.05l-2-2 1.06-1.06 1.46 1.46 3.97-4.41 1.07.96z" />
        </svg>
    ),
    [ToastKind.WARNING]: (
        <svg className="toast-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8.98 1.5a1.13 1.13 0 0 0-1.96 0L.35 13.5A1.13 1.13 0 0 0 1.33 15h13.34a1.13 1.13 0 0 0 .98-1.5L8.98 1.5zM8.75 12h-1.5v-1.5h1.5V12zm0-3h-1.5v-4h1.5v4z" />
        </svg>
    ),
    [ToastKind.ERROR]: (
        <svg className="toast-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.03 11.03-1.06 1.06L8 9.06l-1.97 2.03-1.06-1.06L6.94 8 4.97 5.97l1.06-1.06L8 6.94l1.97-2.03 1.06 1.06L8.94 8l2.09 2.03z" />
        </svg>
    ),
};

export const Toaster: React.FC<ToasterProps> = ({ toasts, onDismiss }) => {
    return createPortal(
        <div className="toaster-container">
            {toasts.map((t) => (
                <div key={t.id} className={`toast ${t.type}${t.exiting ? ' toast--exiting' : ''}`}>
                    <div className="toast-content">
                        {ICONS[t.type]}
                        <div className="toast-body">
                            {t.title && <div className="toast-title">{t.title}</div>}
                            <div className="toast-message">{t.message}</div>
                        </div>
                        {onDismiss && (
                            <button
                                className="toast-close-btn"
                                onClick={() => onDismiss(t.id)}
                                aria-label="Dismiss notification"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>,
        document.getElementById('toaster-root') || document.body,
    );
};
