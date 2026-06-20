import type { Skill } from '@/common/prompts/types';
import React from 'react';

interface Props {
    skill: Skill;
    selected: boolean;
    onClick: () => void;
}

const SkillListItem: React.FC<Props> = ({ skill, selected, onClick }) => (
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
        <div className="pc-list-item-title">{skill.title}</div>
        <div className="pc-list-item-meta">
            <span className="pc-tag">🧩 skill</span>
            <span>{skill.version}</span>
        </div>
    </div>
);

export default SkillListItem;
