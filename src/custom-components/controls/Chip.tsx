import React from 'react';

export type ChipProps = { text: string };

const Chip: React.FC<ChipProps> = (props) => {
    return <div className="chip">{props.text}</div>;
};

export default Chip;
