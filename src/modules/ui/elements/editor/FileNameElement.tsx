import Input from '@/controls/Input';
import Select, { SelectItem } from '@/controls/Select';
import React from 'react';

export type FileNameElementProps = {
    defaultName: string;
    defaultExtensionKey: string;
    extensions: SelectItem[];

    onNameChanged: (name: string) => void;
    onExtensionChanged: (extension: SelectItem) => void;
};

const FileNameElement: React.FC<FileNameElementProps> = (props) => {
    return (
        <>
            <Input defaultValue={props.defaultName} onChange={props.onNameChanged} size="small" variant="outlined" />
            <Select
                items={props.extensions}
                selectedItem={props.defaultExtensionKey}
                onSelect={props.onExtensionChanged}
                size={'small'}
                colorStyle="black-color"
            />
        </>
    );
};

export default FileNameElement;
