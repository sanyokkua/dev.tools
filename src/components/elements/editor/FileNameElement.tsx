import AppInput from '@/components/ui/AppInput';
import AppSelect, { SelectItem } from '@/components/ui/AppSelect';
import React from 'react';

export type FileNameElementProps = {
    defaultName: string;
    defaultExtensionKey: string;
    extensions: SelectItem[];

    onNameChanged: (name: string) => void;
    onExtensionChanged: (extension: string) => void;
};

const FileNameElement: React.FC<FileNameElementProps> = (props) => {
    return (
        <>
            <AppInput defaultValue={props.defaultName} onChange={props.onNameChanged} className="inline-input" />
            <AppSelect
                items={props.extensions}
                defaultKey={props.defaultExtensionKey}
                onSelect={props.onExtensionChanged}
                className="inline-select"
            />
        </>
    );
};

export default FileNameElement;
