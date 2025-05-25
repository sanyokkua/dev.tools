import PageMenuBar, {
    MenuBuilder,
    OnBtnClick,
    OnSubmenuItemClick,
    SubMenuBuilder,
} from '@/components/customs/PageMenuBar';
import { SelectionDetails } from '@zag-js/menu';
import { languages } from 'monaco-editor';
import React from 'react';

enum MenuItems {
    FileNew = 'file-new',
    FileOpen = 'file-open',
    FileSave = 'file-save',
    EditorWrapWords = 'editor-wrap-words',
    EditorMiniMap = 'editor-mini-map',
}

type HandlersMap = { [key: string]: OnBtnClick };

export type CodeEditorMenuProps = {
    languages: languages.ILanguageExtensionPoint[];
    onLanguageSelected: (languageId: string) => void;
    onFileNewClick: OnBtnClick;
    onFileOpenClick: OnBtnClick;
    onFileSaveClick: OnBtnClick;
    onEditorWrapLinesClick: OnBtnClick;
    onEditorCodeMapClick: OnBtnClick;
    onContentPasteClick: OnBtnClick;
    onContentCopyClick: OnBtnClick;
};

const CodeEditorMenu: React.FC<CodeEditorMenuProps> = (props) => {
    const mappedLangsAsMenuItems: { text: string; itemId: string }[] = props.languages.map((lang) => {
        let text = lang.id;
        if (lang.aliases && lang.aliases.length > 0) {
            text = lang.aliases[0];
        }
        return { text: text, itemId: lang.id };
    });

    const mappedHandlers: HandlersMap = {
        [MenuItems.FileNew]: props.onFileNewClick,
        [MenuItems.FileOpen]: props.onFileOpenClick,
        [MenuItems.FileSave]: props.onFileSaveClick,
        [MenuItems.EditorWrapWords]: props.onEditorWrapLinesClick,
        [MenuItems.EditorMiniMap]: props.onEditorCodeMapClick,
    };
    const onSubmenuClick: OnSubmenuItemClick = (details: SelectionDetails) => {
        console.log(details);
        const key = details.value;
        if (!Object.keys(mappedHandlers).includes(key)) {
            throw new Error('Handler not found for key: ' + key);
        }
        const mappedHandler = mappedHandlers[key];
        mappedHandler();
    };
    const onLanguageSubmenuClick: OnSubmenuItemClick = (details: SelectionDetails) => {
        console.log(details);
        const lang = props.languages.find((lang) => lang.id === details.value);
        console.log(lang);
        if (lang) {
            props.onLanguageSelected(lang.id);
        } else {
            console.log('Language not found');
        }
    };

    const menu = MenuBuilder.newBuilder()
        .addSubMenu(
            SubMenuBuilder.newBuilder('File', 'file', onSubmenuClick)
                .addItem('New File', MenuItems.FileNew)
                .addItem('Open File...', MenuItems.FileOpen)
                .addItem('Save File...', MenuItems.FileSave)
                .build(),
        )
        .addSubMenu(
            SubMenuBuilder.newBuilder('Settings', 'settings', onSubmenuClick)
                .addItem('Wrap lines', MenuItems.EditorWrapWords)
                .addItem('Code Map', MenuItems.EditorMiniMap)
                .addSubMenu(
                    SubMenuBuilder.newBuilder('Settings', 'settings', onLanguageSubmenuClick)
                        .addItems(mappedLangsAsMenuItems)
                        .build(),
                )
                .build(),
        )
        .addButton('Paste', 'paste-from-clipboard', props.onContentPasteClick)
        .addButton('Copy', 'copy-to-clipboard', props.onContentCopyClick)
        .build();

    return <PageMenuBar menuItems={menu} />;
};

export default CodeEditorMenu;
