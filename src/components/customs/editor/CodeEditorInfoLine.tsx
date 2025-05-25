import { FileInfo } from '@/components/customs/types/FileTypes';
import { Badge, Editable, HStack, NativeSelect, Stack } from '@chakra-ui/react';
import React, { ChangeEventHandler } from 'react';

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
    const onValueSelected: ChangeEventHandler<HTMLSelectElement> = (e) => {
        props.onExtensionChanged(e.target.value);
    };
    return (
        <HStack mb={2}>
            <Badge>Language: {props.language}</Badge>
            <Badge>WordWrap: {props.wordWrap}</Badge>
            <Badge>MiniMap: {props.minimap}</Badge>
            <Badge>TextLength: {String(props.fileInfo.content.length)}</Badge>

            {!props.readOnly && (
                <>
                    <Editable.Root
                        textAlign="start"
                        value={props.fileInfo.name}
                        onValueChange={(value) => {
                            props.onNameChanged(value.value);
                        }}
                    >
                        <Editable.Preview />
                        <Editable.Input />
                    </Editable.Root>

                    <Stack gap="4" width="300px">
                        <NativeSelect.Root variant="plain">
                            <NativeSelect.Field value={baseValue} onChange={onValueSelected}>
                                {props.extensions.map((extension) => (
                                    <option key={extension} value={extension}>
                                        {extension}
                                    </option>
                                ))}
                            </NativeSelect.Field>
                            <NativeSelect.Indicator />
                        </NativeSelect.Root>
                    </Stack>
                </>
            )}
        </HStack>
    );
};

export default CodeEditorInfoLine;
