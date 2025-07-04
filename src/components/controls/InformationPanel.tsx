'use client';
import React from 'react';
import Chip from './Chip';

export type InformationPanelItem = string | React.ReactElement;
type InformationPanelProps = { items: InformationPanelItem[] };

const CodeEditorInfoLine: React.FC<InformationPanelProps> = (props) => {
    const items = props.items.map((it) => {
        if (typeof it === 'string') {
            return <Chip key={it} text={it} />;
        }
        return it;
    });

    return <div className="info-panel">{items}</div>;
};

export default CodeEditorInfoLine;
