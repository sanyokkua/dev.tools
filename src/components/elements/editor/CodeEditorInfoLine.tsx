'use client';
import { FileInfo } from '@/common/file-types';
import InformationPanel, { InformationPanelItem } from '@/controls/InformationPanel';
import React from 'react';

export type CodeEditorInfoLineProps = { languageName: string; wordWrap: string; minimap: string; fileInfo: FileInfo };

const CodeEditorInfoLine: React.FC<CodeEditorInfoLineProps> = (props) => {
    const infoPanelItems: InformationPanelItem[] = [
        'Language: ' + props.languageName,
        'WordWrap: ' + props.wordWrap,
        'MiniMap: ' + props.minimap,
        'TextLength: ' + String(props.fileInfo.content.length),
        `FileName: ${props.fileInfo.fullName}`,
    ];

    return <InformationPanel items={infoPanelItems} />;
};

export default CodeEditorInfoLine;
