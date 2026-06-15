'use client';
import React from 'react';

export interface SegmentedOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

interface SegmentedControlProps {
    'options': SegmentedOption[];
    'value': string;
    'onChange': (value: string) => void;
    'aria-label'?: string;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange, 'aria-label': ariaLabel }) => {
    return (
        <div role="group" aria-label={ariaLabel} className="seg-control">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    aria-pressed={opt.value === value}
                    onClick={() => {
                        if (opt.value !== value) onChange(opt.value);
                    }}
                >
                    {opt.icon}
                    <span>{opt.label}</span>
                </button>
            ))}
        </div>
    );
};

export default SegmentedControl;
