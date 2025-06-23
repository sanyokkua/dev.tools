import { DEFAULT_EXTENSION, DEFAULT_LANGUAGE_ID } from '@/common/constants';
import { usePage } from '@/contexts/PageContext';
import { saveTextFile } from '@/controls/file/FileSave';
import { createDefaultFile, FileInfo } from '@/controls/file/FileTypes';
import OpenFileDialog from '@/controls/file/OpenFileDialog';
import Modal from '@/controls/Modal';
import { createSelectItemsFromStringArray, SelectItem } from '@/controls/Select';
import { toasterApi, ToastType } from '@/controls/toaster/ToasterApi';
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
} from '@/modules/ui/elements/editor/CodeEditorUtils';
import FileNameElement from '@/modules/ui/elements/editor/FileNameElement';
import { EditorLanguage, EditorProperties } from '@/modules/ui/elements/editor/types';
import { BaseMenuItem, OnMenuItemClick, SubmenuItemTypeless } from '@/modules/ui/elements/navigation/menubar/types';
import { extractErrorDetails } from 'coreutilsts';
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

function mapBoolean(b: boolean): 'On' | 'Off' {
    return b ? 'On' : 'Off';
}

const IndexPage = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Code Editor');
    }, [setPageTitle]);

    // Begin of State
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const fileInputDialogRef = useRef<HTMLInputElement | null>(null);
    const [editorState, setEditorState] = useState<CodeEditorState>(createDefaultState());
    const [fileSaveDialogShow, setFileSaveDialogShow] = useState<boolean>(false);
    // End of Common FileInfo

    // Begin of CodeEditor
    const editorOnEditorMounted: (editorProps: EditorProperties) => void = useCallback((editorProps) => {
        editorRef.current = editorProps.editor;
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
            toasterApi.show('Language changed to ' + languageId, ToastType.INFO);
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
        toasterApi.show('New file created', ToastType.SUCCESS);
    }, [setEditorState]);
    const menuOnFileOpenClick: OnMenuItemClick = useCallback(() => {
        if (fileInputDialogRef.current) {
            fileInputDialogRef.current.click();
        }
    }, []);
    const menuOnFileSaveClick: OnMenuItemClick = useCallback(() => {
        setFileSaveDialogShow(true);
    }, []);
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

    // Begin of FileOpen
    const fileOpenOnFileOpened: (fileInfo?: FileInfo) => void = useCallback(
        (fileInfo) => {
            if (!fileInfo) {
                toasterApi.show('No files are chosen', ToastType.WARNING);
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
            toasterApi.show('File opened', ToastType.INFO);
        },
        [setEditorContent, setEditorState],
    );
    // End of FileOpen

    // Begin of SaveFileModal
    const saveFileOnClose: () => void = useCallback(() => {
        setFileSaveDialogShow(false);
    }, [setFileSaveDialogShow]);
    const saveFileOnConfirm = useCallback(() => {
        setFileSaveDialogShow(false);
        const fileInfo = buildFileInfo(editorState, editorRef);
        try {
            saveTextFile({
                fileName: fileInfo.name,
                fileContent: fileInfo.content,
                fileMimeType: editorState.editorPropsSupportedMimeTypes[0],
                fileExtension: fileInfo.extension,
            });
            toasterApi.show('File saved', ToastType.SUCCESS);
        } catch (e: unknown) {
            const errMsg = extractErrorDetails(e);
            console.log(errMsg);
            toasterApi.show('File was not saved', ToastType.WARNING);
        }
    }, [editorState, setFileSaveDialogShow]);
    const saveFileOnNameChanged: (name: string) => void = useCallback((name) => {
        setEditorState((prevState) => {
            return { ...prevState, fileName: name };
        });
    }, []);
    const saveFileOnExtensionChanged: (extension: SelectItem) => void = useCallback((extension) => {
        setEditorState((prevState) => {
            return { ...prevState, fileExtension: extension.itemId };
        });
    }, []);
    // End of SaveFileModal

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

            <OpenFileDialog
                onMount={(ref) => {
                    fileInputDialogRef.current = ref;
                }}
                supportedFiles={editorState.editorPropsSupportedExtensions}
                onFileOpened={fileOpenOnFileOpened}
            />
            <Modal
                isOpen={fileSaveDialogShow}
                onClose={saveFileOnClose}
                onConfirm={saveFileOnConfirm}
                title="Save File As"
                confirmText="Submit"
            >
                <p>Please enter desired file name and chose available extension for this file type.</p>
                <FileNameElement
                    defaultName={editorState.fileName}
                    defaultExtensionKey={editorState.fileExtension}
                    extensions={editorState.fileSaveExtensions}
                    onNameChanged={saveFileOnNameChanged}
                    onExtensionChanged={saveFileOnExtensionChanged}
                />
            </Modal>
        </ContentContainerFlex>
    );
};

export default IndexPage;
