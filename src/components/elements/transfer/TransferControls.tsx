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
