'use client';
import React from 'react';

type EditorToolbarProps = { children?: React.ReactNode };

const EditorToolbar: React.FC<EditorToolbarProps> = ({ children }) => (
    <div className="eh" role="toolbar">
        {children}
    </div>
);

EditorToolbar.displayName = 'EditorToolbar';
export default EditorToolbar;
