import React from 'react';

export interface SelectItem {
    key: string;
    value: string;
}

interface AppSelectProps {
    items: SelectItem[];
    defaultKey: string;
    onSelect: (selectedKey: string) => void;
    style?: React.CSSProperties;
    className?: string;
}

const AppSelect: React.FC<AppSelectProps> = ({ items, defaultKey, onSelect, style, className = '' }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        onSelect(e.target.value);
    };

    return (
        <select value={defaultKey} onChange={handleChange} style={style} className={className}>
            {items.map((item) => (
                <option key={item.key} value={item.key}>
                    {item.value}
                </option>
            ))}
        </select>
    );
};

export default AppSelect;
