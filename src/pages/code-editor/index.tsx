'use client';

import { DEFAULT_EXTENSION, DEFAULT_LANGUAGE_ID } from '@/common/constants';
import { FileInfo } from '@/common/file-types';
import { createDefaultFile } from '@/common/file-utils';
import { mapBoolean } from '@/common/formatting-tools';
import { useFileOpen } from '@/contexts/FileOpenContext';
import { useFileSaveDialog } from '@/contexts/FileSaveDialogContext';
import { usePage } from '@/contexts/PageContext';
import { useToast } from '@/contexts/ToasterContext';
import { createSelectItemsFromStringArray, SelectItem } from '@/controls/Select';
import { ToastType } from '@/controls/toaster/types';
import ContentContainerFlex from '@/layout/ContentContainerFlex';
import CodeEditor from '@/modules/ui/elements/editor/CodeEditor';
import CodeEditorInfoLine from '@/modules/ui/elements/editor/CodeEditorInfoLine';
import CodeEditorMenu from '@/modules/ui/elements/editor/CodeEditorMenu';
import {
    copyToClipboardFromEditor,
    getEditorContent,
    getFileLanguage,
    mapEditorLanguagesToMenuItem,
    pasteFromClipboardToEditor,
    setEditorContent,
} from '@/modules/ui/elements/editor/code-editor-utils';
import { EditorLanguage, EditorProperties } from '@/modules/ui/elements/editor/types';
import { BaseMenuItem, OnMenuItemClick, SubmenuItemTypeless } from '@/modules/ui/elements/navigation/menubar/types';
import { editor, languages } from 'monaco-editor';
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

interface CodeEditorState {
    menuLanguages: SubmenuItemTypeless[];

    editorLanguageId: string;
    editorWordWrap: boolean;
    editorMinimap: boolean;

    fileFullName: string; // name+extension
    fileSize: number; // size in bytes
    fileContent: string;
    fileName: string;
    fileExtension: string;
    fileSaveExtensions: SelectItem[];

    editorPropsOriginalEditorLangs: languages.ILanguageExtensionPoint[];
    editorPropsMappedLanguages: EditorLanguage[];
    editorPropsSupportedExtensions: string[]; // .txt, .json, .c, etc
    editorPropsSupportedMimeTypes: string[];
    editorPropsLanguageIdMap: Map<string, EditorLanguage>;
    editorPropsExtensionMap: Map<string, EditorLanguage>;
}

function createDefaultState(): CodeEditorState {
    const fileInfo = createDefaultFile();
    return {
        menuLanguages: [],
        editorLanguageId: DEFAULT_LANGUAGE_ID,
        editorWordWrap: false,
        editorMinimap: true,
        fileFullName: fileInfo.fullName,
        fileSize: fileInfo.size,
        fileContent: fileInfo.content,
        fileName: fileInfo.name,
        fileExtension: fileInfo.extension,
        fileSaveExtensions: [],
        editorPropsOriginalEditorLangs: [],
        editorPropsMappedLanguages: [],
        editorPropsSupportedExtensions: [],
        editorPropsSupportedMimeTypes: [],
        editorPropsLanguageIdMap: new Map<string, EditorLanguage>(),
        editorPropsExtensionMap: new Map<string, EditorLanguage>(),
    };
}

function buildFileInfo(state: CodeEditorState, editorProps: RefObject<IStandaloneCodeEditor | null>): FileInfo {
    const content = getEditorContent(editorProps);
    return {
        content: content,
        fullName: state.fileFullName,
        size: content.length,
        name: state.fileName,
        extension: state.fileExtension,
    };
}

