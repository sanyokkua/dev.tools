import React, { useCallback, useId, useRef, useState } from 'react';

interface Props {
    'value': string;
    'onChange': (value: string) => void;
    'options': string[];
    'allowCustom'?: boolean;
    'placeholder'?: string;
    'disabled'?: boolean;
    'id'?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
}

const EditableCombobox: React.FC<Props> = ({
    value,
    onChange,
    options,
    allowCustom = false,
    placeholder,
    disabled = false,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
}) => {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const listboxId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const customOption = allowCustom && value && !options.includes(value) ? value : null;
    const totalOptions = options.length + (customOption ? 1 : 0);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
        },
        [onChange],
    );

    const handleSelect = useCallback(
        (val: string) => {
            onChange(val);
            setOpen(false);
            setActiveIndex(-1);
            inputRef.current?.focus();
        },
        [onChange],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!open) {
                    setOpen(true);
                    return;
                }
                setActiveIndex((i) => Math.min(i + 1, totalOptions - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === 'Enter' && open && activeIndex >= 0) {
                e.preventDefault();
                const selected = activeIndex < options.length ? options[activeIndex] : customOption;
                if (selected) handleSelect(selected);
            } else if (e.key === 'Escape') {
                setOpen(false);
                setActiveIndex(-1);
            }
        },
        [open, activeIndex, options, customOption, totalOptions, handleSelect],
    );

    const handleBlur = useCallback((e: React.FocusEvent) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            setOpen(false);
            setActiveIndex(-1);
        }
    }, []);

    return (
        <div className="ecb" ref={containerRef} onBlur={handleBlur}>
            <div className="ecb-input-row">
                <input
                    ref={inputRef}
                    id={id}
                    role="combobox"
                    aria-expanded={open}
                    aria-autocomplete="list"
                    aria-controls={listboxId}
                    aria-activedescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
                    aria-label={ariaLabel}
                    aria-labelledby={ariaLabelledBy}
                    className="ecb-input"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (options.length > 0) setOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete="off"
                />
                {options.length > 0 && (
                    <button
                        className="ecb-caret"
                        tabIndex={-1}
                        type="button"
                        aria-hidden="true"
                        onClick={() => {
                            setOpen((o) => !o);
                            inputRef.current?.focus();
                        }}
                        disabled={disabled}
                    >
                        ▾
                    </button>
                )}
            </div>
            {open && totalOptions > 0 && (
                <ul id={listboxId} className="ecb-menu" role="listbox">
                    {options.map((opt, i) => (
                        <li
                            key={opt}
                            id={`${listboxId}-opt-${i}`}
                            role="option"
                            aria-selected={value === opt}
                            className={`ecb-option${value === opt ? ' ecb-option-selected' : ''}${activeIndex === i ? ' ecb-option-active' : ''}`}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelect(opt);
                            }}
                        >
                            {opt}
                        </li>
                    ))}
                    {customOption && (
                        <li
                            id={`${listboxId}-opt-${options.length}`}
                            role="option"
                            aria-selected={false}
                            className={`ecb-option ecb-option-custom${activeIndex === options.length ? ' ecb-option-active' : ''}`}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelect(customOption);
                            }}
                        >
                            ＋ Use &quot;{customOption}&quot; — or type any other value…
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};

EditableCombobox.displayName = 'EditableCombobox';
export default EditableCombobox;
