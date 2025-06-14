import React from 'react';
import Select, { SelectItem } from '../../../custom-components/controls/Select';
import ContentContainerGrid from '../../../custom-components/layout/ContentContainerGrid';
import ContentContainerGridChild from '../../../custom-components/layout/ContentContainerGridChild';
import ColumnMenu, { ColumnMenuProps } from '../../elements/column/ColumnMenu';
import CodeEditor, { CodeEditorProps } from '../../elements/editor/CodeEditor';
import Menubar from '../../elements/navigation/menubar/Menubar';
import { MenuItems } from '../../elements/navigation/menubar/types';

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
