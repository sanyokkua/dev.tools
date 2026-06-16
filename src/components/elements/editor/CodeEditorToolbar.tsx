'use client';
import SegmentedControl, { SegmentedOption } from '@/controls/SegmentedControl';
import Switch from '@/controls/Switch';
import { EditorLanguage } from '@/elements/editor/types';
import React from 'react';

const COMMON_LANGUAGES: SegmentedOption[] = [
    { value: 'typescript', label: 'TS' },
    { value: 'javascript', label: 'JS' },
    { value: 'java', label: 'Java' },
    { value: 'go', label: 'Go' },
    { value: 'python', label: 'Python' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'shell', label: 'Shell' },
    { value: 'yaml', label: 'YAML' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
];

const COMMON_LANGUAGE_IDS = new Set(COMMON_LANGUAGES.map((l) => l.value));

export type CodeEditorToolbarProps = {
    onFileNewClick: () => void;
    onFileOpenClick: () => void;
    onFileSaveClick: () => void;
    onFileSaveAsClick: () => void;
    onCopyClick: () => void;
    onPasteClick: () => void;
    onClearClick: () => void;
    onFormatClick: () => void;
    isFormattable: boolean;
    currentLanguageId: string;
    mappedLanguages: EditorLanguage[];
    onLanguageSelected: (languageId: string) => void;
    wordWrap: boolean;
    onWordWrapToggle: () => void;
    minimap: boolean;
    onMinimapToggle: () => void;
};

const CodeEditorToolbar: React.FC<CodeEditorToolbarProps> = (props) => {
    const {
        onFileNewClick,
        onFileOpenClick,
        onFileSaveClick,
        onFileSaveAsClick,
        onCopyClick,
        onPasteClick,
        onClearClick,
        onFormatClick,
        isFormattable,
        currentLanguageId,
        mappedLanguages,
        onLanguageSelected,
        wordWrap,
        onWordWrapToggle,
        minimap,
        onMinimapToggle,
    } = props;

    const isCommonLang = COMMON_LANGUAGE_IDS.has(currentLanguageId);
    const selectValue = isCommonLang ? '' : currentLanguageId;
    const moreLanguages = mappedLanguages.filter((l) => !COMMON_LANGUAGE_IDS.has(l.id));

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        if (e.target.value) {
            onLanguageSelected(e.target.value);
        }
    };

    return (
        <div className="code-editor__toolbar">
            <div className="code-editor__toolbar-group">
                <button type="button" className="button-base button-outlined button-small" onClick={onFileNewClick}>
                    New
                </button>
                <button type="button" className="button-base button-outlined button-small" onClick={onFileOpenClick}>
                    Open
                </button>
                <button type="button" className="button-base button-outlined button-small" onClick={onFileSaveClick}>
                    Save
                </button>
                <button type="button" className="button-base button-outlined button-small" onClick={onFileSaveAsClick}>
                    Save As
                </button>
            </div>

            <div className="code-editor__toolbar-sep" aria-hidden="true" />

            <div className="code-editor__toolbar-group">
                <button type="button" className="button-base button-ghost button-small" onClick={onCopyClick}>
                    Copy
                </button>
                <button type="button" className="button-base button-ghost button-small" onClick={onPasteClick}>
                    Paste
                </button>
                <button type="button" className="button-base button-ghost button-small" onClick={onClearClick}>
                    Clear
                </button>
                <button
                    type="button"
                    className="button-base button-ghost button-small"
                    onClick={onFormatClick}
                    disabled={!isFormattable}
                >
                    Format
                </button>
            </div>

            <div className="code-editor__toolbar-sep" aria-hidden="true" />

            <SegmentedControl
                options={COMMON_LANGUAGES}
                value={currentLanguageId}
                onChange={onLanguageSelected}
                aria-label="Common languages"
            />

            <select
                className="code-editor__lang-select"
                value={selectValue}
                onChange={handleSelectChange}
                aria-label="More languages"
            >
                <option value="">More languages…</option>
                {moreLanguages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                        {lang.aliases[0] ?? lang.id}
                    </option>
                ))}
            </select>

            <div className="code-editor__toolbar-spacer" />

            <Switch label="Wrap" checked={wordWrap} onChange={() => onWordWrapToggle()} />
            <Switch label="Minimap" checked={minimap} onChange={() => onMinimapToggle()} />
        </div>
    );
};

export default CodeEditorToolbar;
