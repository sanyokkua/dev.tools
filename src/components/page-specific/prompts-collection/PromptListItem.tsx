import type { ManifestLogical } from '@/common/prompts/model/types';
import React from 'react';

interface Props {
    logical: ManifestLogical;
    selected: boolean;
    onClick: () => void;
}

const PromptListItem: React.FC<Props> = ({ logical, selected, onClick }) => {
    const hasAgent = logical.hasAgent;
    const hasChat = logical.hasChat;
    const modelCount = logical.modelCount;
    const isMeta = logical.isMetaPrompt;

    return (
        <div
            className={`pc-list-item${selected ? ' selected' : ''}`}
            onClick={onClick}
            role="option"
            aria-selected={selected}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onClick();
            }}
        >
            <div className="pc-list-item-title">{logical.title}</div>
            <div className="pc-list-item-meta">
                {hasChat && <span className="pc-tag">chat</span>}
                {hasAgent && <span className="pc-tag pc-tag-alt">agent</span>}
                {modelCount > 0 && (
                    <span className="pc-tag">
                        🎨 {modelCount} model{modelCount > 1 ? 's' : ''}
                    </span>
                )}
                {isMeta && <span className="pc-tag pc-tag-meta">⚗ meta</span>}
            </div>
        </div>
    );
};

export default PromptListItem;
