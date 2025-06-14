import React from 'react';
import { Color } from './types';

export type Variant = 'solid' | 'outlined' | 'dashed' | 'filled' | 'text' | 'link';
export type Size = 'small' | 'default' | 'large';

interface ButtonProps {
    text: string;
    onClick: () => void;
    variant?: Variant;
    size?: Size;
    colorStyle?: Color;
    danger?: boolean;
    ghost?: boolean;
    disabled?: boolean;
    loading?: boolean;
    block?: boolean;
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
}) => {
    const handle = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!disabled && !loading) onClick();
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
        colorStyle && `color${colorStyle}`,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button type="button" onClick={handle} disabled={disabled || loading} className={classes}>
            {text}
        </button>
    );
};

export default Button;
