'use client';
import React, { useId } from 'react';

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    id?: string;
    disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, label, id, disabled = false }) => {
    const generatedId = useId();
    const checkboxId = id ?? generatedId;
    const labelId = label ? `${checkboxId}-label` : undefined;

    const handleClick = (): void => {
        if (!disabled) onChange(!checked);
    };

    const box = (
        <button
            id={checkboxId}
            type="button"
            role="checkbox"
            aria-checked={checked}
            aria-labelledby={labelId}
            disabled={disabled}
            className="checkbox-btn"
            onClick={handleClick}
        >
            {checked && '✓'}
        </button>
    );

    if (!label) return box;

    return (
        <div className={`checkbox-row${disabled ? ' checkbox-disabled' : ''}`}>
            {box}
            <span id={labelId}>{label}</span>
        </div>
    );
};

export default Checkbox;
