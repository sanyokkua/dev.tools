import CodeEditor, { AppCodeEditorPropsBase, EditorOnMount } from '@/components/customs/editor/CodeEditor';
import CodeEditorInfoLine from '@/components/customs/editor/CodeEditorInfoLine';
import CodeEditorMenu from '@/components/customs/editor/CodeEditorMenu';
import FileOpen from '@/components/customs/file/FileOpen';
import { fileSave } from '@/components/customs/file/FileSave';
import { OnBtnClick } from '@/components/customs/PageMenuBar';
import { FileInfo } from '@/components/customs/types/FileTypes';
import { toaster } from '@/components/ui/Toaster';
import { usePage } from '@/contexts/PageContext';
import { Box } from '@chakra-ui/react';
import { Monaco } from '@monaco-editor/react';
import copy from 'copy-to-clipboard';
import { editor, languages as MonacoLanguages } from 'monaco-editor';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
    originalContent = '',
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
    const [fileInfo, setFileInfo] = useState<FileInfo>({
        name: 'Untitled',
        extension: '.txt',
        content: originalContent,
    });

    const [availableLanguages, setAvailableLanguages] = useState<MonacoLanguages.ILanguageExtensionPoint[]>([]);
    const [languageExtensions, setLanguageExtensions] = useState<string[]>(['.txt']);

    const supportedLanguageIds = useMemo(() => availableLanguages.map((lang) => lang.id), [availableLanguages]);

    const monacoEditorRef = useRef<editor.IStandaloneCodeEditor>(null);

    const editorOnMount: EditorOnMount = useCallback(
        (editorInst: editor.IStandaloneCodeEditor, monaco: Monaco) => {
            const languages = monaco.languages.getLanguages();
            setAvailableLanguages(languages);
            monacoEditorRef.current = editorInst;
            onMount(editorInst, monaco);
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

    const onFileNewClick: OnBtnClick = useCallback(() => {
        const newFile: FileInfo = { name: 'Untitled', extension: languageExtensions[0] || '.txt', content: '' };
        setFileInfo(newFile);
        onEditorContentChanged('');
        onFileCreated(newFile);
        toaster.create({ description: 'New File', type: 'info' });
    }, [languageExtensions, onEditorContentChanged, onFileCreated]);

    const onFileOpenClick: OnBtnClick = useCallback(() => {
        setOpenFileDialog(true);
    }, []);

    const onFileSaveClick: OnBtnClick = useCallback(() => {
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
        toaster.create({ description: 'File Saved', type: 'info' });
    }, [availableLanguages, editorLanguageId, fileInfo, onFileSaved]);

    const onEditorWrapLinesClick: OnBtnClick = useCallback(() => {
        setEditorWordWrap((prev) => !prev);
    }, []);

    const onEditorMiniMapClick: OnBtnClick = useCallback(() => {
        setEditorMinimap((prev) => !prev);
    }, []);

    const hasMountedWrap = useRef(false);
    useEffect(() => {
        if (hasMountedWrap.current) {
            setTimeout(() => {
                toaster.create({ description: `Word Wrap: ${editorWordWrap ? 'On' : 'Off'}`, type: 'info' });
            }, 0);
        } else {
            hasMountedWrap.current = true;
        }
    }, [editorWordWrap]);

    const hasMountedMiniMap = useRef(false);
    useEffect(() => {
        if (hasMountedMiniMap.current) {
            setTimeout(() => {
                toaster.create({ description: `Mini Map: ${editorMinimap ? 'On' : 'Off'}`, type: 'info' });
            }, 0);
        } else {
            hasMountedMiniMap.current = true;
        }
    }, [editorMinimap]);

    const onPasteFromClipboard = useCallback(() => {
        navigator.clipboard
            .readText()
            .then((value) => {
                setFileInfo((prevState) => ({ ...prevState, content: value }));
                onEditorContentChanged(value);
                onContentPasted(value);
                toaster.create({ description: 'Pasted From Clipboard', type: 'info' });
            })
            .catch(() => {
                toaster.create({ description: 'Failed to paste from clipboard', type: 'error' });
            });
    }, [onEditorContentChanged, onContentPasted]);

    const onCopyToClipboard = useCallback(() => {
        if (copy(fileInfo.content)) {
            onContentCopied(fileInfo.content);
            toaster.create({ description: 'Copied To Clipboard', type: 'info' });
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
                toaster.create({ description: `Language changed to: ${lang.id}`, type: 'info' });
            } else {
                toaster.create({ description: 'Language not found', type: 'error' });
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
        <Box borderWidth="1px">
            {editorHeader && <Box p="2">{editorHeader}</Box>}
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
                    onExtensionChanged={onExtensionChanged}
                    readOnly={infoReadOnly}
                />
            )}

            <Box p="2">
                <CodeEditor
                    originalContent={fileInfo.content}
                    isReadOnly={isReadOnly}
                    wordWrap={editorWordWrap}
                    minimap={editorMinimap}
                    originalLang={editorLanguageId}
                    onEditorCreated={editorOnMount}
                    onChange={onTextChanged}
                />
                <FileOpen
                    openFile={openFileDialog}
                    supportedFiles={supportedLanguageIds}
                    onFileOpened={onFileOpenedHandler}
                />
            </Box>
        </Box>
    );
};

export default CodeEditorComponent;
