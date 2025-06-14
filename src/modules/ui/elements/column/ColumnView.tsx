import Select, { SelectItem } from '@/controls/Select';
import ContentContainerGrid from '@/layout/ContentContainerGrid';
import ContentContainerGridChild from '@/layout/ContentContainerGridChild';
import React from 'react';
import CodeEditor, { CodeEditorProps } from '../editor/CodeEditor';
import Menubar from '../navigation/menubar/Menubar';
import { MenuItems } from '../navigation/menubar/types';
import ColumnMenu, { ColumnMenuProps } from './ColumnMenu';

export type ColumnViewProps = {
    leftEditor: CodeEditorProps;
    leftEditorMenu: MenuItems[];

    selectedItem: SelectItem;
    selectItems: SelectItem[];
    onSelectItem: (itemValue: SelectItem) => void;

    rightEditor: CodeEditorProps;
    rightEditorMenu: MenuItems[];
    functions: ColumnMenuProps;
};

const ColumnView: React.FC<ColumnViewProps> = (props) => {
    return (
        <ContentContainerGrid>
            <ContentContainerGridChild>
                <Menubar menuItems={props.leftEditorMenu} />
                <CodeEditor {...props.leftEditor} />
            </ContentContainerGridChild>
            <ContentContainerGridChild>
                <Select
                    items={props.selectItems}
                    selectedItem={props.selectedItem}
                    onSelect={props.onSelectItem}
                    colorStyle="tertiary-color"
                />
                <br />
                <ColumnMenu {...props.functions} />
            </ContentContainerGridChild>
            <ContentContainerGridChild>
                <Menubar menuItems={props.rightEditorMenu} />
                <CodeEditor {...props.rightEditor} />
            </ContentContainerGridChild>
        </ContentContainerGrid>
    );
};

export default ColumnView;
