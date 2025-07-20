import { Prompt } from '@/common/prompts/prompts';
import { SelectItem } from '@/controls/Select';
import { DEFAULT_PROMPT_CATEGORY, DEFAULT_PROMPT_TYPE } from '@/elements/prompt/helpers';
import { useCallback, useMemo, useState } from 'react';

interface Filters {
    promptType: SelectItem;
    promptCategory: SelectItem;
    descriptionTerm: string;
    tagTerm: string;
}

interface Handlers {
    setPromptType: (cat: SelectItem) => void;
    setPromptCategory: (cat: SelectItem) => void;
    setDescriptionTerm: (term: string) => void;
    setTagTerm: (term: string) => void;
    reset: () => void;
}

type UsePromptsFilterRetType = { availableItems: Prompt[]; filters: Filters; handlers: Handlers };

export default function usePromptsFilter(source: Prompt[]): UsePromptsFilterRetType {
    const [selectedPromptType, setSelectedPromptType] = useState<SelectItem>(DEFAULT_PROMPT_TYPE);
    const [selectedPromptCategory, setSelectedPromptCategory] = useState<SelectItem>(DEFAULT_PROMPT_CATEGORY);
    const [descriptionTerm, setDescriptionTerm] = useState<string>('');
    const [tagTerm, setTagTerm] = useState<string>('');

    const availableItems = useMemo(() => {
        const lowerDescription = descriptionTerm.toLowerCase();
        const lowerTag = tagTerm.toLowerCase();
        return source
            .sort((a, b) => a.id.localeCompare(b.id))
            .filter((prompt) => {
                const inType =
                    selectedPromptType.itemId === DEFAULT_PROMPT_TYPE.itemId ||
                    prompt.type === selectedPromptType.itemId;
                const inCat =
                    selectedPromptCategory.itemId === DEFAULT_PROMPT_CATEGORY.itemId ||
                    prompt.category === selectedPromptCategory.itemId;
                const matchesDescr = prompt.description.toLowerCase().includes(lowerDescription);
                const matchesTag = prompt.tags.some((t) => t.toLowerCase().includes(lowerTag));
                return inCat && inType && matchesDescr && matchesTag;
            });
    }, [descriptionTerm, selectedPromptCategory, selectedPromptType, source, tagTerm]);

    const reset = useCallback(() => {
        setSelectedPromptType(DEFAULT_PROMPT_TYPE);
        setSelectedPromptCategory(DEFAULT_PROMPT_CATEGORY);
        setDescriptionTerm('');
        setTagTerm('');
    }, []);

    return {
        availableItems: availableItems,
        filters: {
            promptType: selectedPromptType,
            promptCategory: selectedPromptCategory,
            tagTerm: tagTerm,
            descriptionTerm: descriptionTerm,
        },
        handlers: {
            setDescriptionTerm: setDescriptionTerm,
            setTagTerm: setTagTerm,
            setPromptType: setSelectedPromptType,
            setPromptCategory: setSelectedPromptCategory,
            reset: reset,
        },
    };
}
