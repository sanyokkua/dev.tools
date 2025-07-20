import { copyToClipboard } from '@/common/clipboard-utils';
import { Prompt } from '@/common/prompts/prompts';
import { useToast } from '@/contexts/ToasterContext';
import { ToastType } from '@/controls/toaster/types';
import PromptFilters from '@/elements/prompt/PromptFilters';
import PromptTable from '@/elements/prompt/PromptTable';
import usePromptsFilter from '@/elements/prompt/usePromptsFilter';
import ContentContainerFlex from '@/layouts/ContentContainerFlex';
import { useRouter } from 'next/router';
import React from 'react';

interface PromptsCollectionViewProps {
    prompts: Prompt[];
}

const PromptsCollectionView: React.FC<PromptsCollectionViewProps> = ({ prompts }) => {
    const router = useRouter();
    const { showToast } = useToast();
    const { availableItems, filters, handlers } = usePromptsFilter(prompts);

    const onShowClicked = (prompt: Prompt) => {
        router.push(`/prompts-collection/${prompt.id}`).catch((err: unknown) => {
            console.error(err);
        });
    };

    const onOpenLinkClicked = (prompt: Prompt) => {
        const win = window.open(`/prompts-collection/${prompt.id}`, '_blank');
        if (win != null) {
            win.focus();
        }
    };

    const onCopyLinkClicked = (prompt: Prompt) => {
        if (copyToClipboard(prompt.template)) {
            showToast({ type: ToastType.SUCCESS, message: 'Copied to clipboard' });
        } else {
            showToast({ type: ToastType.ERROR, message: 'Failed to copy to clipboard' });
        }
    };
    return (
        <ContentContainerFlex>
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
            <PromptTable
                items={availableItems}
                onShowClicked={onShowClicked}
                onOpenClicked={onOpenLinkClicked}
                onCopyClicked={onCopyLinkClicked}
            />
        </ContentContainerFlex>
    );
};

export default PromptsCollectionView;
