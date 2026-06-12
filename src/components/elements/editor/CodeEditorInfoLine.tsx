'use client';
import React from 'react';

export type CodeEditorInfoLineProps = {
    cursorLine: number;
    cursorColumn: number;
    languageDisplayName: string;
    eol: string;
    tabSize: number;
    charCount: number;
};

const CodeEditorInfoLine: React.FC<CodeEditorInfoLineProps> = (props) => {
    const { cursorLine, cursorColumn, languageDisplayName, eol, tabSize, charCount } = props;

    return (
        <div className="code-editor__status-bar">
            <span>{`Ln ${cursorLine}, Col ${cursorColumn}`}</span>
            <span>{languageDisplayName}</span>
            <span>UTF-8</span>
            <span>{eol}</span>
            <span className="code-editor__status-bar-end">{`Spaces: ${tabSize} · ${charCount} chars`}</span>
        </div>
    );
};

export default CodeEditorInfoLine;
