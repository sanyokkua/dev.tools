'use client';
import React from 'react';

interface TextareaProps {
    'value'?: string;
    'onChange'?: (text: string) => void;
    'disabled'?: boolean;
    'readOnly'?: boolean;
    'placeholder'?: string;
    'id'?: string;
    'name'?: string;
    'rows'?: number;
    'block'?: boolean;
    'aria-label'?: string;
    'aria-describedby'?: string;
}

const Textarea: React.FC<TextareaProps> = ({
    value = '',
    onChange,
    disabled = false,
    readOnly = false,
    placeholder = '',
    id,
    name,
    rows = 4,
    block = false,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        if (disabled || readOnly) return;
        onChange?.(e.target.value);
    };

    const classes = ['textarea-base', block && 'textarea-block'].filter(Boolean).join(' ');

    return (
        <textarea
            value={value}
            onChange={handleChange}
            disabled={disabled}
            readOnly={readOnly}
            className={classes}
            placeholder={placeholder}
            id={id}
            name={name}
            rows={rows}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedby}
        />
    );
};

Textarea.displayName = 'Textarea';
export default Textarea;
