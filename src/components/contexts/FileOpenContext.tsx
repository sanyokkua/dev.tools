'use client';
import { FileInfo } from '@/common/file-types';
import { createFileInfo, createFileReadPromise, handleFileOpenFailure } from '@/common/file-utils';
import React, { createContext, ReactNode, useCallback, useContext, useRef } from 'react';

/**
 * Configuration options for file open operations.
 * Defines the set of allowed file types and callback handlers
 * for success/failure scenarios.
 */
type FileOpenOptions = {
    supportedFiles: string[];
    onSuccess: (fileInfo?: FileInfo) => void;
    onFailure: (err?: unknown) => void;
};

/**
 * Context value type containing the main method for opening files.
 */
type FileOpenContextValue = { showFileOpenDialog: (opts: FileOpenOptions) => void };

/**
 * Creates a context for managing file opening operations.
 */
const FileOpenContext = createContext<FileOpenContextValue | null>(null);

/**
 * Hook to access the file opening capabilities provided by FileOpenProvider.
 *
 * @returns Object containing the showFileOpenDialog method.
 */
export const useFileOpen = (): FileOpenContextValue => {
    const ctx = useContext(FileOpenContext);
    if (!ctx) {
        throw new Error('useFileOpen must live inside FileOpenProvider');
    }
    return ctx;
};

/**
 * Context provider for file opening functionality. Wraps a hidden input element
 * that triggers the native file open dialog when clicked.
 *
 * @param children - The React components to wrap with this context.
 */

export const FileOpenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    /**
     * Displays a hidden file input element and handles file selection via a native dialog.
     *
     * @param options - Options for configuring the file open operation.
     * @param options.supportedFiles - Array of supported file extensions.
     * @param options.onSuccess - Callback for successful file opens.
     * @param options.onFailure - Callback for failed file operations.
     */
    const showFileOpenDialog = useCallback((options: FileOpenOptions) => {
        const inputEl = inputRef.current;
        if (!inputEl) {
            options.onFailure(new Error('File input is not available'));
            return;
        }

        const handler = (e: Event) => {
            // detach immediately so it only fires once
            inputEl.removeEventListener('change', handler);

            const target = e.target as HTMLInputElement;
            const files = target.files;
            if (!files || files.length === 0) {
                options.onFailure(new Error('No files selected'));
            } else if (files.length > 1) {
                options.onFailure(new Error('Multiple files not supported'));
            } else {
                const file = files[0];
                createFileReadPromise(file)
                    .then((content) => {
                        options.onSuccess(createFileInfo(file, content));
                    })
                    .catch((err: unknown) => {
                        options.onSuccess(handleFileOpenFailure(err));
                    })
                    .finally(() => {
                        target.value = '';
                    });
            }
        };

        inputEl.accept = options.supportedFiles.join(',');
        inputEl.value = '';
        inputEl.addEventListener('change', handler, { once: true });

        // trigger the file picker
        inputEl.click();
    }, []);

    return (
        <FileOpenContext.Provider value={{ showFileOpenDialog }}>
            {children}
            <input type="file" ref={inputRef} style={{ display: 'none' }} />
        </FileOpenContext.Provider>
    );
};
