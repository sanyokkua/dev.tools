import Button from '@/controls/Button';
import { FC, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    children: ReactNode;
    confirmText?: string;
    cancelText?: string;
}

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

        // Cleanup function to remove event listener
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Return null if the modal is not open, so it doesn't render anything
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
