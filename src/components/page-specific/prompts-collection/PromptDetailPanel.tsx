import type { Category, Domain, LogicalPrompt, PromptVariant } from '@/common/prompts/types';
import React from 'react';

interface Props {
    logical: LogicalPrompt | null;
    variant: PromptVariant | null;
    domain: Domain | null;
    category: Category | null;
}

const PromptDetailPanel: React.FC<Props> = ({ logical, variant, domain, category }) => {
    if (!logical || !variant) {
        return (
            <div className="pc-detail-empty" role="status">
                Select a prompt from the list
            </div>
        );
    }
    return (
        <div className="pc-detail-stub">
            <div className="pc-detail-header-row">
                <div>
                    <h2 className="pc-detail-title">{variant.title}</h2>
                    <div className="pc-detail-breadcrumb">
                        {domain?.title} › {category?.title} · <span className="pc-mono">{variant.id}</span>
                    </div>
                </div>
                <div className="pc-detail-kind-badge">
                    <span className={`pc-tag${variant.executionContext === 'agent' ? ' pc-tag-alt' : ''}`}>
                        {variant.executionContext === 'agent' ? 'agent' : 'chat'}
                    </span>
                </div>
            </div>
            {variant.description && <p className="pc-detail-description">{variant.description}</p>}
            <p className="pc-detail-coming-soon">Full parameter editor and copy actions available after T2.2.</p>
        </div>
    );
};

PromptDetailPanel.displayName = 'PromptDetailPanel';
export default PromptDetailPanel;
