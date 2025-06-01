import MenuBar from '@/components/elements/menuBar/MenuBar';
import { MenuButtonClickHandler, SubmenuItem, SubmenuItemClickHandler } from '@/components/elements/menuBar/types';
import { MenuBuilder } from '@/components/elements/menuBar/utils';
import { languages } from 'monaco-editor';
import React from 'react';

enum MenuItems {
    FileNew = 'file-new',
    FileOpen = 'file-open',
    FileSave = 'file-save',
    EditorWrapWords = 'editor-wrap-words',
    EditorMiniMap = 'editor-mini-map',
}

type HandlersMap = { [key: string]: MenuButtonClickHandler };

export type CodeEditorMenuProps = {
    languages: languages.ILanguageExtensionPoint[];
    onLanguageSelected: (languageId: string) => void;
    onFileNewClick: MenuButtonClickHandler;
    onFileOpenClick: MenuButtonClickHandler;
    onFileSaveClick: MenuButtonClickHandler;
    onEditorWrapLinesClick: MenuButtonClickHandler;
    onEditorCodeMapClick: MenuButtonClickHandler;
    onContentPasteClick: MenuButtonClickHandler;
    onContentCopyClick: MenuButtonClickHandler;
};

const CodeEditorMenu: React.FC<CodeEditorMenuProps> = (props) => {
    const mappedLangsAsMenuItems: Omit<SubmenuItem, 'type'>[] = props.languages.map((lang) => {
        let text = lang.id;
        if (lang.aliases && lang.aliases.length > 0) {
            text = lang.aliases[0];
        }
        return { text: text, id: lang.id };
    });

    const mappedHandlers: HandlersMap = {
        [MenuItems.FileNew]: props.onFileNewClick,
        [MenuItems.FileOpen]: props.onFileOpenClick,
        [MenuItems.FileSave]: props.onFileSaveClick,
        [MenuItems.EditorWrapWords]: props.onEditorWrapLinesClick,
        [MenuItems.EditorMiniMap]: props.onEditorCodeMapClick,
    };
    const onSubmenuClick: SubmenuItemClickHandler = (details: string) => {
        console.log(details);
        if (!Object.keys(mappedHandlers).includes(details)) {
            throw new Error('Handler not found for key: ' + details);
        }
        const mappedHandler = mappedHandlers[details];
        mappedHandler();
    };
    const onLanguageSubmenuClick: SubmenuItemClickHandler = (details: string) => {
        console.log(details);
        const lang = props.languages.find((lang) => lang.id === details);
        console.log(lang);
        if (lang) {
            props.onLanguageSelected(lang.id);
        } else {
            console.log('Language not found');
        }
    };

    const menu = MenuBuilder.newBuilder()
        .addSubmenu('file', 'File', onSubmenuClick)
        .addItem(MenuItems.FileNew, 'New File')
        .addItem(MenuItems.FileOpen, 'Open File...')
        .addItem(MenuItems.FileSave, 'Save File...')
        .end()
        .addSubmenu('settings', 'Settings', onSubmenuClick)
        .addItem(MenuItems.EditorWrapWords, 'Wrap lines')
        .addItem(MenuItems.EditorMiniMap, 'Code Map')
        .end()
        .addSubmenu('syntax', 'Syntax', onLanguageSubmenuClick)
        .addItems(mappedLangsAsMenuItems)
        .end()
        .addButton('paste-from-clipboard', 'Paste', props.onContentPasteClick)
        .addButton('copy-to-clipboard', 'Copy', props.onContentCopyClick)
        .build();

    return <MenuBar menuItems={menu} />;
};

export default CodeEditorMenu;
