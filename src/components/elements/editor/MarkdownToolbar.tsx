'use client';
import Button from '@/controls/Button';
import Switch from '@/controls/Switch';
import React from 'react';

export type MarkdownToolbarProps = {
    onFileNewClick: () => void;
    onFileOpenClick: () => void;
    onFileSaveClick: () => void;
    onCopyClick: () => void;
    onPasteClick: () => void;
    showEditor: boolean;
    onToggleEditor: () => void;
    showPreview: boolean;
    onTogglePreview: () => void;
    wordWrap: boolean;
    onWordWrapToggle: () => void;
    minimap: boolean;
    onMinimapToggle: () => void;
    onPrintClick: () => void;
};

const MarkdownToolbar: React.FC<MarkdownToolbarProps> = (props) => {
    const {
        onFileNewClick,
        onFileOpenClick,
        onFileSaveClick,
        onCopyClick,
        onPasteClick,
        showEditor,
        onToggleEditor,
        showPreview,
        onTogglePreview,
        wordWrap,
        onWordWrapToggle,
        minimap,
        onMinimapToggle,
        onPrintClick,
    } = props;

    return (
        <div className="markdown-tools__toolbar">
            <div className="markdown-tools__toolbar-group">
                <Button text="New" variant="outlined" size="small" onClick={onFileNewClick} />
                <Button text="Open" variant="outlined" size="small" onClick={onFileOpenClick} />
                <Button text="Save" variant="outlined" size="small" onClick={onFileSaveClick} />
            </div>

            <div className="markdown-tools__toolbar-sep" aria-hidden="true" />

            <div className="markdown-tools__toolbar-group">
                <Button text="Copy" variant="text" size="small" onClick={onCopyClick} />
                <Button text="Paste" variant="text" size="small" onClick={onPasteClick} />
            </div>

            <div className="markdown-tools__toolbar-sep" aria-hidden="true" />

            <div className="markdown-tools__toolbar-group">
                <Switch label="Editor" checked={showEditor} onChange={() => onToggleEditor()} />
                <Switch label="Preview" checked={showPreview} onChange={() => onTogglePreview()} />
                <Switch label="Wrap" checked={wordWrap} onChange={() => onWordWrapToggle()} />
                <Switch label="Minimap" checked={minimap} onChange={() => onMinimapToggle()} />
            </div>

            <div className="markdown-tools__toolbar-spacer" />

            <Button text="Print / Export PDF" variant="solid" size="small" onClick={onPrintClick} />
        </div>
    );
};

export default MarkdownToolbar;
