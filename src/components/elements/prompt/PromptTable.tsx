import { Prompt } from '@/common/prompts/prompts';
import React from 'react';

interface Props {
    items: Prompt[];
    selectedId: string | null;
    onSelect: (prompt: Prompt) => void;
}

const PromptTable: React.FC<Props> = ({ items, selectedId, onSelect }) => {
    if (items.length === 0) {
        return (
            <div style={{ padding: 16, fontSize: 13, color: 'var(--on-surface-variant)' }}>
                No prompts match the current filters.
            </div>
        );
    }

    return (
        <div className="prompt-list-scroll">
            {items.map((prompt) => (
                <div
                    key={prompt.id}
                    className={`prompt-list-item${prompt.id === selectedId ? ' selected' : ''}`}
                    onClick={() => onSelect(prompt)}
                >
                    <span className="prompt-list-name">{prompt.description}</span>
                    <span className="prompt-list-hint">
                        {prompt.category}
                        {(prompt.parameters?.length ?? 0) > 0
                            ? ` · ${prompt.parameters!.length} param${prompt.parameters!.length !== 1 ? 's' : ''}`
                            : ''}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default React.memo(PromptTable);
