import { DEFAULT_LANGUAGE_ID } from '@/common/constants';
import { usePage } from '@/contexts/PageContext';
import FileOpen from '@/controls/file/FileOpen';
import { fileSave } from '@/controls/file/FileSave';
import { createDefaultFile, FileInfo } from '@/controls/file/FileTypes';
import Modal from '@/controls/Modal';
import { createSelectItemsFromStringArray, SelectItem } from '@/controls/Select';
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
import { EditorProperties, EditorPropertiesState } from '@/modules/ui/elements/editor/types';
import { BaseMenuItem, OnMenuItemClick } from '@/modules/ui/elements/navigation/menubar/types';
import { extractErrorDetails } from 'coreutilsts';
import { editor } from 'monaco-editor';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const initialEditorPropsState = {
    originalEditorLangs: [],
    mappedLanguages: [],
    supportedExtensions: [],
    supportedMimeTypes: [],
    languageIdMap: new Map(),
    extensionMap: new Map(),
};

function mapBoolean(b: boolean): 'On' | 'Off' {
    return b ? 'On' : 'Off';
}

const IndexPage = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Code Editor');
    }, [setPageTitle]);

    // Begin of State
    const [fileInfo, setFileInfo] = useState<FileInfo>(createDefaultFile());
    const [editorWordWrap, setEditorWordWrap] = useState<boolean>(false);
    const [editorMinimap, setEditorMinimap] = useState<boolean>(true);
    const [editorLanguageId, setEditorLanguageId] = useState<string>(DEFAULT_LANGUAGE_ID);
    const [editorPropertiesState, setEditorPropertiesState] = useState<EditorPropertiesState>(initialEditorPropsState);
    const [fileOpenIsOpened, setFileOpenIsOpened] = useState<boolean>(false);
    const [fileOpenSupportedFiles, setFileOpenSupportedFiles] = useState<string[]>([]);
    const [saveFileIsOpened, setSaveFileIsOpened] = useState<boolean>(false);
    const editorRef = useRef<editor.IStandaloneCodeEditor>(null);
    // End of Common FileInfo

    // Begin of CodeEditorMenu
    const menuOnLanguageSelected: (languageId: string) => void = useCallback((languageId) => {
        setEditorLanguageId(languageId);
    }, []);
    const menuOnFileNewClick: OnMenuItemClick = useCallback(() => {
        const newFile = createDefaultFile();
        setFileInfo(newFile);
        setEditorContent(editorRef, newFile.content);
    }, [setFileInfo, setEditorContent]);
    const menuOnFileOpenClick: OnMenuItemClick = useCallback(() => {
        setFileOpenIsOpened(true);
    }, []);
    const menuOnFileSaveClick: OnMenuItemClick = useCallback(() => {
        setSaveFileIsOpened(true);
    }, []);
    const menuOnEditorWrapLinesClick: OnMenuItemClick = useCallback(() => {
        setEditorWordWrap((prevState) => !prevState);
    }, []);
    const menuOnEditorMiniMapClick: OnMenuItemClick = useCallback(() => {
        setEditorMinimap((prevState) => !prevState);
    }, []);
    const menuOnContentPasteClick: OnMenuItemClick = useCallback(() => {
        pasteFromClipboardToEditor(editorRef);
    }, []);
    const menuOnContentCopyClick: OnMenuItemClick = useCallback(() => {
        copyToClipboardFromEditor(editorRef);
    }, []);
    const onMenuLanguageItemClick: OnMenuItemClick = useCallback((item: BaseMenuItem) => {
        menuOnLanguageSelected(item.id);
    }, []);
    // End of CodeEditorMenu

    // Begin of CodeEditor
    const editorOnEditorMounted: (editorProps: EditorProperties) => void = useCallback((editorProps) => {
        editorRef.current = editorProps.editor;
        setEditorPropertiesState(editorProps);
        setFileOpenSupportedFiles(editorProps.supportedExtensions);
    }, []);
    // End of CodeEditor

    // Begin of FileOpen
    const fileOpenOnFileOpened: (fileInfo: FileInfo) => void = useCallback(
        (fileInfo) => {
            setFileOpenIsOpened(false);
            setFileInfo((prevState) => {
                return { ...prevState, ...fileInfo };
            });
            setEditorContent(editorRef, fileInfo.content);
        },
        [setFileInfo, setFileOpenIsOpened, setEditorContent],
    );
    // End of FileOpen

    // Begin of SaveFileModal
    const saveFileOnClose: () => void = useCallback(() => {
        setSaveFileIsOpened(false);
    }, [setSaveFileIsOpened]);
    const saveFileOnConfirm = useCallback(() => {
        setSaveFileIsOpened(false);

        const contentFromEditor = getEditorContent(editorRef);
        const currLang = getFileLanguage(fileInfo, editorPropertiesState);
        const updatedFileInfo = { ...fileInfo, content: contentFromEditor };
        setFileInfo((prev) => ({ ...prev, content: contentFromEditor }));

        try {
            fileSave({
                fileName: updatedFileInfo.name,
                fileContent: updatedFileInfo.content,
                fileMimeType: currLang.mimetypes[0],
                fileExtension: updatedFileInfo.extension,
            });
        } catch (e: unknown) {
            const errMsg = extractErrorDetails(e);
            console.log(errMsg);
        }
    }, [fileInfo, setFileInfo, editorPropertiesState, setSaveFileIsOpened]);
    const saveFileOnNameChanged: (name: string) => void = useCallback((name) => {
        setFileInfo((prevState) => {
            return { ...prevState, name: name };
        });
    }, []);
    const saveFileOnExtensionChanged: (extension: SelectItem) => void = useCallback((extension) => {
        setFileInfo((prevState) => {
            return { ...prevState, extension: extension.itemId };
        });
    }, []);
    // End of SaveFileModal

    useEffect(() => {
        const languageOfFile = getFileLanguage(fileInfo, editorPropertiesState);
        setEditorLanguageId(languageOfFile.id);
    }, [fileInfo, editorPropertiesState]);

    const menuLanguages = useMemo(
        () => mapEditorLanguagesToMenuItem(editorPropertiesState.mappedLanguages, onMenuLanguageItemClick),
        [editorPropertiesState.mappedLanguages],
    );

    const languageOfFile = getFileLanguage(fileInfo, editorPropertiesState);
    const saveFileExtensions: SelectItem[] = createSelectItemsFromStringArray(languageOfFile.extensions);
    // Render Element
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
                languageName={editorLanguageId}
                wordWrap={mapBoolean(editorWordWrap)}
                minimap={mapBoolean(editorMinimap)}
                fileInfo={fileInfo}
            />

            <CodeEditor
                wordWrap={editorWordWrap}
                minimap={editorMinimap}
                languageId={editorLanguageId}
                onEditorMounted={editorOnEditorMounted}
            />

            <FileOpen
                showOpenFileDialog={fileOpenIsOpened}
                supportedFiles={fileOpenSupportedFiles}
                onFileOpened={fileOpenOnFileOpened}
            />
            <Modal
                isOpen={saveFileIsOpened}
                onClose={saveFileOnClose}
                onConfirm={saveFileOnConfirm}
                title="Save File As"
                confirmText="Submit"
            >
                <p>Please enter desired file name and chose available extension for this file type.</p>
                <FileNameElement
                    defaultName={fileInfo.name}
                    defaultExtensionKey={fileInfo.extension}
                    extensions={saveFileExtensions}
                    onNameChanged={saveFileOnNameChanged}
                    onExtensionChanged={saveFileOnExtensionChanged}
                />
            </Modal>
        </ContentContainerFlex>
    );
};

export default IndexPage;
