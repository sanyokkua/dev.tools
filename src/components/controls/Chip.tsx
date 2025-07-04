'use client';
import React from 'react';

type ChipProps = { text: string };

const Chip: React.FC<ChipProps> = (props) => {
    return <div className="chip">{props.text}</div>;
};

export default Chip;
