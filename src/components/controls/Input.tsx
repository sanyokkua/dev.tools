'use client';
import React from 'react';
import { Color } from './types';

/**
 * Enumerates valid HTML input element types supported by browsers.
 */
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

/**
 * Props interface for configuring input components with various styling and behavior options.
 */
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

/**
 * Renders a customizable input element with various styling and behavior options.
 * @param defaultValue - Default Value in Input
 * @param type - Input field type (text, number, etc.)
 * @param value - Current input value
 * @param onChange - Callback for handling value changes
 * @param disabled - Controls input state: enabled or disabled
 * @param readOnly - Sets input to read-only mode
 * @param variant - Visual style: 'outlined' or 'underlined'
 * @param size - Size modifier: 'default', 'small', or 'large'
 * @param block - Makes the input take full width of its container
 * @param colorStyle
 * @param placeholder - Hint text displayed when field is empty
 * @param onChangeDefault
 * @param id - Unique identifier for form fields
 * @param name - Name attribute used in form submission
 * @param form
 * @param autoComplete
 * @param autoFocus
 * @param minLength
 * @param maxLength
 * @param min
 * @param max
 * @param step
 * @param required - Marks input as mandatory field
 * @param checked
 */
const Input: React.FC<InputProps> = ({
    defaultValue,
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
