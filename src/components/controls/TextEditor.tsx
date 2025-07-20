import React, { ChangeEvent } from 'react';

export enum TextEditorSize {
    Small = 'text-font-small',
    Medium = 'text-font-medium',
    Large = 'text-font-large',
}

type TextEditorProps = {
    content?: string;
    mono?: boolean;
    rows?: number;
    size?: TextEditorSize;
    onContentChange?: (content: string) => void;
};

const TextEditor: React.FC<TextEditorProps> = (props) => {
    const { content = '', rows = 3, onContentChange, mono = false, size = TextEditorSize.Medium } = props;

    const handleChangeEvent = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (onContentChange) {
            onContentChange(e.target.value);
        }
    };

    const styles: string[] = [];
    styles.push('text-editor');
    if (mono) {
        styles.push('text-font-mono');
    }
    styles.push(size);
    const finalStyles = styles.join(' ').trim();

    return <textarea value={content} onChange={handleChangeEvent} rows={rows} className={finalStyles} />;
};

export default TextEditor;
