'use client';
import React from 'react';
import { Color } from './types';

/**
 * Represents an option in a selection list with a unique identifier and its display text.
 */
export interface SelectItem {
    itemId: string;
    displayText: string;
}

/**
 * Transforms an array of string identifiers into a standardized select item format.
 *
 * @param items - Array containing the string values to be converted into select items
 * @returns An array of objects representing selectable items with identifier and display text properties
 */
export function createSelectItemsFromStringArray(items: string[]): SelectItem[] {
    return items.map((itemId) => {
        return { itemId: itemId, displayText: itemId };
    });
}

/**
 * Represents a predefined size category for UI elements.
 */
type Size = 'small' | 'default' | 'large';

/**
 * Properties for configuring a select dropdown component.
 */
interface SelectProps {
    items: SelectItem[];
    selectedItem: string | SelectItem;
    onSelect: (selectItem: SelectItem) => void;

    size?: Size;
    colorStyle?: Color;
    disabled?: boolean;
    block?: boolean;
}

/**
 * A functional component for creating a styled and customizable select dropdown.
 * @param items - Array of selectable options with item IDs and display text.
 * @param selectedItem - Currently selected option, can be an ID string or object.
 * @param onSelect - Callback invoked when a new selection is made.
 * @param size - Optional: Size variant for styling (default 'default').
 * @param colorStyle - Optional: Color theme variation for the select element.
 * @param disabled - Optional: If true, prevents user interaction with the select.
 * @param block - Optional: If true, applies full width layout to the component.
 */
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
