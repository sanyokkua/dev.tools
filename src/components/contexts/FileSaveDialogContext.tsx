'use client';
import { FileSaveDialog, SaveFileDialogOptions } from '@/controls/SaveFileDialog';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface FileSaveDialogContextValue {
    showFileSaveDialog: (opts: SaveFileDialogOptions) => void;
}

const FileSaveDialogContext = createContext<FileSaveDialogContextValue | null>(null);

export const useFileSaveDialog = (): FileSaveDialogContextValue => {
    const ctx = useContext(FileSaveDialogContext);
    if (!ctx) {
        throw new Error('useFileSaveDialog must be used within a FileSaveDialogProvider');
    }
    return ctx;
};

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
