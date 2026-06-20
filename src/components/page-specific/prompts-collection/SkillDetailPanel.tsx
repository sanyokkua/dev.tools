import type { Skill } from '@/common/prompts/types';
import React from 'react';

interface Props {
    skill: Skill | null;
}

const SkillDetailPanel: React.FC<Props> = ({ skill }) => {
    if (!skill) {
        return (
            <div className="pc-detail-empty" role="status">
                Select a skill from the list
            </div>
        );
    }
    return (
        <div className="pc-detail-stub">
            <div className="pc-detail-header-row">
                <div>
                    <h2 className="pc-detail-title">{skill.title}</h2>
                    <div className="pc-detail-breadcrumb">
                        <span className="pc-mono">{skill.id}</span> · v{skill.version}
                    </div>
                </div>
                <span className="pc-tag">🧩 Skill</span>
            </div>
            <p className="pc-detail-description">{skill.description}</p>
            <p className="pc-detail-coming-soon">Full skill detail (files, install steps, zip) available after T3.2.</p>
        </div>
    );
};

SkillDetailPanel.displayName = 'SkillDetailPanel';
export default SkillDetailPanel;
