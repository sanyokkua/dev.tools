'use client';
import React from 'react';
import { Color } from './types';

/**
 * Represents a UI component variant style.
 */
type Variant = 'solid' | 'outlined' | 'dashed' | 'filled' | 'text' | 'link';
/**
 * Enumeration of supported size options for components and elements.
 */
type Size = 'small' | 'default' | 'large';

/**
 * Configuration options for a button component.
 */
interface ButtonProps {
    text: string;
    onClick?: () => void;
    variant?: Variant;
    size?: Size;
    colorStyle?: Color;
    danger?: boolean;
    ghost?: boolean;
    disabled?: boolean;
    loading?: boolean;
    block?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

/**
 * A customizable button component with various styling options and states.
 * @param text - Button label or title displayed to the user
 * @param onClick - Callback function executed when button is clicked
 * @param variant - Visual appearance style of the button ('solid', 'outline')
 * @param size - Size class of the button ('small', 'medium', 'large', default: 'default')
 * @param colorStyle - Custom color scheme identifier for themed buttons
 * @param danger - Indicates if the button has destructive functionality
 * @param ghost - Renders a transparent, text-only variant of the button
 * @param disabled - Prevents user interaction with the button
 * @param loading - Shows a loading state while performing an action
 * @param block - Makes the button take full width of its container
 * @param type - HTML button element's form submission behavior ('submit', 'reset' or 'button')
 */
const Button: React.FC<ButtonProps> = ({
    text,
    onClick,
    variant = 'solid',
    size = 'default',
    colorStyle = '',
    danger = false,
    ghost = false,
    disabled = false,
    loading = false,
    block = false,
    type = 'button',
}) => {
    const handle = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!disabled && !loading && onClick) {
            e.preventDefault();
            onClick();
        }
    };

    const classes = [
        'button-base',
        size !== 'default' && `button-${size}`,
        `button-${variant}`,
        danger && 'button-danger',
        ghost && 'button-ghost',
        disabled && 'button-disabled',
        loading && 'button-loading',
        block && 'button-block',
        colorStyle && `color-${colorStyle}`,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button type={type} onClick={handle} disabled={disabled || loading} className={classes}>
            {text}
        </button>
    );
};

export default Button;
