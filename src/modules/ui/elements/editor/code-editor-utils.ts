import { copyToClipboard, pasteFromClipboard } from '@/common/clipboard-utils';
import { DEFAULT_EXTENSION, DEFAULT_LANGUAGE_ID, DEFAULT_MIME_TYPE } from '@/common/constants';
import { FileInfo } from '@/common/file-types';
import { EditorLanguage, EditorProperties } from '@/modules/ui/elements/editor/types';
import { OnMenuItemClick, SubmenuItemTypeless } from '@/modules/ui/elements/navigation/menubar/types';
import { Monaco } from '@monaco-editor/react';
import { editor, languages } from 'monaco-editor';
import { RefObject } from 'react';

export function getEditorContent(editor: RefObject<editor.IStandaloneCodeEditor | null>): string {
    if (editor.current) {
        return editor.current.getValue();
    }
    return '';
}

export function setEditorContent(editor: RefObject<editor.IStandaloneCodeEditor | null>, value: string): void {
    if (editor.current) {
        editor.current.setValue(value);
    }
}

export function pasteFromClipboardToEditor(
    editor: RefObject<editor.IStandaloneCodeEditor | null>,
    onErrorCallback?: (errMsg: string) => void,
) {
    const onSuccess = (text: string) => {
        editor.current?.setValue(text);
    };
    const onError = (errMsg: string) => {
        console.log(`Failed to paste to editor: ${errMsg}`);
        if (onErrorCallback) {
            onErrorCallback(errMsg);
        }
    };

    if (editor.current) {
        pasteFromClipboard(onSuccess, onError);
    }
}

export function copyToClipboardFromEditor(editor: RefObject<editor.IStandaloneCodeEditor | null>) {
    if (editor.current) {
        copyToClipboard(editor.current.getValue());
    }
}

export function mapEditorLanguage(lang: languages.ILanguageExtensionPoint): EditorLanguage {
    let extensions = lang.extensions;
    let aliases = lang.aliases;
    let mimeTypes = lang.mimetypes;

    if (!extensions || extensions.length === 0) {
        extensions = [DEFAULT_EXTENSION];
    }
    if (!aliases || aliases.length === 0) {
        aliases = extensions;
    }
    if (!mimeTypes || mimeTypes.length === 0) {
        mimeTypes = [DEFAULT_MIME_TYPE];
    }
    const normalizedExtensions = extensions
        .map((ext) => {
            return ext.trim();
        })
        .filter((ext) => {
            return ext.length > 0;
        })
        .map((ext) => {
            if (ext.startsWith('.')) {
                return ext;
            } else {
                return `.${ext}`;
            }
        });

    const normalizedAliases = aliases
        .map((alias) => {
            return alias.trim();
        })
        .filter((alias) => {
            return alias.length > 0;
        });

    const normalizedMimes = mimeTypes
        .map((mime) => {
            return mime.trim();
        })
        .filter((mime) => {
            return mime.length > 0;
        });

    return {
        id: lang.id.trim(),
        extensions: normalizedExtensions,
        aliases: normalizedAliases,
        mimetypes: normalizedMimes,
    };
}

export function mapEditorLanguages(langs: languages.ILanguageExtensionPoint[]): EditorLanguage[] {
    return langs.map(mapEditorLanguage);
}

export function getSupportedExtensions(languages: EditorLanguage[]) {
    const strings = languages.flatMap((lang) => lang.extensions);
    return [...new Set(strings)];
}

export function getSupportedMimeTypes(languages: EditorLanguage[]) {
    const strings = languages.flatMap((lang) => lang.mimetypes);
    return [...new Set(strings)];
}

export function buildEditorProperties(editor: editor.IStandaloneCodeEditor, monaco: Monaco): EditorProperties {
    const languages: languages.ILanguageExtensionPoint[] = monaco.languages.getLanguages();
    const editorLanguages: EditorLanguage[] = mapEditorLanguages(languages);
    const supportedExtensions = getSupportedExtensions(editorLanguages);
    const supportedMimeTypes = getSupportedMimeTypes(editorLanguages);
    const langsMapping: Map<string, EditorLanguage> = new Map<string, EditorLanguage>();
    editorLanguages.forEach((language) => {
        langsMapping.set(language.id, language);
    });
    const extMapping: Map<string, EditorLanguage> = new Map<string, EditorLanguage>();
    editorLanguages.forEach((language) => {
        language.extensions.forEach((extension) => {
            if (!extMapping.has(extension)) {
                extMapping.set(extension, language);
            }
        });
    });

    return {
        editor: editor,
        monaco: monaco,
        originalEditorLangs: languages,
        mappedLanguages: editorLanguages,
        supportedExtensions: supportedExtensions,
        supportedMimeTypes: supportedMimeTypes,
        languageIdMap: langsMapping,
        extensionMap: extMapping,
    };
}

export function getFileLanguage(fileInfo: FileInfo, extensionMap: Map<string, EditorLanguage>): EditorLanguage {
    const languageOfFile = extensionMap.get(fileInfo.extension);
    if (languageOfFile) {
        return languageOfFile;
    }
    return {
        id: DEFAULT_LANGUAGE_ID,
        extensions: [DEFAULT_EXTENSION],
        aliases: [DEFAULT_LANGUAGE_ID],
        mimetypes: [DEFAULT_MIME_TYPE],
    };
}

export function mapEditorLanguagesToMenuItem(langs: EditorLanguage[], handler: OnMenuItemClick): SubmenuItemTypeless[] {
    return langs.map((lang) => {
        return { id: lang.id, text: lang.aliases[0], onItemClick: handler };
    });
}
