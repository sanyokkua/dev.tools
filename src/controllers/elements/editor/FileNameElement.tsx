import React from 'react';
import Input from '../../../custom-components/controls/Input';
import Select, { SelectItem } from '../../../custom-components/controls/Select';

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
            />
        </>
    );
};

export default FileNameElement;
