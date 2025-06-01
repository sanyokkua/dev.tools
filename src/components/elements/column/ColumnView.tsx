import ColumnMenu, { ColumnMenuProps } from '@/components/elements/column/ColumnMenu';
import CodeEditor, { CodeEditorProps } from '@/components/elements/editor/CodeEditor';
import MenuBar from '@/components/elements/menuBar/MenuBar';
import { TopLevelMenuItem } from '@/components/elements/menuBar/types';
import AppSelect, { SelectItem } from '@/components/ui/AppSelect';
import AppColumn from '@/components/ui/layout/Column';
import AppColumnContainer from '@/components/ui/layout/ColumnContainer';
import React from 'react';

export type ColumnViewProps = {
    leftEditor: CodeEditorProps;
    leftEditorMenu: TopLevelMenuItem[];

    selectedItem: SelectItem;
    selectItems: SelectItem[];
    onSelectItem: (itemValue: string) => void;

    rightEditor: CodeEditorProps;
    rightEditorMenu: TopLevelMenuItem[];
    functions: ColumnMenuProps;
};

const ColumnView: React.FC<ColumnViewProps> = (props) => {
    const selectedItemKey = props.selectedItem.key;
    return (
        <AppColumnContainer>
            <AppColumn>
                <MenuBar menuItems={props.leftEditorMenu} />
                <CodeEditor {...props.leftEditor} />
            </AppColumn>
            <AppColumn>
                <AppSelect
                    items={props.selectItems}
                    defaultKey={selectedItemKey}
                    onSelect={props.onSelectItem}
                    className="inline-select"
                />
                <br />
                <ColumnMenu {...props.functions} />
            </AppColumn>
            <AppColumn>
                <MenuBar menuItems={props.rightEditorMenu} />
                <br />
                <CodeEditor {...props.rightEditor} />
            </AppColumn>
        </AppColumnContainer>
    );
};

export default ColumnView;
