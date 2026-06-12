'use client';
import { EditorLanguage } from '@/elements/editor/types';
import React from 'react';

const COMMON_LANGUAGES = [
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
] as const;

const COMMON_LANGUAGE_IDS = new Set(COMMON_LANGUAGES.map((l) => l.value));

export type CodeEditorToolbarProps = {
    onFileNewClick: () => void;
    onFileOpenClick: () => void;
    onFileSaveClick: () => void;
    onCopyClick: () => void;
    onPasteClick: () => void;
    onClearClick: () => void;
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
        onCopyClick,
        onPasteClick,
        onClearClick,
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
            </div>

            <div className="code-editor__toolbar-sep" aria-hidden="true" />

            <div className="seg-control" role="group" aria-label="Common languages">
                {COMMON_LANGUAGES.map((lang) => (
                    <button
                        key={lang.value}
                        type="button"
                        aria-pressed={currentLanguageId === lang.value}
                        onClick={() => onLanguageSelected(lang.value)}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>

            <select
                className="code-editor__lang-select"
                value={selectValue}
                onChange={handleSelectChange}
                aria-label="More languages"
            >
                <option value="">More languages…</option>
                {moreLanguages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                        {lang.aliases[0]}
                    </option>
                ))}
            </select>

            <div className="code-editor__toolbar-spacer" />

            <div className="switch-row">
                <span id="wrap-label" className="code-editor__switch-label">
                    Wrap
                </span>
                <button
                    type="button"
                    role="switch"
                    className="switch-track"
                    aria-checked={wordWrap}
                    aria-labelledby="wrap-label"
                    onClick={onWordWrapToggle}
                >
                    <span className="switch-thumb" />
                </button>
            </div>

            <div className="switch-row">
                <span id="minimap-label" className="code-editor__switch-label">
                    Minimap
                </span>
                <button
                    type="button"
                    role="switch"
                    className="switch-track"
                    aria-checked={minimap}
                    aria-labelledby="minimap-label"
                    onClick={onMinimapToggle}
                >
                    <span className="switch-thumb" />
                </button>
            </div>
        </div>
    );
};

export default CodeEditorToolbar;
