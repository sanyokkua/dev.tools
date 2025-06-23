import { StringUtils } from 'coreutilsts';
import React, { ChangeEvent, useEffect, useRef } from 'react';
import { createEmptyFile, FileInfo } from './FileTypes';

type OnSuccessHandler = (event: ProgressEvent<FileReader>) => void;
type OnErrorHandler = () => void;

const createFileReader = (onSuccess: OnSuccessHandler, onFailure: OnErrorHandler) => {
    const reader = new FileReader();
    reader.onload = onSuccess;
    reader.onerror = onFailure;
    return reader;
};

const createOnSuccessHandler: (
    resolve: (value: string | PromiseLike<string>) => void,
    reject: (reason?: unknown) => void,
) => OnSuccessHandler = (resolve, reject) => {
    return (event: ProgressEvent<FileReader>) => {
        const isDone = event.target?.readyState === FileReader.DONE;
        const isStringValue = typeof event.target?.result === 'string';
        if (isDone && isStringValue) {
            resolve(event.target.result);
        } else {
            reject(new Error('Failed to read file'));
        }
    };
};

const createOnErrorHandler: (reject: (reason?: unknown) => void) => OnErrorHandler = (reject) => {
    return () => {
        reject(new Error('Failed to read file'));
    };
};

const createFileReadPromise = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const onFileReadSuccess = createOnSuccessHandler(resolve, reject);
        const onFileReadFailed = createOnErrorHandler(reject);
        const reader = createFileReader(onFileReadSuccess, onFileReadFailed);
        reader.readAsText(file);
    });
};

const createFileInfo: (file: File, content: string) => FileInfo = (file, content) => {
    let extension = file.name.split('.').pop() || '';
    extension = extension.startsWith('.') ? extension : `.${extension}`;
    const name = StringUtils.removeSuffixIfPresent(file.name, extension);
    return {
        fullName: file.name,
        size: file.size,
        name, // Use the updated name variable
        extension: extension.toLowerCase(),
        content,
    };
};

const handleFileOpenFailure: (error: unknown) => FileInfo = (error) => {
    console.error('Error reading file:', error);
    return createEmptyFile();
};

export type FileOpenProps = {
    supportedFiles: string[];
    onFileOpened: (fileInfo?: FileInfo) => void;
    onMount: (openDialog: HTMLInputElement | null) => void;
};

const OpenFileDialog: React.FC<FileOpenProps> = ({ supportedFiles, onFileOpened, onMount }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const acceptAttribute = supportedFiles.join(',');

    const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const files: FileList | null = event.target.files;
        if (!files || files.length === 0) {
            // there are no files selected
            console.log('No files selected');
            return;
        }
        if (files.length > 1) {
            // multiple selection prevention
            console.log('Multiple selection prevention');
            return;
        }
        createFileReadPromise(files[0])
            .then((content) => {
                console.log('File Content received: ', content);
                const fileInfo = createFileInfo(files[0], content);
                onFileOpened(fileInfo);
            })
            .catch((error: unknown) => {
                const fileInfo = handleFileOpenFailure(error);
                onFileOpened(fileInfo);
                console.log('Error opening file:', error);
            })
            .finally(() => {
                console.log('File opened');
                event.target.value = '';
            });
    };

    useEffect(() => {
        onMount(fileInputRef.current);
    }, []);

    return (
        <input
            type="file"
            ref={fileInputRef}
            onChange={onChangeHandler}
            style={{ display: 'none' }}
            accept={acceptAttribute}
        />
    );
};

export default OpenFileDialog;
