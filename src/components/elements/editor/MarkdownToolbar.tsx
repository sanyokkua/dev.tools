'use client';
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
                <button type="button" className="button-base button-outlined button-small" onClick={onFileNewClick}>
                    New
                </button>
                <button type="button" className="button-base button-outlined button-small" onClick={onFileOpenClick}>
                    Open
                </button>
                <button type="button" className="button-base button-outlined button-small" onClick={onFileSaveClick}>
                    Save
                </button>
            </div>

            <div className="markdown-tools__toolbar-sep" aria-hidden="true" />

            <div className="markdown-tools__toolbar-group">
                <button type="button" className="button-base button-ghost button-small" onClick={onCopyClick}>
                    Copy
                </button>
                <button type="button" className="button-base button-ghost button-small" onClick={onPasteClick}>
                    Paste
                </button>
            </div>

            <div className="markdown-tools__toolbar-sep" aria-hidden="true" />

            <div className="markdown-tools__toolbar-group">
                <Switch label="Editor" checked={showEditor} onChange={() => onToggleEditor()} />
                <Switch label="Preview" checked={showPreview} onChange={() => onTogglePreview()} />
                <Switch label="Wrap" checked={wordWrap} onChange={() => onWordWrapToggle()} />
                <Switch label="Minimap" checked={minimap} onChange={() => onMinimapToggle()} />
            </div>

            <div className="markdown-tools__toolbar-spacer" />

            <button type="button" className="button-base button-filled button-small" onClick={onPrintClick}>
                Print / Export PDF
            </button>
        </div>
    );
};

export default MarkdownToolbar;
