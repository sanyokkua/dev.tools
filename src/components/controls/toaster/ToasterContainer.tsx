import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Toast, toasterApi } from './ToasterApi';

export const ToasterContainer: React.FC = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // subscribe to incoming toasts
        return toasterApi.onShow((toast) => {
            setToasts((prev) => [...prev, toast]);
            // auto-remove after 4s
            setTimeout(() => {
                setToasts((current) => current.filter((t) => t.id !== toast.id));
            }, 4000);
        });
    }, []);

    if (!mounted) {
        return null;
    }

    return createPortal(
        <div className="toaster-container">
            {toasts.map((t) => (
                <div key={t.id} className={`toast ${t.type}`}>
                    {t.title && <div className="toast-title">{t.title}</div>}
                    <div className="toast-message">{t.message}</div>
                </div>
            ))}
        </div>,
        document.body,
    );
};
