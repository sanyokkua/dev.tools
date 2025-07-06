'use client';
import React from 'react';
import { Color } from './types';

type Variant = 'solid' | 'outlined' | 'dashed' | 'filled' | 'text' | 'link';
type Size = 'small' | 'default' | 'large';

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
