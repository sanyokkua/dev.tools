'use client';
import React from 'react';
import { Color } from './types';

// Define input types as per HTML spec
type InputType =
    | 'button'
    | 'checkbox'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'file'
    | 'hidden'
    | 'image'
    | 'month'
    | 'number'
    | 'password'
    | 'radio'
    | 'range'
    | 'reset'
    | 'search'
    | 'submit'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week';

// Define props interface
interface InputProps {
    defaultValue?: string;
    type?: InputType;
    onChange: (text: string) => void;
    disabled?: boolean;
    readOnly?: boolean;
    variant?: 'outlined' | 'underlined';
    size?: 'small' | 'default' | 'large';
    block?: boolean;
    colorStyle?: Color;
    placeholder?: string;
}

// Input component
const Input: React.FC<InputProps> = ({
    defaultValue = '',
    type = 'text',
    onChange,
    disabled = false,
    readOnly = false,
    variant = 'outlined',
    size = 'default',
    block = false,
    colorStyle = '',
    placeholder = '',
}) => {
    // Handle change event
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled || readOnly) {
            return;
        }
        onChange(e.target.value);
    };

    // Construct class names dynamically
    const classes = [
        'input-base',
        variant === 'outlined' ? 'input-outlined' : 'input-underlined',
        size === 'small' ? 'input-small' : size === 'large' ? 'input-large' : '',
        block ? 'input-block' : '',
        colorStyle ? `color-${colorStyle}` : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <input
            type={type}
            defaultValue={defaultValue}
            onChange={handleChange}
            disabled={disabled}
            readOnly={readOnly}
            className={classes}
            placeholder={placeholder}
        />
    );
};

export default Input;
