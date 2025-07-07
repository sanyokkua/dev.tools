'use client';
import React from 'react';
import Menubar from '../navigation/menubar/Menubar';
import { BaseMenuItem, OnMenuItemClick, SubmenuItemTypeless } from '../navigation/menubar/types';
import { MenuBuilder } from '../navigation/menubar/utils';

enum MenuItems {
    FileNew = 'file-new',
    FileOpen = 'file-open',
    FileSave = 'file-save',
    EditorWrapWords = 'editor-wrap-words',
    EditorMiniMap = 'editor-mini-map',
}

type HandlersMap = { [key: string]: OnMenuItemClick };

export type CodeEditorMenuProps = {
    languages: SubmenuItemTypeless[];
    onLanguageSelected: (languageId: string) => void;
    onFileNewClick: OnMenuItemClick;
    onFileOpenClick: OnMenuItemClick;
    onFileSaveClick: OnMenuItemClick;
    onEditorWrapLinesClick: OnMenuItemClick;
    onEditorMiniMapClick: OnMenuItemClick;
    onContentPasteClick: OnMenuItemClick;
    onContentCopyClick: OnMenuItemClick;
};

const CodeEditorMenu: React.FC<CodeEditorMenuProps> = (props) => {
    const mappedHandlers: HandlersMap = {
        [MenuItems.FileNew]: props.onFileNewClick,
        [MenuItems.FileOpen]: props.onFileOpenClick,
        [MenuItems.FileSave]: props.onFileSaveClick,
        [MenuItems.EditorWrapWords]: props.onEditorWrapLinesClick,
        [MenuItems.EditorMiniMap]: props.onEditorMiniMapClick,
    };
    const onSubmenuClick: OnMenuItemClick = (details: BaseMenuItem) => {
        console.log(details);
        if (!Object.keys(mappedHandlers).includes(details.id)) {
            throw new Error('Handler not found for key: ' + details.id);
        }
        const mappedHandler = mappedHandlers[details.id];
        mappedHandler(details);
    };

    const menu = MenuBuilder.newBuilder()
        .addSubmenu('file', 'File')
        .addItem(MenuItems.FileNew, 'New File', onSubmenuClick)
        .addItem(MenuItems.FileOpen, 'Open File...', onSubmenuClick)
        .addItem(MenuItems.FileSave, 'Save File...', onSubmenuClick)
        .end()
        .addSubmenu('settings', 'Settings')
        .addItem(MenuItems.EditorWrapWords, 'Wrap lines', onSubmenuClick)
        .addItem(MenuItems.EditorMiniMap, 'Code Map', onSubmenuClick)
        .end()
        .addSubmenu('syntax', 'Syntax')
        .addItems(props.languages)
        .end()
        .addButton('paste-from-clipboard', 'Paste', props.onContentPasteClick)
        .addButton('copy-to-clipboard', 'Copy', props.onContentCopyClick)
        .build();

    return <Menubar menuItems={menu} />;
};

export default CodeEditorMenu;
