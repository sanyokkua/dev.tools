'use client';
import React from 'react';

/**
 * Represents properties of a chip component.
 */
type ChipProps = { text: string };

/**
 * Renders a compact, interactive UI component that displays text as a chip.
 * @param props - Component properties including the displayed text
 */
const Chip: React.FC<ChipProps> = (props) => {
    return <div className="chip">{props.text}</div>;
};

export default Chip;
