import { StringUtils } from 'coreutilsts';
import React, { ChangeEvent, useEffect, useRef } from 'react';
import { FileInfo } from './FileTypes';

const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (result && typeof result === 'string') {
                resolve(result);
            }
            resolve('');
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
};

export type FileOpenProps = {
    showOpenFileDialog: boolean;
    supportedFiles: string[];
    onFileOpened: (fileInfo: FileInfo) => void;
};

const FileOpen: React.FC<FileOpenProps> = ({ showOpenFileDialog, supportedFiles, onFileOpened }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const acceptAttribute = supportedFiles.join(',');

    useEffect(() => {
        if (showOpenFileDialog && fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, [showOpenFileDialog]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        readFileAsText(file)
            .then((content) => {
                let extension = file.name.split('.').pop() || '';
                extension = extension.startsWith('.') ? extension : `.${extension}`;
                const name = StringUtils.removeSuffixIfPresent(file.name, extension);
                const fileInfo: FileInfo = {
                    fullName: file.name,
                    size: file.size,
                    name: name,
                    extension: extension.toLowerCase(),
                    content,
                };
                onFileOpened(fileInfo);
            })
            .catch((error: unknown) => {
                console.error('Error reading file:', error);
                onFileOpened({ fullName: '', size: 0, name: '', extension: '', content: '' });
            })
            .finally(() => {
                event.target.value = '';
            });
    };

    return (
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept={acceptAttribute}
        />
    );
};

export default FileOpen;
