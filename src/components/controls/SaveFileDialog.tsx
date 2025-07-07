'use client';
import { useToast } from '@/contexts/ToasterContext';
import Input from '@/controls/Input';
import Modal from '@/controls/Modal';
import Select, { SelectItem } from '@/controls/Select';
import { ToastType } from '@/controls/toaster/types';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { saveTextFile } from '@/common/file-utils';

/**
 * Defines configuration options for a save file dialog.
 */
export interface SaveFileDialogOptions {
    fileContent: string;
    fileName: string; // without extension
    fileExtension: string; // e.g. ".txt"
    availableExtensions: string[]; // e.g. [".txt", ".md"]
    mimeType?: string; // optional override
}

/**
 * Configuration properties for a modal dialog component.
 * Defines state and behavior of the dialog interface.
 */
interface Props {
    isOpen: boolean;
    options: SaveFileDialogOptions;
    onClose: () => void;
}

/**
 * A modal dialog component for saving files with user-provided names and extensions.
 * @param isOpen - Indicates whether the save dialog is currently displayed
 * @param options - Configuration object containing file details and available extensions
 * @param onClose - Callback function to handle closing the dialog
 */
export const FileSaveDialog: React.FC<Props> = ({ isOpen, options, onClose }) => {
    const { fileContent, fileName, fileExtension, availableExtensions, mimeType } = options;
    const { showToast } = useToast();
    const [name, setName] = useState(fileName);
    const [ext, setExt] = useState(fileExtension);

    // Reset when reopened
    useEffect(() => {
        if (isOpen) {
            setName(fileName);
            setExt(fileExtension);
        }
    }, [isOpen, fileName, fileExtension]);

    const handleConfirm = () => {
        try {
            saveTextFile({ fileName: name, fileExtension: ext, fileContent: fileContent, fileMimeType: mimeType });
            showToast({ message: 'File Saved', type: ToastType.SUCCESS });
        } catch (ex: unknown) {
            console.error(ex);
            showToast({ message: 'Failed to Save file', type: ToastType.ERROR });
        }
        onClose();
    };

    const selectItems: SelectItem[] = availableExtensions.map((e) => ({ itemId: e, displayText: e }));

    return createPortal(
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            title="Save File As"
            confirmText="Save"
            cancelText="Cancel"
        >
            <p>Please choose a file name and extension:</p>
            <div className="flex gap-2 items-center">
                <Input
                    defaultValue={name}
                    onChange={(value) => {
                        setName(value);
                    }}
                    size="small"
                    variant="outlined"
                />
                <Select
                    items={selectItems}
                    selectedItem={ext}
                    onSelect={(item) => {
                        setExt(item.itemId);
                    }}
                    size="small"
                    colorStyle="black-color"
                />
            </div>
        </Modal>,
        document.getElementById('modal-root') || document.body,
    );
};
