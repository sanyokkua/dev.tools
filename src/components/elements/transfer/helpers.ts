import { ALL_CATEGORIES } from '@/common/types';

/**
 * Default category object representing an all-encompassing category option.
 * Used as a fallback or initial state when no specific category is selected.
 *
 * @type {{itemId: string, displayText: string}}
 *
 * @remarks
 * This constant provides a default selection that typically represents all items across the system.
 * It's commonly used in dropdowns, filters, and other UI components to allow users to select an "All" option.
 */
export const DEFAULT_CATEGORY: { itemId: string; displayText: string } = {
    itemId: 'All Categories',
    displayText: 'All Categories',
};

/**
 * Defines the available application categories used for categorization and filtering purposes.
 *
 * This array combines a default category with all other pre-defined categories,
 * transforming each into an object format suitable for UI display and data processing.
 *
 * The transformation includes:
 * - Merging DEFAULT_CATEGORY at the beginning of the list
 * - Converting each category from its original structure to { itemId: string, displayText: string }
 * - Ensuring consistency in the data model across the application
 */
export const APP_CATEGORIES = [DEFAULT_CATEGORY, ...ALL_CATEGORIES.map((c) => ({ itemId: c.id, displayText: c.text }))];
