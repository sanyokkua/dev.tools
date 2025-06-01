import { FileInfo } from '@/components/elements/file/FileTypes';
import { StringUtils } from 'coreutilsts';
import React, { ChangeEvent, useEffect, useRef } from 'react';

export type FileOpenProps = { openFile: boolean; supportedFiles: string[]; onFileOpened: (fileInfo: FileInfo) => void };

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

const FileOpen: React.FC<FileOpenProps> = ({ openFile, supportedFiles, onFileOpened }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const acceptAttribute = supportedFiles.join(',');

    useEffect(() => {
        if (openFile && fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, [openFile]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        readFileAsText(file)
            .then((content) => {
                let extension = file.name.split('.').pop() || '';
                extension = extension.startsWith('.') ? extension : `.${extension}`;
                const name = StringUtils.removeSuffixIfPresent(file.name, extension);
                const fileInfo: FileInfo = { name: name, extension: extension, content };
                onFileOpened(fileInfo);
            })
            .catch((error: unknown) => {
                console.error('Error reading file:', error);
                onFileOpened({ name: '', extension: '', content: '' });
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
