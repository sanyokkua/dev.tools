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
    value?: string;
    type?: InputType;
    onChange?: (text: string) => void;
    onChangeDefault?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    readOnly?: boolean;
    variant?: 'outlined' | 'underlined';
    size?: 'small' | 'default' | 'large';
    block?: boolean;
    colorStyle?: Color;
    placeholder?: string;
    id?: string;
    name?: string;
    form?: string;
    autoComplete?: string;
    autoFocus?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    step?: number;
    required?: boolean;
    checked?: boolean;
}

// Input component
const Input: React.FC<InputProps> = ({
    defaultValue = '',
    type = 'text',
    value = '',
    onChange,
    disabled = false,
    readOnly = false,
    variant = 'outlined',
    size = 'default',
    block = false,
    colorStyle = '',
    placeholder = '',
    onChangeDefault,
    id,
    name,
    form,
    autoComplete,
    autoFocus,
    minLength,
    maxLength,
    min,
    max,
    step,
    required,
    checked,
}) => {
    // Handle change event
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChangeDefault) {
            onChangeDefault(e);
            return;
        }
        if (disabled || readOnly) {
            return;
        }
        if (onChange) {
            onChange(e.target.value);
        }
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
            value={value}
            onChange={handleChange}
            disabled={disabled}
            readOnly={readOnly}
            className={classes}
            placeholder={placeholder}
            id={id}
            name={name}
            form={form}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            minLength={minLength}
            maxLength={maxLength}
            min={min}
            max={max}
            step={step}
            required={required}
            checked={checked}
        />
    );
};

export default Input;
