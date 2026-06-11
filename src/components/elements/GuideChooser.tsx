import Input from '@/controls/Input';
import { StringUtils } from 'coreutilsts';
import React from 'react';

interface RadioButtonProps {
    label: string;
    value: string;
    selectedValue: string;
    onChange: (value: string) => void;
    name?: string;
}

const RadioButton: React.FC<RadioButtonProps> = ({ label, value, selectedValue, onChange, name }) => {
    const handleChange = (): void => {
        onChange(value);
    };

    return (
        <label>
            <Input
                type="radio"
                name={name ?? 'radio-group'}
                value={value}
                checked={selectedValue === value}
                onChange={handleChange}
            />
            {label}
        </label>
    );
};

interface RadioGroupProps {
    options: { label: string; value: string }[];
    selectedValue: string;
    onChange: (value: string) => void;
    name?: string;
}

const GuideChooser: React.FC<RadioGroupProps> = ({ options, selectedValue, onChange, name }) => {
    return (
        <div>
            {options.map((option) => (
                <RadioButton
                    key={StringUtils.slugifyString(option.value)}
                    label={option.label}
                    value={option.value}
                    selectedValue={selectedValue}
                    onChange={onChange}
                    name={name}
                />
            ))}
        </div>
    );
};

export default GuideChooser;
