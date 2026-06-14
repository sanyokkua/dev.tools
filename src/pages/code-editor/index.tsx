import { DEFAULT_EXTENSION } from '@/common/constants';
import { createDefaultFile } from '@/common/file-utils';
import { useFileOpen } from '@/contexts/FileOpenContext';
import { useFileSaveDialog } from '@/contexts/FileSaveDialogContext';
import { usePage } from '@/contexts/PageContext';
import { useToast } from '@/contexts/ToasterContext';
import { createSelectItemsFromStringArray, SelectItem } from '@/controls/Select';
import { ToastType } from '@/controls/toaster/types';
import {
    clearEditorContent,
    copyToClipboardFromEditor,
    getEditorContent,
    getFileLanguage,
    pasteFromClipboardToEditor,
    setEditorContent,
} from '@/elements/editor/code-editor-utils';
import { EditorLanguage, EditorProperties } from '@/elements/editor/types';
import { editor, IDisposable, languages } from 'monaco-editor';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CodeEditor from '../../components/elements/editor/CodeEditor';
import CodeEditorInfoLine from '../../components/elements/editor/CodeEditorInfoLine';
import CodeEditorToolbar from '../../components/elements/editor/CodeEditorToolbar';
import ContentContainerFlex from '../../components/layouts/ContentContainerFlex';
const DEFAULT_EDITOR_LANGUAGE = 'typescript';

interface CodeEditorState {
    editorLanguageId: string;
    editorWordWrap: boolean;
    editorMinimap: boolean;

    cursorLine: number;
    cursorColumn: number;
    cursorEol: string;
    cursorTabSize: number;
    cursorInsertSpaces: boolean;

    fileFullName: string;
    fileSize: number;
    fileContent: string;
    fileName: string;
    fileExtension: string;
    fileSaveExtensions: SelectItem[];

    editorPropsOriginalEditorLangs: languages.ILanguageExtensionPoint[];
    editorPropsMappedLanguages: EditorLanguage[];
    editorPropsSupportedExtensions: string[];
    editorPropsSupportedMimeTypes: string[];
    editorPropsLanguageIdMap: Map<string, EditorLanguage>;
    editorPropsExtensionMap: Map<string, EditorLanguage>;
}

