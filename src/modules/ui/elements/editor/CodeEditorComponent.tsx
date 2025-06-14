import { usePage } from '@/contexts/PageContext';
import { toasterApi, ToastType } from '@/controls/toaster/ToasterApi';
import ContentContainerFlex from '@/layout/ContentContainerFlex';
import copy from 'copy-to-clipboard';
import { editor, languages as MonacoLanguages } from 'monaco-editor';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FileOpen from '../file/FileOpen';
import { fileSave } from '../file/FileSave';
import { FileInfo } from '../file/FileTypes';
import { OnMenuItemClick } from '../navigation/menubar/types';
import CodeEditor, { AppCodeEditorPropsBase, EditorOnMount, EditorProperties } from './CodeEditor';
import CodeEditorInfoLine from './CodeEditorInfoLine';
import CodeEditorMenu from './CodeEditorMenu';

export type OnFileChangesEvent = (fileInfo?: FileInfo) => void;
export type OnContentChangesEvent = (content?: string) => void;

export interface CodeEditorProps extends AppCodeEditorPropsBase {
    editorHeader?: string;
    showMenu?: boolean;
    showInfo?: boolean;
    infoReadOnly?: boolean;
    originalLang?: string;
    onMount?: EditorOnMount;
    onFileCreated?: OnFileChangesEvent;
    onFileOpened?: OnFileChangesEvent;
    onFileSaved?: OnFileChangesEvent;
    onEditorContentChanged?: OnContentChangesEvent;
    onContentPasted?: OnContentChangesEvent;
    onContentCopied?: OnContentChangesEvent;
    onEditorLanguageChanged?: (language: MonacoLanguages.ILanguageExtensionPoint) => void;
}