const IndexPage = () => {
    const { setPageTitle } = usePage();
    const { showFileSaveDialog } = useFileSaveDialog();
    const { showFileOpenDialog } = useFileOpen();
    const { showToast } = useToast();

    useEffect(() => {
        setPageTitle('Code Editor');
    }, [setPageTitle]);

    // Begin of State
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const [editorState, setEditorState] = useState<CodeEditorState>(createDefaultState());
    // End of Common FileInfo

    // Begin of CodeEditor
    const editorOnEditorMounted: (editorProps: EditorProperties) => void = useCallback((editorProps) => {
        editorRef.current = editorProps.editor;
        console.log(editorProps.languageIdMap);
        setEditorState((prevState) => {
            return {
                ...prevState,
                editorPropsExtensionMap: editorProps.extensionMap,
                editorPropsMappedLanguages: editorProps.mappedLanguages,
                editorPropsOriginalEditorLangs: editorProps.originalEditorLangs,
                editorPropsLanguageIdMap: editorProps.languageIdMap,
                editorPropsSupportedMimeTypes: editorProps.supportedMimeTypes,
                editorPropsSupportedExtensions: editorProps.supportedExtensions,
            };
        });
    }, []);
    // End of CodeEditor

    // Begin of CodeEditorMenu
    const menuOnLanguageSelected: (languageId: string) => void = useCallback(
        (languageId) => {
            setEditorState((prevState) => {
                const language = prevState.editorPropsLanguageIdMap.get(languageId);
                const extensions = language?.extensions ?? [DEFAULT_EXTENSION];
                const saveFileExtensions = createSelectItemsFromStringArray(extensions);
                return {
                    ...prevState,
                    editorLanguageId: languageId,
                    fileExtension: extensions[0],
                    fileSaveExtensions: saveFileExtensions,
                };
            });
            showToast({ message: 'Language changed to ' + languageId, type: ToastType.INFO });
        },
        [setEditorState],
    );
    const menuOnFileNewClick: OnMenuItemClick = useCallback(() => {
        const newFile = createDefaultFile();
        setEditorContent(editorRef, newFile.content);
        setEditorState((prevState) => {
            const languageOfFile = getFileLanguage(newFile, prevState.editorPropsExtensionMap);
            const saveFileExtensions = createSelectItemsFromStringArray(languageOfFile.extensions);
            return {
                ...prevState,
                fileName: newFile.name,
                fileContent: newFile.content,
                fileSize: newFile.size,
                fileExtension: newFile.extension,
                fileFullName: newFile.fullName,
                fileSaveExtensions: saveFileExtensions,
                editorLanguageId: languageOfFile.id,
            };
        });
        showToast({ message: 'New file created', type: ToastType.SUCCESS });
    }, [setEditorState]);
    const menuOnFileOpenClick: OnMenuItemClick = useCallback(() => {
        showFileOpenDialog({
            supportedFiles: editorState.editorPropsSupportedExtensions,
            onSuccess: (fileInfo) => {
                if (!fileInfo) {
                    showToast({ message: 'No files are chosen', type: ToastType.WARNING });
                    return;
                }
                setEditorContent(editorRef, fileInfo.content);
                setEditorState((prevState) => {
                    const languageOfFile = getFileLanguage(fileInfo, prevState.editorPropsExtensionMap);
                    const saveFileExtensions = createSelectItemsFromStringArray(languageOfFile.extensions);
                    return {
                        ...prevState,
                        fileName: fileInfo.name,
                        fileFullName: fileInfo.fullName,
                        fileExtension: fileInfo.extension,
                        fileContent: fileInfo.content,
                        fileSize: fileInfo.size,
                        fileSaveExtensions: saveFileExtensions,
                        editorLanguageId: languageOfFile.id,
                    };
                });
                showToast({ message: 'File opened', type: ToastType.INFO });
            },
            onFailure: (err) => {
                console.log(err);
                showToast({ message: 'Failed to open file', type: ToastType.ERROR });
            },
        });
    }, []);
    const menuOnFileSaveClick: OnMenuItemClick = useCallback(() => {
        const content = getEditorContent(editorRef);
        const ext = editorState.fileExtension;
        const name = editorState.fileName;
        showFileSaveDialog({
            fileContent: content,
            fileName: name,
            fileExtension: ext,
            mimeType: editorState.editorPropsSupportedMimeTypes[0],
            availableExtensions: editorState.fileSaveExtensions.map((e) => e.itemId),
        });
    }, [editorState]);
    const menuOnEditorWrapLinesClick: OnMenuItemClick = useCallback(() => {
        setEditorState((prevState) => {
            return { ...prevState, editorWordWrap: !prevState.editorWordWrap };
        });
    }, []);
    const menuOnEditorMiniMapClick: OnMenuItemClick = useCallback(() => {
        setEditorState((prevState) => {
            return { ...prevState, editorMinimap: !prevState.editorMinimap };
        });
    }, []);
    const menuOnContentPasteClick: OnMenuItemClick = useCallback(() => {
        pasteFromClipboardToEditor(editorRef);
    }, []);
    const menuOnContentCopyClick: OnMenuItemClick = useCallback(() => {
        copyToClipboardFromEditor(editorRef);
    }, []);
    const onMenuLanguageItemClick: OnMenuItemClick = useCallback(
        (item: BaseMenuItem) => {
            menuOnLanguageSelected(item.id);
        },
        [menuOnLanguageSelected],
    );
    // End of CodeEditorMenu

    const menuLanguages = useMemo(
        () => mapEditorLanguagesToMenuItem(editorState.editorPropsMappedLanguages, onMenuLanguageItemClick),
        [editorState.editorPropsMappedLanguages, onMenuLanguageItemClick],
    );

    // Render Element
    const onEditorContentChanged = () => {
        setEditorState((prevState) => {
            const content = getEditorContent(editorRef);
            return { ...prevState, fileSize: content.length };
        });
    };
    return (
        <ContentContainerFlex>
            <CodeEditorMenu
                languages={menuLanguages}
                onLanguageSelected={menuOnLanguageSelected}
                onFileNewClick={menuOnFileNewClick}
                onFileOpenClick={menuOnFileOpenClick}
                onFileSaveClick={menuOnFileSaveClick}
                onEditorWrapLinesClick={menuOnEditorWrapLinesClick}
                onEditorMiniMapClick={menuOnEditorMiniMapClick}
                onContentCopyClick={menuOnContentCopyClick}
                onContentPasteClick={menuOnContentPasteClick}
            />

            <CodeEditorInfoLine
                languageName={editorState.editorLanguageId}
                wordWrap={mapBoolean(editorState.editorWordWrap)}
                minimap={mapBoolean(editorState.editorMinimap)}
                fileInfo={buildFileInfo(editorState, editorRef)}
            />

            <CodeEditor
                wordWrap={editorState.editorWordWrap}
                minimap={editorState.editorMinimap}
                languageId={editorState.editorLanguageId}
                onEditorMounted={editorOnEditorMounted}
                onChange={onEditorContentChanged}
            />
        </ContentContainerFlex>
    );
};

export default IndexPage;
