'use client';
import React, { useId } from 'react';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    id?: string;
    disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, id, disabled = false }) => {
    const generatedId = useId();
    const switchId = id ?? generatedId;
    const labelId = label ? `${switchId}-label` : undefined;

    const handleClick = (): void => {
        if (!disabled) onChange(!checked);
    };

    const track = (
        <button
            id={switchId}
            type="button"
            role="switch"
            aria-checked={checked}
            aria-labelledby={labelId}
            disabled={disabled}
            className="switch-track"
            onClick={handleClick}
        >
            <span className="switch-thumb" />
        </button>
    );

    if (!label) return track;

    return (
        <div className={`switch-row${disabled ? ' switch-row-disabled' : ''}`}>
            <span id={labelId}>{label}</span>
            {track}
        </div>
    );
};

export default Switch;
