'use client';
import React from 'react';
import Chip from './Chip';

/**
 * Represents a valid item that can be rendered in an information panel.
 * Accepts either plain text strings or React components for flexible content display.
 */
export type InformationPanelItem = string | React.ReactElement;
/**
 * Properties for configuring an information panel component.
 */
type InformationPanelProps = { items: InformationPanelItem[] };

/**
 * Renders a collection of information items in the editor's info panel.
 * @param props
 */
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
