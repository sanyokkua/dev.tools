import { isMetaPrompt } from '@/common/prompts/meta';
import type { LogicalPrompt, PromptVariant } from '@/common/prompts/types';
import React from 'react';

interface Props {
    logical: LogicalPrompt;
    variants: PromptVariant[];
    selected: boolean;
    onClick: () => void;
}

const PromptListItem: React.FC<Props> = ({ logical, variants, selected, onClick }) => {
    const hasAgent = variants.some((v) => v.executionContext === 'agent');
    const hasChat = variants.some((v) => v.executionContext === 'chat' || v.kind === 'user');
    const models = [...new Set(variants.map((v) => v.model).filter(Boolean))];
    const isMeta = variants.some((v) => isMetaPrompt(v));

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
                {models.length > 0 && (
                    <span className="pc-tag">
                        🎨 {models.length} model{models.length > 1 ? 's' : ''}
                    </span>
                )}
                {isMeta && <span className="pc-tag pc-tag-meta">⚗ meta</span>}
            </div>
        </div>
    );
};

export default PromptListItem;
