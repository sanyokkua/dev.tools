import InformationPanel, { InformationPanelItem } from '@/controls/InformationPanel';
import { SelectItem } from '@/controls/Select';
import React from 'react';
import { FileInfo } from '../file/FileTypes';
import FileNameElement from './FileNameElement';

export type CodeEditorInfoLineProps = {
    language: string;
    extensions: string[];
    wordWrap: string;
    minimap: string;
    fileInfo: FileInfo;
    onNameChanged: (name: string) => void;
    onExtensionChanged: (extension: SelectItem) => void;
    readOnly?: boolean;
};

const CodeEditorInfoLine: React.FC<CodeEditorInfoLineProps> = (props) => {
    const infoPanelItems: InformationPanelItem[] = [
        'Language: ' + props.language,
        'WordWrap: ' + props.wordWrap,
        'MiniMap: ' + props.minimap,
        'TextLength: ' + String(props.fileInfo.content.length),
    ];
    if (!props.readOnly) {
        const baseValue = props.fileInfo.extension ?? props.extensions[0];
        const items = props.extensions.map((ext) => ({ itemId: ext, displayText: ext }));
        infoPanelItems.push(
            <FileNameElement
                defaultName={props.fileInfo.name ?? ''}
                defaultExtensionKey={baseValue}
                extensions={items}
                onNameChanged={props.onNameChanged}
                onExtensionChanged={props.onExtensionChanged}
            />,
        );
    }

    return <InformationPanel items={infoPanelItems} />;
};

export default CodeEditorInfoLine;
