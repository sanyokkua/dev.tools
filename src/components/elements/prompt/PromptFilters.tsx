import Button from '@/controls/Button';
import Input from '@/controls/Input';
import Select, { SelectItem } from '@/controls/Select';
import { PromptCategoriesSelectList, PromptTypesSelectList } from '@/elements/prompt/helpers';
import React from 'react';

interface Props {
    promptType: SelectItem;
    promptCategory: SelectItem;

    descriptionTerm: string;
    tagTerm: string;

    setPromptType: (cat: SelectItem) => void;
    setPromptCategory: (cat: SelectItem) => void;

    setDescriptionTerm: (term: string) => void;
    setTagTerm: (term: string) => void;

    reset: () => void;
}

const PromptFilters: React.FC<Props> = ({
    promptType,
    promptCategory,
    descriptionTerm,
    tagTerm,
    setPromptType,
    setPromptCategory,
    setDescriptionTerm,
    setTagTerm,
    reset,
}) => (
    <div className="filters-with-headers">
        <div className="filter-group">
            <h4>Chose Prompt Type</h4>
            <Select
                items={PromptTypesSelectList}
                selectedItem={promptType.itemId}
                onSelect={setPromptType}
                colorStyle={'primary-color'}
                size={'small'}
            />
        </div>

        <div className="filter-group">
            <h4>Chose Prompt Category</h4>
            <Select
                items={PromptCategoriesSelectList}
                selectedItem={promptCategory.itemId}
                onSelect={setPromptCategory}
                colorStyle={'primary-color'}
                size={'small'}
            />
        </div>
        <div className="filter-group">
            <h4>Filter by description</h4>
            <Input
                placeholder="Search Description…"
                value={descriptionTerm}
                onChange={setDescriptionTerm}
                variant="outlined"
                colorStyle="primary-color"
                size={'small'}
            />
        </div>

        <div className="filter-group">
            <h4>Filter by tag</h4>
            <Input
                placeholder="Search Tag…"
                value={tagTerm}
                onChange={setTagTerm}
                variant="outlined"
                colorStyle="primary-color"
                size={'small'}
            />
        </div>

        <div className="filter-group">
            <h4>Reset filters to default</h4>
            <Button text="Reset" variant="outlined" onClick={reset} colorStyle="error-color" size={'small'} />
        </div>
    </div>
);

export default React.memo(PromptFilters);
