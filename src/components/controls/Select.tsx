'use client';
import React from 'react';
import { Color } from './types';

export interface SelectItem {
    itemId: string;
    displayText: string;
}

export function createSelectItemsFromStringArray(items: string[]): SelectItem[] {
    return items.map((itemId) => {
        return { itemId: itemId, displayText: itemId };
    });
}

type Size = 'small' | 'default' | 'large';

interface SelectProps {
    items: SelectItem[];
    selectedItem: string | SelectItem;
    onSelect: (selectItem: SelectItem) => void;

    size?: Size;
    colorStyle?: Color;
    disabled?: boolean;
    block?: boolean;
}

const Select: React.FC<SelectProps> = ({
    items,
    selectedItem,
    onSelect,
    size = 'default',
    colorStyle = '',
    disabled = false,
    block = false,
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const itemId = e.target.value;
        const foundItem = items.find((it) => it.itemId === itemId);
        if (!foundItem) {
            throw Error(`Could not find item: ${itemId}`);
        }
        onSelect(foundItem);
    };

    const selectedItemId: string = typeof selectedItem === 'string' ? selectedItem : selectedItem.itemId;

    const classes = [
        'select-base',
        size !== 'default' && `select-${size}`,
        disabled && 'select-disabled',
        colorStyle && `color-${colorStyle}`,
        block && 'select-block',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <select value={selectedItemId} onChange={handleChange} className={classes} disabled={disabled}>
            {items.map((item) => (
                <option key={item.itemId} value={item.itemId}>
                    {item.displayText}
                </option>
            ))}
        </select>
    );
};

export default Select;
