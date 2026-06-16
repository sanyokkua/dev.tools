'use client';
import { DEFAULT_LANGUAGE_ID } from '@/common/constants';
import React from 'react';
import CodeEditor from './CodeEditor';
import EditorToolbar from './EditorToolbar';

export interface SplitPreviewEditorProps {
    language?: string;
    value?: string;
    onChange?: (value: string) => void;
    renderPreview: (value: string) => React.ReactNode;
    editorToolbarChildren?: React.ReactNode;
    previewToolbarChildren?: React.ReactNode;
}

const SplitPreviewEditor: React.FC<SplitPreviewEditorProps> = ({
    language = DEFAULT_LANGUAGE_ID,
    value = '',
    onChange,
    renderPreview,
    editorToolbarChildren,
    previewToolbarChildren,
}) => {
    const handleChange = (val: string | undefined): void => {
        onChange?.(val ?? '');
    };

    return (
        <div className="split-preview-editor">
            <div className="editorpane">
                <EditorToolbar>{editorToolbarChildren}</EditorToolbar>
                <div className="eb">
                    <CodeEditor
                        editorContent={value}
                        languageId={language}
                        minimap={false}
                        height="100%"
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className="editorpane">
                <EditorToolbar>{previewToolbarChildren}</EditorToolbar>
                <div className="eb split-preview-editor__preview">{renderPreview(value)}</div>
            </div>
        </div>
    );
};

SplitPreviewEditor.displayName = 'SplitPreviewEditor';
export default SplitPreviewEditor;
