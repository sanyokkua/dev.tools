'use client';
import Button from '@/controls/Button';
import { FC, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Properties for configuring a modal component.
 */
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    children: ReactNode;
    confirmText?: string;
    cancelText?: string;
}

/**
 * Creates a reusable modal component with customizable content and actions.
 * @param isOpen - Determines whether the modal is currently visible.
 * @param onClose - Callback to handle closing of the modal.
 * @param onConfirm - Optional callback for confirm action in the modal.
 * @param title - Header text displayed at the top of the modal.
 * @param children - Main content area inside the modal body.
 * @param confirmText - Text of Confirm button
 * @param cancelText - Text of Cancel button
 * @returns A React portal-rendered modal overlay with backdrop and content.*/
const Modal: FC<ModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    children,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
}) => {
    // Handle Escape key press for closing the modal
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        // Cleanup function to remove an event listener
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Return null if the modal is not open, so it doesn't render anything
    if (!isOpen || !document) {
        return null;
    }
    const modalRoot = document.getElementById('modal-root') || document.body;

    // The actual modal content to be portaled
    const modalContent = (
        <div className="modal-backdrop" onClick={onClose}>
            {/* Stop propagation to prevent clicks inside the modal from closing it */}
            <div
                className="modal-content"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="modal-close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className="modal-body">{children}</div>

                <div className="modal-footer">
                    <Button variant="outlined" colorStyle="primary-color" onClick={onClose} text={cancelText} />
                    {onConfirm && (
                        <Button variant="solid" colorStyle="primary-color" onClick={onConfirm} text={confirmText} />
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, modalRoot);
};

export default Modal;