const CodeEditorComponent: React.FC<CodeEditorProps> = ({
    editorHeader,
    editorContent = '',
    isReadOnly = false,
    wordWrap = false,
    minimap = true,
    originalLang = 'plaintext',
    showMenu = true,
    showInfo = true,
    infoReadOnly = false,
    onMount = () => {},
    onFileCreated = () => {},
    onFileOpened = () => {},
    onFileSaved = () => {},
    onEditorContentChanged = () => {},
    onContentPasted = () => {},
    onContentCopied = () => {},
    onEditorLanguageChanged = () => {},
}) => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Code Editor');
    }, [setPageTitle]);

    const [editorLanguageId, setEditorLanguageId] = useState<string>(originalLang);
    const [editorWordWrap, setEditorWordWrap] = useState<boolean>(wordWrap);
    const [editorMinimap, setEditorMinimap] = useState<boolean>(minimap);
    const [openFileDialog, setOpenFileDialog] = useState<boolean>(false);
    const [fileInfo, setFileInfo] = useState<FileInfo>({ name: 'Untitled', extension: '.txt', content: editorContent });

    const [availableLanguages, setAvailableLanguages] = useState<MonacoLanguages.ILanguageExtensionPoint[]>([]);
    const [languageExtensions, setLanguageExtensions] = useState<string[]>(['.txt']);

    const supportedLanguageIds = useMemo(() => availableLanguages.map((lang) => lang.id), [availableLanguages]);

    const monacoEditorRef = useRef<editor.IStandaloneCodeEditor>(null);

    const editorOnMount = useCallback(
        (editorProps: EditorProperties) => {
            const languages = editorProps.languages;
            setAvailableLanguages(languages);
            monacoEditorRef.current = editorProps.editor;
            onMount(editorProps.editor, editorProps.monaco);
        },
        [onMount],
    );

    useEffect(() => {
        if (availableLanguages.length > 0) {
            const foundLang = availableLanguages.find((lang) => lang.id === editorLanguageId);
            if (foundLang) {
                const newExtensions = foundLang.extensions ?? ['.txt'];
                setLanguageExtensions(newExtensions);
                setFileInfo((prevState) => ({ ...prevState, extension: newExtensions[0] }));
            }
        }
    }, [availableLanguages, editorLanguageId]);

    useEffect(() => {
        if (monacoEditorRef.current && monacoEditorRef.current.getValue() !== fileInfo.content) {
            monacoEditorRef.current.setValue(fileInfo.content);
        }
    }, [fileInfo.content]);

    const onFileNewClick: OnMenuItemClick = useCallback(() => {
        const newFile: FileInfo = { name: 'Untitled', extension: languageExtensions[0] || '.txt', content: '' };
        setFileInfo(newFile);
        onEditorContentChanged('');
        onFileCreated(newFile);
        toasterApi.show('File Created', ToastType.INFO);
    }, [languageExtensions, onEditorContentChanged, onFileCreated]);

    const onFileOpenClick: OnMenuItemClick = useCallback(() => {
        setOpenFileDialog(true);
    }, []);

    const onFileSaveClick: OnMenuItemClick = useCallback(() => {
        const selectedLanguage = availableLanguages.find((lang) => lang.id === editorLanguageId);
        const availableMimeTypes = selectedLanguage?.mimetypes ?? ['text/plain;charset=utf-8'];
        const mimeType = availableMimeTypes[0];
        const content = fileInfo.content;
        const contentFromEditor = monacoEditorRef.current?.getValue();
        if (content !== contentFromEditor) {
            throw new Error('Content from editor does not match content from state');
        }
        fileSave({
            fileName: fileInfo.name ?? '',
            fileContent: content,
            fileMimeType: mimeType,
            fileExtension: fileInfo.extension ?? '',
        });
        onFileSaved(fileInfo);
        // toaster.create({ description: 'File Saved', type: 'info' });
    }, [availableLanguages, editorLanguageId, fileInfo, onFileSaved]);

    const onEditorWrapLinesClick: OnMenuItemClick = useCallback(() => {
        setEditorWordWrap((prev) => !prev);
    }, []);

    const onEditorMiniMapClick: OnMenuItemClick = useCallback(() => {
        setEditorMinimap((prev) => !prev);
    }, []);

    const onPasteFromClipboard = useCallback(() => {
        navigator.clipboard
            .readText()
            .then((value) => {
                setFileInfo((prevState) => ({ ...prevState, content: value }));
                onEditorContentChanged(value);
                onContentPasted(value);
                // toaster.create({ description: 'Pasted From Clipboard', type: 'info' });
            })
            .catch(() => {
                // toaster.create({ description: 'Failed to paste from clipboard', type: 'error' });
            });
    }, [onEditorContentChanged, onContentPasted]);

    const onCopyToClipboard = useCallback(() => {
        if (copy(fileInfo.content)) {
            onContentCopied(fileInfo.content);
            // toaster.create({ description: 'Copied To Clipboard', type: 'info' });
        }
    }, [fileInfo.content, onContentCopied]);

    const onTypeSubmenuClick = useCallback(
        (langId: string) => {
            const lang = availableLanguages.find((lang) => lang.id === langId);
            if (lang) {
                const langExtensions = lang.extensions ?? ['.txt'];
                setEditorLanguageId(lang.id);
                setLanguageExtensions(langExtensions);
                setFileInfo((prevState) => ({ ...prevState, extension: langExtensions[0] }));
                onEditorLanguageChanged(lang);
                // toaster.create({ description: `Language changed to: ${lang.id}`, type: 'info' });
            } else {
                // toaster.create({ description: 'Language not found', type: 'error' });
            }
        },
        [availableLanguages, onEditorLanguageChanged],
    );

    const onFileOpenedHandler = useCallback(
        (openedFileInfo: FileInfo) => {
            setOpenFileDialog(false);
            setFileInfo(openedFileInfo);
            if (openedFileInfo.extension && availableLanguages.length > 0) {
                const ext = openedFileInfo.extension;
                const languageOfFile = availableLanguages.find((lang) =>
                    lang.extensions ? lang.extensions.includes(ext) : false,
                );
                if (languageOfFile) {
                    setEditorLanguageId(languageOfFile.id);
                    setLanguageExtensions(languageOfFile.extensions ?? ['.txt']);
                }
            }
            onFileOpened(openedFileInfo);
        },
        [availableLanguages, onFileOpened],
    );

    const onNameChanged = useCallback((name: string) => {
        setFileInfo((prevState) => ({ ...prevState, name }));
    }, []);

    const onExtensionChanged = useCallback((extension: string) => {
        setFileInfo((prevState) => ({ ...prevState, extension }));
    }, []);

    const onTextChanged = useCallback((value: string | undefined) => {
        if (value) {
            setFileInfo((prevState) => ({ ...prevState, content: value }));
            onEditorContentChanged(value);
        } else {
            setFileInfo((prevState) => ({ ...prevState, content: '' }));
            onEditorContentChanged('');
        }
    }, []);

    return (
        <ContentContainerFlex>
            {editorHeader && <h1>{editorHeader}</h1>}
            {showMenu && (
                <CodeEditorMenu
                    languages={availableLanguages}
                    onLanguageSelected={onTypeSubmenuClick}
                    onFileNewClick={onFileNewClick}
                    onFileOpenClick={onFileOpenClick}
                    onFileSaveClick={onFileSaveClick}
                    onEditorWrapLinesClick={onEditorWrapLinesClick}
                    onEditorCodeMapClick={onEditorMiniMapClick}
                    onContentCopyClick={onCopyToClipboard}
                    onContentPasteClick={onPasteFromClipboard}
                />
            )}
            {showInfo && (
                <CodeEditorInfoLine
                    language={editorLanguageId}
                    extensions={languageExtensions}
                    wordWrap={editorWordWrap ? 'On' : 'Off'}
                    minimap={editorMinimap ? 'On' : 'Off'}
                    fileInfo={fileInfo}
                    onNameChanged={onNameChanged}
                    onExtensionChanged={(it) => {
                        onExtensionChanged(it.itemId);
                    }}
                    readOnly={infoReadOnly}
                />
            )}
            <CodeEditor
                editorContent={fileInfo.content}
                isReadOnly={isReadOnly}
                wordWrap={editorWordWrap}
                minimap={editorMinimap}
                originalLang={editorLanguageId}
                onEditorMounted={editorOnMount}
                onChange={onTextChanged}
            />
            <FileOpen
                openFile={openFileDialog}
                supportedFiles={supportedLanguageIds}
                onFileOpened={onFileOpenedHandler}
            />
        </ContentContainerFlex>
    );
};

export default CodeEditorComponent;
