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
    icon?: React.ReactNode;
}

const VARIANT_CLASS: Record<Variant, string> = {
    solid: 'primary',
    filled: 'tonal',
    outlined: 'outline',
    dashed: 'outline',
    text: 'ghost',
    link: 'button-link',
};

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
    icon,
}) => {
    const handle = (e: React.MouseEvent<HTMLButtonElement>): void => {
        if (!disabled && !loading && onClick) {
            e.preventDefault();
            onClick();
        }
    };

    const classes = [
        'btn',
        VARIANT_CLASS[variant],
        size === 'small' && 'sm',
        size === 'large' && 'button-large',
        danger && 'danger',
        ghost && 'ghost',
        loading && 'button-loading',
        block && 'button-block',
        colorStyle && `color-${colorStyle}`,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button type={type} onClick={handle} disabled={disabled || loading} className={classes}>
            {icon}
            {text}
        </button>
    );
};

export default Button;
