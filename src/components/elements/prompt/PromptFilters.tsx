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
    <div className="prompts-filter-bar">
        <div className="toolbar">
            <div className="field">
                <label>Category</label>
                <Select
                    items={PromptCategoriesSelectList}
                    selectedItem={promptCategory.itemId}
                    onSelect={setPromptCategory}
                    colorStyle="primary-color"
                    size="small"
                />
            </div>
            <div className="field">
                <label>Type</label>
                <Select
                    items={PromptTypesSelectList}
                    selectedItem={promptType.itemId}
                    onSelect={setPromptType}
                    colorStyle="primary-color"
                    size="small"
                />
            </div>
            <div className="field">
                <label>Tag</label>
                <Input
                    placeholder="filter by tag…"
                    value={tagTerm}
                    onChange={setTagTerm}
                    variant="outlined"
                    colorStyle="primary-color"
                    size="small"
                />
            </div>
            <div className="field field-grow">
                <label>Search description</label>
                <Input
                    placeholder="search…"
                    value={descriptionTerm}
                    onChange={setDescriptionTerm}
                    variant="outlined"
                    colorStyle="primary-color"
                    size="small"
                />
            </div>
            <div className="field" style={{ alignSelf: 'flex-end' }}>
                <Button text="Reset" variant="outlined" colorStyle="error-color" size="small" onClick={reset} />
            </div>
        </div>
    </div>
);

export default React.memo(PromptFilters);
