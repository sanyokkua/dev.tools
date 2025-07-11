import { ALL_CATEGORIES } from '@/common/types';

export const DEFAULT_CATEGORY = { itemId: 'All Categories', displayText: 'All Categories' };

export const APP_CATEGORIES = [DEFAULT_CATEGORY, ...ALL_CATEGORIES.map((c) => ({ itemId: c.id, displayText: c.text }))];
