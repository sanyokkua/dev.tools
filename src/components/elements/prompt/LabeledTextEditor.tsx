import AutoTextarea from '@/controls/AutoTextarea';
import React from 'react';

type LabeledTextEditorProps = { label: string; content: string; onChange: (label: string, value: string) => void };

const LabeledTextEditor: React.FC<LabeledTextEditorProps> = ({ label, content, onChange }) => (
    <div className="field">
        <label htmlFor={`param-${label}`}>{label}</label>
        <AutoTextarea
            id={`param-${label}`}
            value={content}
            onChange={(val) => onChange(label, val)}
            placeholder={`Enter ${label}…`}
        />
    </div>
);

LabeledTextEditor.displayName = 'LabeledTextEditor';
export default LabeledTextEditor;