function createDefaultState(): CodeEditorState {
    const fileInfo = createDefaultFile();
    return {
        editorLanguageId: DEFAULT_EDITOR_LANGUAGE,
        editorWordWrap: false,
        editorMinimap: true,
        cursorLine: 1,
        cursorColumn: 1,
        cursorEol: 'LF',
        cursorTabSize: 2,
        cursorInsertSpaces: true,
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

const IndexPage = (): React.JSX.Element => {
    const { setPageTitle } = usePage();
    const { showFileSaveDialog } = useFileSaveDialog();
    const { showFileOpenDialog } = useFileOpen();
    const { showToast } = useToast();

    useEffect(() => {
        setPageTitle('Code Editor');
    }, [setPageTitle]);

    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const cursorDisposableRef = useRef<IDisposable | null>(null);
    const [editorState, setEditorState] = useState<CodeEditorState>(createDefaultState());

    useEffect(() => {
        return (): void => {
            cursorDisposableRef.current?.dispose();
        };
    }, []);

    const editorOnEditorMounted: (editorProps: EditorProperties) => void = useCallback((editorProps) => {
        editorRef.current = editorProps.editor;
        setEditorState((prevState) => ({
            ...prevState,
            editorPropsExtensionMap: editorProps.extensionMap,
            editorPropsMappedLanguages: editorProps.mappedLanguages,
            editorPropsOriginalEditorLangs: editorProps.originalEditorLangs,
            editorPropsLanguageIdMap: editorProps.languageIdMap,
            editorPropsSupportedMimeTypes: editorProps.supportedMimeTypes,
            editorPropsSupportedExtensions: editorProps.supportedExtensions,
        }));
        cursorDisposableRef.current?.dispose();
        cursorDisposableRef.current = editorProps.editor.onDidChangeCursorPosition((e) => {
            const model = editorProps.editor.getModel();
            const eol = model?.getEOL() === '\r\n' ? 'CRLF' : 'LF';
            const tabSize = model?.getOptions().tabSize ?? 2;
            const insertSpaces = model?.getOptions().insertSpaces ?? true;
            setEditorState((prevState) => ({
                ...prevState,
                cursorLine: e.position.lineNumber,
                cursorColumn: e.position.column,
                cursorEol: eol,
                cursorTabSize: tabSize,
                cursorInsertSpaces: insertSpaces,
            }));
        });
    }, []);

    const handleLanguageSelected: (languageId: string) => void = useCallback(
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
        [showToast],
    );

    const handleFileNew: () => void = useCallback(() => {
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
    }, [showToast]);

    const handleFileOpen: () => void = useCallback(() => {
        showFileOpenDialog({
            supportedFiles: editorState.editorPropsSupportedExtensions,
            onSuccess: (fileInfo): void => {
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
                showToast({ message: 'File opened', type: ToastType.SUCCESS });
            },
            onFailure: (err): void => {
                console.log(err);
                showToast({ message: 'Failed to open file', type: ToastType.ERROR });
            },
        });
    }, [editorState.editorPropsSupportedExtensions, showFileOpenDialog, showToast]);

    const handleFileSave: () => void = useCallback(() => {
        const content = getEditorContent(editorRef);
        showFileSaveDialog({
            fileContent: content,
            fileName: editorState.fileName,
            fileExtension: editorState.fileExtension,
            mimeType: editorState.editorPropsSupportedMimeTypes[0],
            availableExtensions: editorState.fileSaveExtensions.map((e) => e.itemId),
        });
    }, [
        editorState.fileName,
        editorState.fileExtension,
        editorState.editorPropsSupportedMimeTypes,
        editorState.fileSaveExtensions,
        showFileSaveDialog,
    ]);

    const handleWordWrapToggle: () => void = useCallback(() => {
        setEditorState((prevState) => ({ ...prevState, editorWordWrap: !prevState.editorWordWrap }));
    }, []);

    const handleMinimapToggle: () => void = useCallback(() => {
        setEditorState((prevState) => ({ ...prevState, editorMinimap: !prevState.editorMinimap }));
    }, []);

    const handlePaste: () => void = useCallback(() => {
        pasteFromClipboardToEditor(editorRef, () => {}, showToast);
    }, [showToast]);

    const handleCopy: () => void = useCallback(() => {
        copyToClipboardFromEditor(editorRef, showToast);
    }, [showToast]);

    const handleClear: () => void = useCallback(() => {
        clearEditorContent(editorRef);
        setEditorState((prevState) => ({ ...prevState, fileSize: 0 }));
    }, []);

    const onEditorContentChanged = useCallback((): void => {
        setEditorState((prevState) => {
            const content = getEditorContent(editorRef);
            return { ...prevState, fileSize: content.length };
        });
    }, []);

    const languageDisplayName = useMemo(() => {
        const lang = editorState.editorPropsLanguageIdMap.get(editorState.editorLanguageId);
        return lang?.aliases[0] ?? editorState.editorLanguageId;
    }, [editorState.editorPropsLanguageIdMap, editorState.editorLanguageId]);

    return (
        <ContentContainerFlex>
            <div className="code-editor">
                <CodeEditorToolbar
                    onFileNewClick={handleFileNew}
                    onFileOpenClick={handleFileOpen}
                    onFileSaveClick={handleFileSave}
                    onCopyClick={handleCopy}
                    onPasteClick={handlePaste}
                    onClearClick={handleClear}
                    currentLanguageId={editorState.editorLanguageId}
                    mappedLanguages={editorState.editorPropsMappedLanguages}
                    onLanguageSelected={handleLanguageSelected}
                    wordWrap={editorState.editorWordWrap}
                    onWordWrapToggle={handleWordWrapToggle}
                    minimap={editorState.editorMinimap}
                    onMinimapToggle={handleMinimapToggle}
                />

                <div className="code-editor__editor">
                    <CodeEditor
                        wordWrap={editorState.editorWordWrap}
                        minimap={editorState.editorMinimap}
                        languageId={editorState.editorLanguageId}
                        onEditorMounted={editorOnEditorMounted}
                        onChange={onEditorContentChanged}
                        height="100%"
                    />
                </div>

                <CodeEditorInfoLine
                    cursorLine={editorState.cursorLine}
                    cursorColumn={editorState.cursorColumn}
                    languageDisplayName={languageDisplayName}
                    eol={editorState.cursorEol}
                    tabSize={editorState.cursorTabSize}
                    insertSpaces={editorState.cursorInsertSpaces}
                    charCount={editorState.fileSize}
                />
            </div>
        </ContentContainerFlex>
    );
};

export default IndexPage;
