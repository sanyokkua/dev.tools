import ColumnMenu, { ColumnMenuProps } from '@/components/customs/column/ColumnMenu';
import CodeEditor, { CodeEditorProps } from '@/components/customs/editor/CodeEditor';
import { Box, createListCollection, Flex, NativeSelect, Portal, Select, Separator } from '@chakra-ui/react';
import React from 'react';
import PageMenuBar, { TopLevelMenuItemConfig } from '@/components/customs/PageMenuBar';

export type SelectItem = {
    label: string;
    value: string;
}

export type ColumnViewProps = {
    leftEditor: CodeEditorProps;
    leftEditorMenu: TopLevelMenuItemConfig[];

    selectedItem: SelectItem;
    selectItems: SelectItem[];
    onSelectItem: (itemValue: string) => void;

    rightEditor: CodeEditorProps;
    rightEditorMenu: TopLevelMenuItemConfig[];
    functions: ColumnMenuProps
};

const ColumnView: React.FC<ColumnViewProps> = (props) => {
    return (
        <Flex>
            <Box flex="2" p={2}>
                <PageMenuBar menuItems={props.leftEditorMenu} />
                <br />
                <CodeEditor {...props.leftEditor} />
            </Box>
            <Box flex="1" p={2}>
                <NativeSelect.Root variant="plain">
                    <NativeSelect.Field
                        value={props.selectedItem.value}
                        onChange={(e) => {
                            props.onSelectItem(e.target.value);
                        }}
                    >
                        {props.selectItems.map((extension) => (
                            <option key={extension.value} value={extension.value}>
                                {extension.label}
                            </option>
                        ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                </NativeSelect.Root>
                <br />
                <ColumnMenu {...props.functions} />
            </Box>
            <Box flex="2" p={2}>
                <PageMenuBar menuItems={props.rightEditorMenu} />
                <br />
                <CodeEditor {...props.rightEditor} />
            </Box>
        </Flex>
    );
};

export default ColumnView;
