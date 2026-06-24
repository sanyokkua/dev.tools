import { paletteSearch, type PaletteResult } from '@/common/prompts/fuzzy';
import type { Manifest, ManifestLogical, ManifestSkill } from '@/common/prompts/model/types';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    manifest: Manifest;
    onSelect: (result: PaletteResult) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, manifest, onSelect }) => {
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const results: PaletteResult[] = paletteSearch(manifest, query);

    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setActiveIndex(-1);
            return;
        }
        requestAnimationFrame(() => inputRef.current?.focus());
    }, [isOpen]);

    useEffect(() => {
        const handler = (e: KeyboardEvent): void => {
            if (isOpen && e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };
        globalThis.addEventListener('keydown', handler);
        return (): void => globalThis.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (activeIndex < 0 || !listRef.current) return;
        const item = listRef.current.children[activeIndex] as HTMLElement | undefined;
        item?.scrollIntoView?.({ block: 'nearest' });
    }, [activeIndex]);

    if (!isOpen || typeof document === 'undefined') return null;

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && results[activeIndex]) {
                onSelect(results[activeIndex]);
            }
        }
    };

    const resultKey = (r: PaletteResult, i: number): string => {
        const id = (r.item as ManifestLogical).id ?? (r.item as ManifestSkill).slug;
        return `${r.type}-${id}-${i}`;
    };

    const root = document.getElementById('modal-root') ?? document.body;

    return createPortal(
        <div className="cp-overlay" role="dialog" aria-modal="true" aria-label="Quick search" data-testid="cmd-palette">
            <div className="cp-backdrop" data-testid="cmd-palette-backdrop" onClick={onClose} />
            <div className="cp-panel">
                <input
                    ref={inputRef}
                    className="cp-input"
                    type="text"
                    placeholder="Search prompts and skills…"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setActiveIndex(-1);
                    }}
                    onKeyDown={handleInputKeyDown}
                    role="combobox"
                    aria-expanded={results.length > 0}
                    aria-controls="cp-results"
                    aria-autocomplete="list"
                    aria-activedescendant={activeIndex >= 0 ? `cp-result-${activeIndex}` : undefined}
                    data-testid="cmd-palette-input"
                />

                {results.length > 0 ? (
                    <ul
                        id="cp-results"
                        className="cp-results"
                        role="listbox"
                        ref={listRef}
                        data-testid="cmd-palette-results"
                    >
                        {results.map((r, i) => (
                            <li
                                key={resultKey(r, i)}
                                id={`cp-result-${i}`}
                                className={`cp-result${i === activeIndex ? ' active' : ''}`}
                                role="option"
                                aria-selected={i === activeIndex}
                                onClick={() => onSelect(r)}
                                onMouseEnter={() => setActiveIndex(i)}
                            >
                                <span className="cp-result-label">{r.label}</span>
                                <span className="cp-result-meta">
                                    <span className={`cp-badge ${r.type}`}>
                                        {r.type === 'skill' ? 'Skill' : 'Prompt'}
                                    </span>
                                    {r.sublabel && <span className="cp-result-sublabel">{r.sublabel}</span>}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : query.trim() ? (
                    <div className="cp-empty" data-testid="cmd-palette-empty">
                        No results for <strong>{query}</strong>
                    </div>
                ) : null}

                <div className="cp-footer">
                    <span className="cp-hint">↑↓ navigate · ↵ open · Esc close</span>
                </div>
            </div>
        </div>,
        root,
    );
};

CommandPalette.displayName = 'CommandPalette';
export default CommandPalette;
