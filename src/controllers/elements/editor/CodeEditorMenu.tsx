import { languages } from 'monaco-editor';
import React from 'react';
import Menubar from '../../elements/navigation/menubar/Menubar';
import { BaseMenuItem, OnMenuItemClick, SubmenuItemTypeless } from '../../elements/navigation/menubar/types';
import { MenuBuilder } from '../../elements/navigation/menubar/utils';

enum MenuItems {
    FileNew = 'file-new',
    FileOpen = 'file-open',
    FileSave = 'file-save',
    EditorWrapWords = 'editor-wrap-words',
    EditorMiniMap = 'editor-mini-map',
}

type HandlersMap = { [key: string]: OnMenuItemClick };

export type CodeEditorMenuProps = {
    languages: languages.ILanguageExtensionPoint[];
    onLanguageSelected: (languageId: string) => void;
    onFileNewClick: OnMenuItemClick;
    onFileOpenClick: OnMenuItemClick;
    onFileSaveClick: OnMenuItemClick;
    onEditorWrapLinesClick: OnMenuItemClick;
    onEditorCodeMapClick: OnMenuItemClick;
    onContentPasteClick: OnMenuItemClick;
    onContentCopyClick: OnMenuItemClick;
};

const CodeEditorMenu: React.FC<CodeEditorMenuProps> = (props) => {
    const mappedHandlers: HandlersMap = {
        [MenuItems.FileNew]: props.onFileNewClick,
        [MenuItems.FileOpen]: props.onFileOpenClick,
        [MenuItems.FileSave]: props.onFileSaveClick,
        [MenuItems.EditorWrapWords]: props.onEditorWrapLinesClick,
        [MenuItems.EditorMiniMap]: props.onEditorCodeMapClick,
    };
    const onSubmenuClick: OnMenuItemClick = (details: BaseMenuItem) => {
        console.log(details);
        if (!Object.keys(mappedHandlers).includes(details.id)) {
            throw new Error('Handler not found for key: ' + details.id);
        }
        const mappedHandler = mappedHandlers[details.id];
        mappedHandler(details);
    };
    const onLanguageSubmenuClick: OnMenuItemClick = (details: BaseMenuItem) => {
        console.log(details);
        const lang = props.languages.find((lang) => lang.id === details.id);
        console.log(lang);
        if (lang) {
            props.onLanguageSelected(lang.id);
        } else {
            console.log('Language not found');
        }
    };
    const mappedLangsAsMenuItems: SubmenuItemTypeless[] = props.languages.map((lang) => {
        let text = lang.id;
        if (lang.aliases && lang.aliases.length > 0) {
            text = lang.aliases[0];
        }
        return { text: text, id: lang.id, onItemClick: onLanguageSubmenuClick };
    });

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
        .addItems(mappedLangsAsMenuItems)
        .end()
        .addButton('paste-from-clipboard', 'Paste', props.onContentPasteClick)
        .addButton('copy-to-clipboard', 'Copy', props.onContentCopyClick)
        .build();

    return <Menubar menuItems={menu} />;
};

export default CodeEditorMenu;
