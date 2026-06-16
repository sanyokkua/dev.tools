'use client';
import { saveAsFile } from '@/common/file-utils';
import { useToast } from '@/contexts/ToasterContext';
import { FileSaveDialog, SaveFileDialogOptions } from '@/controls/SaveFileDialog';
import { ToastType } from '@/controls/toaster/types';
import { supported } from 'browser-fs-access';
import React, { createContext, ReactNode, useContext, useState } from 'react';

/**
 * Provides access to the file save dialog functionality.
 */
interface FileSaveDialogContextValue {
    showFileSaveDialog: (opts: SaveFileDialogOptions) => void;
    saveAs: (opts: SaveFileDialogOptions) => void;
    save: (opts: SaveFileDialogOptions) => void;
    currentHandle: FileSystemFileHandle | null;
    setCurrentHandle: (handle: FileSystemFileHandle | null) => void;
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
    const [currentHandle, setCurrentHandle] = useState<FileSystemFileHandle | null>(null);
    const { showToast } = useToast();

    const showFileSaveDialog = (opts: SaveFileDialogOptions): void => {
        setOptions(opts);
        setOpen(true);
    };

    const hide = (): void => {
        setOpen(false);
    };

    const performSaveAs = async (opts: SaveFileDialogOptions, handle?: FileSystemFileHandle | null): Promise<void> => {
        try {
            const newHandle = await saveAsFile(
                {
                    fileName: opts.fileName,
                    fileExtension: opts.fileExtension,
                    fileContent: opts.fileContent,
                    fileMimeType: opts.mimeType,
                },
                handle ?? null,
            );
            if (newHandle) setCurrentHandle(newHandle);
            showToast({ message: 'File Saved', type: ToastType.SUCCESS });
        } catch (err: unknown) {
            console.error(err);
            showToast({ message: 'Failed to Save file', type: ToastType.ERROR });
        }
    };

    const saveAs = (opts: SaveFileDialogOptions): void => {
        if (supported) {
            void performSaveAs(opts, null);
        } else {
            showFileSaveDialog(opts);
        }
    };

    const save = (opts: SaveFileDialogOptions): void => {
        if (currentHandle) {
            void performSaveAs(opts, currentHandle);
        } else {
            saveAs(opts);
        }
    };

    const elementToRender = options && <FileSaveDialog isOpen={isOpen} options={options} onClose={hide} />;

    return (
        <FileSaveDialogContext.Provider value={{ showFileSaveDialog, saveAs, save, currentHandle, setCurrentHandle }}>
            {children}
            {elementToRender}
        </FileSaveDialogContext.Provider>
    );
};
