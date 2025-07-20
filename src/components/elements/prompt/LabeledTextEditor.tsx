import TextEditor, { TextEditorSize } from '@/controls/TextEditor';
import React from 'react';

type LabeledTextEditorProps = { label: string; content: string; onChange: (label: string, value: string) => void };

const LabeledTextEditor: React.FC<LabeledTextEditorProps> = ({ label, content, onChange }) => {
    const handleOnChange = (text: string) => {
        onChange(label, text);
    };
    return (
        <label className="text-editor-label">
            <strong>{label}</strong>
            <TextEditor content={content} onContentChange={handleOnChange} rows={3} size={TextEditorSize.Medium} />
        </label>
    );
};

export default LabeledTextEditor;
