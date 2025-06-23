import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Toast, toasterApi } from './ToasterApi';

/**
 * React functional component that serves as a container for displaying toast notifications.
 * It manages the state of toasts and automatically removes them after a set duration.
 * The component ensures that it only renders when mounted and the document is available,
 * using a portal to append the toast content to a specific root element in the DOM.
 *
 * @returns {React.ReactPortal | null} - A React Portal containing the toast notifications or null if not ready to render.
 */
export const ToasterContainer: React.FC = (): React.ReactPortal | null => {
    // State to hold the list of active toasts
    const [toasts, setToasts] = useState<Toast[]>([]);
    // State to track if the component is mounted
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Set the component as mounted when effect runs
        setMounted(true);
        // Subscribe to incoming toasts from toasterApi
        return toasterApi.onShow((toast) => {
            // Add new toast to the list of active toasts
            setToasts((prev) => [...prev, toast]);
            // Auto-remove the toast after 4 seconds
            setTimeout(() => {
                // Filter out the removed toast by id
                setToasts((current) => current.filter((t) => t.id !== toast.id));
            }, 4000);
        });
    }, []);

    // Check if component is mounted and document is available before rendering
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!mounted || !document) {
        return null;
    }
    // Select the toaster root element or fall back to document body if not found
    const toasterRoot = document.getElementById('toaster-root') || document.body;

    // Render the toast container with individual toast elements
    const toasterContent = (
        <div className="toaster-container">
            {toasts.map((t) => (
                // Map each toast to a div element with its corresponding title and message
                <div key={t.id} className={`toast ${t.type}`}>
                    {t.title && <div className="toast-title">{t.title}</div>}
                    <div className="toast-message">{t.message}</div>
                </div>
            ))}
        </div>
    );
    // Create a portal to append the toast content to the selected root element
    return createPortal(toasterContent, toasterRoot);
};
