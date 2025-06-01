import FileNameElement from '@/components/elements/editor/FileNameElement';
import { FileInfo } from '@/components/elements/file/FileTypes';
import AppBadge from '@/components/ui/AppBadge';
import React from 'react';

export type CodeEditorInfoLineProps = {
    language: string;
    extensions: string[];
    wordWrap: string;
    minimap: string;
    fileInfo: FileInfo;
    onNameChanged: (name: string) => void;
    onExtensionChanged: (extension: string) => void;
    readOnly?: boolean;
};

const CodeEditorInfoLine: React.FC<CodeEditorInfoLineProps> = (props) => {
    const baseValue = props.fileInfo.extension ?? props.extensions[0];
    const items = props.extensions.map((ext) => ({ key: ext, value: ext }));

    return (
        <div className="editorInfoBar">
            <AppBadge text={'Language: ' + props.language}></AppBadge>
            <AppBadge text={'WordWrap: ' + props.wordWrap}></AppBadge>
            <AppBadge text={'MiniMap: ' + props.minimap}></AppBadge>
            <AppBadge text={'TextLength: ' + String(props.fileInfo.content.length)}></AppBadge>

            {!props.readOnly && (
                <FileNameElement
                    defaultName={props.fileInfo.name ?? ''}
                    defaultExtensionKey={baseValue}
                    extensions={items}
                    onNameChanged={props.onNameChanged}
                    onExtensionChanged={props.onExtensionChanged}
                />
            )}
        </div>
    );
};

export default CodeEditorInfoLine;
