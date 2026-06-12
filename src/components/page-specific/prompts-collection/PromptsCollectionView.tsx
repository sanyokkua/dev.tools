import { Prompt } from '@/common/prompts/prompts';
import PromptFilters from '@/elements/prompt/PromptFilters';
import PromptTable from '@/elements/prompt/PromptTable';
import usePromptsFilter from '@/elements/prompt/usePromptsFilter';
import PromptDetailPanel from '@/page-specific/prompts-collection/PromptDetailPanel';
import React, { useState } from 'react';

interface Props {
    prompts: Prompt[];
}

const PromptsCollectionView: React.FC<Props> = ({ prompts }) => {
    const { availableItems, filters, handlers } = usePromptsFilter(prompts);
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

    const handleSelect = (prompt: Prompt): void => {
        setSelectedPrompt((prev) => (prev?.id === prompt.id ? null : prompt));
    };

    return (
        <>
            <PromptFilters
                promptType={filters.promptType}
                promptCategory={filters.promptCategory}
                descriptionTerm={filters.descriptionTerm}
                tagTerm={filters.tagTerm}
                setDescriptionTerm={handlers.setDescriptionTerm}
                setPromptCategory={handlers.setPromptCategory}
                setPromptType={handlers.setPromptType}
                setTagTerm={handlers.setTagTerm}
                reset={handlers.reset}
            />

            <div className="prompts-split">
                <div className="prompt-list-card">
                    <PromptTable
                        items={availableItems}
                        selectedId={selectedPrompt?.id ?? null}
                        onSelect={handleSelect}
                    />
                </div>

                <div className="prompt-detail-col">
                    {selectedPrompt ? (
                        <PromptDetailPanel prompt={selectedPrompt} />
                    ) : (
                        <div className="prompt-detail-empty">Select a prompt from the list to view and edit it.</div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PromptsCollectionView;
