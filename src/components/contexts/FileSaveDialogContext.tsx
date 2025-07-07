'use client';
import { FileSaveDialog, SaveFileDialogOptions } from '@/controls/SaveFileDialog';
import React, { createContext, ReactNode, useContext, useState } from 'react';

/**
 * Provides access to the file save dialog functionality.
 */
interface FileSaveDialogContextValue {
    showFileSaveDialog: (opts: SaveFileDialogOptions) => void;
}

/**
 * React context provider for the file save dialog configuration and state.
 * Holds information required to control and manage the file save dialog behavior.
 */
const FileSaveDialogContext = createContext<FileSaveDialogContextValue | null>(null);

/**
 * Retrieves the context value for the file save dialog from the nearest parent provider.
 */
export const useFileSaveDialog = (): FileSaveDialogContextValue => {
    const ctx = useContext(FileSaveDialogContext);
    if (!ctx) {
        throw new Error('useFileSaveDialog must be used within a FileSaveDialogProvider');
    }
    return ctx;
};

/**
 * Component that manages the state and rendering of a file save dialog.
 *
 * @param children - React components to be rendered within the context provider.
 */
export const FileSaveDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setOpen] = useState(false);
    const [options, setOptions] = useState<SaveFileDialogOptions | null>(null);

    const showFileSaveDialog = (opts: SaveFileDialogOptions) => {
        setOptions(opts);
        setOpen(true);
    };

    const hide = () => {
        setOpen(false);
    };

    const elementToRender = options && <FileSaveDialog isOpen={isOpen} options={options} onClose={hide} />;

    return (
        <FileSaveDialogContext.Provider value={{ showFileSaveDialog }}>
            {children}
            {elementToRender}
        </FileSaveDialogContext.Provider>
    );
};
