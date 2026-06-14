'use client';
import React from 'react';

export type CodeEditorInfoLineProps = {
    cursorLine: number;
    cursorColumn: number;
    languageDisplayName: string;
    eol: string;
    tabSize: number;
    insertSpaces: boolean;
    charCount: number;
};

const CodeEditorInfoLine: React.FC<CodeEditorInfoLineProps> = (props) => {
    const { cursorLine, cursorColumn, languageDisplayName, eol, tabSize, insertSpaces, charCount } = props;
    const indentLabel = insertSpaces ? `Spaces: ${tabSize}` : `Tab Size: ${tabSize}`;

    return (
        <div className="code-editor__status-bar">
            <span>{`Ln ${cursorLine}, Col ${cursorColumn}`}</span>
            <span>{languageDisplayName}</span>
            <span>{eol}</span>
            <span className="code-editor__status-bar-end">{`${indentLabel} · ${charCount} chars`}</span>
        </div>
    );
};

export default CodeEditorInfoLine;
