import { Monaco } from '@monaco-editor/react';
import { editor, languages } from 'monaco-editor';

export interface EditorLanguage {
    id: string; // Language Unique ID
    extensions: string[]; // List of extensions ['.txt', '.cpp', '.hpp']
    aliases: string[]; // List of Human Names ['C#', 'csharp', 'Plain Text', 'text']
    mimetypes: string[]; // List of MimeTypes ['text/plain', 'application/json', ]
}

export interface EditorPropertiesState {
    originalEditorLangs: languages.ILanguageExtensionPoint[];
    mappedLanguages: EditorLanguage[];
    supportedExtensions: string[]; // .txt, .json, .c, etc
    supportedMimeTypes: string[];
    languageIdMap: Map<string, EditorLanguage>;
    extensionMap: Map<string, EditorLanguage>;
}

export interface EditorProperties extends EditorPropertiesState {
    editor: editor.IStandaloneCodeEditor;
    monaco: Monaco;
}
