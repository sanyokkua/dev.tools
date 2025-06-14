import { copyToClipboard, pasteFromClipboard } from '@/modules/tools/clipboard_utils';
import { editor } from 'monaco-editor';
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

export function pasteFromClipboardToEditor(editor: RefObject<editor.IStandaloneCodeEditor | null>) {
    if (editor.current) {
        pasteFromClipboard(
            (text) => {
                editor.current?.setValue(text);
            },
            () => {
                console.log('Failed to paste to editor');
            },
        );
    }
}

export function copyToClipboardFromEditor(editor: RefObject<editor.IStandaloneCodeEditor | null>) {
    if (editor.current) {
        copyToClipboard(editor.current.getValue());
    }
}
