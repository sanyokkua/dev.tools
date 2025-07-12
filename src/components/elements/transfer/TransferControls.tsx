import Button from '@/controls/Button';
import Input from '@/controls/Input';
import Select, { SelectItem } from '@/controls/Select';
import { APP_CATEGORIES } from '@/elements/transfer/helpers';
import React from 'react';

interface Props {
    selectedCategory: SelectItem;
    searchTerm: string;
    setCategory: (cat: SelectItem) => void;
    setSearch: (term: string) => void;
    reset: () => void;
    build: () => void;
}

/**
 * A React functional component that provides transfer controls for filtering and searching.
 *
 * This component includes a select dropdown for category selection, an input field for search terms,
 * and buttons to reset the filters and build commands. It is used to manage the state of selected
 * categories and search terms within the application.
 *
 * @param props - The properties passed to this component.
 * @param props.selectedCategory - The ID of the currently selected category.
 * @param props.searchTerm - The current search term.
 * @param props.setCategory - A function to update the selected category.
 * @param props.setSearch - A function to update the search term.
 * @param props.reset - A function to reset the filters.
 * @param props.build - A function to build commands based on current filters.
 *
 * @returns The rendered component with transfer controls.
 */
const TransferControls: React.FC<Props> = ({ selectedCategory, searchTerm, setCategory, setSearch, reset, build }) => (
    <div className="transfer-filters">
        <Select
            items={APP_CATEGORIES}
            selectedItem={selectedCategory.itemId}
            onSelect={setCategory}
            colorStyle={'primary-color'}
        />
        <Input
            placeholder="Search…"
            value={searchTerm}
            onChange={setSearch}
            variant="outlined"
            colorStyle="primary-color"
        />
        <Button text="Reset" variant="outlined" onClick={reset} colorStyle="error-color" />
        <Button text="Build Commands" variant="solid" onClick={build} colorStyle="primary-color" />
    </div>
);

export default React.memo(TransferControls);
